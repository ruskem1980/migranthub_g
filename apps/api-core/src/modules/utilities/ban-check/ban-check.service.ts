import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BanCheckQueryDto,
  BanCheckResponseDto,
  BanStatus,
  BanCheckSource,
} from './dto';
import { CacheService } from '../../cache/cache.service';
import { MvdClient } from './mvd.client';

// Константы кэширования
const CACHE_KEY_PREFIX = 'ban-check:';

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
  private readonly cacheTtl: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly mvdClient: MvdClient,
  ) {
    this.cacheTtl = this.configService.get<number>(
      'mvd.cacheTtl',
      3600000, // 1 час по умолчанию
    );
  }

  /**
   * Проверка запрета на въезд
   */
  async checkBan(query: BanCheckQueryDto): Promise<BanCheckResponseDto> {
    this.logger.log(
      `Проверка запрета на въезд: ${query.lastName} ${query.firstName}, ДР: ${query.birthDate}`,
    );

    const cacheKey = this.buildCacheKey(query);

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
      return this.createFallbackResponse();
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
      await this.saveToCache(cacheKey, response);

      this.logger.log(
        `Результат проверки МВД: ${response.status} для ${query.lastName}`,
      );
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
   * Формирование ключа кэша
   */
  private buildCacheKey(query: BanCheckQueryDto): string {
    // Нормализуем данные для консистентности кэша
    const normalized = [
      query.lastName.toUpperCase().trim(),
      query.firstName.toUpperCase().trim(),
      query.birthDate,
    ].join(':');

    return `${CACHE_KEY_PREFIX}${normalized}`;
  }

  /**
   * Получение результата из кэша
   */
  private async getFromCache(
    key: string,
  ): Promise<BanCheckResponseDto | null> {
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
  ): Promise<void> {
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
   * Возвращает UNKNOWN, чтобы пользователь понимал,
   * что проверка не была выполнена реально.
   */
  private createFallbackResponse(): BanCheckResponseDto {
    return {
      status: BanStatus.UNKNOWN,
      source: BanCheckSource.FALLBACK,
      checkedAt: new Date().toISOString(),
      error:
        'Автоматическая проверка недоступна. Рекомендуем проверить статус на официальном сайте МВД.',
    };
  }
}
