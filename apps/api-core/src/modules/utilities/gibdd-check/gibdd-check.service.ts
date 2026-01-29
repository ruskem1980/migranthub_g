import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GibddQueryDto, GibddResultDto, GibddCheckSource, GibddFine, GibddCheckType } from './dto';
import { CacheService } from '../../cache/cache.service';
import { GibddClient } from './gibdd.client';

// Константы кэширования
const CACHE_KEY_PREFIX = 'gibdd-check:';

/**
 * GibddCheckService - сервис проверки штрафов ГИБДД.
 *
 * Особенности:
 * - Интеграция с сайтом ГИБДД через Playwright (при включении GIBDD_CHECK_ENABLED)
 * - Два режима проверки: по СТС и по водительскому удостоверению
 * - Кэширование результатов (TTL 6 часов)
 * - Graceful degradation при недоступности внешнего сервиса
 * - Fallback на mock при отключенной интеграции
 */
@Injectable()
export class GibddCheckService {
  private readonly logger = new Logger(GibddCheckService.name);
  private readonly cacheTtl: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly gibddClient: GibddClient,
  ) {
    this.cacheTtl = this.configService.get<number>(
      'gibdd.cacheTtl',
      6 * 60 * 60 * 1000, // 6 часов по умолчанию
    );
  }

  /**
   * Проверка штрафов ГИБДД
   */
  async checkFines(query: GibddQueryDto): Promise<GibddResultDto> {
    this.logger.log(
      `Проверка штрафов ГИБДД: тип=${query.checkType}, ` +
        (query.checkType === GibddCheckType.STS
          ? `госномер=${query.regNumber}, СТС=${query.stsNumber}`
          : `ВУ=${query.licenseNumber}, дата выдачи=${query.issueDate}`),
    );

    const cacheKey = this.buildCacheKey(query);

    // 1. Проверяем кэш
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT для ${cacheKey}`);
      return {
        ...cached,
        source: GibddCheckSource.CACHE,
      };
    }

    // 2. Проверяем, включена ли интеграция с ГИБДД
    if (!this.gibddClient.isEnabled()) {
      this.logger.debug('Интеграция с ГИБДД отключена, используем fallback');
      return this.createFallbackResponse();
    }

    // 3. Запрос к ГИБДД
    try {
      const result = await this.gibddClient.checkFines(query);

      const response: GibddResultDto = {
        hasFines: result.hasFines,
        totalAmount: result.totalAmount,
        finesCount: result.fines.length,
        fines: result.fines,
        source: GibddCheckSource.GIBDD,
        checkedAt: new Date().toISOString(),
      };

      // Кэшируем успешный результат
      await this.saveToCache(cacheKey, response);

      this.logger.log(
        `Результат проверки ГИБДД: hasFines=${response.hasFines}, amount=${response.totalAmount}`,
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Ошибка при проверке ГИБДД: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      // Graceful degradation - возвращаем fallback вместо ошибки
      return {
        hasFines: false,
        source: GibddCheckSource.FALLBACK,
        checkedAt: new Date().toISOString(),
        error: 'Сервис ГИБДД временно недоступен. Повторите проверку позже.',
      };
    }
  }

  /**
   * Формирование ключа кэша
   */
  private buildCacheKey(query: GibddQueryDto): string {
    // Нормализуем данные для консистентности кэша
    let normalized: string;

    if (query.checkType === GibddCheckType.STS) {
      normalized = [
        query.checkType,
        query.regNumber?.toUpperCase().trim() || '',
        query.stsNumber?.trim() || '',
      ].join(':');
    } else {
      normalized = [
        query.checkType,
        query.licenseNumber?.toUpperCase().trim() || '',
        query.issueDate || '',
      ].join(':');
    }

    return `${CACHE_KEY_PREFIX}${normalized}`;
  }

  /**
   * Получение результата из кэша
   */
  private async getFromCache(key: string): Promise<GibddResultDto | null> {
    try {
      return await this.cacheService.get<GibddResultDto>(key);
    } catch (error) {
      this.logger.warn(
        `Ошибка чтения из кэша: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  /**
   * Сохранение результата в кэш
   */
  private async saveToCache(key: string, response: GibddResultDto): Promise<void> {
    try {
      await this.cacheService.set(key, response, this.cacheTtl);
      this.logger.debug(`Результат сохранен в кэш: ${key}, TTL: ${this.cacheTtl}ms`);
    } catch (error) {
      this.logger.warn(
        `Ошибка записи в кэш: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Fallback ответ при отключенной интеграции
   *
   * Возвращает mock данные для тестирования и когда сервис недоступен.
   */
  private createFallbackResponse(): GibddResultDto {
    return {
      hasFines: false,
      totalAmount: 0,
      finesCount: 0,
      fines: [],
      source: GibddCheckSource.FALLBACK,
      checkedAt: new Date().toISOString(),
      error:
        'Автоматическая проверка штрафов ГИБДД недоступна. Рекомендуем проверить на официальном сайте: https://гибдд.рф/check/fines или на Госуслугах: https://www.gosuslugi.ru',
    };
  }

  /**
   * Mock данные для демонстрации (используется при GIBDD_CHECK_ENABLED=false)
   */
  getMockDataWithFines(): GibddResultDto {
    const mockFines: GibddFine[] = [
      {
        date: '2024-01-10',
        article: '12.9 ч.2',
        description:
          'Превышение установленной скорости движения на величину более 20, но не более 40 км/ч',
        amount: 500,
        discountAmount: 250,
        discountDeadline: '2024-01-30',
        uin: '18810177220123456789',
        paymentUrl: 'https://www.gosuslugi.ru/pay?uin=18810177220123456789',
        location: 'г. Москва, ул. Тверская',
        department: 'ЦАФАП ОДД ГИБДД ГУ МВД России по г. Москве',
      },
      {
        date: '2024-01-05',
        article: '12.16 ч.1',
        description: 'Несоблюдение требований, предписанных дорожными знаками',
        amount: 500,
        discountAmount: 250,
        discountDeadline: '2024-01-25',
        uin: '18810177220987654321',
        paymentUrl: 'https://www.gosuslugi.ru/pay?uin=18810177220987654321',
        location: 'г. Москва, Ленинградский пр-т',
        department: 'ЦАФАП ОДД ГИБДД ГУ МВД России по г. Москве',
      },
    ];

    return {
      hasFines: true,
      totalAmount: 1000,
      finesCount: 2,
      fines: mockFines,
      source: GibddCheckSource.FALLBACK,
      checkedAt: new Date().toISOString(),
      message: 'Тестовые данные. Для реальной проверки используйте официальный сайт ГИБДД.',
    };
  }
}
