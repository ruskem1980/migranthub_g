import { Module } from '@nestjs/common';
import { GibddCheckController } from './gibdd-check.controller';
import { GibddCheckService } from './gibdd-check.service';
import { GibddClient } from './gibdd.client';

@Module({
  controllers: [GibddCheckController],
  providers: [GibddCheckService, GibddClient],
  exports: [GibddCheckService],
})
export class GibddCheckModule {}
