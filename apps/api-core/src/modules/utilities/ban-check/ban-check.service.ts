import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BanCheckQueryDto,
  BanCheckResponseDto,
  BanStatus,
  BanCheckSource,
  BanCheckSourceRequest,
} from './dto';
import { CacheService } from '../../cache/cache.service';
import { MvdClient } from './mvd.client';
import { FmsClient } from './fms.client';

// Константы кэширования
const CACHE_KEY_PREFIX = 'ban-check:';
const FMS_CACHE_KEY_PREFIX = 'ban-check:fms:';

/**
 * BanCheckService - сервис проверки запрета на въезд в РФ.
 *
 * Особенности:
 * - Интеграция с API МВД (при включении MVD_ENABLED)
 * - Кэширование результатов (TTL настраивается)
 * - Graceful degradation при недоступности внешнего сервиса
 * - Fallback на mock при отключенной интеграции
 */
@Injectable()
export class BanCheckService {
  private readonly logger = new Logger(BanCheckService.name);
  private readonly mvdCacheTtl: number;
  private readonly fmsCacheTtl: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly mvdClient: MvdClient,
    private readonly fmsClient: FmsClient,
  ) {
    this.mvdCacheTtl = this.configService.get<number>(
      'mvd.cacheTtl',
      3600000, // 1 час по умолчанию
    );
    this.fmsCacheTtl = this.configService.get<number>(
      'entryBan.cacheTtl',
      24 * 60 * 60 * 1000, // 24 часа по умолчанию
    );
  }

  /**
   * Проверка запрета на въезд
   */
  async checkBan(query: BanCheckQueryDto): Promise<BanCheckResponseDto> {
    const requestedSource = query.source || BanCheckSourceRequest.MVD;

    this.logger.log(
      `Проверка запрета на въезд (${requestedSource}): ${query.lastName} ${query.firstName}, ДР: ${query.birthDate}`,
    );

    // Если запрошен FMS, но не указано гражданство - ошибка
    if (requestedSource === BanCheckSourceRequest.FMS && !query.citizenship) {
      throw new BadRequestException(
        'Citizenship is required for FMS source. Please provide citizenship field.',
      );
    }

    // Выбираем источник проверки
    if (requestedSource === BanCheckSourceRequest.FMS) {
      return this.checkBanViaFms(query);
    }

    return this.checkBanViaMvd(query);
  }

  /**
   * Проверка запрета через МВД (HTTP API)
   */
  private async checkBanViaMvd(query: BanCheckQueryDto): Promise<BanCheckResponseDto> {
    const cacheKey = this.buildCacheKey(query, CACHE_KEY_PREFIX);

    // 1. Проверяем кэш
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT для ${cacheKey}`);
      return {
        ...cached,
        source: BanCheckSource.CACHE,
      };
    }

    // 2. Проверяем, включена ли интеграция с МВД
    if (!this.mvdClient.isEnabled()) {
      this.logger.debug('Интеграция с МВД отключена, используем fallback');
      return this.createFallbackResponse('MVD');
    }

    // 3. Запрос к МВД
    try {
      const result = await this.mvdClient.checkBan(query);

      const response: BanCheckResponseDto = {
        status: result.hasBan ? BanStatus.HAS_BAN : BanStatus.NO_BAN,
        source: BanCheckSource.MVD,
        reason: result.reason,
        expiresAt: result.expiresAt,
        checkedAt: new Date().toISOString(),
      };

      // Кэшируем успешный результат
      await this.saveToCache(cacheKey, response, this.mvdCacheTtl);

      this.logger.log(`Результат проверки МВД: ${response.status} для ${query.lastName}`);
      return response;
    } catch (error) {
      this.logger.error(
        `Ошибка при проверке МВД: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      // Graceful degradation - возвращаем UNKNOWN вместо ошибки
      return {
        status: BanStatus.UNKNOWN,
        source: BanCheckSource.FALLBACK,
        checkedAt: new Date().toISOString(),
        error: 'Сервис МВД временно недоступен. Повторите проверку позже.',
      };
    }
  }

  /**
   * Проверка запрета через ФМС (Playwright, sid=3000)
   */
  private async checkBanViaFms(query: BanCheckQueryDto): Promise<BanCheckResponseDto> {
    const cacheKey = this.buildFmsCacheKey(query);

    // 1. Проверяем кэш
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT для ${cacheKey}`);
      return {
        ...cached,
        source: BanCheckSource.CACHE,
      };
    }

    // 2. Проверяем, включена ли интеграция с ФМС
    if (!this.fmsClient.isEnabled()) {
      this.logger.debug('Интеграция с ФМС отключена, используем fallback');
      return this.createFallbackResponse('FMS');
    }

    // 3. Запрос к ФМС через Playwright
    try {
      const result = await this.fmsClient.checkBan(query);

      const response: BanCheckResponseDto = {
        status: result.hasBan ? BanStatus.HAS_BAN : BanStatus.NO_BAN,
        source: BanCheckSource.FMS,
        banType: result.banType,
        reason: result.reason,
        expiresAt: result.expiresAt,
        checkedAt: new Date().toISOString(),
      };

      // Кэшируем успешный результат
      await this.saveToCache(cacheKey, response, this.fmsCacheTtl);

      this.logger.log(`Результат проверки ФМС: ${response.status} для ${query.lastName}`);
      return response;
    } catch (error) {
      this.logger.error(
        `Ошибка при проверке ФМС: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );

      // Graceful degradation - возвращаем UNKNOWN вместо ошибки
      return {
        status: BanStatus.UNKNOWN,
        source: BanCheckSource.FALLBACK,
        checkedAt: new Date().toISOString(),
        error: 'Сервис ФМС временно недоступен. Повторите проверку позже.',
      };
    }
  }

  /**
   * Формирование ключа кэша для МВД
   */
  private buildCacheKey(query: BanCheckQueryDto, prefix: string = CACHE_KEY_PREFIX): string {
    // Нормализуем данные для консистентности кэша
    const normalized = [
      query.lastName.toUpperCase().trim(),
      query.firstName.toUpperCase().trim(),
      query.birthDate,
    ].join(':');

    return `${prefix}${normalized}`;
  }

  /**
   * Формирование ключа кэша для ФМС (включает гражданство)
   */
  private buildFmsCacheKey(query: BanCheckQueryDto): string {
    const normalized = [
      query.lastName.toUpperCase().trim(),
      query.firstName.toUpperCase().trim(),
      query.middleName?.toUpperCase().trim() || '',
      query.birthDate,
      query.citizenship?.toUpperCase().trim() || '',
    ].join(':');

    return `${FMS_CACHE_KEY_PREFIX}${normalized}`;
  }

  /**
   * Получение результата из кэша
   */
  private async getFromCache(key: string): Promise<BanCheckResponseDto | null> {
    try {
      return await this.cacheService.get<BanCheckResponseDto>(key);
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
  private async saveToCache(
    key: string,
    response: BanCheckResponseDto,
    ttl?: number,
  ): Promise<void> {
    const cacheTtl = ttl || this.mvdCacheTtl;
    try {
      await this.cacheService.set(key, response, cacheTtl);
      this.logger.debug(`Результат сохранен в кэш: ${key}, TTL: ${cacheTtl}ms`);
    } catch (error) {
      this.logger.warn(
        `Ошибка записи в кэш: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Fallback ответ при отключенной интеграции
   *
   * Возвращает UNKNOWN, чтобы пользователь понимал,
   * что проверка не была выполнена реально.
   */
  private createFallbackResponse(source: 'MVD' | 'FMS' = 'MVD'): BanCheckResponseDto {
    const siteUrl =
      source === 'FMS'
        ? 'https://services.fms.gov.ru/info-service.htm?sid=3000'
        : 'https://services.fms.gov.ru/info-service.htm?sid=2000';

    return {
      status: BanStatus.UNKNOWN,
      source: BanCheckSource.FALLBACK,
      checkedAt: new Date().toISOString(),
      error: `Автоматическая проверка через ${source} недоступна. Рекомендуем проверить статус на официальном сайте: ${siteUrl}`,
    };
  }
}
