import { Module, Global, Logger } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheService } from './cache.service';

/**
 * CacheModule - глобальный модуль для кэширования на основе Redis.
 *
 * Особенности:
 * - Graceful degradation: если Redis недоступен, приложение работает без кэша
 * - Конфигурация через environment variables
 * - TTL по умолчанию: 5 минут (300000 мс)
 */
@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('CacheModule');
        const host = configService.get<string>('redis.host', 'localhost');
        const port = configService.get<number>('redis.port', 6379);
        const password = configService.get<string>('redis.password');
        const ttl = configService.get<number>('redis.ttl', 300) * 1000; // секунды -> мс

        logger.log(`Подключение к Redis: ${host}:${port}`);

        try {
          const store = await redisStore({
            socket: {
              host,
              port,
              connectTimeout: 5000,
              reconnectStrategy: (retries) => {
                if (retries > 3) {
                  logger.warn('Не удалось подключиться к Redis после 3 попыток');
                  return false; // Прекращаем попытки
                }
                return Math.min(retries * 500, 3000); // Экспоненциальная задержка
              },
            },
            password: password || undefined,
            ttl,
          });

          logger.log('Redis store успешно создан');
          return { store, ttl };
        } catch (error) {
          logger.warn(
            `Не удалось подключиться к Redis: ${error instanceof Error ? error.message : 'Unknown error'}`,
          );
          logger.warn('Используется in-memory cache как fallback');

          // Возвращаем конфигурацию по умолчанию (in-memory)
          return { ttl };
        }
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}
