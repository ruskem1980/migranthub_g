import { Controller, Get, Post, Param, Query, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { LegislationWatcherService } from './legislation-watcher.service';
import { Law, LawStatus } from '../database/entities/law.entity';

@Controller('legislation')
export class LegislationWatcherController {
  private readonly logger = new Logger(LegislationWatcherController.name);

  constructor(private readonly legislationWatcherService: LegislationWatcherService) {}

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
}
