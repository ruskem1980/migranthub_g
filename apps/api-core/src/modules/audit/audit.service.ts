import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export interface AuditLogData {
  userId?: string | null;
  action: string;
  resource: string;
  requestBody?: Record<string, unknown> | null;
  responseStatus: number;
  ipAddress: string;
  userAgent: string;
  durationMs: number;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(data: AuditLogData): Promise<void> {
    try {
      const auditLog = this.auditLogRepository.create({
        userId: data.userId || null,
        action: data.action,
        resource: data.resource,
        requestBody: data.requestBody || null,
        responseStatus: data.responseStatus,
        ipAddress: data.ipAddress || 'unknown',
        userAgent: data.userAgent || 'unknown',
        durationMs: data.durationMs,
      });

      await this.auditLogRepository.save(auditLog);
    } catch (error) {
      // Не прерываем основной поток при ошибке логирования
      this.logger.error('Failed to save audit log', error);
    }
  }
}
