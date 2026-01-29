import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { YooKassaProvider } from './yookassa.provider';
import { Payment } from './entities/payment.entity';
import { AuditModule } from '../audit/audit.module';
import { CacheModule } from '../cache/cache.module';
import yookassaConfig from '../../config/yookassa.config';

@Module({
  imports: [
    ConfigModule.forFeature(yookassaConfig),
    TypeOrmModule.forFeature([Payment]),
    AuditModule,
    CacheModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, YooKassaProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
