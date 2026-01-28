import { registerAs } from '@nestjs/config';

export default registerAs('permitStatus', () => ({
  // URL сервиса ФМС для проверки РВП (sid=2060)
  serviceUrlRvp:
    process.env.PERMIT_STATUS_RVP_URL || 'https://services.fms.gov.ru/info-service.htm?sid=2060',

  // URL сервиса ФМС для проверки ВНЖ (sid=2070)
  serviceUrlVnj:
    process.env.PERMIT_STATUS_VNJ_URL || 'https://services.fms.gov.ru/info-service.htm?sid=2070',

  // Включение реальных запросов (false = только mock)
  enabled: process.env.PERMIT_STATUS_ENABLED === 'true',

  // Таймаут запроса в миллисекундах
  timeout: parseInt(process.env.PERMIT_STATUS_TIMEOUT || '30000', 10),

  // Количество попыток при ошибке
  retryAttempts: parseInt(process.env.PERMIT_STATUS_RETRY_ATTEMPTS || '3', 10),

  // Базовая задержка между попытками (exponential backoff)
  retryDelay: parseInt(process.env.PERMIT_STATUS_RETRY_DELAY || '2000', 10),

  // Circuit breaker: порог ошибок для открытия
  circuitBreakerThreshold: parseInt(process.env.PERMIT_STATUS_CIRCUIT_BREAKER_THRESHOLD || '5', 10),

  // Circuit breaker: время восстановления в миллисекундах
  circuitBreakerResetTime: parseInt(
    process.env.PERMIT_STATUS_CIRCUIT_BREAKER_RESET_TIME || '60000',
    10,
  ),

  // TTL кэша результатов в миллисекундах (6 часов)
  cacheTtl: parseInt(process.env.PERMIT_STATUS_CACHE_TTL || String(6 * 60 * 60 * 1000), 10),

  // Настройки браузера (Playwright)
  browser: {
    headless: process.env.BROWSER_HEADLESS !== 'false',
    // Таймаут навигации
    navigationTimeout: parseInt(process.env.BROWSER_NAVIGATION_TIMEOUT || '30000', 10),
    // Таймаут ожидания селектора
    selectorTimeout: parseInt(process.env.BROWSER_SELECTOR_TIMEOUT || '10000', 10),
  },
}));
