import { registerAs } from '@nestjs/config';

export default registerAs('mvd', () => ({
  // URL сервиса МВД для проверки запрета на въезд
  apiUrl: process.env.MVD_API_URL || 'https://services.fms.gov.ru/info-service.htm?sid=2000',

  // Включение реальных запросов к МВД (false = только mock)
  enabled: process.env.MVD_ENABLED === 'true',

  // Таймаут запроса в миллисекундах
  timeout: parseInt(process.env.MVD_TIMEOUT || '10000', 10),

  // Количество попыток при ошибке
  retryAttempts: parseInt(process.env.MVD_RETRY_ATTEMPTS || '3', 10),

  // Базовая задержка между попытками (exponential backoff)
  retryDelay: parseInt(process.env.MVD_RETRY_DELAY || '1000', 10),

  // Circuit breaker: порог ошибок для открытия
  circuitBreakerThreshold: parseInt(process.env.MVD_CIRCUIT_BREAKER_THRESHOLD || '5', 10),

  // Circuit breaker: время восстановления в миллисекундах
  circuitBreakerResetTime: parseInt(process.env.MVD_CIRCUIT_BREAKER_RESET_TIME || '60000', 10),

  // TTL кэша результатов в миллисекундах (1 час)
  cacheTtl: parseInt(process.env.MVD_CACHE_TTL || '3600000', 10),
}));
