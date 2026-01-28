import { registerAs } from '@nestjs/config';

export default registerAs('innCheck', () => ({
  // URL сервиса ФНС для получения ИНН
  serviceUrl: process.env.INN_CHECK_SERVICE_URL || 'https://service.nalog.ru/inn.do',

  // Включение реальных запросов (false = только mock)
  enabled: process.env.INN_CHECK_ENABLED === 'true',

  // Таймаут запроса в миллисекундах
  timeout: parseInt(process.env.INN_CHECK_TIMEOUT || '30000', 10),

  // Количество попыток при ошибке
  retryAttempts: parseInt(process.env.INN_CHECK_RETRY_ATTEMPTS || '3', 10),

  // Базовая задержка между попытками (exponential backoff)
  retryDelay: parseInt(process.env.INN_CHECK_RETRY_DELAY || '2000', 10),

  // Circuit breaker: порог ошибок для открытия
  circuitBreakerThreshold: parseInt(process.env.INN_CHECK_CIRCUIT_BREAKER_THRESHOLD || '5', 10),

  // Circuit breaker: время восстановления в миллисекундах
  circuitBreakerResetTime: parseInt(
    process.env.INN_CHECK_CIRCUIT_BREAKER_RESET_TIME || '60000',
    10,
  ),

  // TTL кэша результатов в миллисекундах (30 дней - ИНН не меняется)
  cacheTtl: parseInt(process.env.INN_CHECK_CACHE_TTL || String(30 * 24 * 60 * 60 * 1000), 10),

  // 2Captcha API настройки (используем общие с patent-check)
  captcha: {
    apiKey: process.env.TWO_CAPTCHA_API_KEY || '',
    enabled: process.env.TWO_CAPTCHA_ENABLED === 'true',
    // Таймаут решения капчи в миллисекундах
    timeout: parseInt(process.env.TWO_CAPTCHA_TIMEOUT || '120000', 10),
    // Интервал проверки результата
    pollingInterval: parseInt(process.env.TWO_CAPTCHA_POLLING_INTERVAL || '5000', 10),
  },

  // Настройки браузера (Playwright)
  browser: {
    headless: process.env.BROWSER_HEADLESS !== 'false',
    // Таймаут навигации
    navigationTimeout: parseInt(process.env.BROWSER_NAVIGATION_TIMEOUT || '30000', 10),
    // Таймаут ожидания селектора
    selectorTimeout: parseInt(process.env.BROWSER_SELECTOR_TIMEOUT || '10000', 10),
  },
}));
