import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  PassportValidityQueryDto,
  PassportValidityResultDto,
  PassportValidityStatus,
  PassportValiditySource,
} from './dto';
import { CacheService } from '../../cache/cache.service';
import { MvdPassportClient } from './mvd-passport.client';

// Константы кэширования
const CACHE_KEY_PREFIX = 'passport-validity:';

/**
 * PassportValidityService - сервис проверки действительности паспорта РФ.
 *
 * Особенности:
 * - Интеграция с сайтом МВД через Playwright (при включении PASSPORT_VALIDITY_ENABLED)
 * - Кэширование результатов (TTL 7 дней)
 * - Graceful degradation при недоступности внешнего сервиса
 * - Fallback на mock при отключенной интеграции
 */
@Injectable()
export class PassportValidityService {
  private readonly logger = new Logger(PassportValidityService.name);
  private readonly cacheTtl: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly mvdPassportClient: MvdPassportClient,
  ) {
    this.cacheTtl = this.configService.get<number>(
      'passportValidity.cacheTtl',
      7 * 24 * 60 * 60 * 1000, // 7 дней по умолчанию
    );
  }

  /**
   * Проверка действительности паспорта
   */
  async checkValidity(query: PassportValidityQueryDto): Promise<PassportValidityResultDto> {
    this.logger.log(`Проверка паспорта: ${query.series} ${query.number}`);

    const cacheKey = this.buildCacheKey(query);

    // 1. Проверяем кэш
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT для ${cacheKey}`);
      return {
        ...cached,
        source: PassportValiditySource.CACHE,
      };
    }

    // 2. Проверяем, включена ли интеграция с МВД
    if (!this.mvdPassportClient.isEnabled()) {
      this.logger.debug('Интеграция с МВД отключена, используем fallback');
      return this.createFallbackResponse(query);
    }

    // 3. Запрос к МВД
    try {
      const result = await this.mvdPassportClient.checkValidity(query);

      const response: PassportValidityResultDto = {
        status: result.status,
        isValid: result.isValid,
        series: query.series,
        number: query.number,
        source: PassportValiditySource.MVD,
        checkedAt: new Date().toISOString(),
        message: result.message,
      };

      // Кэшируем успешный результат
      await this.saveToCache(cacheKey, response);

      this.logger.log(
        `Результат проверки паспорта: status=${response.status}, isValid=${response.isValid}`,
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Ошибка при проверке паспорта: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      // Graceful degradation - возвращаем fallback вместо ошибки
      return {
        status: PassportValidityStatus.UNKNOWN,
        isValid: false,
        series: query.series,
        number: query.number,
        source: PassportValiditySource.FALLBACK,
        checkedAt: new Date().toISOString(),
        error: 'Сервис МВД временно недоступен. Повторите проверку позже.',
        message: 'Рекомендуем проверить статус на официальном сайте: services.fms.gov.ru',
      };
    }
  }

  /**
   * Формирование ключа кэша
   */
  private buildCacheKey(query: PassportValidityQueryDto): string {
    // Нормализуем данные для консистентности кэша
    const normalized = [query.series.trim(), query.number.trim()].join(':');

    return `${CACHE_KEY_PREFIX}${normalized}`;
  }

  /**
   * Получение результата из кэша
   */
  private async getFromCache(key: string): Promise<PassportValidityResultDto | null> {
    try {
      return await this.cacheService.get<PassportValidityResultDto>(key);
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
  private async saveToCache(key: string, response: PassportValidityResultDto): Promise<void> {
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
  private createFallbackResponse(query: PassportValidityQueryDto): PassportValidityResultDto {
    // Для тестирования: серия 0000 = недействителен
    const isTestInvalid = query.series === '0000';

    return {
      status: isTestInvalid ? PassportValidityStatus.INVALID : PassportValidityStatus.NOT_FOUND,
      isValid: !isTestInvalid,
      series: query.series,
      number: query.number,
      source: PassportValiditySource.FALLBACK,
      checkedAt: new Date().toISOString(),
      message: isTestInvalid
        ? 'Тестовые данные: паспорт недействителен'
        : 'Тестовые данные: паспорт не найден в базе недействительных',
      error:
        'Автоматическая проверка паспорта недоступна. Рекомендуем проверить статус на официальном сайте: https://services.fms.gov.ru/info-service.htm?sid=2000',
    };
  }

  /**
   * Mock данные для демонстрации (используется при PASSPORT_VALIDITY_ENABLED=false)
   */
  getMockDataValid(): PassportValidityResultDto {
    return {
      status: PassportValidityStatus.NOT_FOUND,
      isValid: true,
      series: '4510',
      number: '123456',
      source: PassportValiditySource.FALLBACK,
      checkedAt: new Date().toISOString(),
      message: 'Паспорт не найден в базе недействительных паспортов',
    };
  }

  /**
   * Mock данные для недействительного паспорта
   */
  getMockDataInvalid(): PassportValidityResultDto {
    return {
      status: PassportValidityStatus.INVALID,
      isValid: false,
      series: '0000',
      number: '000000',
      source: PassportValiditySource.FALLBACK,
      checkedAt: new Date().toISOString(),
      message: 'Паспорт числится в базе недействительных паспортов МВД',
    };
  }
}
