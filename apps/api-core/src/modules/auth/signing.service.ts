import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

/**
 * Сервис для подписи запросов с использованием HMAC-SHA256.
 * Защищает от MITM атак путём проверки целостности запроса.
 *
 * Формат подписи:
 * X-Signature: base64(HMAC-SHA256(timestamp + method + path + body, secretKey))
 * X-Timestamp: unix_timestamp_ms
 */
@Injectable()
export class SigningService {
  private readonly logger = new Logger(SigningService.name);

  /** Максимально допустимый возраст запроса (5 минут) */
  private readonly MAX_TIMESTAMP_AGE_MS = 5 * 60 * 1000;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Генерирует криптографически безопасный ключ подписи.
   * Используется при регистрации устройства.
   * @returns 32-байтный hex-ключ (64 символа)
   */
  generateSigningKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Вычисляет HMAC-SHA256 подпись для запроса.
   * @param timestamp - Unix timestamp в миллисекундах
   * @param method - HTTP метод (GET, POST, etc.)
   * @param path - Путь запроса (e.g., /api/users/profile)
   * @param body - Тело запроса (пустая строка для GET)
   * @param signingKey - Секретный ключ пользователя
   * @returns Base64-encoded подпись
   */
  computeSignature(
    timestamp: string,
    method: string,
    path: string,
    body: string,
    signingKey: string,
  ): string {
    const message = timestamp + method.toUpperCase() + path + body;
    const hmac = crypto.createHmac('sha256', signingKey);
    hmac.update(message);
    return hmac.digest('base64');
  }

  /**
   * Проверяет подпись запроса.
   * @param request - Express request объект
   * @param userId - ID пользователя из JWT
   * @returns true если подпись валидна
   * @throws UnauthorizedException при ошибке проверки
   */
  async verifySignature(request: Request, userId: string): Promise<boolean> {
    const signature = request.headers['x-signature'] as string | undefined;
    const timestamp = request.headers['x-timestamp'] as string | undefined;

    // Проверяем наличие обязательных заголовков
    if (!signature || !timestamp) {
      this.logger.warn(`Отсутствуют заголовки подписи для пользователя ${userId}`);
      throw new UnauthorizedException('Missing signature headers');
    }

    // Проверяем актуальность timestamp
    const requestTime = parseInt(timestamp, 10);
    if (isNaN(requestTime)) {
      throw new UnauthorizedException('Invalid timestamp format');
    }

    const now = Date.now();
    const age = now - requestTime;

    if (age > this.MAX_TIMESTAMP_AGE_MS) {
      this.logger.warn(`Истёкший timestamp для пользователя ${userId}: возраст ${age}ms`);
      throw new UnauthorizedException('Request timestamp expired');
    }

    // Защита от replay-атак с будущим timestamp (с небольшим допуском на рассинхрон)
    if (requestTime > now + 60000) {
      // 1 минута допуска
      this.logger.warn(`Timestamp из будущего для пользователя ${userId}: ${requestTime} > ${now}`);
      throw new UnauthorizedException('Invalid timestamp');
    }

    // Получаем signing key пользователя
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'signingKey'],
    });

    if (!user || !user.signingKey) {
      this.logger.warn(`Signing key не найден для пользователя ${userId}`);
      throw new UnauthorizedException('Signing key not found');
    }

    // Вычисляем ожидаемую подпись
    const method = request.method;
    const path = request.originalUrl || request.url;
    const body =
      request.body && Object.keys(request.body).length > 0 ? JSON.stringify(request.body) : '';

    const expectedSignature = this.computeSignature(timestamp, method, path, body, user.signingKey);

    // Безопасное сравнение для предотвращения timing атак
    const signatureBuffer = Buffer.from(signature, 'base64');
    const expectedBuffer = Buffer.from(expectedSignature, 'base64');

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      this.logger.warn(`Неверная подпись для пользователя ${userId}`);
      throw new UnauthorizedException('Invalid signature');
    }

    return true;
  }
}
