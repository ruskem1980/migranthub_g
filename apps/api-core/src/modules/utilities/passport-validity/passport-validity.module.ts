import { Module } from '@nestjs/common';
import { PassportValidityController } from './passport-validity.controller';
import { PassportValidityService } from './passport-validity.service';
import { MvdPassportClient } from './mvd-passport.client';
import { BrowserService, CaptchaSolverService } from '../../../common/services';

@Module({
  controllers: [PassportValidityController],
  providers: [PassportValidityService, MvdPassportClient, BrowserService, CaptchaSolverService],
  exports: [PassportValidityService],
})
export class PassportValidityModule {}
