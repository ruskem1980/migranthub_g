import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WorkPermitQueryDto, WorkPermitResultDto, WorkPermitStatus, WorkPermitSource } from './dto';
import { CacheService } from '../../cache/cache.service';
import { WorkPermitClient } from './work-permit.client';

// Константы кэширования
const CACHE_KEY_PREFIX = 'work-permit:';

/**
 * WorkPermitCheckService - сервис проверки разрешения на работу (РНР).
 *
 * Особенности:
 * - Интеграция с сайтом ФМС через Playwright (при включении WORK_PERMIT_ENABLED)
 * - Кэширование результатов (TTL 6 часов)
 * - Graceful degradation при недоступности внешнего сервиса
 * - Fallback на mock при отключенной интеграции
 */
@Injectable()
export class WorkPermitCheckService {
  private readonly logger = new Logger(WorkPermitCheckService.name);
  private readonly cacheTtl: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly workPermitClient: WorkPermitClient,
  ) {
    this.cacheTtl = this.configService.get<number>(
      'workPermit.cacheTtl',
      6 * 60 * 60 * 1000, // 6 часов по умолчанию
    );
  }

  /**
   * Проверка разрешения на работу
   */
  async checkPermit(query: WorkPermitQueryDto): Promise<WorkPermitResultDto> {
    this.logger.log(`Проверка разрешения на работу: ${query.series} ${query.number}`);

    const cacheKey = this.buildCacheKey(query);

    // 1. Проверяем кэш
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT для ${cacheKey}`);
      return {
        ...cached,
        source: WorkPermitSource.CACHE,
      };
    }

    // 2. Проверяем, включена ли интеграция с ФМС
    if (!this.workPermitClient.isEnabled()) {
      this.logger.debug('Интеграция с ФМС отключена, используем fallback');
      return this.createFallbackResponse(query);
    }

    // 3. Запрос к ФМС
    try {
      const result = await this.workPermitClient.checkPermit(query);

      const response: WorkPermitResultDto = {
        status: result.status,
        isValid: result.isValid,
        series: query.series,
        number: query.number,
        region: result.region,
        employer: result.employer,
        validUntil: result.validUntil,
        issuedAt: result.issuedAt,
        source: WorkPermitSource.FMS,
        checkedAt: new Date().toISOString(),
        message: result.message,
      };

      // Кэшируем успешный результат
      await this.saveToCache(cacheKey, response);

      this.logger.log(
        `Результат проверки РНР: status=${response.status}, isValid=${response.isValid}`,
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Ошибка при проверке РНР: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      // Graceful degradation - возвращаем fallback вместо ошибки
      return {
        status: WorkPermitStatus.UNKNOWN,
        isValid: false,
        series: query.series,
        number: query.number,
        source: WorkPermitSource.FALLBACK,
        checkedAt: new Date().toISOString(),
        error: 'Сервис ФМС временно недоступен. Повторите проверку позже.',
        message: 'Рекомендуем проверить статус на официальном сайте: services.fms.gov.ru',
      };
    }
  }

  /**
   * Формирование ключа кэша
   */
  private buildCacheKey(query: WorkPermitQueryDto): string {
    // Нормализуем данные для консистентности кэша
    const normalized = [query.series.trim().toUpperCase(), query.number.trim()].join(':');

    return `${CACHE_KEY_PREFIX}${normalized}`;
  }

  /**
   * Получение результата из кэша
   */
  private async getFromCache(key: string): Promise<WorkPermitResultDto | null> {
    try {
      return await this.cacheService.get<WorkPermitResultDto>(key);
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
  private async saveToCache(key: string, response: WorkPermitResultDto): Promise<void> {
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
  private createFallbackResponse(query: WorkPermitQueryDto): WorkPermitResultDto {
    // Для тестирования:
    // - серия "00" = недействителен
    // - серия "99" = срок истек
    const isTestInvalid = query.series === '00';
    const isTestExpired = query.series === '99';

    if (isTestInvalid) {
      return {
        status: WorkPermitStatus.INVALID,
        isValid: false,
        series: query.series,
        number: query.number,
        source: WorkPermitSource.FALLBACK,
        checkedAt: new Date().toISOString(),
        message: 'Тестовые данные: разрешение на работу недействительно',
        error:
          'Автоматическая проверка РНР недоступна. Рекомендуем проверить статус на официальном сайте: https://services.fms.gov.ru/info-service.htm?sid=2010',
      };
    }

    if (isTestExpired) {
      return {
        status: WorkPermitStatus.EXPIRED,
        isValid: false,
        series: query.series,
        number: query.number,
        validUntil: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 дней назад
        source: WorkPermitSource.FALLBACK,
        checkedAt: new Date().toISOString(),
        message: 'Тестовые данные: срок действия разрешения истек',
        error:
          'Автоматическая проверка РНР недоступна. Рекомендуем проверить статус на официальном сайте: https://services.fms.gov.ru/info-service.htm?sid=2010',
      };
    }

    return {
      status: WorkPermitStatus.VALID,
      isValid: true,
      series: query.series,
      number: query.number,
      region: 'г. Москва',
      employer: 'ООО "Тестовая организация"',
      validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 дней вперед
      issuedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 дней назад
      source: WorkPermitSource.FALLBACK,
      checkedAt: new Date().toISOString(),
      message: 'Тестовые данные: разрешение на работу действительно',
      error:
        'Автоматическая проверка РНР недоступна. Рекомендуем проверить статус на официальном сайте: https://services.fms.gov.ru/info-service.htm?sid=2010',
    };
  }

  /**
   * Mock данные для демонстрации (используется при WORK_PERMIT_ENABLED=false)
   */
  getMockDataValid(): WorkPermitResultDto {
    return {
      status: WorkPermitStatus.VALID,
      isValid: true,
      series: '77',
      number: '1234567',
      region: 'г. Москва',
      employer: 'ООО "Пример"',
      validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      issuedAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      source: WorkPermitSource.FALLBACK,
      checkedAt: new Date().toISOString(),
      message: 'Разрешение на работу действительно',
    };
  }

  /**
   * Mock данные для недействительного разрешения
   */
  getMockDataInvalid(): WorkPermitResultDto {
    return {
      status: WorkPermitStatus.INVALID,
      isValid: false,
      series: '00',
      number: '0000000',
      source: WorkPermitSource.FALLBACK,
      checkedAt: new Date().toISOString(),
      message: 'Разрешение на работу аннулировано',
    };
  }

  /**
   * Mock данные для истекшего разрешения
   */
  getMockDataExpired(): WorkPermitResultDto {
    return {
      status: WorkPermitStatus.EXPIRED,
      isValid: false,
      series: '99',
      number: '9999999',
      validUntil: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      source: WorkPermitSource.FALLBACK,
      checkedAt: new Date().toISOString(),
      message: 'Срок действия разрешения истек',
    };
  }
}
