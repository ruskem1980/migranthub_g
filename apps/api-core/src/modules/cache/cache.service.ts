import { Injectable, Inject, Logger, OnModuleDestroy } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * CacheService - обертка над cache-manager с graceful degradation.
 * Если Redis недоступен, методы возвращают null/void и логируют ошибку.
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private isAvailable = true;

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
    this.checkConnection();
  }

  /**
   * Проверка соединения с Redis при старте
   */
  private async checkConnection(): Promise<void> {
    try {
      const testKey = '__cache_test__';
      await this.cacheManager.set(testKey, 'ok', 1000);
      const result = await this.cacheManager.get(testKey);
      await this.cacheManager.del(testKey);

      if (result === 'ok') {
        this.isAvailable = true;
        this.logger.log('Redis cache подключен и доступен');
      } else {
        throw new Error('Тест записи/чтения не прошел');
      }
    } catch (error) {
      this.isAvailable = false;
      this.logger.warn(
        `Redis cache недоступен, работаем без кэширования: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Получение значения из кэша
   * @param key Ключ кэша
   * @returns Значение или null если не найдено / ошибка
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isAvailable) {
      return null;
    }

    try {
      const value = await this.cacheManager.get<T>(key);
      return value ?? null;
    } catch (error) {
      this.logger.warn(
        `Ошибка чтения из кэша [${key}]: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return null;
    }
  }

  /**
   * Сохранение значения в кэш
   * @param key Ключ кэша
   * @param value Значение для сохранения
   * @param ttl TTL в миллисекундах (опционально)
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    if (!this.isAvailable) {
      return;
    }

    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      this.logger.warn(
        `Ошибка записи в кэш [${key}]: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Удаление значения из кэша
   * @param key Ключ кэша
   */
  async del(key: string): Promise<void> {
    if (!this.isAvailable) {
      return;
    }

    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.warn(
        `Ошибка удаления из кэша [${key}]: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Cache-aside pattern: получить из кэша или выполнить функцию и закэшировать результат
   * @param key Ключ кэша
   * @param fn Функция для получения данных если кэш пуст
   * @param ttl TTL в миллисекундах (опционально)
   * @returns Результат из кэша или функции
   */
  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    // Пробуем получить из кэша
    const cached = await this.get<T>(key);
    if (cached !== null) {
      this.logger.debug(`Cache HIT: ${key}`);
      return cached;
    }

    // Выполняем функцию
    this.logger.debug(`Cache MISS: ${key}`);
    const result = await fn();

    // Сохраняем в кэш
    await this.set(key, result, ttl);

    return result;
  }

  /**
   * Проверка доступности кэша
   */
  isConnected(): boolean {
    return this.isAvailable;
  }

  /**
   * Очистка при завершении модуля
   */
  async onModuleDestroy(): Promise<void> {
    try {
      // cache-manager v5 использует store с методом disconnect
      const store = (this.cacheManager as any).store;
      if (store && typeof store.disconnect === 'function') {
        await store.disconnect();
        this.logger.log('Redis соединение закрыто');
      }
    } catch (error) {
      this.logger.warn(
        `Ошибка при закрытии Redis соединения: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
