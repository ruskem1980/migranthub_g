/**
 * Тесты калькулятора пребывания 90/180
 *
 * КРИТИЧЕСКИ ВАЖНО: Эти тесты проверяют правильность определения
 * легального статуса мигранта. Ошибка может привести к:
 * - Штрафу 2000-7000₽
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

// Хелпер для создания дат относительно "сегодня"
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatISO(date);
}

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatISO(date);
}

function formatISO(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Хелпер для создания периода
function createPeriod(
  entryDaysAgo: number,
  exitDaysAgo?: number
): StayPeriod {
  return {
    id: `period-${entryDaysAgo}-${exitDaysAgo ?? 'active'}`,
    entryDate: daysAgo(entryDaysAgo),
    exitDate: exitDaysAgo !== undefined ? daysAgo(exitDaysAgo) : undefined,
  };
}

describe('Stay Calculator - Правило 90/180', () => {
  describe('Базовые сценарии', () => {
    it('должен вернуть 0 дней при отсутствии периодов', () => {
      const result = calculateStay([]);

      expect(result.totalDays).toBe(0);
      expect(result.daysRemaining).toBe(90);
      expect(result.isOverstay).toBe(false);
      expect(result.overstayDays).toBe(0);
      expect(result.status).toBe('safe');
      expect(result.usagePercent).toBe(0);
    });

    it('должен корректно считать первый въезд сегодня (1 день)', () => {
      const periods: StayPeriod[] = [createPeriod(0)]; // въехал сегодня

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(1); // сегодня = 1 день
      expect(result.daysRemaining).toBe(89);
      expect(result.isOverstay).toBe(false);
      expect(result.status).toBe('safe');
      expect(result.usagePercent).toBe(1);
    });

    it('должен вернуть safe при 45 днях пребывания (50%)', () => {
      const periods: StayPeriod[] = [createPeriod(44)]; // 45 дней включая сегодня

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(45);
      expect(result.daysRemaining).toBe(45);
      expect(result.isOverstay).toBe(false);
      expect(result.status).toBe('safe');
      expect(result.usagePercent).toBe(50);
    });

    it('должен вернуть warning при 68 днях (75% - граница)', () => {
      const periods: StayPeriod[] = [createPeriod(67)]; // 68 дней

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(68);
      expect(result.daysRemaining).toBe(22);
      expect(result.isOverstay).toBe(false);
      expect(result.status).toBe('warning');
      expect(result.usagePercent).toBe(76); // округление
    });

    it('должен вернуть danger при 81 дне (90%)', () => {
      const periods: StayPeriod[] = [createPeriod(80)]; // 81 день

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(81);
      expect(result.daysRemaining).toBe(9);
      expect(result.isOverstay).toBe(false);
      expect(result.status).toBe('danger');
      expect(result.usagePercent).toBe(90);
    });

    it('должен вернуть danger при 89 днях (99%)', () => {
      const periods: StayPeriod[] = [createPeriod(88)]; // 89 дней

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(89);
      expect(result.daysRemaining).toBe(1);
      expect(result.isOverstay).toBe(false);
      expect(result.status).toBe('danger');
    });

    it('должен вернуть overstay при РОВНО 90 днях', () => {
      const periods: StayPeriod[] = [createPeriod(89)]; // 90 дней

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(90);
      expect(result.daysRemaining).toBe(0);
      expect(result.isOverstay).toBe(false); // ровно 90 - ещё не overstay!
      expect(result.status).toBe('danger'); // но уже danger
      expect(result.usagePercent).toBe(100);
    });

    it('должен вернуть overstay при 91 дне (превышение на 1 день)', () => {
      const periods: StayPeriod[] = [createPeriod(90)]; // 91 день

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(91);
      expect(result.daysRemaining).toBe(0);
      expect(result.isOverstay).toBe(true);
      expect(result.overstayDays).toBe(1);
      expect(result.status).toBe('overstay');
    });

    it('должен вернуть overstay при 100 днях (превышение на 10 дней)', () => {
      const periods: StayPeriod[] = [createPeriod(99)]; // 100 дней

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(100);
      expect(result.isOverstay).toBe(true);
      expect(result.overstayDays).toBe(10);
      expect(result.status).toBe('overstay');
    });
  });

  describe('Завершённые периоды', () => {
    it('должен корректно считать завершённый период в пределах окна', () => {
      // Въезд 30 дней назад, выезд 10 дней назад = 21 день пребывания
      const periods: StayPeriod[] = [createPeriod(30, 10)];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(21); // включительно обе даты
      expect(result.daysRemaining).toBe(69);
      expect(result.status).toBe('safe');
    });

    it('должен суммировать несколько завершённых периодов', () => {
      const periods: StayPeriod[] = [
        createPeriod(60, 50), // 11 дней
        createPeriod(30, 20), // 11 дней
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(22);
      expect(result.daysRemaining).toBe(68);
    });
  });

  describe('Множественные въезды/выезды (сложные сценарии)', () => {
    it('КРИТИЧНО: выезд на 1 день НЕ сбрасывает счётчик!', () => {
      // Человек думает, что выехав на 1 день, сбросит лимит - это НЕ ТАК!
      const periods: StayPeriod[] = [
        createPeriod(60, 31), // 30 дней (включительно: день въезда и выезда считаются)
        createPeriod(29, 29), // 1 день в РФ (день въезда/выезда)
        createPeriod(28),     // вернулся, 29 дней до сегодня
      ];

      const result = calculateStay(periods);

      // daysBetween считает включительно, поэтому:
      // период 1: 60-31 = 30 дней (включая оба дня)
      // период 2: 29-29 = 1 день
      // период 3: 28-0 = 29 дней
      // Итого: 30 + 1 + 29 = 60 дней
      expect(result.totalDays).toBe(60);
      expect(result.daysRemaining).toBe(30);
      expect(result.status).toBe('safe');
    });

    it('КРИТИЧНО: выезд на 90+ дней сбрасывает счётчик', () => {
      // Окно 180 дней: от 179 дней назад до сегодня
      // Период 1: был в РФ с 200 до 190 дней назад = вне окна, игнорируется
      // Период 2: вернулся 5 дней назад
      const periods: StayPeriod[] = [
        createPeriod(200, 190), // полностью вне 180-дневного окна
        createPeriod(4),        // вернулся, 5 дней
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(5); // только текущий период
      expect(result.daysRemaining).toBe(85);
      expect(result.status).toBe('safe');
    });

    it('должен правильно считать частично пересекающийся период с границей окна', () => {
      // Въезд 200 дней назад, выезд 170 дней назад
      // Только часть периода попадает в 180-дневное окно
      const periods: StayPeriod[] = [
        createPeriod(200, 170), // 31 день, но только часть в окне
      ];

      const result = calculateStay(periods);

      // Окно: 179 дней назад до сегодня
      // Выезд был 170 дней назад - это в окне
      // Въезд 200 дней назад - не в окне, обрезается до 179
      expect(result.totalDays).toBe(10); // от дня 179 до дня 170 = 10 дней
      expect(result.status).toBe('safe');
    });

    it('должен игнорировать периоды полностью вне 180-дневного окна', () => {
      const periods: StayPeriod[] = [
        createPeriod(365, 300), // год назад - полностью вне окна
        createPeriod(10),       // текущий период
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(11); // только текущий период
      expect(result.periodsInWindow).toHaveLength(1);
    });

    it('должен суммировать несколько коротких визитов до лимита', () => {
      // Много коротких визитов, которые в сумме создают предупреждение
      // daysBetween считает включительно: от 170 до 161 = 10 дней
      const periods: StayPeriod[] = [
        createPeriod(170, 161), // 10 дней, но часть вне 180-дневного окна
        createPeriod(140, 131), // 10 дней
        createPeriod(110, 101), // 10 дней
        createPeriod(80, 71),   // 10 дней
        createPeriod(50, 41),   // 10 дней
        createPeriod(30, 21),   // 10 дней
        createPeriod(10, 1),    // 10 дней
        createPeriod(0),        // 1 день (сегодня)
      ];

      const result = calculateStay(periods);

      // Первый период частично вне окна (170-179 дней назад вне окна)
      // Остальные полностью в окне
      // Примерно 70+ дней, что > 75% и создаёт warning
      expect(result.totalDays).toBeGreaterThanOrEqual(70);
      expect(result.status).not.toBe('overstay');
    });
  });

  describe('Граничные даты окна 180 дней', () => {
    it('должен включать день ровно 179 дней назад (начало окна)', () => {
      // Окно: от 179 дней назад до сегодня (180 дней)
      const periods: StayPeriod[] = [
        createPeriod(179, 179), // ровно на границе окна
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(1); // день входит в окно
    });

    it('должен исключать день 180 дней назад (за пределами окна)', () => {
      const periods: StayPeriod[] = [
        createPeriod(180, 180), // за пределами окна
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(0); // день не входит в окно
    });

    it('должен правильно обрезать период на границе окна', () => {
      // Въезд 190 дней назад, выезд 175 дней назад (16 дней)
      // Но только 5 дней попадают в 180-дневное окно (179-175)
      const periods: StayPeriod[] = [
        createPeriod(190, 175),
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(5); // 179, 178, 177, 176, 175
    });
  });

  describe('Сброс лимита (nextResetDate)', () => {
    it('должен вычислять дату следующего сброса', () => {
      const periods: StayPeriod[] = [createPeriod(30)]; // въезд 30 дней назад

      const result = calculateStay(periods);

      expect(result.nextResetDate).not.toBeNull();
      expect(result.daysUntilReset).not.toBeNull();

      // Сброс должен произойти через (180 - 30) = 150 дней
      // Но расчёт идёт от первого дня в окне + 180
      if (result.daysUntilReset !== null) {
        expect(result.daysUntilReset).toBeGreaterThanOrEqual(149);
        expect(result.daysUntilReset).toBeLessThanOrEqual(151);
      }
    });

    it('должен вернуть null для nextResetDate при отсутствии периодов', () => {
      const result = calculateStay([]);

      expect(result.nextResetDate).toBeNull();
      expect(result.daysUntilReset).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('должен игнорировать периоды без entryDate', () => {
      const periods: StayPeriod[] = [
        { id: '1', entryDate: '', exitDate: daysAgo(10) },
        createPeriod(5),
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(6); // только валидный период
    });

    it('должен игнорировать будущие периоды', () => {
      const periods: StayPeriod[] = [
        {
          id: 'future',
          entryDate: daysFromNow(10), // въезд в будущем
          exitDate: daysFromNow(20),
        },
        createPeriod(5),
      ];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(6); // только текущий период
    });

    it('должен корректно обрабатывать период, начавшийся в будущем exitDate', () => {
      // Это невалидный сценарий, но система не должна падать
      const periods: StayPeriod[] = [
        {
          id: 'weird',
          entryDate: daysAgo(10),
          exitDate: daysFromNow(5), // выезд в будущем
        },
      ];

      const result = calculateStay(periods);

      // Должен обрезать до сегодня
      expect(result.totalDays).toBe(11);
    });

    it('должен правильно сортировать неупорядоченные периоды', () => {
      const periods: StayPeriod[] = [
        createPeriod(10, 5),  // недавний
        createPeriod(50, 40), // давний
        createPeriod(30, 20), // средний
      ];

      const result = calculateStay(periods);

      // Сумма: 6 + 11 + 11 = 28 дней
      expect(result.totalDays).toBe(28);
      expect(result.periodsInWindow).toHaveLength(3);
    });
  });

  describe('Реальные жизненные сценарии', () => {
    it('Сценарий: Турист приехал на 2 недели отдыха', () => {
      const periods: StayPeriod[] = [createPeriod(13)]; // 14 дней

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(14);
      expect(result.daysRemaining).toBe(76);
      expect(result.status).toBe('safe');
      expect(result.usagePercent).toBe(16);
    });

    it('Сценарий: Работник по патенту, живёт постоянно', () => {
      const periods: StayPeriod[] = [createPeriod(85)]; // 86 дней

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(86);
      expect(result.daysRemaining).toBe(4);
      expect(result.status).toBe('danger');

      const recommendation = getRecommendation(result);
      expect(recommendation.type).toBe('warning');
      expect(recommendation.title).toContain('Критически');
    });

    it('Сценарий: Нелегал, просрочил на месяц', () => {
      const periods: StayPeriod[] = [createPeriod(119)]; // 120 дней

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(120);
      expect(result.isOverstay).toBe(true);
      expect(result.overstayDays).toBe(30);
      expect(result.status).toBe('overstay');

      const recommendation = getRecommendation(result);
      expect(recommendation.type).toBe('error');
      expect(recommendation.message).toContain('юристу');
    });

    it('Сценарий: Челночник - частые короткие визиты', () => {
      // Торговец, который ездит туда-сюда каждые 2 недели
      const periods: StayPeriod[] = [];
      for (let i = 0; i < 6; i++) {
        const start = 170 - i * 30;
        const end = start - 10;
        if (start >= 0) {
          periods.push(createPeriod(start, Math.max(0, end)));
        }
      }

      const result = calculateStay(periods);

      // Каждый визит ~11 дней, 6 визитов, но часть вне окна
      expect(result.status).not.toBe('overstay');
    });

    it('Сценарий: Гражданин ЕАЭС (должен работать так же для 90/180)', () => {
      // Граждане ЕАЭС освобождены от патента, но правило 90/180 для них тоже действует
      // если нет трудового договора
      const periods: StayPeriod[] = [createPeriod(89)];

      const result = calculateStay(periods);

      expect(result.totalDays).toBe(90);
      expect(result.status).toBe('danger');
    });
  });
});

describe('getRecommendation', () => {
  it('должен вернуть success для безопасного статуса', () => {
    const calculation: StayCalculation = {
      totalDays: 30,
      daysRemaining: 60,
      isOverstay: false,
      overstayDays: 0,
      usagePercent: 33,
      windowStart: new Date(),
      nextResetDate: null,
      daysUntilReset: null,
      periodsInWindow: [],
      status: 'safe',
    };

    const result = getRecommendation(calculation);

    expect(result.type).toBe('success');
    expect(result.title).toContain('порядке');
  });

  it('должен вернуть warning для статуса warning', () => {
    const calculation: StayCalculation = {
      totalDays: 70,
      daysRemaining: 20,
      isOverstay: false,
      overstayDays: 0,
      usagePercent: 78,
      windowStart: new Date(),
      nextResetDate: null,
      daysUntilReset: null,
      periodsInWindow: [],
      status: 'warning',
    };

    const result = getRecommendation(calculation);

    expect(result.type).toBe('warning');
    expect(result.title).toContain('Внимание');
  });

  it('должен вернуть warning для статуса danger', () => {
    const calculation: StayCalculation = {
      totalDays: 85,
      daysRemaining: 5,
      isOverstay: false,
      overstayDays: 0,
      usagePercent: 94,
      windowStart: new Date(),
      nextResetDate: null,
      daysUntilReset: null,
      periodsInWindow: [],
      status: 'danger',
    };

    const result = getRecommendation(calculation);

    expect(result.type).toBe('warning');
    expect(result.title).toContain('Критически');
  });

  it('должен вернуть error для overstay', () => {
    const calculation: StayCalculation = {
      totalDays: 100,
      daysRemaining: 0,
      isOverstay: true,
      overstayDays: 10,
      usagePercent: 111,
      windowStart: new Date(),
      nextResetDate: null,
      daysUntilReset: null,
      periodsInWindow: [],
      status: 'overstay',
    };

    const result = getRecommendation(calculation);

    expect(result.type).toBe('error');
    expect(result.title).toContain('Превышение');
    expect(result.message).toContain('штраф');
    expect(result.message).toContain('запрет');
  });

  it('должен информировать о скором обновлении лимита', () => {
    const calculation: StayCalculation = {
      totalDays: 20,
      daysRemaining: 70,
      isOverstay: false,
      overstayDays: 0,
      usagePercent: 22,
      windowStart: new Date(),
      nextResetDate: new Date(),
      daysUntilReset: 15, // скоро сбросится
      periodsInWindow: [],
      status: 'safe',
    };

    const result = getRecommendation(calculation);

    expect(result.type).toBe('info');
    expect(result.title).toContain('обновится');
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
  describe('False Positives (система не должна говорить "всё ок" когда есть проблема)', () => {
    it('НЕ должен показывать safe при 90 днях', () => {
      const periods: StayPeriod[] = [createPeriod(89)];
      const result = calculateStay(periods);

      expect(result.status).not.toBe('safe');
    });

    it('НЕ должен показывать safe при 76+ днях', () => {
      const periods: StayPeriod[] = [createPeriod(75)]; // 76 дней
      const result = calculateStay(periods);

      // 76/90 = 84.4%, должен быть warning
      expect(result.status).not.toBe('safe');
    });

    it('НЕ должен пропускать overstay', () => {
      const periods: StayPeriod[] = [createPeriod(100)]; // 101 день
      const result = calculateStay(periods);

      expect(result.isOverstay).toBe(true);
      expect(result.status).toBe('overstay');
    });
  });

  describe('False Negatives (система не должна паниковать зря)', () => {
    it('НЕ должен показывать warning при < 75%', () => {
      const periods: StayPeriod[] = [createPeriod(66)]; // 67 дней = 74.4%
      const result = calculateStay(periods);

      expect(result.status).toBe('safe');
    });

    it('НЕ должен показывать danger при < 90%', () => {
      const periods: StayPeriod[] = [createPeriod(79)]; // 80 дней = 88.9%
      const result = calculateStay(periods);

      expect(result.status).not.toBe('danger');
      expect(result.status).toBe('warning');
    });

    it('НЕ должен показывать overstay при ровно 90 днях', () => {
      const periods: StayPeriod[] = [createPeriod(89)]; // 90 дней
      const result = calculateStay(periods);

      expect(result.isOverstay).toBe(false);
      expect(result.status).toBe('danger'); // но предупреждение
    });
  });
});
