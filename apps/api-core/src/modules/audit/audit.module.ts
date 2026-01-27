import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditService } from './audit.service';
import { LoggingInterceptor } from '../../common/interceptors/logging.interceptor';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditService, LoggingInterceptor],
  exports: [AuditService, LoggingInterceptor],
})
export class AuditModule {}
