import { registerAs } from '@nestjs/config';

export default registerAs('fssp', () => ({
  // URL сервиса ФССП для проверки задолженности
  serviceUrl: process.env.FSSP_SERVICE_URL || 'https://fssp.gov.ru/iss/ip',

  // Включение реальных запросов (false = только mock)
  enabled: process.env.FSSP_CHECK_ENABLED === 'true',

  // Таймаут запроса в миллисекундах
  timeout: parseInt(process.env.FSSP_TIMEOUT || '30000', 10),

  // Количество попыток при ошибке
  retryAttempts: parseInt(process.env.FSSP_RETRY_ATTEMPTS || '3', 10),

  // Базовая задержка между попытками (exponential backoff)
  retryDelay: parseInt(process.env.FSSP_RETRY_DELAY || '2000', 10),

  // Circuit breaker: порог ошибок для открытия
  circuitBreakerThreshold: parseInt(process.env.FSSP_CIRCUIT_BREAKER_THRESHOLD || '5', 10),

  // Circuit breaker: время восстановления в миллисекундах
  circuitBreakerResetTime: parseInt(process.env.FSSP_CIRCUIT_BREAKER_RESET_TIME || '60000', 10),

  // TTL кэша результатов в миллисекундах (24 часа)
  cacheTtl: parseInt(process.env.FSSP_CACHE_TTL || String(24 * 60 * 60 * 1000), 10),

  // Настройки браузера (Playwright)
  browser: {
    headless: process.env.BROWSER_HEADLESS !== 'false',
    navigationTimeout: parseInt(process.env.BROWSER_NAVIGATION_TIMEOUT || '30000', 10),
    selectorTimeout: parseInt(process.env.BROWSER_SELECTOR_TIMEOUT || '10000', 10),
  },
}));
