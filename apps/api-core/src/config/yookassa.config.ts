import { registerAs } from '@nestjs/config';

export default registerAs('yookassa', () => ({
  shopId: process.env.YOOKASSA_SHOP_ID || '',
  secretKey: process.env.YOOKASSA_SECRET_KEY || '',
  baseUrl: process.env.YOOKASSA_BASE_URL || 'https://api.yookassa.ru/v3',
  returnUrl: process.env.YOOKASSA_RETURN_URL || 'https://migranthub.ru/payment/success',
  webhookSecret: process.env.YOOKASSA_WEBHOOK_SECRET || '',
  timeout: parseInt(process.env.YOOKASSA_TIMEOUT || '30000', 10),
  // Circuit breaker settings
  circuitBreaker: {
    failureThreshold: parseInt(process.env.YOOKASSA_CB_FAILURE_THRESHOLD || '5', 10),
    successThreshold: parseInt(process.env.YOOKASSA_CB_SUCCESS_THRESHOLD || '2', 10),
    timeout: parseInt(process.env.YOOKASSA_CB_TIMEOUT || '60000', 10),
  },
}));
