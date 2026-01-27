import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CategoryDto,
  LawDto,
  FormDto,
  FaqItemDto,
  PatentCalcRequestDto,
  PatentCalcResponseDto,
  PatentCalcBreakdownDto,
  StayCalcRequestDto,
  StayCalcResponseDto,
  StayPeriodDto,
} from './dto';
import {
  LEGAL_CATEGORIES,
  LEGAL_LAWS,
  LEGAL_FORMS,
  LEGAL_FAQ,
  getRegionByCode,
} from './data';

@Injectable()
export class LegalService {
  /**
   * Получить все категории законодательства
   */
  getCategories(): CategoryDto[] {
    return LEGAL_CATEGORIES.map((category) => ({
      ...category,
      itemCount: LEGAL_LAWS.filter((law) => law.categoryId === category.id).length,
    }));
  }

  /**
   * Получить законы по категории
   */
  getCategoryItems(categoryId: string): LawDto[] {
    return LEGAL_LAWS.filter((law) => law.categoryId === categoryId);
  }

  /**
   * Получить все законы или поиск по названию/номеру
   */
  getLaws(search?: string): LawDto[] {
    if (!search) {
      return LEGAL_LAWS;
    }

    const searchLower = search.toLowerCase();
    return LEGAL_LAWS.filter(
      (law) =>
        law.title.toLowerCase().includes(searchLower) ||
        law.number.toLowerCase().includes(searchLower),
    );
  }

  /**
   * Получить закон по ID
   */
  getLawById(id: string): LawDto | null {
    return LEGAL_LAWS.find((law) => law.id === id) || null;
  }

  /**
   * Получить формы документов
   */
  getForms(categoryId?: string): FormDto[] {
    if (!categoryId) {
      return LEGAL_FORMS;
    }
    return LEGAL_FORMS.filter((form) => form.categoryId === categoryId);
  }

  /**
   * Получить FAQ
   */
  getFaq(categoryId?: string): FaqItemDto[] {
    if (!categoryId) {
      return LEGAL_FAQ;
    }
    return LEGAL_FAQ.filter((faq) => faq.categoryId === categoryId);
  }

  /**
   * Рассчитать стоимость патента на работу
   * Формула: monthlyPrice * months (monthlyPrice уже содержит baseRate * coefficient * deflator)
   */
  calculatePatentPrice(dto: PatentCalcRequestDto): PatentCalcResponseDto {
    const region = getRegionByCode(dto.regionCode);

    if (!region) {
      throw new NotFoundException(`Регион с кодом "${dto.regionCode}" не найден`);
    }

    const { months } = dto;
    const pricePerMonth = region.monthlyPrice;
    const totalPrice = pricePerMonth * months;

    // Формируем детализацию по месяцам
    const breakdown: PatentCalcBreakdownDto[] = [];
    for (let i = 1; i <= months; i++) {
      breakdown.push({
        month: i,
        price: pricePerMonth,
      });
    }

    return {
      regionCode: region.code,
      regionName: region.name,
      baseRate: region.baseRate,
      coefficient: region.coefficient,
      months,
      totalPrice,
      breakdown,
    };
  }

  /**
   * Рассчитать срок пребывания по правилу 90/180
   * Правило: максимум 90 дней пребывания в любом 180-дневном периоде
   */
  calculateStay(dto: StayCalcRequestDto): StayCalcResponseDto {
    const entryDate = new Date(dto.entryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    entryDate.setHours(0, 0, 0, 0);

    const exitDates = (dto.exitDates || []).map((d) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date;
    });

    // Сортируем даты выезда
    exitDates.sort((a, b) => a.getTime() - b.getTime());

    // Считаем периоды пребывания
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
        // После выезда считаем, что следующий въезд - на следующий день
        // (упрощённая логика, в реальности нужна дата повторного въезда)
      }
      currentEntryDate = new Date(exitDate.getTime() + 24 * 60 * 60 * 1000);
    }

    // Добавляем текущий период (от последнего въезда до сегодня)
    if (currentEntryDate <= today) {
      const days = this.daysBetween(currentEntryDate, today);
      periods.push({
        startDate: this.formatDate(currentEntryDate),
        endDate: this.formatDate(today),
        days,
      });
      totalDaysInRussia += days;
    }

    // Если не было выездов, считаем от даты въезда до сегодня
    if (exitDates.length === 0) {
      totalDaysInRussia = this.daysBetween(entryDate, today);
      periods.push({
        startDate: this.formatDate(entryDate),
        endDate: this.formatDate(today),
        days: totalDaysInRussia,
      });
    }

    // Рассчитываем оставшиеся дни (максимум 90 дней)
    const maxDays = 90;
    const daysRemaining = Math.max(0, maxDays - totalDaysInRussia);

    // Максимальная дата пребывания (entryDate + 90 дней)
    const maxStayDate = new Date(entryDate);
    maxStayDate.setDate(maxStayDate.getDate() + maxDays);

    // Проверяем превышение срока
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
   * Количество дней между двумя датами (включительно)
   */
  private daysBetween(startDate: Date, endDate: Date): number {
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * Форматировать дату в ISO формат (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
