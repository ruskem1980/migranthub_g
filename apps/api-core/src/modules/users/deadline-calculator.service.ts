import { Injectable } from '@nestjs/common';
import {
  CalculateDeadlinesDto,
  DeadlinesResponseDto,
  DeadlineInfo,
} from './dto/calculate-deadlines.dto';
import { VisitPurpose } from './dto/complete-onboarding.dto';

/**
 * Сервис расчёта миграционных дедлайнов
 *
 * Основные правила:
 * - Регистрация: 7 рабочих дней с момента въезда
 * - Пребывание: максимум 90 дней из каждых 180
 * - Патент: ежемесячная оплата, максимум 12 месяцев
 */
@Injectable()
export class DeadlineCalculatorService {
  /**
   * Количество дней для предупреждения (warning)
   */
  private readonly WARNING_DAYS = 14;

  /**
   * Количество дней для критического предупреждения
   */
  private readonly CRITICAL_DAYS = 7;

  /**
   * Максимальный срок пребывания в днях
   */
  private readonly MAX_STAY_DAYS = 90;

  /**
   * Период расчёта 180 дней
   */
  private readonly PERIOD_DAYS = 180;

  /**
   * Срок регистрации в рабочих днях
   */
  private readonly REGISTRATION_WORK_DAYS = 7;

  /**
   * Рассчитать все дедлайны на основе входных данных
   */
  calculateDeadlines(dto: CalculateDeadlinesDto): DeadlinesResponseDto {
    const entryDate = new Date(dto.entryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const response = new DeadlinesResponseDto();

    // Рассчитываем срок регистрации (7 рабочих дней)
    response.registration = this.calculateRegistrationDeadline(entryDate, today);

    // Рассчитываем окончание 90-дневного периода
    response.stay90Days = this.calculateStay90Deadline(entryDate, today);

    // Рассчитываем ограничение 90 из 180 дней
    response.stayLimit180 = this.calculateStayLimit180(entryDate, today);

    // Рассчитываем дедлайны патента (если указана дата патента)
    if (dto.patentDate) {
      const patentDate = new Date(dto.patentDate);
      response.patentPayment = this.calculatePatentPaymentDeadline(patentDate, today);
      response.patentRenewal = this.calculatePatentRenewalDeadline(patentDate, today);
    } else if (dto.purpose === VisitPurpose.WORK) {
      // Если цель - работа, но патент не оформлен, показываем предупреждение
      response.patentPayment = {
        date: this.formatDate(this.addDays(entryDate, 30)),
        daysRemaining: this.daysBetween(today, this.addDays(entryDate, 30)),
        status: this.getStatus(this.daysBetween(today, this.addDays(entryDate, 30))),
        description: 'Рекомендуемый срок оформления патента для работы',
      };
    }

    response.calculatedAt = this.formatDate(today);

    return response;
  }

  /**
   * Рассчитать дедлайн регистрации (7 рабочих дней)
   */
  private calculateRegistrationDeadline(entryDate: Date, today: Date): DeadlineInfo {
    const deadline = this.addWorkDays(entryDate, this.REGISTRATION_WORK_DAYS);
    const daysRemaining = this.daysBetween(today, deadline);

    return {
      date: this.formatDate(deadline),
      daysRemaining,
      status: this.getStatus(daysRemaining),
      description: 'Срок постановки на миграционный учёт (регистрация)',
    };
  }

  /**
   * Рассчитать окончание 90-дневного периода пребывания
   */
  private calculateStay90Deadline(entryDate: Date, today: Date): DeadlineInfo {
    const deadline = this.addDays(entryDate, this.MAX_STAY_DAYS);
    const daysRemaining = this.daysBetween(today, deadline);

    return {
      date: this.formatDate(deadline),
      daysRemaining,
      status: this.getStatus(daysRemaining),
      description: 'Окончание 90-дневного периода законного пребывания',
    };
  }

  /**
   * Рассчитать ограничение 90 из 180 дней
   * Показывает, когда начнётся новый 180-дневный период
   */
  private calculateStayLimit180(entryDate: Date, today: Date): DeadlineInfo {
    const periodEnd = this.addDays(entryDate, this.PERIOD_DAYS);
    const daysRemaining = this.daysBetween(today, periodEnd);

    return {
      date: this.formatDate(periodEnd),
      daysRemaining,
      status: daysRemaining < 0 ? 'ok' : this.getStatus(daysRemaining - this.MAX_STAY_DAYS),
      description: 'Конец 180-дневного периода (правило 90/180)',
    };
  }

  /**
   * Рассчитать срок оплаты патента (ежемесячно)
   */
  private calculatePatentPaymentDeadline(patentDate: Date, today: Date): DeadlineInfo {
    // Находим следующую дату оплаты (каждый месяц от даты оформления)
    let nextPaymentDate = new Date(patentDate);

    while (nextPaymentDate <= today) {
      nextPaymentDate = this.addMonths(nextPaymentDate, 1);
    }

    const daysRemaining = this.daysBetween(today, nextPaymentDate);

    return {
      date: this.formatDate(nextPaymentDate),
      daysRemaining,
      status: this.getStatus(daysRemaining),
      description: 'Срок очередной оплаты патента',
    };
  }

  /**
   * Рассчитать срок продления патента (максимум 12 месяцев)
   */
  private calculatePatentRenewalDeadline(patentDate: Date, today: Date): DeadlineInfo {
    const maxDate = this.addMonths(patentDate, 12);
    const daysRemaining = this.daysBetween(today, maxDate);

    return {
      date: this.formatDate(maxDate),
      daysRemaining,
      status: this.getStatus(daysRemaining),
      description: 'Максимальный срок действия патента (12 месяцев)',
    };
  }

  /**
   * Определить статус дедлайна по оставшимся дням
   */
  private getStatus(daysRemaining: number): 'ok' | 'warning' | 'critical' | 'expired' {
    if (daysRemaining < 0) return 'expired';
    if (daysRemaining <= this.CRITICAL_DAYS) return 'critical';
    if (daysRemaining <= this.WARNING_DAYS) return 'warning';
    return 'ok';
  }

  /**
   * Добавить указанное количество дней к дате
   */
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Добавить указанное количество рабочих дней к дате
   * (исключая выходные: субботу и воскресенье)
   */
  private addWorkDays(date: Date, workDays: number): Date {
    const result = new Date(date);
    let addedDays = 0;

    while (addedDays < workDays) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      // 0 = воскресенье, 6 = суббота
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        addedDays++;
      }
    }

    return result;
  }

  /**
   * Добавить указанное количество месяцев к дате
   */
  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * Рассчитать количество дней между двумя датами
   */
  private daysBetween(from: Date, to: Date): number {
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.floor((to.getTime() - from.getTime()) / msPerDay);
  }

  /**
   * Форматировать дату в ISO формат (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
