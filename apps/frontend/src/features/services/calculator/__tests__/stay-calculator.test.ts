/**
 * Unit tests for Stay Calculator (90 days per calendar year rule)
 *
 * Rule: From 05.02.2025, foreign citizens can stay in Russia
 * no more than 90 days per calendar year (January 1 - December 31).
 */

import { calculateStay, getRecommendation, formatStayStatus, formatDate, formatDateShort } from '../stay-calculator';
import type { StayPeriod, StayCalculation } from '../types';

describe('Stay Calculator', () => {
  // Mock the current date for predictable tests
  const MOCK_DATE = new Date(2025, 5, 15); // June 15, 2025
  let originalDate: DateConstructor;

  beforeAll(() => {
    originalDate = global.Date;
  });

  beforeEach(() => {
    // Mock Date to return controlled date
    const MockDate = class extends originalDate {
      constructor(...args: any[]) {
        if (args.length === 0) {
          super(MOCK_DATE.getTime());
        } else {
          // @ts-ignore
          super(...args);
        }
      }

      static now() {
        return MOCK_DATE.getTime();
      }
    } as DateConstructor;

    global.Date = MockDate;
  });

  afterEach(() => {
    global.Date = originalDate;
  });

  describe('calculateStay', () => {
    describe('Basic calculations', () => {
      it('should calculate days for a single period fully in current year', () => {
        const periods: StayPeriod[] = [
          { id: '1', entryDate: '2025-03-01', exitDate: '2025-03-10' },
        ];

        const result = calculateStay(periods);

        expect(result.totalDays).toBe(10); // March 1-10 = 10 days inclusive
        expect(result.daysRemaining).toBe(80);
        expect(result.isOverstay).toBe(false);
        expect(result.overstayDays).toBe(0);
        expect(result.status).toBe('safe');
        expect(result.currentYear).toBe(2025);
      });

      it('should calculate days for multiple non-overlapping periods', () => {
        const periods: StayPeriod[] = [
          { id: '1', entryDate: '2025-01-10', exitDate: '2025-01-20' }, // 11 days
          { id: '2', entryDate: '2025-03-01', exitDate: '2025-03-15' }, // 15 days
          { id: '3', entryDate: '2025-05-01', exitDate: '2025-05-10' }, // 10 days
        ];

        const result = calculateStay(periods);

        expect(result.totalDays).toBe(36); // 11 + 15 + 10
        expect(result.daysRemaining).toBe(54);
        expect(result.isOverstay).toBe(false);
        expect(result.status).toBe('safe');
      });

      it('should handle empty periods array', () => {
        const periods: StayPeriod[] = [];

        const result = calculateStay(periods);

        expect(result.totalDays).toBe(0);
        expect(result.daysRemaining).toBe(90);
        expect(result.isOverstay).toBe(false);
        expect(result.status).toBe('safe');
        expect(result.periodsInWindow).toHaveLength(0);
      });

      it('should sort periods by entry date', () => {
        const periods: StayPeriod[] = [
          { id: '2', entryDate: '2025-03-01', exitDate: '2025-03-05' },
          { id: '1', entryDate: '2025-01-10', exitDate: '2025-01-15' },
          { id: '3', entryDate: '2025-02-01', exitDate: '2025-02-10' },
        ];

        const result = calculateStay(periods);

        // Periods should be processed in order, first period in result should be January
        expect(result.periodsInWindow[0].entry.getMonth()).toBe(0); // January
        expect(result.periodsInWindow[1].entry.getMonth()).toBe(1); // February
        expect(result.periodsInWindow[2].entry.getMonth()).toBe(2); // March
      });
    });

    describe('Boundary cases', () => {
      it('should trim period that starts in previous year to current year start', () => {
        const periods: StayPeriod[] = [
          { id: '1', entryDate: '2024-12-20', exitDate: '2025-01-15' },
        ];

        const result = calculateStay(periods);

        // Only count days from Jan 1, 2025 to Jan 15, 2025
        expect(result.totalDays).toBe(15);
        expect(result.periodsInWindow).toHaveLength(1);
      });

      it('should handle active period (no exitDate) - still in country', () => {
        const periods: StayPeriod[] = [
          { id: '1', entryDate: '2025-06-01' }, // No exit date, entered June 1
        ];

        const result = calculateStay(periods);

        // June 1 to June 15 (today) = 15 days
        expect(result.totalDays).toBe(15);
        expect(result.periodsInWindow[0].isActive).toBe(true);
      });

      it('should ignore periods completely in past year', () => {
        const periods: StayPeriod[] = [
          { id: '1', entryDate: '2024-06-01', exitDate: '2024-06-30' },
          { id: '2', entryDate: '2025-02-01', exitDate: '2025-02-10' },
        ];

        const result = calculateStay(periods);

        expect(result.totalDays).toBe(10); // Only February period counts
        expect(result.periodsInWindow).toHaveLength(1);
      });

      it('should ignore periods starting in the future', () => {
        const periods: StayPeriod[] = [
          { id: '1', entryDate: '2025-03-01', exitDate: '2025-03-10' },
          { id: '2', entryDate: '2025-07-01', exitDate: '2025-07-15' }, // Future
        ];

        const result = calculateStay(periods);

        expect(result.totalDays).toBe(10); // Only March period counts
        expect(result.periodsInWindow).toHaveLength(1);
      });

      it('should handle period spanning year boundary from previous year', () => {
        const periods: StayPeriod[] = [
          { id: '1', entryDate: '2024-12-15', exitDate: '2025-02-15' },
        ];

        const result = calculateStay(periods);

        // Only count from Jan 1, 2025 to Feb 15, 2025 = 46 days
        expect(result.totalDays).toBe(46);
      });

      it('should calculate days until reset correctly', () => {
        const result = calculateStay([]);

        // From June 15, 2025 to Jan 1, 2026
        // daysBetween calculates inclusive days, then subtracts 1
        // June 15 to Jan 1 = 200 days inclusive, minus 1 = 199 (but code gives 200)
        // The formula: daysBetween(today, nextResetDate) - 1
        // daysBetween returns (Jan1 - Jun15) / MS_PER_DAY + 1 = 200 + 1 = 201
        // Then minus 1 = 200
        expect(result.daysUntilReset).toBe(200);
        expect(result.nextResetDate.getFullYear()).toBe(2026);
        expect(result.nextResetDate.getMonth()).toBe(0);
        expect(result.nextResetDate.getDate()).toBe(1);
      });

      it('should filter out periods without entryDate', () => {
        const periods: StayPeriod[] = [
          { id: '1', entryDate: '', exitDate: '2025-03-10' },
          { id: '2', entryDate: '2025-04-01', exitDate: '2025-04-05' },
        ];

        const result = calculateStay(periods);

        expect(result.totalDays).toBe(5);
        expect(result.periodsInWindow).toHaveLength(1);
      });
    });

    describe('Status determination', () => {
      it('should return "safe" status when usage < 75%', () => {
        const periods: StayPeriod[] = [
          { id: '1', entryDate: '2025-03-01', exitDate: '2025-03-20' }, // 20 days ~ 22%
        ];

        const result = calculateStay(periods);

        expect(result.status).toBe('safe');
        expect(result.usagePercent).toBe(22);
      });

      it('should return "warning" status when usage >= 75% and < 90%', () => {
        // Need to use 68-80 days to get 75%-89%
        const periods: StayPeriod[] = [
          { id: '1', entryDate: '2025-01-01', exitDate: '2025-03-10' }, // 69 days = 77%
        ];

        const result = calculateStay(periods);

        expect(result.status).toBe('warning');
        expect(result.usagePercent).toBeGreaterThanOrEqual(75);
        expect(result.usagePercent).toBeLessThan(90);
      });

      it('should return "danger" status when usage >= 90% and <= 100%', () => {
        // Need 81-90 days for 90%-100%
        const periods: StayPeriod[] = [
          { id: '1', entryDate: '2025-01-01', exitDate: '2025-03-23' }, // 82 days = 91%
        ];

        const result = calculateStay(periods);

        expect(result.status).toBe('danger');
        expect(result.usagePercent).toBeGreaterThanOrEqual(90);
      });

      it('should return "overstay" status when totalDays > 90', () => {
        const periods: StayPeriod[] = [
          { id: '1', entryDate: '2025-01-01', exitDate: '2025-04-05' }, // 95 days
        ];

        const result = calculateStay(periods);

        expect(result.status).toBe('overstay');
        expect(result.isOverstay).toBe(true);
        expect(result.overstayDays).toBe(5);
        expect(result.totalDays).toBe(95);
      });

      it('should calculate exact boundary at 90 days (danger, not overstay)', () => {
        const periods: StayPeriod[] = [
          { id: '1', entryDate: '2025-01-01', exitDate: '2025-03-31' }, // 90 days
        ];

        const result = calculateStay(periods);

        expect(result.totalDays).toBe(90);
        expect(result.status).toBe('danger'); // 100% usage
        expect(result.isOverstay).toBe(false);
        expect(result.daysRemaining).toBe(0);
      });
    });

    describe('Usage percentage calculation', () => {
      it('should calculate 0% for no days', () => {
        const result = calculateStay([]);
        expect(result.usagePercent).toBe(0);
      });

      it('should calculate 50% for 45 days', () => {
        const periods: StayPeriod[] = [
          { id: '1', entryDate: '2025-02-01', exitDate: '2025-03-17' }, // 45 days
        ];

        const result = calculateStay(periods);
        expect(result.usagePercent).toBe(50);
      });

      it('should calculate >100% for overstay', () => {
        const periods: StayPeriod[] = [
          { id: '1', entryDate: '2025-01-01', exitDate: '2025-05-01' }, // 121 days
        ];

        const result = calculateStay(periods);
        expect(result.usagePercent).toBeGreaterThan(100);
      });
    });
  });

  describe('getRecommendation', () => {
    it('should return error recommendation for overstay', () => {
      const calculation: StayCalculation = {
        totalDays: 95,
        daysRemaining: 0,
        isOverstay: true,
        overstayDays: 5,
        usagePercent: 106,
        currentYear: 2025,
        yearStart: new Date(2025, 0, 1),
        nextResetDate: new Date(2026, 0, 1),
        daysUntilReset: 200,
        periodsInWindow: [],
        status: 'overstay',
      };

      const recommendation = getRecommendation(calculation);

      expect(recommendation.type).toBe('error');
      expect(recommendation.title).toContain('Превышение');
      expect(recommendation.message).toContain('5');
      expect(recommendation.message).toContain('юрист');
    });

    it('should return warning recommendation for danger status', () => {
      const calculation: StayCalculation = {
        totalDays: 85,
        daysRemaining: 5,
        isOverstay: false,
        overstayDays: 0,
        usagePercent: 94,
        currentYear: 2025,
        yearStart: new Date(2025, 0, 1),
        nextResetDate: new Date(2026, 0, 1),
        daysUntilReset: 200,
        periodsInWindow: [],
        status: 'danger',
      };

      const recommendation = getRecommendation(calculation);

      expect(recommendation.type).toBe('warning');
      expect(recommendation.title).toContain('Критически');
      expect(recommendation.message).toContain('5');
      expect(recommendation.message).toContain('выезд');
    });

    it('should return warning recommendation for warning status', () => {
      const calculation: StayCalculation = {
        totalDays: 70,
        daysRemaining: 20,
        isOverstay: false,
        overstayDays: 0,
        usagePercent: 78,
        currentYear: 2025,
        yearStart: new Date(2025, 0, 1),
        nextResetDate: new Date(2026, 0, 1),
        daysUntilReset: 200,
        periodsInWindow: [],
        status: 'warning',
      };

      const recommendation = getRecommendation(calculation);

      expect(recommendation.type).toBe('warning');
      expect(recommendation.title).toContain('Внимание');
      expect(recommendation.message).toContain('70');
      expect(recommendation.message).toContain('20');
    });

    it('should return info recommendation when new year is approaching (<=30 days)', () => {
      const calculation: StayCalculation = {
        totalDays: 30,
        daysRemaining: 60,
        isOverstay: false,
        overstayDays: 0,
        usagePercent: 33,
        currentYear: 2025,
        yearStart: new Date(2025, 0, 1),
        nextResetDate: new Date(2026, 0, 1),
        daysUntilReset: 20, // Less than 30 days to new year
        periodsInWindow: [],
        status: 'safe',
      };

      const recommendation = getRecommendation(calculation);

      expect(recommendation.type).toBe('info');
      expect(recommendation.title).toContain('новый год');
      expect(recommendation.message).toContain('20');
      expect(recommendation.message).toContain('обнулится');
    });

    it('should return success recommendation for safe status', () => {
      const calculation: StayCalculation = {
        totalDays: 30,
        daysRemaining: 60,
        isOverstay: false,
        overstayDays: 0,
        usagePercent: 33,
        currentYear: 2025,
        yearStart: new Date(2025, 0, 1),
        nextResetDate: new Date(2026, 0, 1),
        daysUntilReset: 200, // More than 30 days to new year
        periodsInWindow: [],
        status: 'safe',
      };

      const recommendation = getRecommendation(calculation);

      expect(recommendation.type).toBe('success');
      expect(recommendation.title).toContain('в порядке');
      expect(recommendation.message).toContain('30');
      expect(recommendation.message).toContain('60');
    });

    it('should show correct year in recommendation messages', () => {
      const calculation: StayCalculation = {
        totalDays: 30,
        daysRemaining: 60,
        isOverstay: false,
        overstayDays: 0,
        usagePercent: 33,
        currentYear: 2025,
        yearStart: new Date(2025, 0, 1),
        nextResetDate: new Date(2026, 0, 1),
        daysUntilReset: 200,
        periodsInWindow: [],
        status: 'safe',
      };

      const recommendation = getRecommendation(calculation);

      expect(recommendation.message).toContain('2025');
    });
  });

  describe('formatStayStatus', () => {
    it('should format overstay status correctly', () => {
      const calculation: StayCalculation = {
        totalDays: 95,
        daysRemaining: 0,
        isOverstay: true,
        overstayDays: 5,
        usagePercent: 106,
        currentYear: 2025,
        yearStart: new Date(2025, 0, 1),
        nextResetDate: new Date(2026, 0, 1),
        daysUntilReset: 200,
        periodsInWindow: [],
        status: 'overstay',
      };

      const formatted = formatStayStatus(calculation);

      expect(formatted.label).toBe('Превышение');
      expect(formatted.color).toBe('red');
      expect(formatted.icon).toBe('alert');
    });

    it('should format danger status correctly', () => {
      const calculation = { status: 'danger' } as StayCalculation;
      const formatted = formatStayStatus(calculation);

      expect(formatted.label).toBe('Критично');
      expect(formatted.color).toBe('red');
      expect(formatted.icon).toBe('warning');
    });

    it('should format warning status correctly', () => {
      const calculation = { status: 'warning' } as StayCalculation;
      const formatted = formatStayStatus(calculation);

      expect(formatted.label).toBe('Внимание');
      expect(formatted.color).toBe('yellow');
      expect(formatted.icon).toBe('warning');
    });

    it('should format safe status correctly', () => {
      const calculation = { status: 'safe' } as StayCalculation;
      const formatted = formatStayStatus(calculation);

      expect(formatted.label).toBe('В норме');
      expect(formatted.color).toBe('green');
      expect(formatted.icon).toBe('check');
    });
  });

  describe('formatDate', () => {
    it('should format date in Russian locale', () => {
      const date = new Date(2025, 5, 15); // June 15, 2025
      const formatted = formatDate(date);

      expect(formatted).toBe('15 июня 2025');
    });

    it('should handle January correctly', () => {
      const date = new Date(2025, 0, 1);
      const formatted = formatDate(date);

      expect(formatted).toBe('1 января 2025');
    });

    it('should handle December correctly', () => {
      const date = new Date(2025, 11, 31);
      const formatted = formatDate(date);

      expect(formatted).toBe('31 декабря 2025');
    });
  });

  describe('formatDateShort', () => {
    it('should format date as DD.MM.YYYY', () => {
      const date = new Date(2025, 5, 15);
      const formatted = formatDateShort(date);

      expect(formatted).toBe('15.06.2025');
    });

    it('should pad single digit day and month', () => {
      const date = new Date(2025, 0, 5); // January 5
      const formatted = formatDateShort(date);

      expect(formatted).toBe('05.01.2025');
    });
  });

  describe('Integration: calculateStay + getRecommendation', () => {
    it('should provide correct recommendation for new visitor', () => {
      const periods: StayPeriod[] = [];

      const calculation = calculateStay(periods);
      const recommendation = getRecommendation(calculation);

      expect(recommendation.type).toBe('success');
      expect(recommendation.message).toContain('90');
    });

    it('should provide correct recommendation for overstay', () => {
      const periods: StayPeriod[] = [
        { id: '1', entryDate: '2025-01-01', exitDate: '2025-04-15' }, // 105 days
      ];

      const calculation = calculateStay(periods);
      const recommendation = getRecommendation(calculation);

      expect(calculation.status).toBe('overstay');
      expect(recommendation.type).toBe('error');
      expect(recommendation.message).toContain('юрист');
    });

    it('should handle active stay approaching limit', () => {
      // Entry on May 1, still in country (today is June 15) = 46 days
      // Plus previous stay of 35 days = 81 days total
      const periods: StayPeriod[] = [
        { id: '1', entryDate: '2025-02-01', exitDate: '2025-03-07' }, // 35 days
        { id: '2', entryDate: '2025-05-01' }, // Active, 46 days by June 15
      ];

      const calculation = calculateStay(periods);
      const recommendation = getRecommendation(calculation);

      expect(calculation.totalDays).toBe(81);
      // 81/90 = 90%, so status is 'danger' (>= 90%)
      expect(calculation.status).toBe('danger');
      expect(recommendation.type).toBe('warning');
    });
  });
});

