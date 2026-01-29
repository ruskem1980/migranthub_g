import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FsspQueryDto, FsspResultDto, FsspCheckSource, ExecutiveProceeding } from './dto';
import { CacheService } from '../../cache/cache.service';
import { FsspClient } from './fssp.client';

// Константы кэширования
const CACHE_KEY_PREFIX = 'fssp-check:';

/**
 * FsspCheckService - сервис проверки задолженности в ФССП.
 *
 * Особенности:
 * - Интеграция с сайтом ФССП через Playwright (при включении FSSP_CHECK_ENABLED)
 * - Кэширование результатов (TTL 24 часа)
 * - Graceful degradation при недоступности внешнего сервиса
 * - Fallback на mock при отключенной интеграции
 */
@Injectable()
export class FsspCheckService {
  private readonly logger = new Logger(FsspCheckService.name);
  private readonly cacheTtl: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly fsspClient: FsspClient,
  ) {
    this.cacheTtl = this.configService.get<number>(
      'fssp.cacheTtl',
      24 * 60 * 60 * 1000, // 24 часа по умолчанию
    );
  }

  /**
   * Проверка задолженности в ФССП
   */
  async checkDebt(query: FsspQueryDto): Promise<FsspResultDto> {
    this.logger.log(
      `Проверка задолженности ФССП: ${query.lastName} ${query.firstName}, ДР: ${query.birthDate}, регион: ${query.region}`,
    );

    const cacheKey = this.buildCacheKey(query);

    // 1. Проверяем кэш
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT для ${cacheKey}`);
      return {
        ...cached,
        source: FsspCheckSource.CACHE,
      };
    }

    // 2. Проверяем, включена ли интеграция с ФССП
    if (!this.fsspClient.isEnabled()) {
      this.logger.debug('Интеграция с ФССП отключена, используем fallback');
      return this.createFallbackResponse();
    }

    // 3. Запрос к ФССП
    try {
      const result = await this.fsspClient.checkDebt(query);

      const response: FsspResultDto = {
        hasDebt: result.hasDebt,
        totalAmount: result.totalAmount,
        execProceedings: result.execProceedings,
        totalProceedings: result.execProceedings.length,
        source: FsspCheckSource.FSSP,
        checkedAt: new Date().toISOString(),
      };

      // Кэшируем успешный результат
      await this.saveToCache(cacheKey, response);

      this.logger.log(
        `Результат проверки ФССП: hasDebt=${response.hasDebt}, amount=${response.totalAmount} для ${query.lastName}`,
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Ошибка при проверке ФССП: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      // Graceful degradation - возвращаем fallback вместо ошибки
      return {
        hasDebt: false,
        source: FsspCheckSource.FALLBACK,
        checkedAt: new Date().toISOString(),
        error: 'Сервис ФССП временно недоступен. Повторите проверку позже.',
      };
    }
  }

  /**
   * Формирование ключа кэша
   */
  private buildCacheKey(query: FsspQueryDto): string {
    // Нормализуем данные для консистентности кэша
    const normalized = [
      query.lastName.toUpperCase().trim(),
      query.firstName.toUpperCase().trim(),
      query.middleName?.toUpperCase().trim() || '',
      query.birthDate,
      query.region.toString(),
    ].join(':');

    return `${CACHE_KEY_PREFIX}${normalized}`;
  }

  /**
   * Получение результата из кэша
   */
  private async getFromCache(key: string): Promise<FsspResultDto | null> {
    try {
      return await this.cacheService.get<FsspResultDto>(key);
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
  private async saveToCache(key: string, response: FsspResultDto): Promise<void> {
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
  private createFallbackResponse(): FsspResultDto {
    return {
      hasDebt: false,
      totalAmount: 0,
      execProceedings: [],
      totalProceedings: 0,
      source: FsspCheckSource.FALLBACK,
      checkedAt: new Date().toISOString(),
      error:
        'Автоматическая проверка ФССП недоступна. Рекомендуем проверить статус на официальном сайте: https://fssp.gov.ru/iss/ip',
    };
  }

  /**
   * Mock данные для демонстрации (используется при FSSP_CHECK_ENABLED=false)
   */
  getMockDataWithDebt(): FsspResultDto {
    const mockProceedings: ExecutiveProceeding[] = [
      {
        number: '12345/21/77001-ИП',
        date: '2021-03-15',
        subject: 'Госпошлина',
        department: 'ОСП по Центральному АО г. Москвы',
        bailiff: 'Петров А.И.',
        amount: 5000.5,
        executiveDocument: 'Судебный приказ № 2-1234/2021 от 01.02.2021',
      },
      {
        number: '54321/22/77002-ИП',
        date: '2022-06-20',
        subject: 'Штраф ГИБДД',
        department: 'ОСП по Южному АО г. Москвы',
        bailiff: 'Сидорова Е.В.',
        amount: 1500.0,
        executiveDocument: 'Постановление по делу об АП № 18810177220123456 от 15.05.2022',
      },
    ];

    return {
      hasDebt: true,
      totalAmount: 6500.5,
      execProceedings: mockProceedings,
      totalProceedings: 2,
      source: FsspCheckSource.FALLBACK,
      checkedAt: new Date().toISOString(),
    };
  }
}
