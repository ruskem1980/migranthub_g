import { registerAs } from '@nestjs/config';

export default registerAs('workPermit', () => ({
  // URL сервиса проверки разрешения на работу (ФМС)
  serviceUrl:
    process.env.WORK_PERMIT_SERVICE_URL || 'https://services.fms.gov.ru/info-service.htm?sid=2010',

  // Включение реальных запросов (false = только mock)
  enabled: process.env.WORK_PERMIT_ENABLED === 'true',

  // Таймаут запроса в миллисекундах
  timeout: parseInt(process.env.WORK_PERMIT_TIMEOUT || '30000', 10),

  // Количество попыток при ошибке
  retryAttempts: parseInt(process.env.WORK_PERMIT_RETRY_ATTEMPTS || '3', 10),

  // Базовая задержка между попытками (exponential backoff)
  retryDelay: parseInt(process.env.WORK_PERMIT_RETRY_DELAY || '2000', 10),

  // Circuit breaker: порог ошибок для открытия
  circuitBreakerThreshold: parseInt(process.env.WORK_PERMIT_CIRCUIT_BREAKER_THRESHOLD || '5', 10),

  // Circuit breaker: время восстановления в миллисекундах
  circuitBreakerResetTime: parseInt(
    process.env.WORK_PERMIT_CIRCUIT_BREAKER_RESET_TIME || '60000',
    10,
  ),

  // TTL кэша результатов в миллисекундах (6 часов)
  cacheTtl: parseInt(process.env.WORK_PERMIT_CACHE_TTL || String(6 * 60 * 60 * 1000), 10),

  // Настройки браузера (Playwright)
  browser: {
    headless: process.env.BROWSER_HEADLESS !== 'false',
    navigationTimeout: parseInt(process.env.BROWSER_NAVIGATION_TIMEOUT || '30000', 10),
    selectorTimeout: parseInt(process.env.BROWSER_SELECTOR_TIMEOUT || '10000', 10),
  },
}));