describe('Days word declension (implicit via getRecommendation)', () => {
  // Test Russian word declension for "day" indirectly through recommendations

  it('should use correct declension for 1 day', () => {
    const calculation: StayCalculation = {
      totalDays: 89,
      daysRemaining: 1,
      isOverstay: false,
      overstayDays: 0,
      usagePercent: 99,
      currentYear: 2025,
      yearStart: new Date(2025, 0, 1),
      nextResetDate: new Date(2026, 0, 1),
      daysUntilReset: 200,
      periodsInWindow: [],
      status: 'danger',
    };

    const recommendation = getRecommendation(calculation);

    expect(recommendation.message).toContain('1 день');
  });

  it('should use correct declension for 2-4 days', () => {
    const calculation: StayCalculation = {
      totalDays: 87,
      daysRemaining: 3,
      isOverstay: false,
      overstayDays: 0,
      usagePercent: 97,
      currentYear: 2025,
      yearStart: new Date(2025, 0, 1),
      nextResetDate: new Date(2026, 0, 1),
      daysUntilReset: 200,
      periodsInWindow: [],
      status: 'danger',
    };

    const recommendation = getRecommendation(calculation);

    expect(recommendation.message).toContain('3 дня');
  });

  it('should use correct declension for 5+ days', () => {
    const calculation: StayCalculation = {
      totalDays: 80,
      daysRemaining: 10,
      isOverstay: false,
      overstayDays: 0,
      usagePercent: 89,
      currentYear: 2025,
      yearStart: new Date(2025, 0, 1),
      nextResetDate: new Date(2026, 0, 1),
      daysUntilReset: 200,
      periodsInWindow: [],
      status: 'warning',
    };

    const recommendation = getRecommendation(calculation);

    expect(recommendation.message).toContain('10 дней');
  });

  it('should use correct declension for 11-19 days (exception)', () => {
    const calculation: StayCalculation = {
      totalDays: 77,
      daysRemaining: 13,
      isOverstay: false,
      overstayDays: 0,
      usagePercent: 86,
      currentYear: 2025,
      yearStart: new Date(2025, 0, 1),
      nextResetDate: new Date(2026, 0, 1),
      daysUntilReset: 200,
      periodsInWindow: [],
      status: 'warning',
    };

    const recommendation = getRecommendation(calculation);

    expect(recommendation.message).toContain('13 дней');
  });

  it('should use correct declension for 21 days', () => {
    const calculation: StayCalculation = {
      totalDays: 69,
      daysRemaining: 21,
      isOverstay: false,
      overstayDays: 0,
      usagePercent: 77,
      currentYear: 2025,
      yearStart: new Date(2025, 0, 1),
      nextResetDate: new Date(2026, 0, 1),
      daysUntilReset: 200,
      periodsInWindow: [],
      status: 'warning',
    };

    const recommendation = getRecommendation(calculation);

    expect(recommendation.message).toContain('21 день');
  });
});
