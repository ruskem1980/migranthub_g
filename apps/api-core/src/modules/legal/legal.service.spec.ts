import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LegalService } from './legal.service';

describe('LegalService', () => {
  let service: LegalService;

  // Mock today's date for consistent tests
  const mockDate = (dateString: string) => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(dateString));
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LegalService],
    }).compile();

    service = module.get<LegalService>(LegalService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getCategories', () => {
    it('should return all categories', () => {
      const result = service.getCategories();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include id, name, description for each category', () => {
      const result = service.getCategories();

      for (const category of result) {
        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('description');
        expect(typeof category.id).toBe('string');
        expect(typeof category.name).toBe('string');
        expect(typeof category.description).toBe('string');
      }
    });

    it('should return categories sorted by order', () => {
      const result = service.getCategories();

      for (let i = 1; i < result.length; i++) {
        expect(result[i].order).toBeGreaterThanOrEqual(result[i - 1].order);
      }
    });
  });

  describe('getCategoryById', () => {
    it('should return category by id', () => {
      const result = service.getCategoryById('registration');

      expect(result).toBeDefined();
      expect(result.id).toBe('registration');
      expect(result.name).toBe('Миграционный учёт');
    });

    it('should throw NotFoundException for invalid id', () => {
      expect(() => service.getCategoryById('non-existent-id')).toThrow(
        NotFoundException,
      );
    });

    it('should return different categories for different ids', () => {
      const registration = service.getCategoryById('registration');
      const patent = service.getCategoryById('patent');

      expect(registration.id).not.toBe(patent.id);
      expect(registration.name).not.toBe(patent.name);
    });
  });

  describe('getCategoryItems', () => {
    it('should return laws, forms and faq for category', () => {
      const result = service.getCategoryItems('registration');

      expect(result).toHaveProperty('laws');
      expect(result).toHaveProperty('forms');
      expect(result).toHaveProperty('faq');
      expect(Array.isArray(result.laws)).toBe(true);
      expect(Array.isArray(result.forms)).toBe(true);
      expect(Array.isArray(result.faq)).toBe(true);
    });

    it('should throw NotFoundException for invalid category', () => {
      expect(() => service.getCategoryItems('non-existent')).toThrow(
        NotFoundException,
      );
    });

    it('should return faq sorted by order', () => {
      const result = service.getCategoryItems('registration');

      if (result.faq.length > 1) {
        for (let i = 1; i < result.faq.length; i++) {
          expect(result.faq[i].order).toBeGreaterThanOrEqual(
            result.faq[i - 1].order,
          );
        }
      }
    });
  });

  describe('getLaws', () => {
    it('should return all laws without filter', () => {
      const result = service.getLaws();

      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by categoryId', () => {
      const result = service.getLaws({ categoryId: 'registration' });

      for (const law of result) {
        expect(law.categoryId).toBe('registration');
      }
    });

    it('should filter by search term in title', () => {
      const result = service.getLaws({ search: 'миграционн' });

      for (const law of result) {
        const matchesSearch =
          law.title.toLowerCase().includes('миграционн') ||
          law.number.toLowerCase().includes('миграционн') ||
          law.summary.toLowerCase().includes('миграционн');
        expect(matchesSearch).toBe(true);
      }
    });

    it('should filter by search term in number', () => {
      const allLaws = service.getLaws();
      if (allLaws.length > 0) {
        const firstLawNumber = allLaws[0].number;
        const result = service.getLaws({ search: firstLawNumber.substring(0, 5) });

        expect(result.length).toBeGreaterThan(0);
      }
    });

    it('should combine categoryId and search filters', () => {
      const result = service.getLaws({
        categoryId: 'registration',
        search: 'учёт',
      });

      for (const law of result) {
        expect(law.categoryId).toBe('registration');
        const matchesSearch =
          law.title.toLowerCase().includes('учёт') ||
          law.number.toLowerCase().includes('учёт') ||
          law.summary.toLowerCase().includes('учёт');
        expect(matchesSearch).toBe(true);
      }
    });

    it('should return empty array for non-matching search', () => {
      const result = service.getLaws({ search: 'xyznonexistent123' });

      expect(result).toHaveLength(0);
    });
  });

  describe('getLawById', () => {
    it('should return law by id', () => {
      const allLaws = service.getLaws();
      if (allLaws.length > 0) {
        const firstLaw = allLaws[0];
        const result = service.getLawById(firstLaw.id);

        expect(result).toBeDefined();
        expect(result.id).toBe(firstLaw.id);
      }
    });

    it('should throw NotFoundException for invalid id', () => {
      expect(() => service.getLawById('non-existent-id')).toThrow(
        NotFoundException,
      );
    });
  });

  describe('getForms', () => {
    it('should return all forms without filter', () => {
      const result = service.getForms();

      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by categoryId', () => {
      const result = service.getForms('registration');

      for (const form of result) {
        expect(form.categoryId).toBe('registration');
      }
    });
  });

  describe('getFormById', () => {
    it('should return form by id', () => {
      const allForms = service.getForms();
      if (allForms.length > 0) {
        const firstForm = allForms[0];
        const result = service.getFormById(firstForm.id);

        expect(result).toBeDefined();
        expect(result.id).toBe(firstForm.id);
      }
    });

    it('should throw NotFoundException for invalid id', () => {
      expect(() => service.getFormById('non-existent-id')).toThrow(
        NotFoundException,
      );
    });
  });

  describe('getFaq', () => {
    it('should return all faq without filter', () => {
      const result = service.getFaq();

      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter by categoryId', () => {
      const result = service.getFaq('registration');

      for (const faq of result) {
        expect(faq.categoryId).toBe('registration');
      }
    });

    it('should return faq sorted by order', () => {
      const result = service.getFaq();

      if (result.length > 1) {
        for (let i = 1; i < result.length; i++) {
          expect(result[i].order).toBeGreaterThanOrEqual(result[i - 1].order);
        }
      }
    });
  });

  describe('calculatePatentPrice', () => {
    it('should calculate for Moscow (code 77)', () => {
      const result = service.calculatePatentPrice({
        regionCode: '77',
        months: 3,
      });

      expect(result.regionCode).toBe('77');
      expect(result.regionName).toBe('Москва');
      expect(result.months).toBe(3);
      expect(result.totalPrice).toBe(6502 * 3); // 19506
    });

    it('should calculate for single month', () => {
      const result = service.calculatePatentPrice({
        regionCode: '77',
        months: 1,
      });

      expect(result.totalPrice).toBe(6502);
      expect(result.breakdown).toHaveLength(1);
      expect(result.breakdown[0].month).toBe(1);
      expect(result.breakdown[0].price).toBe(6502);
    });

    it('should calculate for 12 months', () => {
      const result = service.calculatePatentPrice({
        regionCode: '77',
        months: 12,
      });

      expect(result.totalPrice).toBe(6502 * 12);
      expect(result.breakdown).toHaveLength(12);
    });

    it('should include breakdown for each month', () => {
      const result = service.calculatePatentPrice({
        regionCode: '50', // Moscow Oblast
        months: 6,
      });

      expect(result.breakdown).toHaveLength(6);
      for (let i = 0; i < 6; i++) {
        expect(result.breakdown[i].month).toBe(i + 1);
        expect(result.breakdown[i].price).toBe(6287);
      }
    });

    it('should throw NotFoundException for invalid region', () => {
      expect(() =>
        service.calculatePatentPrice({
          regionCode: 'INVALID',
          months: 1,
        }),
      ).toThrow(NotFoundException);
    });

    it('should include baseRate and coefficient', () => {
      const result = service.calculatePatentPrice({
        regionCode: '77',
        months: 1,
      });

      expect(result.baseRate).toBe(1200);
      expect(result.coefficient).toBeDefined();
      expect(result.coefficient).toBeGreaterThan(0);
    });

    it('should calculate for different regions', () => {
      const moscow = service.calculatePatentPrice({
        regionCode: '77',
        months: 1,
      });
      const spb = service.calculatePatentPrice({
        regionCode: '78',
        months: 1,
      });

      expect(moscow.totalPrice).not.toBe(spb.totalPrice);
      expect(moscow.regionName).toBe('Москва');
      expect(spb.regionName).toBe('Санкт-Петербург');
    });
  });

  describe('getPatentRegions', () => {
    it('should return all regions', () => {
      const result = service.getPatentRegions();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include code, name and monthlyCost', () => {
      const result = service.getPatentRegions();

      for (const region of result) {
        expect(region).toHaveProperty('code');
        expect(region).toHaveProperty('name');
        expect(region).toHaveProperty('monthlyCost');
      }
    });

    it('should include Moscow', () => {
      const result = service.getPatentRegions();
      const moscow = result.find((r) => r.code === '77');

      expect(moscow).toBeDefined();
      expect(moscow!.name).toBe('Москва');
    });
  });

  describe('calculateStay', () => {
    it('should calculate remaining days', () => {
      mockDate('2024-02-15');

      const result = service.calculateStay({
        entryDate: '2024-01-01',
      });

      // 46 days from Jan 1 to Feb 15 (inclusive)
      expect(result.daysInRussia).toBe(46);
      expect(result.daysRemaining).toBe(90 - 46);
      expect(result.isOverstay).toBe(false);
    });

    it('should track exits from Russia', () => {
      mockDate('2024-03-01');

      const result = service.calculateStay({
        entryDate: '2024-01-01',
        exitDates: ['2024-01-15', '2024-02-01'],
      });

      expect(result.periods).toBeDefined();
      expect(result.periods.length).toBeGreaterThan(0);
    });

    it('should return warning if overstay', () => {
      mockDate('2024-05-01'); // More than 90 days from Jan 1

      const result = service.calculateStay({
        entryDate: '2024-01-01',
      });

      expect(result.isOverstay).toBe(true);
      expect(result.daysRemaining).toBe(0);
    });

    it('should calculate max stay date', () => {
      mockDate('2024-02-01');

      const result = service.calculateStay({
        entryDate: '2024-01-01',
      });

      expect(result.maxStayDate).toBe('2024-03-31'); // Jan 1 + 90 days
    });

    it('should handle multiple exit dates', () => {
      mockDate('2024-03-15');

      const result = service.calculateStay({
        entryDate: '2024-01-01',
        exitDates: ['2024-01-20', '2024-02-15'],
      });

      expect(result.periods.length).toBe(3); // 3 periods: entry->exit1, exit1->exit2, exit2->today
    });

    it('should sort exit dates', () => {
      mockDate('2024-03-01');

      const result = service.calculateStay({
        entryDate: '2024-01-01',
        exitDates: ['2024-02-15', '2024-01-20'], // Unsorted
      });

      // Should still work correctly with unsorted dates
      expect(result.periods).toBeDefined();
    });

    it('should calculate days remaining as 0 when overstay', () => {
      mockDate('2024-06-01'); // Way past 90 days

      const result = service.calculateStay({
        entryDate: '2024-01-01',
      });

      expect(result.daysRemaining).toBe(0);
      expect(result.isOverstay).toBe(true);
    });

    it('should include entry date in response', () => {
      mockDate('2024-02-01');

      const result = service.calculateStay({
        entryDate: '2024-01-15',
      });

      expect(result.entryDate).toBe('2024-01-15');
    });
  });
});
