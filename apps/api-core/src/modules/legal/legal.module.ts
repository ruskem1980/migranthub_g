import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LegalService } from './legal.service';
import { LegalController } from './legal.controller';
import { LegalSyncService } from './legal-sync.service';
import rabbitmqConfig from '../../config/rabbitmq.config';

@Module({
  imports: [
    ConfigModule.forFeature(rabbitmqConfig),
  ],
  controllers: [LegalController],
  providers: [LegalService, LegalSyncService],
  exports: [LegalService],
})
export class LegalModule {}
