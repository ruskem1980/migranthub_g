import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { Law } from '../database/entities/law.entity';
import { LegislationWatcherService } from './legislation-watcher.service';
import { LegislationWatcherController } from './legislation-watcher.controller';
import { ScraperService } from './scraper.service';
import { DiffEngineService } from './diff-engine.service';
import { AlertingService } from './alerting.service';
import { AIAnalysisService } from './ai-analysis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Law]),
    ScheduleModule.forRoot(),
    ConfigModule,
  ],
  controllers: [LegislationWatcherController],
  providers: [
    LegislationWatcherService,
    ScraperService,
    DiffEngineService,
    AlertingService,
    AIAnalysisService,
  ],
  exports: [LegislationWatcherService],
})
export class LegislationWatcherModule {}
