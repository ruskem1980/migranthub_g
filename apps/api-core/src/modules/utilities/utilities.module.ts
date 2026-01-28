import { Module } from '@nestjs/common';
import { BanCheckController } from './ban-check/ban-check.controller';
import { BanCheckService } from './ban-check/ban-check.service';
import { MvdClient } from './ban-check/mvd.client';
import { PatentController } from './patent/patent.controller';
import { PatentService } from './patent/patent.service';
import { PatentCheckService } from './patent/patent-check.service';
import {
  BrowserService,
  CaptchaSolverService,
} from '../../common/services';

@Module({
  controllers: [BanCheckController, PatentController],
  providers: [
    BanCheckService,
    MvdClient,
    PatentService,
    PatentCheckService,
    BrowserService,
    CaptchaSolverService,
  ],
  exports: [BanCheckService, PatentService, PatentCheckService],
})
export class UtilitiesModule {}
