import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { SigningService } from '../../modules/auth/signing.service';

/**
 * Интерфейс для request с аутентифицированным пользователем.
 * Расширяет Express Request для типизации данных из JWT.
 */
interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    did: string;
    type: string;
  };
}

/**
 * Guard для проверки подписи запросов с HMAC-SHA256.
 *
 * Требует:
 * - Валидный JWT токен (должен быть применён JwtAuthGuard перед этим guard)
 * - Заголовок X-Signature с base64-encoded HMAC-SHA256 подписью
 * - Заголовок X-Timestamp с Unix timestamp в миллисекундах
 *
 * Формат подписи:
 * X-Signature: base64(HMAC-SHA256(timestamp + method + path + body, secretKey))
 *
 * @example
 * // Применение к контроллеру
 * @UseGuards(JwtAuthGuard, SigningGuard)
 * @Controller('users')
 * export class UsersController {}
 *
 * @example
 * // Применение к отдельному методу
 * @UseGuards(JwtAuthGuard, SigningGuard)
 * @Get('profile')
 * getProfile() {}
 */
@Injectable()
export class SigningGuard implements CanActivate {
  constructor(private readonly signingService: SigningService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    // Проверяем наличие аутентифицированного пользователя из JWT
    if (!request.user || !request.user.sub) {
      throw new UnauthorizedException(
        'User not authenticated. JwtAuthGuard must be applied before SigningGuard.',
      );
    }

    const userId = request.user.sub;

    // Делегируем проверку подписи сервису
    await this.signingService.verifySignature(request, userId);

    return true;
  }
}
