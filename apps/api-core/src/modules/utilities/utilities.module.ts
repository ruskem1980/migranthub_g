import { Module } from '@nestjs/common';
import { BanCheckController } from './ban-check/ban-check.controller';
import { BanCheckService } from './ban-check/ban-check.service';
import { PatentController } from './patent/patent.controller';
import { PatentService } from './patent/patent.service';

@Module({
  controllers: [BanCheckController, PatentController],
  providers: [BanCheckService, PatentService],
  exports: [BanCheckService, PatentService],
})
export class UtilitiesModule {}
