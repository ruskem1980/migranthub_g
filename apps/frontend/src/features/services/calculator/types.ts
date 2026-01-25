/**
 * Типы для калькулятора пребывания 90 дней в календарный год
 * С 05.02.2025: новое правило — 90 дней в календарный год (1 января - 31 декабря)
 */

export interface StayPeriod {
  id: string;
  entryDate: string; // ISO date string YYYY-MM-DD
  exitDate?: string; // ISO date string YYYY-MM-DD, undefined = ещё в стране
  migrationCardId?: string; // связь с документом
}

export interface StayCalculation {
  /** Всего дней использовано в текущем календарном году */
  totalDays: number;
  /** Осталось дней из 90 */
  daysRemaining: number;
  /** Превышение срока пребывания */
  isOverstay: boolean;
  /** Количество дней превышения */
  overstayDays: number;
  /** Процент использования (0-100+) */
  usagePercent: number;
  /** Текущий календарный год */
  currentYear: number;
  /** Дата начала текущего календарного года (1 января) */
  yearStart: Date;
  /** Дата следующего сброса (1 января следующего года) */
  nextResetDate: Date;
  /** Дней до следующего сброса (до 1 января) */
  daysUntilReset: number;
  /** Периоды в текущем году с рассчитанными днями */
  periodsInWindow: Array<{
    entry: Date;
    exit: Date;
    days: number;
    isActive: boolean; // true если это текущий период (без exitDate)
  }>;
  /** Статус для UI */
  status: 'safe' | 'warning' | 'danger' | 'overstay';
}

export interface StayRecommendation {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}
