import { Module } from '@nestjs/common';
import { FsspCheckController } from './fssp-check.controller';
import { FsspCheckService } from './fssp-check.service';
import { FsspClient } from './fssp.client';
import { BrowserService, CaptchaSolverService } from '../../../common/services';

@Module({
  controllers: [FsspCheckController],
  providers: [FsspCheckService, FsspClient, BrowserService, CaptchaSolverService],
  exports: [FsspCheckService],
})
export class FsspCheckModule {}
