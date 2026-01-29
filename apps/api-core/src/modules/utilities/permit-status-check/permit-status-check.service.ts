import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../../cache/cache.service';
import { FmsPermitClient } from './fms-permit.client';
import {
  CheckPermitDto,
  PermitStatusResponseDto,
  PermitStatusEnum,
  PermitStatusSource,
} from './dto';

// Константы кэширования
const CACHE_KEY_PREFIX = 'permit-status:';

/**
 * PermitStatusCheckService - сервис проверки статуса РВП/ВНЖ.
 *
 * Особенности:
 * - Интеграция с ФМС через Playwright (sid=2060 для РВП, sid=2070 для ВНЖ)
 * - Кэширование результатов (TTL 6 часов)
 * - Graceful degradation при недоступности внешнего сервиса
 * - Fallback на mock при отключенной интеграции
 */
@Injectable()
export class PermitStatusCheckService {
  private readonly logger = new Logger(PermitStatusCheckService.name);
  private readonly cacheTtl: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly fmsPermitClient: FmsPermitClient,
  ) {
    this.cacheTtl = this.configService.get<number>(
      'permitStatus.cacheTtl',
      6 * 60 * 60 * 1000, // 6 часов по умолчанию
    );
  }

  /**
   * Проверка статуса РВП/ВНЖ
   */
  async checkStatus(query: CheckPermitDto): Promise<PermitStatusResponseDto> {
    this.logger.log(
      `Проверка статуса ${query.permitType}: ${query.lastName} ${query.firstName}, регион: ${query.region}, дата подачи: ${query.applicationDate}`,
    );

    // 1. Формируем ключ кэша
    const cacheKey = this.buildCacheKey(query);

    // 2. Проверяем кэш
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT для ${cacheKey}`);
      return {
        ...cached,
        source: PermitStatusSource.CACHE,
        checkedAt: cached.checkedAt, // Оставляем оригинальную дату проверки
      };
    }

    // 3. Проверяем, включена ли интеграция
    if (!this.fmsPermitClient.isEnabled()) {
      this.logger.debug('Интеграция с ФМС отключена, используем fallback');
      return this.createFallbackResponse(query);
    }

    // 4. Запрос через FmsPermitClient
    try {
      const result = await this.fmsPermitClient.checkPermitStatus(query);

      // Добавляем source к результату
      const resultWithSource = {
        ...result,
        source: PermitStatusSource.FMS,
      };

      // Кэшируем успешный результат (не кэшируем ошибки)
      if (!result.error) {
        await this.saveToCache(cacheKey, resultWithSource);
      }

      this.logger.log(
        `Результат проверки ${query.permitType}: ${result.status} для ${query.lastName}`,
      );
      return resultWithSource;
    } catch (error) {
      this.logger.error(
        `Ошибка при проверке статуса: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      // Graceful degradation - возвращаем UNKNOWN вместо ошибки
      return {
        found: false,
        status: PermitStatusEnum.UNKNOWN,
        message: 'Сервис временно недоступен. Повторите проверку позже.',
        checkedAt: new Date().toISOString(),
        error: 'Сервис ФМС временно недоступен',
        source: PermitStatusSource.FALLBACK,
      };
    }
  }

  /**
   * Формирование ключа кэша
   * Формат: permit-status:{permitType}:{region}:{lastName}:{firstName}:{birthDate}
   */
  private buildCacheKey(query: CheckPermitDto): string {
    const normalized = [
      query.permitType,
      query.region.trim(),
      query.lastName.toUpperCase().trim(),
      query.firstName.toUpperCase().trim(),
      query.birthDate,
    ].join(':');

    return `${CACHE_KEY_PREFIX}${normalized}`;
  }

  /**
   * Получение результата из кэша
   */
  private async getFromCache(key: string): Promise<PermitStatusResponseDto | null> {
    try {
      return await this.cacheService.get<PermitStatusResponseDto>(key);
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
  private async saveToCache(key: string, response: PermitStatusResponseDto): Promise<void> {
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
   */
  private createFallbackResponse(query: CheckPermitDto): PermitStatusResponseDto {
    const siteUrl =
      query.permitType === 'RVP'
        ? 'https://services.fms.gov.ru/info-service.htm?sid=2060'
        : 'https://services.fms.gov.ru/info-service.htm?sid=2070';

    const permitName = query.permitType === 'RVP' ? 'РВП' : 'ВНЖ';

    return {
      found: false,
      status: PermitStatusEnum.UNKNOWN,
      message: `Автоматическая проверка статуса ${permitName} недоступна. Рекомендуем проверить статус на официальном сайте.`,
      checkedAt: new Date().toISOString(),
      error: `Автоматическая проверка отключена. Проверьте статус вручную: ${siteUrl}`,
      source: PermitStatusSource.FALLBACK,
    };
  }
}
