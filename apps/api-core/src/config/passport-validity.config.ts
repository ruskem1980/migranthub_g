import { registerAs } from '@nestjs/config';

export default registerAs('passportValidity', () => ({
  // URL сервиса проверки паспорта МВД
  serviceUrl:
    process.env.PASSPORT_VALIDITY_SERVICE_URL ||
    'https://services.fms.gov.ru/info-service.htm?sid=2000',

  // Включение реальных запросов (false = только mock)
  enabled: process.env.PASSPORT_VALIDITY_ENABLED === 'true',

  // Таймаут запроса в миллисекундах
  timeout: parseInt(process.env.PASSPORT_VALIDITY_TIMEOUT || '30000', 10),

  // Количество попыток при ошибке
  retryAttempts: parseInt(process.env.PASSPORT_VALIDITY_RETRY_ATTEMPTS || '3', 10),

  // Базовая задержка между попытками (exponential backoff)
  retryDelay: parseInt(process.env.PASSPORT_VALIDITY_RETRY_DELAY || '2000', 10),

  // Circuit breaker: порог ошибок для открытия
  circuitBreakerThreshold: parseInt(
    process.env.PASSPORT_VALIDITY_CIRCUIT_BREAKER_THRESHOLD || '5',
    10,
  ),

  // Circuit breaker: время восстановления в миллисекундах
  circuitBreakerResetTime: parseInt(
    process.env.PASSPORT_VALIDITY_CIRCUIT_BREAKER_RESET_TIME || '60000',
    10,
  ),

  // TTL кэша результатов в миллисекундах (7 дней)
  cacheTtl: parseInt(
    process.env.PASSPORT_VALIDITY_CACHE_TTL || String(7 * 24 * 60 * 60 * 1000),
    10,
  ),

  // Настройки браузера (Playwright)
  browser: {
    headless: process.env.BROWSER_HEADLESS !== 'false',
    navigationTimeout: parseInt(process.env.BROWSER_NAVIGATION_TIMEOUT || '30000', 10),
    selectorTimeout: parseInt(process.env.BROWSER_SELECTOR_TIMEOUT || '10000', 10),
  },
}));
