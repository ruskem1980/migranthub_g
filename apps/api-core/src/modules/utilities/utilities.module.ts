import { Module } from '@nestjs/common';
import { BanCheckController } from './ban-check/ban-check.controller';
import { BanCheckService } from './ban-check/ban-check.service';
import { MvdClient } from './ban-check/mvd.client';
import { FmsClient } from './ban-check/fms.client';
import { PatentController } from './patent/patent.controller';
import { PatentService } from './patent/patent.service';
import { PatentCheckService } from './patent/patent-check.service';
import { InnCheckController } from './inn-check/inn-check.controller';
import { InnCheckService } from './inn-check/inn-check.service';
import {
  BrowserService,
  CaptchaSolverService,
} from '../../common/services';

@Module({
  controllers: [BanCheckController, PatentController, InnCheckController],
  providers: [
    BanCheckService,
    MvdClient,
    FmsClient,
    PatentService,
    PatentCheckService,
    InnCheckService,
    BrowserService,
    CaptchaSolverService,
  ],
  exports: [BanCheckService, PatentService, PatentCheckService, InnCheckService],
})
export class UtilitiesModule {}
