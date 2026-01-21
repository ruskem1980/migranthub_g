import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Law, LawStatus } from '../database/entities/law.entity';
import { ScraperService, ScrapedLaw } from './scraper.service';
import { DiffEngineService } from './diff-engine.service';
import { AlertingService, LegislationUpdateEvent } from './alerting.service';
import { AIAnalysisService } from './ai-analysis.service';

@Injectable()
export class LegislationWatcherService {
  private readonly logger = new Logger(LegislationWatcherService.name);
  private isRunning = false;

  constructor(
    @InjectRepository(Law)
    private readonly lawRepository: Repository<Law>,
    private readonly scraperService: ScraperService,
    private readonly diffEngineService: DiffEngineService,
    private readonly alertingService: AlertingService,
    private readonly aiAnalysisService: AIAnalysisService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async scheduledLegislationCheck() {
    this.logger.log('Starting scheduled legislation check...');
    await this.checkLegislationUpdates();
  }

  async checkLegislationUpdates(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Legislation check is already running. Skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      this.logger.log('=== LEGISLATION WATCHER: Starting scraping process ===');
      
      const scrapedLaws = await this.scraperService.scrapeAllSources();
      this.logger.log(`Scraped ${scrapedLaws.length} documents from all sources`);

      if (scrapedLaws.length === 0) {
        this.logger.warn('No documents scraped. Check scraper configuration.');
        return;
      }

      const updates = await this.processScrapedLaws(scrapedLaws);
      
      if (updates.length > 0) {
        this.logger.log(`Detected ${updates.length} legislation updates`);
        await this.handleUpdates(updates);
      } else {
        this.logger.log('No legislation changes detected');
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      this.logger.log(`=== LEGISLATION WATCHER: Completed in ${duration}s ===`);
    } catch (error) {
      this.logger.error('Legislation check failed', error.stack);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  private async processScrapedLaws(scrapedLaws: ScrapedLaw[]): Promise<LegislationUpdateEvent[]> {
    const updates: LegislationUpdateEvent[] = [];

    for (const scrapedLaw of scrapedLaws) {
      try {
        const update = await this.processLaw(scrapedLaw);
        if (update) {
          updates.push(update);
        }
      } catch (error) {
        this.logger.error(
          `Failed to process law from ${scrapedLaw.sourceUrl}: ${error.message}`,
          error.stack
        );
      }
    }

    return updates;
  }

  private async processLaw(scrapedLaw: ScrapedLaw): Promise<LegislationUpdateEvent | null> {
    const existingLaw = await this.lawRepository.findOne({
      where: { source_url: scrapedLaw.sourceUrl }
    });

    const newHash = this.diffEngineService.calculateHash(scrapedLaw.rawText);

    if (!existingLaw) {
      await this.createNewLaw(scrapedLaw, newHash);
      this.logger.log(`New law added: ${scrapedLaw.title}`);
      return null;
    }

    const diffResult = this.diffEngineService.compareTexts(
      existingLaw.raw_text,
      scrapedLaw.rawText,
      existingLaw.content_hash
    );

    if (!diffResult.hasChanged) {
      this.logger.debug(`No changes detected for: ${scrapedLaw.title}`);
      return null;
    }

    if (!this.diffEngineService.isSignificantChange(diffResult.changePercentage || 0)) {
      this.logger.debug(`Insignificant change detected for: ${scrapedLaw.title}`);
      return null;
    }

    await this.updateExistingLaw(existingLaw, scrapedLaw, newHash);
    this.logger.log(
      `Law updated: ${scrapedLaw.title} (${diffResult.changePercentage?.toFixed(2)}% change)`
    );

    return {
      eventType: 'legislation.updated',
      lawId: existingLaw.id,
      title: scrapedLaw.title,
      sourceUrl: scrapedLaw.sourceUrl,
      changePercentage: diffResult.changePercentage || 0,
      diff: diffResult.textDiff || '',
      timestamp: new Date(),
      metadata: {
        oldHash: diffResult.oldHash,
        newHash: diffResult.newHash,
        keywords: existingLaw.metadata?.keywords
      }
    };
  }

  private async createNewLaw(scrapedLaw: ScrapedLaw, contentHash: string): Promise<Law> {
    const law = this.lawRepository.create({
      title: scrapedLaw.title,
      source_url: scrapedLaw.sourceUrl,
      raw_text: scrapedLaw.rawText,
      content_hash: contentHash,
      last_updated: scrapedLaw.scrapedAt,
      status: LawStatus.ACTIVE,
      metadata: {
        last_scrape_attempt: scrapedLaw.scrapedAt,
        scrape_errors: 0
      }
    });

    return await this.lawRepository.save(law);
  }

  private async updateExistingLaw(
    existingLaw: Law,
    scrapedLaw: ScrapedLaw,
    newHash: string
  ): Promise<Law> {
    existingLaw.title = scrapedLaw.title;
    existingLaw.raw_text = scrapedLaw.rawText;
    existingLaw.content_hash = newHash;
    existingLaw.last_updated = scrapedLaw.scrapedAt;
    existingLaw.status = LawStatus.PENDING_REVIEW;
    existingLaw.metadata = {
      ...existingLaw.metadata,
      last_scrape_attempt: scrapedLaw.scrapedAt
    };

    return await this.lawRepository.save(existingLaw);
  }

  private async handleUpdates(updates: LegislationUpdateEvent[]): Promise<void> {
    this.logger.log(`Processing ${updates.length} legislation updates...`);

    await this.alertingService.sendBatchUpdates(updates);

    if (this.aiAnalysisService.isEnabled()) {
      const analysisRequests = updates.map(update => ({
        lawId: update.lawId,
        title: update.title,
        diff: update.diff
      }));

      const analyses = await this.aiAnalysisService.analyzeMultipleChanges(analysisRequests);
      
      analyses.forEach((analysis, index) => {
        this.logger.log(
          `AI Analysis for "${updates[index].title}": ` +
          `Urgency=${analysis.urgency}, ActionRequired=${analysis.actionRequired}`
        );
      });
    } else {
      this.logger.log('AI Analysis is disabled. Skipping analysis step.');
    }
  }

  async getLawById(id: string): Promise<Law | null> {
    return await this.lawRepository.findOne({ where: { id } });
  }

  async getAllLaws(status?: LawStatus): Promise<Law[]> {
    if (status) {
      return await this.lawRepository.find({ where: { status } });
    }
    return await this.lawRepository.find();
  }

  async getRecentUpdates(limit: number = 10): Promise<Law[]> {
    return await this.lawRepository.find({
      order: { last_updated: 'DESC' },
      take: limit
    });
  }

  async manualTrigger(): Promise<void> {
    this.logger.log('Manual legislation check triggered');
    await this.checkLegislationUpdates();
  }
}
