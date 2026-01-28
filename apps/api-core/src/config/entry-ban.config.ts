import { registerAs } from '@nestjs/config';

export default registerAs('entryBan', () => ({
  // URL сервиса ФМС для проверки запрета на въезд (sid=3000)
  serviceUrl:
    process.env.ENTRY_BAN_FMS_SERVICE_URL ||
    'https://services.fms.gov.ru/info-service.htm?sid=3000',

  // Включение реальных запросов (false = только mock)
  enabled: process.env.ENTRY_BAN_FMS_ENABLED === 'true',

  // Таймаут запроса в миллисекундах
  timeout: parseInt(process.env.ENTRY_BAN_FMS_TIMEOUT || '30000', 10),

  // Количество попыток при ошибке
  retryAttempts: parseInt(process.env.ENTRY_BAN_FMS_RETRY_ATTEMPTS || '3', 10),

  // Базовая задержка между попытками (exponential backoff)
  retryDelay: parseInt(process.env.ENTRY_BAN_FMS_RETRY_DELAY || '2000', 10),

  // Circuit breaker: порог ошибок для открытия
  circuitBreakerThreshold: parseInt(process.env.ENTRY_BAN_FMS_CIRCUIT_BREAKER_THRESHOLD || '5', 10),

  // Circuit breaker: время восстановления в миллисекундах
  circuitBreakerResetTime: parseInt(
    process.env.ENTRY_BAN_FMS_CIRCUIT_BREAKER_RESET_TIME || '60000',
    10,
  ),

  // TTL кэша результатов в миллисекундах (24 часа)
  cacheTtl: parseInt(process.env.ENTRY_BAN_FMS_CACHE_TTL || String(24 * 60 * 60 * 1000), 10),

  // Настройки браузера (Playwright)
  browser: {
    headless: process.env.BROWSER_HEADLESS !== 'false',
    // Таймаут навигации
    navigationTimeout: parseInt(process.env.BROWSER_NAVIGATION_TIMEOUT || '30000', 10),
    // Таймаут ожидания селектора
    selectorTimeout: parseInt(process.env.BROWSER_SELECTOR_TIMEOUT || '10000', 10),
  },
}));
