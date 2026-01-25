/**
 * Тесты калькулятора пребывания 90 дней в календарный год
 *
 * С 05.02.2025 действует новое правило: 90 дней в КАЛЕНДАРНЫЙ год
 * (с 1 января по 31 декабря), а не скользящее окно 180 дней.
 *
 * КРИТИЧЕСКИ ВАЖНО: Эти тесты проверяют правильность определения
 * легального статуса мигранта. Ошибка может привести к:
 * - Штрафу 2000-7000 руб.
 * - Выдворению из РФ
 * - Запрету на въезд от 3 до 10 лет
 */

import {
  calculateStay,
  getRecommendation,
  formatStayStatus,
  formatDate,
  formatDateShort,
} from '@/features/services/calculator/stay-calculator';
import type { StayPeriod, StayCalculation } from '@/features/services/calculator/types';

// Фиксируем дату для тестов - 15 июля 2025 года
// Это позволяет тестировать разные сценарии в пределах одного года
const MOCK_DATE = new Date(2025, 6, 15); // 15 июля 2025

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(MOCK_DATE);
});

afterAll(() => {
  jest.useRealTimers();
});

function formatISO(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Хелпер для создания даты в конкретный день
function createDate(year: number, month: number, day: number): string {
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

describe('Stay Calculator - Правило 90 дней в календарный год', () => {
  const testYear = 2025; // Год для тестов (соответствует MOCK_DATE)

  describe('Базовые сценарии', () => {
    it('должен вернуть 0 дней при отсутствии периодов', () => {
      const result = calculateStay([]);

      expect(result.totalDays).toBe(0);
      expect(result.daysRemaining).toBe(90);
      expect(result.isOverstay).toBe(false);
      expect(result.overstayDays).toBe(0);
      expect(result.status).toBe('safe');
      expect(result.usagePercent).toBe(0);
      expect(result.currentYear).toBe(testYear);
    });

    it('должен корректно считать первый въезд сегодня (1 день)', () => {
      const periods: StayPeriod[] = [
        {
          id: 'today',
          entryDate: createDate(testYear, 7, 15), // 15 июля - сегодня
          exitDate: undefined,
        },
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(1); // сегодня = 1 день
      expect(result.daysRemaining).toBe(89);
      expect(result.isOverstay).toBe(false);
      expect(result.status).toBe('safe');
      expect(result.usagePercent).toBe(1);
    });

    it('должен вернуть safe при 45 днях пребывания (50%)', () => {
      const periods: StayPeriod[] = [
        {
          id: 'stay-45',
          entryDate: createDate(testYear, 6, 1), // 1 июня
          exitDate: createDate(testYear, 7, 15), // 15 июля = 45 дней
        },
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(45);
      expect(result.daysRemaining).toBe(45);
      expect(result.isOverstay).toBe(false);
      expect(result.status).toBe('safe');
      expect(result.usagePercent).toBe(50);
    });

    it('должен вернуть warning при 68 днях (75%+)', () => {
      const periods: StayPeriod[] = [
        {
          id: 'stay-68-1',
          entryDate: createDate(testYear, 2, 1), // 1 февраля
          exitDate: createDate(testYear, 3, 10), // 10 марта = 38 дней
        },
        {
          id: 'stay-68-2',
          entryDate: createDate(testYear, 4, 1), // 1 апреля
          exitDate: createDate(testYear, 4, 30), // 30 апреля = 30 дней, итого 68
        },
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(68);
      expect(result.daysRemaining).toBe(22);
      expect(result.isOverstay).toBe(false);
      expect(result.status).toBe('warning');
    });

    it('должен вернуть danger при 81 дне (90%)', () => {
      const periods: StayPeriod[] = [
        {
          id: 'stay-81-1',
          entryDate: createDate(testYear, 2, 1),
          exitDate: createDate(testYear, 3, 22), // 50 дней
        },
        {
          id: 'stay-81-2',
          entryDate: createDate(testYear, 4, 1),
          exitDate: createDate(testYear, 4, 30), // 30 дней
        },
        {
          id: 'stay-81-3',
          entryDate: createDate(testYear, 5, 1),
          exitDate: createDate(testYear, 5, 1), // 1 день = 81
        },
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(81);
      expect(result.daysRemaining).toBe(9);
      expect(result.isOverstay).toBe(false);
      expect(result.status).toBe('danger');
      expect(result.usagePercent).toBe(90);
    });

    it('должен вернуть danger при 89 днях (99%)', () => {
      const periods: StayPeriod[] = [
        {
          id: 'stay-89-1',
          entryDate: createDate(testYear, 2, 1),
          exitDate: createDate(testYear, 4, 1), // 60 дней
        },
        {
          id: 'stay-89-2',
          entryDate: createDate(testYear, 5, 1),
          exitDate: createDate(testYear, 5, 29), // 29 дней = 89
        },
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(89);
      expect(result.daysRemaining).toBe(1);
      expect(result.isOverstay).toBe(false);
      expect(result.status).toBe('danger');
    });

    it('должен вернуть danger при РОВНО 90 днях (не overstay)', () => {
      const periods: StayPeriod[] = [
        {
          id: 'stay-90-1',
          entryDate: createDate(testYear, 2, 1),
          exitDate: createDate(testYear, 4, 1), // 60 дней
        },
        {
          id: 'stay-90-2',
          entryDate: createDate(testYear, 5, 1),
          exitDate: createDate(testYear, 5, 30), // 30 дней = 90
        },
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(90);
      expect(result.daysRemaining).toBe(0);
      expect(result.isOverstay).toBe(false); // ровно 90 - ещё не overstay!
      expect(result.status).toBe('danger'); // но уже danger
      expect(result.usagePercent).toBe(100);
    });

    it('должен вернуть overstay при 91 дне (превышение на 1 день)', () => {
      const periods: StayPeriod[] = [
        {
          id: 'stay-91-1',
          entryDate: createDate(testYear, 2, 1),
          exitDate: createDate(testYear, 4, 1), // 60 дней
        },
        {
          id: 'stay-91-2',
          entryDate: createDate(testYear, 5, 1),
          exitDate: createDate(testYear, 5, 31), // 31 день = 91
        },
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(91);
      expect(result.daysRemaining).toBe(0);
      expect(result.isOverstay).toBe(true);
      expect(result.overstayDays).toBe(1);
      expect(result.status).toBe('overstay');
    });

    it('должен вернуть overstay при 100 днях (превышение на 10 дней)', () => {
      const periods: StayPeriod[] = [
        {
          id: 'stay-100-1',
          entryDate: createDate(testYear, 2, 1),
          exitDate: createDate(testYear, 4, 10), // 69 дней
        },
        {
          id: 'stay-100-2',
          entryDate: createDate(testYear, 5, 1),
          exitDate: createDate(testYear, 5, 31), // 31 день = 100
        },
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(100);
      expect(result.isOverstay).toBe(true);
      expect(result.overstayDays).toBe(10);
      expect(result.status).toBe('overstay');
    });
  });

  describe('Границы календарного года', () => {
    it('должен устанавливать yearStart на 1 января текущего года', () => {
      const result = calculateStay([]);

      expect(result.yearStart.getFullYear()).toBe(testYear);
      expect(result.yearStart.getMonth()).toBe(0); // январь
      expect(result.yearStart.getDate()).toBe(1);
    });

    it('должен устанавливать nextResetDate на 1 января следующего года', () => {
      const result = calculateStay([]);

      expect(result.nextResetDate.getFullYear()).toBe(testYear + 1);
      expect(result.nextResetDate.getMonth()).toBe(0); // январь
      expect(result.nextResetDate.getDate()).toBe(1);
    });

    it('должен корректно вычислять daysUntilReset до конца года', () => {
      const result = calculateStay([]);

      // 15 июля 2025 до 1 января 2026 = 170 дней
      expect(result.daysUntilReset).toBe(170);
    });

    it('должен содержать currentYear в результате расчёта', () => {
      const periods: StayPeriod[] = [
        {
          id: 'test',
          entryDate: createDate(testYear, 7, 10),
          exitDate: createDate(testYear, 7, 15),
        },
      ];
      const result = calculateStay(periods);

      expect(result.currentYear).toBe(testYear);
    });
  });

  describe('Периоды, пересекающие Новый год', () => {
    it('КРИТИЧНО: период из прошлого года должен учитываться только с 1 января', () => {
      const lastYear = testYear - 1;

      // Период: въезд 15 декабря 2024, ещё в РФ (15 июля 2025)
      const periods: StayPeriod[] = [
        {
          id: 'cross-year',
          entryDate: createDate(lastYear, 12, 15), // 15 декабря 2024
          exitDate: undefined, // ещё в РФ
        },
      ];

      const result = calculateStay(periods);

      // С 1 января по 15 июля = 196 дней (но это больше 90)
      // Должен учитывать дни с 1 января 2025
      expect(result.totalDays).toBe(196);
      expect(result.isOverstay).toBe(true);
    });

    it('должен полностью игнорировать периоды, закончившиеся в прошлом году', () => {
      const lastYear = testYear - 1;

      // Период полностью в прошлом году
      const periods: StayPeriod[] = [
        {
          id: 'last-year',
          entryDate: createDate(lastYear, 6, 1), // 1 июня 2024
          exitDate: createDate(lastYear, 8, 31), // 31 августа 2024
        },
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(0); // не должно учитываться
      expect(result.periodsInWindow).toHaveLength(0);
    });

    it('должен корректно обрезать период на границе 1 января', () => {
      const lastYear = testYear - 1;

      // Период: въезд 20 декабря 2024, выезд 10 января 2025
      const periods: StayPeriod[] = [
        {
          id: 'cross-year-exit',
          entryDate: createDate(lastYear, 12, 20), // 20 декабря 2024
          exitDate: createDate(testYear, 1, 10), // 10 января 2025
        },
      ];

      const result = calculateStay(periods);

      // Должен учитывать только дни с 1 по 10 января = 10 дней
      expect(result.totalDays).toBe(10);
    });

    it('период начавшийся 31 декабря и продолжающийся - считается с 1 января', () => {
      const lastYear = testYear - 1;

      const periods: StayPeriod[] = [
        {
          id: 'dec31-start',
          entryDate: createDate(lastYear, 12, 31), // 31 декабря 2024
          exitDate: createDate(testYear, 1, 20), // 20 января 2025
        },
      ];

      const result = calculateStay(periods);

      // День 31 декабря не учитывается, только с 1 января = 20 дней
      expect(result.totalDays).toBe(20);
    });

    it('период начавшийся 1 января текущего года учитывается полностью', () => {
      const periods: StayPeriod[] = [
        {
          id: 'jan1-start',
          entryDate: createDate(testYear, 1, 1), // 1 января 2025
          exitDate: createDate(testYear, 1, 20), // 20 января 2025
        },
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(20);
    });
  });

  describe('Множественные въезды/выезды в текущем году', () => {
    it('должен суммировать несколько периодов в текущем году', () => {
      const periods: StayPeriod[] = [
        {
          id: 'trip1',
          entryDate: createDate(testYear, 3, 1),
          exitDate: createDate(testYear, 3, 11), // 11 дней
        },
        {
          id: 'trip2',
          entryDate: createDate(testYear, 4, 1),
          exitDate: createDate(testYear, 4, 11), // 11 дней
        },
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(22);
      expect(result.periodsInWindow).toHaveLength(2);
    });

    it('КРИТИЧНО: выезд за границу НЕ сбрасывает счётчик в рамках года', () => {
      // Человек думает, что выехав, сбросит лимит - это НЕ ТАК!
      const periods: StayPeriod[] = [
        {
          id: 'trip1',
          entryDate: createDate(testYear, 2, 5),
          exitDate: createDate(testYear, 2, 25), // 21 день
        },
        {
          id: 'trip2',
          entryDate: createDate(testYear, 3, 5),
          exitDate: createDate(testYear, 3, 25), // 21 день
        },
        {
          id: 'trip3',
          entryDate: createDate(testYear, 4, 5),
          exitDate: createDate(testYear, 4, 25), // 21 день
        },
      ];

      const result = calculateStay(periods);

      // Все периоды суммируются: 21 + 21 + 21 = 63 дня
      expect(result.totalDays).toBe(63);
      expect(result.daysRemaining).toBe(27);
    });
  });

  describe('Сброс лимита (nextResetDate = 1 января)', () => {
    it('должен всегда показывать 1 января следующего года как дату сброса', () => {
      const periods: StayPeriod[] = [
        {
          id: 'test',
          entryDate: createDate(testYear, 6, 1),
          exitDate: createDate(testYear, 6, 30),
        },
      ];

      const result = calculateStay(periods);

      expect(result.nextResetDate.getFullYear()).toBe(testYear + 1);
      expect(result.nextResetDate.getMonth()).toBe(0);
      expect(result.nextResetDate.getDate()).toBe(1);
    });

    it('должен показывать daysUntilReset даже при отсутствии периодов', () => {
      const result = calculateStay([]);

      expect(result.nextResetDate).not.toBeNull();
      expect(result.daysUntilReset).toBeGreaterThan(0);
    });
  });

  describe('Завершённые периоды в текущем году', () => {
    it('должен корректно считать завершённый период', () => {
      const periods: StayPeriod[] = [
        {
          id: 'finished-period',
          entryDate: createDate(testYear, 3, 1),
          exitDate: createDate(testYear, 3, 21), // 21 день
        },
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(21);
      expect(result.daysRemaining).toBe(69);
      expect(result.status).toBe('safe');
    });

    it('должен суммировать несколько завершённых периодов', () => {
      const periods: StayPeriod[] = [
        {
          id: 'period1',
          entryDate: createDate(testYear, 2, 1),
          exitDate: createDate(testYear, 2, 11), // 11 дней
        },
        {
          id: 'period2',
          entryDate: createDate(testYear, 3, 1),
          exitDate: createDate(testYear, 3, 11), // 11 дней
        },
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(22);
      expect(result.daysRemaining).toBe(68);
    });
  });

  describe('Edge cases', () => {
    it('должен игнорировать периоды без entryDate', () => {
      const periods: StayPeriod[] = [
        { id: '1', entryDate: '', exitDate: createDate(testYear, 3, 10) },
        {
          id: '2',
          entryDate: createDate(testYear, 3, 1),
          exitDate: createDate(testYear, 3, 6), // 6 дней
        },
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(6); // только валидный период
    });

    it('должен игнорировать будущие периоды', () => {
      const periods: StayPeriod[] = [
        {
          id: 'future',
          entryDate: createDate(testYear, 8, 1), // август - в будущем
          exitDate: createDate(testYear, 8, 10),
        },
        {
          id: 'valid',
          entryDate: createDate(testYear, 3, 1),
          exitDate: createDate(testYear, 3, 6), // 6 дней
        },
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(6); // только валидный период
    });

    it('должен правильно сортировать неупорядоченные периоды', () => {
      const periods: StayPeriod[] = [
        {
          id: 'recent',
          entryDate: createDate(testYear, 4, 1),
          exitDate: createDate(testYear, 4, 6), // 6 дней
        },
        {
          id: 'old',
          entryDate: createDate(testYear, 2, 1),
          exitDate: createDate(testYear, 2, 11), // 11 дней
        },
        {
          id: 'middle',
          entryDate: createDate(testYear, 3, 1),
          exitDate: createDate(testYear, 3, 11), // 11 дней
        },
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(28);
      expect(result.periodsInWindow).toHaveLength(3);
    });
  });

  describe('Реальные жизненные сценарии', () => {
    it('Сценарий: Турист приехал на 2 недели отдыха', () => {
      const periods: StayPeriod[] = [
        {
          id: 'tourist',
          entryDate: createDate(testYear, 3, 1),
          exitDate: createDate(testYear, 3, 14), // 14 дней
        },
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(14);
      expect(result.daysRemaining).toBe(76);
      expect(result.status).toBe('safe');
    });

    it('Сценарий: Работник исчерпал почти весь лимит', () => {
      const periods: StayPeriod[] = [
        {
          id: 'worker-1',
          entryDate: createDate(testYear, 2, 1),
          exitDate: createDate(testYear, 3, 28), // 56 дней
        },
        {
          id: 'worker-2',
          entryDate: createDate(testYear, 4, 1),
          exitDate: createDate(testYear, 4, 30), // 30 дней = 86
        },
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(86);
      expect(result.daysRemaining).toBe(4);
      expect(result.status).toBe('danger');

      const recommendation = getRecommendation(result);
      expect(recommendation.type).toBe('warning');
      expect(recommendation.title).toContain('Критически');
    });

    it('Сценарий: Нелегал, просрочил на месяц', () => {
      const periods: StayPeriod[] = [
        {
          id: 'illegal-1',
          entryDate: createDate(testYear, 2, 1),
          exitDate: createDate(testYear, 4, 1), // 60 дней
        },
        {
          id: 'illegal-2',
          entryDate: createDate(testYear, 5, 1),
          exitDate: createDate(testYear, 6, 29), // 60 дней = 120
        },
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(120);
      expect(result.isOverstay).toBe(true);
      expect(result.overstayDays).toBe(30);
      expect(result.status).toBe('overstay');

      const recommendation = getRecommendation(result);
      expect(recommendation.type).toBe('error');
      expect(recommendation.message).toContain('юристу');
    });

    it('Сценарий: Бизнесмен с частыми короткими визитами', () => {
      const periods: StayPeriod[] = [
        {
          id: 'biz-1',
          entryDate: createDate(testYear, 2, 1),
          exitDate: createDate(testYear, 2, 11), // 11 дней
        },
        {
          id: 'biz-2',
          entryDate: createDate(testYear, 3, 1),
          exitDate: createDate(testYear, 3, 11), // 11 дней
        },
        {
          id: 'biz-3',
          entryDate: createDate(testYear, 4, 1),
          exitDate: createDate(testYear, 4, 11), // 11 дней
        },
        {
          id: 'biz-4',
          entryDate: createDate(testYear, 5, 1),
          exitDate: createDate(testYear, 5, 11), // 11 дней
        },
        {
          id: 'biz-5',
          entryDate: createDate(testYear, 6, 1),
          exitDate: createDate(testYear, 6, 21), // 21 день = 65 всего
        },
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(65);
      expect(result.status).not.toBe('overstay');
    });
  });
});

describe('getRecommendation', () => {
  const testYear = 2025;

  it('должен вернуть success для безопасного статуса', () => {
    const calculation: StayCalculation = {
      totalDays: 30,
      daysRemaining: 60,
      isOverstay: false,
      overstayDays: 0,
      usagePercent: 33,
      currentYear: testYear,
      yearStart: new Date(testYear, 0, 1),
      nextResetDate: new Date(testYear + 1, 0, 1),
      daysUntilReset: 200,
      periodsInWindow: [],
      status: 'safe',
    };

    const result = getRecommendation(calculation);

    expect(result.type).toBe('success');
    expect(result.title).toContain('порядке');
    expect(result.message).toContain(String(testYear));
  });

  it('должен вернуть warning для статуса warning', () => {
    const calculation: StayCalculation = {
      totalDays: 70,
      daysRemaining: 20,
      isOverstay: false,
      overstayDays: 0,
      usagePercent: 78,
      currentYear: testYear,
      yearStart: new Date(testYear, 0, 1),
      nextResetDate: new Date(testYear + 1, 0, 1),
      daysUntilReset: 200,
      periodsInWindow: [],
      status: 'warning',
    };

    const result = getRecommendation(calculation);

    expect(result.type).toBe('warning');
    expect(result.title).toContain('Внимание');
    expect(result.message).toContain(String(testYear));
  });

  it('должен вернуть warning для статуса danger', () => {
    const calculation: StayCalculation = {
      totalDays: 85,
      daysRemaining: 5,
      isOverstay: false,
      overstayDays: 0,
      usagePercent: 94,
      currentYear: testYear,
      yearStart: new Date(testYear, 0, 1),
      nextResetDate: new Date(testYear + 1, 0, 1),
      daysUntilReset: 200,
      periodsInWindow: [],
      status: 'danger',
    };

    const result = getRecommendation(calculation);

    expect(result.type).toBe('warning');
    expect(result.title).toContain('Критически');
  });

  it('должен вернуть error для overstay с указанием года', () => {
    const calculation: StayCalculation = {
      totalDays: 100,
      daysRemaining: 0,
      isOverstay: true,
      overstayDays: 10,
      usagePercent: 111,
      currentYear: testYear,
      yearStart: new Date(testYear, 0, 1),
      nextResetDate: new Date(testYear + 1, 0, 1),
      daysUntilReset: 200,
      periodsInWindow: [],
      status: 'overstay',
    };

    const result = getRecommendation(calculation);

    expect(result.type).toBe('error');
    expect(result.title).toContain('Превышение');
    expect(result.message).toContain('штраф');
    expect(result.message).toContain('запрет');
    expect(result.message).toContain(String(testYear));
  });

  it('должен информировать о скором обнулении лимита в новом году', () => {
    const calculation: StayCalculation = {
      totalDays: 20,
      daysRemaining: 70,
      isOverstay: false,
      overstayDays: 0,
      usagePercent: 22,
      currentYear: testYear,
      yearStart: new Date(testYear, 0, 1),
      nextResetDate: new Date(testYear + 1, 0, 1),
      daysUntilReset: 15, // скоро Новый год
      periodsInWindow: [],
      status: 'safe',
    };

    const result = getRecommendation(calculation);

    expect(result.type).toBe('info');
    expect(result.title).toContain('новый год');
    expect(result.message).toContain(String(testYear + 1));
  });
});

describe('formatStayStatus', () => {
  it('должен вернуть зелёный для safe', () => {
    const result = formatStayStatus({
      status: 'safe',
    } as StayCalculation);

    expect(result.color).toBe('green');
    expect(result.icon).toBe('check');
  });

  it('должен вернуть жёлтый для warning', () => {
    const result = formatStayStatus({
      status: 'warning',
    } as StayCalculation);

    expect(result.color).toBe('yellow');
    expect(result.icon).toBe('warning');
  });

  it('должен вернуть красный для danger', () => {
    const result = formatStayStatus({
      status: 'danger',
    } as StayCalculation);

    expect(result.color).toBe('red');
    expect(result.icon).toBe('warning');
  });

  it('должен вернуть красный для overstay', () => {
    const result = formatStayStatus({
      status: 'overstay',
    } as StayCalculation);

    expect(result.color).toBe('red');
    expect(result.icon).toBe('alert');
    expect(result.label).toBe('Превышение');
  });
});

describe('Форматирование дат', () => {
  it('formatDate должен форматировать на русском', () => {
    const date = new Date(2024, 0, 15); // 15 января 2024
    const result = formatDate(date);

    expect(result).toBe('15 января 2024');
  });

  it('formatDateShort должен форматировать в DD.MM.YYYY', () => {
    const date = new Date(2024, 0, 5); // 5 января 2024
    const result = formatDateShort(date);

    expect(result).toBe('05.01.2024');
  });
});

describe('Проверка отсутствия false positives и false negatives', () => {
  const testYear = 2025;

  describe('False Positives (система не должна говорить "всё ок" когда есть проблема)', () => {
    it('НЕ должен показывать safe при 90 днях', () => {
      const periods: StayPeriod[] = [
        {
          id: 'fp-90-1',
          entryDate: createDate(testYear, 2, 1),
          exitDate: createDate(testYear, 4, 1), // 60 дней
        },
        {
          id: 'fp-90-2',
          entryDate: createDate(testYear, 5, 1),
          exitDate: createDate(testYear, 5, 30), // 30 дней = 90
        },
      ];
      const result = calculateStay(periods);

      expect(result.status).not.toBe('safe');
    });

    it('НЕ должен показывать safe при 76+ днях', () => {
      const periods: StayPeriod[] = [
        {
          id: 'fp-76-1',
          entryDate: createDate(testYear, 2, 1),
          exitDate: createDate(testYear, 3, 17), // 45 дней
        },
        {
          id: 'fp-76-2',
          entryDate: createDate(testYear, 4, 1),
          exitDate: createDate(testYear, 5, 1), // 31 день = 76
        },
      ];
      const result = calculateStay(periods);

      // 76/90 = 84.4%, должен быть warning
      expect(result.status).not.toBe('safe');
    });

    it('НЕ должен пропускать overstay', () => {
      const periods: StayPeriod[] = [
        {
          id: 'fp-overstay-1',
          entryDate: createDate(testYear, 2, 1),
          exitDate: createDate(testYear, 4, 11), // 70 дней
        },
        {
          id: 'fp-overstay-2',
          entryDate: createDate(testYear, 5, 1),
          exitDate: createDate(testYear, 5, 31), // 31 день = 101
        },
      ];
      const result = calculateStay(periods);

      expect(result.isOverstay).toBe(true);
      expect(result.status).toBe('overstay');
    });
  });

  describe('False Negatives (система не должна паниковать зря)', () => {
    it('НЕ должен показывать warning при < 75%', () => {
      const periods: StayPeriod[] = [
        {
          id: 'fn-67-1',
          entryDate: createDate(testYear, 2, 1),
          exitDate: createDate(testYear, 3, 9), // 37 дней
        },
        {
          id: 'fn-67-2',
          entryDate: createDate(testYear, 4, 1),
          exitDate: createDate(testYear, 4, 30), // 30 дней = 67
        },
      ];
      const result = calculateStay(periods);

      expect(result.status).toBe('safe');
    });

    it('НЕ должен показывать danger при < 90%', () => {
      const periods: StayPeriod[] = [
        {
          id: 'fn-80-1',
          entryDate: createDate(testYear, 2, 1),
          exitDate: createDate(testYear, 3, 20), // 48 дней
        },
        {
          id: 'fn-80-2',
          entryDate: createDate(testYear, 4, 1),
          exitDate: createDate(testYear, 5, 2), // 32 дня = 80
        },
      ];
      const result = calculateStay(periods);

      expect(result.status).not.toBe('danger');
      expect(result.status).toBe('warning');
    });

    it('НЕ должен показывать overstay при ровно 90 днях', () => {
      const periods: StayPeriod[] = [
        {
          id: 'fn-90-1',
          entryDate: createDate(testYear, 2, 1),
          exitDate: createDate(testYear, 4, 1), // 60 дней
        },
        {
          id: 'fn-90-2',
          entryDate: createDate(testYear, 5, 1),
          exitDate: createDate(testYear, 5, 30), // 30 дней = 90
        },
      ];
      const result = calculateStay(periods);

      expect(result.isOverstay).toBe(false);
      expect(result.status).toBe('danger'); // но предупреждение
    });
  });
});
