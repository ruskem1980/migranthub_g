import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AuditService } from '../../modules/audit/audit.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    deviceId: string;
    subscriptionType: string;
  };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<AuthenticatedRequest>();
    const response = ctx.getResponse<Response>();

    const { method, url, ip, body } = request;
    const userAgent = request.get('user-agent') || '';
    const requestId = request.headers['x-request-id'] || '-';
    const userId = request.user?.id || null;

    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const { statusCode } = response;
          const contentLength = response.get('content-length') || 0;
          const duration = Date.now() - now;

          this.logger.log(
            `${method} ${url} ${statusCode} ${contentLength} - ${duration}ms - ${ip} "${userAgent}" [${requestId}]`,
          );

          // Асинхронно сохраняем в audit log
          this.auditService.log({
            userId,
            action: method,
            resource: url,
            requestBody: this.sanitizeRequestBody(body),
            responseStatus: statusCode,
            ipAddress: ip || 'unknown',
            userAgent: userAgent.substring(0, 500),
            durationMs: duration,
          });
        },
        error: (error: Error & { status?: number }) => {
          const duration = Date.now() - now;
          const statusCode = error.status || 500;

          this.logger.error(
            `${method} ${url} ERROR - ${duration}ms - ${ip} "${userAgent}" [${requestId}] - ${error.message}`,
          );

          // Логируем ошибки тоже
          this.auditService.log({
            userId,
            action: method,
            resource: url,
            requestBody: this.sanitizeRequestBody(body),
            responseStatus: statusCode,
            ipAddress: ip || 'unknown',
            userAgent: userAgent.substring(0, 500),
            durationMs: duration,
          });
        },
      }),
    );
  }

  /**
   * Удаляем чувствительные данные из тела запроса перед сохранением
   */
  private sanitizeRequestBody(body: unknown): Record<string, unknown> | null {
    if (!body || typeof body !== 'object') {
      return null;
    }

    const sanitized = { ...body } as Record<string, unknown>;

    // Удаляем потенциально чувствительные поля
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'authorization',
      'apiKey',
      'api_key',
      'refreshToken',
      'refresh_token',
      'accessToken',
      'access_token',
    ];

    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}
