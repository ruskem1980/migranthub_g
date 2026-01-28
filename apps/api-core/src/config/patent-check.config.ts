import { registerAs } from '@nestjs/config';

export default registerAs('patentCheck', () => ({
  // URL сервиса ФМС для проверки патента
  serviceUrl:
    process.env.PATENT_CHECK_SERVICE_URL || 'https://services.fms.gov.ru/info-service.htm?sid=2000',

  // Включение реальных запросов (false = только mock)
  enabled: process.env.PATENT_CHECK_ENABLED === 'true',

  // Таймаут запроса в миллисекундах
  timeout: parseInt(process.env.PATENT_CHECK_TIMEOUT || '30000', 10),

  // Количество попыток при ошибке
  retryAttempts: parseInt(process.env.PATENT_CHECK_RETRY_ATTEMPTS || '3', 10),

  // Базовая задержка между попытками (exponential backoff)
  retryDelay: parseInt(process.env.PATENT_CHECK_RETRY_DELAY || '2000', 10),

  // Circuit breaker: порог ошибок для открытия
  circuitBreakerThreshold: parseInt(process.env.PATENT_CHECK_CIRCUIT_BREAKER_THRESHOLD || '5', 10),

  // Circuit breaker: время восстановления в миллисекундах
  circuitBreakerResetTime: parseInt(
    process.env.PATENT_CHECK_CIRCUIT_BREAKER_RESET_TIME || '60000',
    10,
  ),

  // TTL кэша результатов в миллисекундах (6 часов)
  cacheTtl: parseInt(process.env.PATENT_CHECK_CACHE_TTL || String(6 * 60 * 60 * 1000), 10),

  // 2Captcha API настройки
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
