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
import { PermitStatusCheckController } from './permit-status-check/permit-status-check.controller';
import { PermitStatusCheckService } from './permit-status-check/permit-status-check.service';
import { FmsPermitClient } from './permit-status-check/fms-permit.client';
import { FsspCheckController } from './fssp-check/fssp-check.controller';
import { FsspCheckService } from './fssp-check/fssp-check.service';
import { FsspClient } from './fssp-check/fssp.client';
import { PassportValidityController } from './passport-validity/passport-validity.controller';
import { PassportValidityService } from './passport-validity/passport-validity.service';
import { MvdPassportClient } from './passport-validity/mvd-passport.client';
import { GibddCheckController } from './gibdd-check/gibdd-check.controller';
import { GibddCheckService } from './gibdd-check/gibdd-check.service';
import { GibddClient } from './gibdd-check/gibdd.client';
import { WorkPermitCheckController } from './work-permit-check/work-permit-check.controller';
import { WorkPermitCheckService } from './work-permit-check/work-permit-check.service';
import { WorkPermitClient } from './work-permit-check/work-permit.client';
import { BrowserService, CaptchaSolverService } from '../../common/services';

@Module({
  controllers: [
    BanCheckController,
    PatentController,
    InnCheckController,
    PermitStatusCheckController,
    FsspCheckController,
    PassportValidityController,
    GibddCheckController,
    WorkPermitCheckController,
  ],
  providers: [
    BanCheckService,
    MvdClient,
    FmsClient,
    PatentService,
    PatentCheckService,
    InnCheckService,
    PermitStatusCheckService,
    FmsPermitClient,
    FsspCheckService,
    FsspClient,
    PassportValidityService,
    MvdPassportClient,
    GibddCheckService,
    GibddClient,
    WorkPermitCheckService,
    WorkPermitClient,
    BrowserService,
    CaptchaSolverService,
  ],
  exports: [
    BanCheckService,
    PatentService,
    PatentCheckService,
    InnCheckService,
    PermitStatusCheckService,
    FsspCheckService,
    PassportValidityService,
    GibddCheckService,
    WorkPermitCheckService,
  ],
})
export class UtilitiesModule {}
