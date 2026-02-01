import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { categories, laws, forms, faqItems, patentRegions, BASE_NDFL } from './data';
import {
  CategoryDto,
  CategoryItemsDto,
  LawDto,
  LawFilterDto,
  FormDto,
  FaqItemDto,
  PatentCalcRequestDto,
  PatentCalcResponseDto,
  PatentCalcBreakdownDto,
  StayCalcRequestDto,
  StayCalcResponseDto,
  StayPeriodDto,
  LegalMetadataDto,
} from './dto';

// Default metadata - will be updated dynamically via RabbitMQ
const DEFAULT_METADATA = {
  lastUpdatedAt: '2026-01-01',
  source: 'consultant.ru',
  version: '2.0.0',
};

/**
 * Interface for metadata update
 */
export interface MetadataUpdate {
  lastUpdatedAt?: string;
  source?: string;
  version?: string;
}

@Injectable()
export class LegalService {
  private readonly logger = new Logger(LegalService.name);

  // Dynamic metadata storage (in-memory)
  private metadata = { ...DEFAULT_METADATA };

  // ==================== Metadata ====================

  getMetadata(): LegalMetadataDto {
    return {
      ...this.metadata,
      lawsCount: laws.length,
      formsCount: forms.length,
      faqCount: faqItems.length,
    };
  }

  /**
   * Update metadata dynamically (called by LegalSyncService)
   */
  updateMetadata(update: MetadataUpdate): void {
    if (update.lastUpdatedAt) {
      this.metadata.lastUpdatedAt = update.lastUpdatedAt;
    }
    if (update.source) {
      this.metadata.source = update.source;
    }
    if (update.version) {
      this.metadata.version = update.version;
    }
    this.logger.log(`Metadata updated: lastUpdatedAt=${this.metadata.lastUpdatedAt}`);
  }

  /**
   * Reset metadata to defaults (for testing)
   */
  resetMetadata(): void {
    this.metadata = { ...DEFAULT_METADATA };
    this.logger.log('Metadata reset to defaults');
  }

  // ==================== Categories ====================

  getCategories(): CategoryDto[] {
    return categories.sort((a, b) => a.order - b.order);
  }

  getCategoryById(id: string): CategoryDto {
    const category = categories.find((c) => c.id === id);
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return category;
  }

  getCategoryItems(categoryId: string): CategoryItemsDto {
    this.getCategoryById(categoryId);

    return {
      laws: laws.filter((l) => l.categoryId === categoryId),
      forms: forms.filter((f) => f.categoryId === categoryId),
      faq: faqItems.filter((f) => f.categoryId === categoryId).sort((a, b) => a.order - b.order),
    };
  }

  // ==================== Laws ====================

  getLaws(filter?: LawFilterDto): LawDto[] {
    let result = [...laws];

    if (filter?.categoryId) {
      result = result.filter((l) => l.categoryId === filter.categoryId);
    }

    if (filter?.search) {
      const search = filter.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(search) ||
          l.number.toLowerCase().includes(search) ||
          l.summary.toLowerCase().includes(search),
      );
    }

    return result;
  }

  getLawById(id: string): LawDto {
    const law = laws.find((l) => l.id === id);
    if (!law) {
      throw new NotFoundException(`Law ${id} not found`);
    }
    return law;
  }

  // ==================== Forms ====================

  getForms(categoryId?: string): FormDto[] {
    if (categoryId) {
      return forms.filter((f) => f.categoryId === categoryId);
    }
    return forms;
  }

  getFormById(id: string): FormDto {
    const form = forms.find((f) => f.id === id);
    if (!form) {
      throw new NotFoundException(`Form ${id} not found`);
    }
    return form;
  }

  // ==================== FAQ ====================

  getFaq(categoryId?: string): FaqItemDto[] {
    let result = [...faqItems];

    if (categoryId) {
      result = result.filter((f) => f.categoryId === categoryId);
    }

    return result.sort((a, b) => a.order - b.order);
  }

  // ==================== Patent Calculator ====================

  calculatePatentPrice(request: PatentCalcRequestDto): PatentCalcResponseDto {
    const region = patentRegions.find((r) => r.code === request.regionCode);

    if (!region) {
      throw new NotFoundException(`Region with code ${request.regionCode} not found`);
    }

    const totalPrice = region.monthlyCost * request.months;

    // Build breakdown
    const breakdown: PatentCalcBreakdownDto[] = [];
    for (let i = 1; i <= request.months; i++) {
      breakdown.push({
        month: i,
        price: region.monthlyCost,
      });
    }

    return {
      regionCode: region.code,
      regionName: region.name,
      baseRate: BASE_NDFL,
      coefficient: region.coefficient,
      months: request.months,
      totalPrice,
      breakdown,
    };
  }

  getPatentRegions() {
    return patentRegions.map((r) => ({
      code: r.code,
      name: r.name,
      coefficient: r.coefficient,
      monthlyCost: r.monthlyCost,
      cities: r.cities,
    }));
  }

  // ==================== Stay Calculator (90/180) ====================

  calculateStay(request: StayCalcRequestDto): StayCalcResponseDto {
    const entryDate = new Date(request.entryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    entryDate.setHours(0, 0, 0, 0);

    const exitDates = (request.exitDates || []).map((d: string) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date;
    });

    // Sort exit dates
    exitDates.sort((a: Date, b: Date) => a.getTime() - b.getTime());

    // Calculate stay periods
    const periods: StayPeriodDto[] = [];
    let totalDaysInRussia = 0;
    let currentEntryDate = entryDate;

    for (const exitDate of exitDates) {
      if (exitDate > currentEntryDate) {
        const days = this.daysBetween(currentEntryDate, exitDate);
        periods.push({
          startDate: this.formatDate(currentEntryDate),
          endDate: this.formatDate(exitDate),
          days,
        });
        totalDaysInRussia += days;
      }
      // After exit, assume re-entry next day (simplified logic)
      currentEntryDate = new Date(exitDate.getTime() + 24 * 60 * 60 * 1000);
    }

    // Add current period (from last entry to today)
    if (currentEntryDate <= today) {
      const days = this.daysBetween(currentEntryDate, today);
      periods.push({
        startDate: this.formatDate(currentEntryDate),
        endDate: this.formatDate(today),
        days,
      });
      totalDaysInRussia += days;
    }

    // If no exits, count from entry date to today
    if (exitDates.length === 0) {
      totalDaysInRussia = this.daysBetween(entryDate, today);
      periods.length = 0; // Clear any periods
      periods.push({
        startDate: this.formatDate(entryDate),
        endDate: this.formatDate(today),
        days: totalDaysInRussia,
      });
    }

    // Calculate remaining days (max 90 days)
    const maxDays = 90;
    const daysRemaining = Math.max(0, maxDays - totalDaysInRussia);

    // Max stay date (entry + 90 days)
    const maxStayDate = new Date(entryDate);
    maxStayDate.setDate(maxStayDate.getDate() + maxDays);

    // Check overstay
    const isOverstay = totalDaysInRussia > maxDays;

    return {
      entryDate: this.formatDate(entryDate),
      daysInRussia: totalDaysInRussia,
      daysRemaining,
      maxStayDate: this.formatDate(maxStayDate),
      isOverstay,
      periods,
    };
  }

  /**
   * Days between two dates (inclusive)
   */
  private daysBetween(startDate: Date, endDate: Date): number {
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * Format date to ISO (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
