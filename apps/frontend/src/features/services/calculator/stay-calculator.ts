/**
 * Калькулятор пребывания 90 дней в календарный год
 *
 * С 05.02.2025 действует новое правило: иностранные граждане могут находиться в РФ
 * не более 90 дней в течение календарного года (с 1 января по 31 декабря).
 */

import type { StayPeriod, StayCalculation, StayRecommendation } from './types';

const MAX_STAY_DAYS = 90;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Парсит дату из строки ISO (YYYY-MM-DD)
 */
function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Возвращает дату без времени (начало дня)
 */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Вычисляет количество дней между двумя датами (включительно)
 */
function daysBetween(start: Date, end: Date): number {
  const startDay = startOfDay(start);
  const endDay = startOfDay(end);
  return Math.floor((endDay.getTime() - startDay.getTime()) / MS_PER_DAY) + 1;
}

/**
 * Получить начало текущего календарного года
 */
function getYearStart(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1); // 1 января текущего года
}

/**
 * Получить начало следующего календарного года
 */
function getNextYearStart(date: Date): Date {
  return new Date(date.getFullYear() + 1, 0, 1); // 1 января следующего года
}

/**
 * Основной расчёт пребывания
 * С 05.02.2025: 90 дней в календарный год (1 января - 31 декабря)
 */
export function calculateStay(periods: StayPeriod[]): StayCalculation {
  const today = startOfDay(new Date());
  const currentYear = today.getFullYear();
  const yearStart = getYearStart(today);

  let totalDays = 0;
  const periodsInWindow: StayCalculation['periodsInWindow'] = [];

  // Сортируем периоды по дате въезда
  const sortedPeriods = [...periods]
    .filter(p => p.entryDate)
    .sort((a, b) => parseDate(a.entryDate).getTime() - parseDate(b.entryDate).getTime());

  for (const period of sortedPeriods) {
    const entry = parseDate(period.entryDate);
    const exit = period.exitDate ? parseDate(period.exitDate) : today;
    const isActive = !period.exitDate;

    // Пропускаем периоды полностью вне текущего года
    if (exit < yearStart) continue;
    if (entry > today) continue;

    // Обрезаем период по границам года (с 1 января текущего года до сегодня)
    const effectiveEntry = entry < yearStart ? yearStart : entry;
    const effectiveExit = exit > today ? today : exit;

    if (effectiveEntry <= effectiveExit) {
      const days = daysBetween(effectiveEntry, effectiveExit);
      totalDays += days;
      periodsInWindow.push({
        entry,
        exit,
        days,
        isActive,
      });
    }
  }

  const daysRemaining = Math.max(0, MAX_STAY_DAYS - totalDays);
  const isOverstay = totalDays > MAX_STAY_DAYS;
  const overstayDays = isOverstay ? totalDays - MAX_STAY_DAYS : 0;
  const usagePercent = Math.round((totalDays / MAX_STAY_DAYS) * 100);

  // Дата сброса лимита — 1 января следующего года
  const nextResetDate = getNextYearStart(today);
  const daysUntilReset = Math.max(0, daysBetween(today, nextResetDate) - 1);

  // Определяем статус
  let status: StayCalculation['status'];
  if (isOverstay) {
    status = 'overstay';
  } else if (usagePercent >= 90) {
    status = 'danger';
  } else if (usagePercent >= 75) {
    status = 'warning';
  } else {
    status = 'safe';
  }

  return {
    totalDays,
    daysRemaining,
    isOverstay,
    overstayDays,
    usagePercent,
    currentYear,
    yearStart,
    nextResetDate,
    daysUntilReset,
    periodsInWindow,
    status,
  };
}

/**
 * Получить рекомендации на основе расчёта
 */
export function getRecommendation(calculation: StayCalculation): StayRecommendation {
  const { totalDays, daysRemaining, isOverstay, overstayDays, status, daysUntilReset, currentYear } = calculation;

  if (isOverstay) {
    return {
      title: 'Превышение срока пребывания',
      message: `Вы превысили разрешённый срок на ${overstayDays} ${getDaysWord(overstayDays)} в ${currentYear} году. ` +
        'Это может повлечь штраф и запрет на въезд в РФ. Рекомендуем срочно обратиться к миграционному юристу.',
      type: 'error',
    };
  }

  if (status === 'danger') {
    return {
      title: 'Критически мало дней',
      message: `Осталось всего ${daysRemaining} ${getDaysWord(daysRemaining)} до конца ${currentYear} года. ` +
        'Рекомендуем запланировать выезд из России в ближайшее время.',
      type: 'warning',
    };
  }

  if (status === 'warning') {
    return {
      title: 'Внимание: лимит заканчивается',
      message: `Использовано ${totalDays} из 90 дней в ${currentYear} году. Осталось ${daysRemaining} ${getDaysWord(daysRemaining)}. ` +
        'Следите за датами и планируйте выезд заранее.',
      type: 'warning',
    };
  }

  if (daysUntilReset !== null && daysUntilReset <= 30) {
    return {
      title: 'Скоро новый год — лимит обнулится',
      message: `Через ${daysUntilReset} ${getDaysWord(daysUntilReset)} наступит ${currentYear + 1} год и лимит обнулится. ` +
        `Сейчас использовано ${totalDays} из 90 дней.`,
      type: 'info',
    };
  }

  return {
    title: 'Всё в порядке',
    message: `Использовано ${totalDays} из 90 дней в ${currentYear} году. У вас достаточный запас — ${daysRemaining} ${getDaysWord(daysRemaining)}.`,
    type: 'success',
  };
}

/**
 * Форматирование статуса для отображения
 */
export function formatStayStatus(calculation: StayCalculation): {
  label: string;
  color: 'green' | 'yellow' | 'orange' | 'red';
  icon: 'check' | 'warning' | 'alert';
} {
  switch (calculation.status) {
    case 'overstay':
      return { label: 'Превышение', color: 'red', icon: 'alert' };
    case 'danger':
      return { label: 'Критично', color: 'red', icon: 'warning' };
    case 'warning':
      return { label: 'Внимание', color: 'yellow', icon: 'warning' };
    case 'safe':
    default:
      return { label: 'В норме', color: 'green', icon: 'check' };
  }
}

/**
 * Склонение слова "день"
 */
function getDaysWord(count: number): string {
  const absCount = Math.abs(count);
  const lastTwo = absCount % 100;
  const lastOne = absCount % 10;

  if (lastTwo >= 11 && lastTwo <= 19) {
    return 'дней';
  }
  if (lastOne === 1) {
    return 'день';
  }
  if (lastOne >= 2 && lastOne <= 4) {
    return 'дня';
  }
  return 'дней';
}

/**
 * Форматирование даты на русском
 */
export function formatDate(date: Date): string {
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * Форматирование даты в короткий формат
 */
export function formatDateShort(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}
