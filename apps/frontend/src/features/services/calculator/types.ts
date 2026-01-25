/**
 * Типы для калькулятора пребывания 90/180
 */

export interface StayPeriod {
  id: string;
  entryDate: string; // ISO date string YYYY-MM-DD
  exitDate?: string; // ISO date string YYYY-MM-DD, undefined = ещё в стране
  migrationCardId?: string; // связь с документом
}

export interface StayCalculation {
  /** Всего дней использовано в текущем 180-дневном окне */
  totalDays: number;
  /** Осталось дней из 90 */
  daysRemaining: number;
  /** Превышение срока пребывания */
  isOverstay: boolean;
  /** Количество дней превышения */
  overstayDays: number;
  /** Процент использования (0-100+) */
  usagePercent: number;
  /** Дата начала текущего 180-дневного окна */
  windowStart: Date;
  /** Дата следующего сброса (когда откроется новый лимит) */
  nextResetDate: Date | null;
  /** Дней до следующего сброса */
  daysUntilReset: number | null;
  /** Периоды в текущем окне с рассчитанными днями */
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
