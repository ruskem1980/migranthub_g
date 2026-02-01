import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { Law } from '../database/entities/law.entity';
import { DailyReport } from '../database/entities/report.entity';
import { LegislationWatcherService } from './legislation-watcher.service';
import { LegislationWatcherController } from './legislation-watcher.controller';
import { BrowserService } from './browser.service';
import { ScraperService } from './scraper.service';
import { DiffEngineService } from './diff-engine.service';
import { AlertingService } from './alerting.service';
import { AIAnalysisService } from './ai-analysis.service';
import { ReportingService } from './reporting.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Law, DailyReport]),
    ScheduleModule.forRoot(),
    ConfigModule,
  ],
  controllers: [LegislationWatcherController],
  providers: [
    LegislationWatcherService,
    BrowserService,
    ScraperService,
    DiffEngineService,
    AlertingService,
    AIAnalysisService,
    ReportingService,
  ],
  exports: [LegislationWatcherService, ReportingService],
})
export class LegislationWatcherModule {}
