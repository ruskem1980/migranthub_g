import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DailyReport, ReportChange } from '../database/entities/report.entity';
import { AIAnalysisResponse } from './ai-analysis.service';
import { LegislationUpdateEvent } from './alerting.service';

export interface GenerateReportInput {
  updates: LegislationUpdateEvent[];
  analyses: AIAnalysisResponse[];
}

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  constructor(
    @InjectRepository(DailyReport)
    private readonly reportRepository: Repository<DailyReport>,
  ) {}

  /**
   * Generates a daily report from legislation updates and AI analyses
   */
  async generateDailyReport(input: GenerateReportInput): Promise<DailyReport> {
    const today = this.getDateOnly(new Date());

    // Check if report for today already exists
    const existingReport = await this.reportRepository.findOne({
      where: { date: today },
    });

    const changes: ReportChange[] = input.updates.map((update, index) => {
      const analysis = input.analyses[index];

      return {
        lawId: update.lawId,
        title: update.title,
        changePercentage: update.changePercentage,
        urgency: analysis?.urgency || 'medium',
        summary: analysis?.summary || `Обнаружены изменения в документе "${update.title}"`,
        impactForMigrants: analysis?.impactForMigrants || 'Требуется анализ влияния на мигрантов',
        recommendations: analysis?.recommendations || [],
        actionRequired: analysis?.actionRequired || false,
      };
    });

    if (existingReport) {
      // Append new changes to existing report
      this.logger.log(`Updating existing report for ${today.toISOString().split('T')[0]}`);

      // Merge changes, avoiding duplicates by lawId
      const existingLawIds = new Set(existingReport.changes.map(c => c.lawId));
      const newChanges = changes.filter(c => !existingLawIds.has(c.lawId));

      existingReport.changes = [...existingReport.changes, ...newChanges];
      existingReport.changesCount = existingReport.changes.length;

      const savedReport = await this.reportRepository.save(existingReport);
      this.logger.log(`Report updated with ${newChanges.length} new changes. Total: ${savedReport.changesCount}`);

      return savedReport;
    }

    // Create new report
    const report = this.reportRepository.create({
      date: today,
      changesCount: changes.length,
      changes,
    });

    const savedReport = await this.reportRepository.save(report);
    this.logger.log(`Daily report generated with ${savedReport.changesCount} changes for ${today.toISOString().split('T')[0]}`);

    return savedReport;
  }

  /**
   * Generates an empty report for days with no changes
   */
  async generateEmptyReport(): Promise<DailyReport> {
    const today = this.getDateOnly(new Date());

    const existingReport = await this.reportRepository.findOne({
      where: { date: today },
    });

    if (existingReport) {
      this.logger.log(`Report for ${today.toISOString().split('T')[0]} already exists`);
      return existingReport;
    }

    const report = this.reportRepository.create({
      date: today,
      changesCount: 0,
      changes: [],
    });

    const savedReport = await this.reportRepository.save(report);
    this.logger.log(`Empty daily report generated for ${today.toISOString().split('T')[0]}`);

    return savedReport;
  }

  /**
   * Gets a report for a specific date
   */
  async getDailyReport(date: Date): Promise<DailyReport | null> {
    const dateOnly = this.getDateOnly(date);

    return await this.reportRepository.findOne({
      where: { date: dateOnly },
    });
  }

  /**
   * Gets the most recent reports
   */
  async getRecentReports(limit: number = 10): Promise<DailyReport[]> {
    return await this.reportRepository.find({
      order: { date: 'DESC' },
      take: limit,
    });
  }

  /**
   * Gets all reports within a date range
   */
  async getReportsInRange(startDate: Date, endDate: Date): Promise<DailyReport[]> {
    const start = this.getDateOnly(startDate);
    const end = this.getDateOnly(endDate);

    return await this.reportRepository.find({
      where: {
        date: Between(start, end),
      },
      order: { date: 'DESC' },
    });
  }

  /**
   * Gets the latest report
   */
  async getLatestReport(): Promise<DailyReport | null> {
    return await this.reportRepository.findOne({
      order: { date: 'DESC' },
    });
  }

  /**
   * Gets reports with critical or high urgency changes
   */
  async getUrgentReports(limit: number = 10): Promise<DailyReport[]> {
    const reports = await this.reportRepository.find({
      order: { date: 'DESC' },
      take: limit * 2, // Get more to filter
    });

    return reports
      .filter(report =>
        report.changes.some(change =>
          change.urgency === 'critical' || change.urgency === 'high'
        )
      )
      .slice(0, limit);
  }

  /**
   * Normalizes a date to midnight UTC for consistent comparisons
   */
  private getDateOnly(date: Date): Date {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }
}
