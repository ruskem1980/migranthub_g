import { Controller, Get, Post, Param, Query, HttpCode, HttpStatus, Logger, NotFoundException } from '@nestjs/common';
import { LegislationWatcherService } from './legislation-watcher.service';
import { Law, LawStatus } from '../database/entities/law.entity';
import { DailyReport } from '../database/entities/report.entity';
import { ReportingService } from './reporting.service';

@Controller('legislation')
export class LegislationWatcherController {
  private readonly logger = new Logger(LegislationWatcherController.name);

  constructor(
    private readonly legislationWatcherService: LegislationWatcherService,
    private readonly reportingService: ReportingService,
  ) {}

  @Get('laws')
  async getAllLaws(@Query('status') status?: LawStatus): Promise<Law[]> {
    this.logger.log(`Fetching all laws${status ? ` with status: ${status}` : ''}`);
    return await this.legislationWatcherService.getAllLaws(status);
  }

  @Get('laws/:id')
  async getLawById(@Param('id') id: string): Promise<Law | null> {
    this.logger.log(`Fetching law with id: ${id}`);
    return await this.legislationWatcherService.getLawById(id);
  }

  @Get('recent-updates')
  async getRecentUpdates(@Query('limit') limit?: number): Promise<Law[]> {
    const limitValue = limit ? parseInt(limit.toString(), 10) : 10;
    this.logger.log(`Fetching ${limitValue} recent updates`);
    return await this.legislationWatcherService.getRecentUpdates(limitValue);
  }

  @Post('check')
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerManualCheck(): Promise<{ message: string }> {
    this.logger.log('Manual legislation check triggered via API');
    
    this.legislationWatcherService.manualTrigger().catch(error => {
      this.logger.error('Manual check failed', error.stack);
    });

    return {
      message: 'Legislation check started. This may take several minutes.'
    };
  }

  @Get('health')
  async healthCheck(): Promise<{ status: string; timestamp: Date }> {
    return {
      status: 'ok',
      timestamp: new Date()
    };
  }

  // ========== Reports Endpoints ==========

  @Get('reports')
  async getReports(@Query('limit') limit?: number): Promise<DailyReport[]> {
    const limitValue = limit ? parseInt(limit.toString(), 10) : 10;
    this.logger.log(`Fetching ${limitValue} recent reports`);
    return await this.reportingService.getRecentReports(limitValue);
  }

  @Get('reports/latest')
  async getLatestReport(): Promise<DailyReport> {
    this.logger.log('Fetching latest report');
    const report = await this.reportingService.getLatestReport();

    if (!report) {
      throw new NotFoundException('No reports found');
    }

    return report;
  }

  @Get('reports/urgent')
  async getUrgentReports(@Query('limit') limit?: number): Promise<DailyReport[]> {
    const limitValue = limit ? parseInt(limit.toString(), 10) : 10;
    this.logger.log(`Fetching ${limitValue} urgent reports`);
    return await this.reportingService.getUrgentReports(limitValue);
  }

  @Get('reports/:date')
  async getReportByDate(@Param('date') dateString: string): Promise<DailyReport> {
    this.logger.log(`Fetching report for date: ${dateString}`);

    // Parse date string (expected format: YYYY-MM-DD)
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      throw new NotFoundException(`Invalid date format: ${dateString}. Use YYYY-MM-DD format.`);
    }

    const report = await this.reportingService.getDailyReport(date);

    if (!report) {
      throw new NotFoundException(`No report found for date: ${dateString}`);
    }

    return report;
  }
}
