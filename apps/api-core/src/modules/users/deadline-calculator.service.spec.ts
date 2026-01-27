import { Test, TestingModule } from '@nestjs/testing';
import { DeadlineCalculatorService } from './deadline-calculator.service';
import { VisitPurpose } from './dto/complete-onboarding.dto';

describe('DeadlineCalculatorService', () => {
  let service: DeadlineCalculatorService;

  // Helper to mock today's date
  const mockDate = (dateString: string) => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(dateString));
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeadlineCalculatorService],
    }).compile();

    service = module.get<DeadlineCalculatorService>(DeadlineCalculatorService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('calculateDeadlines', () => {
    describe('registration deadline (7 work days)', () => {
      it('should calculate registration deadline correctly', () => {
        mockDate('2024-01-15'); // Monday

        const result = service.calculateDeadlines({
          entryDate: '2024-01-15',
        });

        // 7 work days from Monday 15 Jan = Wednesday 24 Jan (skipping weekends)
        expect(result.registration.date).toBe('2024-01-24');
        expect(result.registration.daysRemaining).toBe(9);
        // 9 days remaining is warning (8-14 days)
        expect(result.registration.status).toBe('warning');
      });

      it('should mark registration as expired when past deadline', () => {
        mockDate('2024-02-01');

        const result = service.calculateDeadlines({
          entryDate: '2024-01-15',
        });

        expect(result.registration.daysRemaining).toBeLessThan(0);
        expect(result.registration.status).toBe('expired');
      });

      it('should mark registration as critical when <7 days', () => {
        mockDate('2024-01-20');

        const result = service.calculateDeadlines({
          entryDate: '2024-01-15',
        });

        expect(result.registration.daysRemaining).toBeLessThanOrEqual(7);
        expect(result.registration.status).toBe('critical');
      });

      it('should mark registration as warning when 8-14 days remaining', () => {
        mockDate('2024-01-16');

        const result = service.calculateDeadlines({
          entryDate: '2024-01-15',
        });

        // 8 days remaining should be warning
        expect(result.registration.daysRemaining).toBeGreaterThanOrEqual(8);
        expect(result.registration.daysRemaining).toBeLessThanOrEqual(14);
        expect(result.registration.status).toBe('warning');
      });
    });

    describe('90-day stay limit', () => {
      it('should calculate 90-day stay limit', () => {
        mockDate('2024-01-15');

        const result = service.calculateDeadlines({
          entryDate: '2024-01-01',
        });

        expect(result.stay90Days.date).toBe('2024-03-31'); // 90 days from Jan 1
        expect(result.stay90Days.daysRemaining).toBe(76); // 90 - 14 days elapsed
      });

      it('should mark as expired after 90 days', () => {
        mockDate('2024-05-01');

        const result = service.calculateDeadlines({
          entryDate: '2024-01-01',
        });

        expect(result.stay90Days.status).toBe('expired');
      });
    });

    describe('180-day window', () => {
      it('should calculate 180-day window end', () => {
        mockDate('2024-01-15');

        const result = service.calculateDeadlines({
          entryDate: '2024-01-01',
        });

        expect(result.stayLimit180.date).toBe('2024-06-29'); // 180 days from Jan 1
      });
    });

    describe('patent deadlines', () => {
      it('should calculate patent payment deadline', () => {
        mockDate('2024-02-15');

        const result = service.calculateDeadlines({
          entryDate: '2024-01-01',
          patentDate: '2024-02-01',
        });

        expect(result.patentPayment).toBeDefined();
        expect(result.patentPayment!.date).toBe('2024-03-01'); // Next month from patent date
      });

      it('should calculate patent renewal deadline (12 months)', () => {
        mockDate('2024-02-15');

        const result = service.calculateDeadlines({
          entryDate: '2024-01-01',
          patentDate: '2024-02-01',
        });

        expect(result.patentRenewal).toBeDefined();
        expect(result.patentRenewal!.date).toBe('2025-02-01'); // 12 months from patent date
      });

      it('should show patent recommendation for work purpose without patent', () => {
        mockDate('2024-01-15');

        const result = service.calculateDeadlines({
          entryDate: '2024-01-01',
          purpose: VisitPurpose.WORK,
        });

        expect(result.patentPayment).toBeDefined();
        expect(result.patentPayment!.description).toContain('Рекомендуемый срок оформления патента');
      });

      it('should not show patent for non-work purposes', () => {
        mockDate('2024-01-15');

        const result = service.calculateDeadlines({
          entryDate: '2024-01-01',
          purpose: VisitPurpose.TOURISM,
        });

        expect(result.patentPayment).toBeUndefined();
        expect(result.patentRenewal).toBeUndefined();
      });
    });

    describe('status calculation', () => {
      it('should return ok for >14 days remaining', () => {
        mockDate('2024-01-01');

        const result = service.calculateDeadlines({
          entryDate: '2024-01-01',
        });

        expect(result.stay90Days.status).toBe('ok');
      });

      it('should return warning for 8-14 days remaining', () => {
        mockDate('2024-03-20'); // 78 days from Jan 1, 12 days remaining

        const result = service.calculateDeadlines({
          entryDate: '2024-01-01',
        });

        expect(result.stay90Days.status).toBe('warning');
      });

      it('should return critical for 1-7 days remaining', () => {
        mockDate('2024-03-26'); // 84 days from Jan 1, 6 days remaining

        const result = service.calculateDeadlines({
          entryDate: '2024-01-01',
        });

        expect(result.stay90Days.status).toBe('critical');
      });

      it('should return expired for negative days', () => {
        mockDate('2024-04-05'); // 94 days from Jan 1

        const result = service.calculateDeadlines({
          entryDate: '2024-01-01',
        });

        expect(result.stay90Days.status).toBe('expired');
      });
    });

    describe('calculatedAt field', () => {
      it('should include calculation date', () => {
        mockDate('2024-02-15T12:00:00Z'); // Use explicit timezone

        const result = service.calculateDeadlines({
          entryDate: '2024-01-01',
        });

        // The calculatedAt is based on local time zone
        expect(result.calculatedAt).toMatch(/^2024-02-1[45]$/);
      });
    });

    describe('edge cases', () => {
      it('should handle entry date on weekend', () => {
        mockDate('2024-01-13'); // Saturday

        const result = service.calculateDeadlines({
          entryDate: '2024-01-13', // Saturday
        });

        // Registration deadline should still be calculated correctly
        // 7 work days from Saturday should skip weekends
        expect(result.registration).toBeDefined();
        expect(result.registration.date).toBeDefined();
      });

      it('should handle leap year', () => {
        mockDate('2024-02-15');

        const result = service.calculateDeadlines({
          entryDate: '2024-02-15',
        });

        // 90 days from Feb 15 2024 (leap year)
        expect(result.stay90Days.date).toBe('2024-05-15');
      });

      it('should handle year boundary', () => {
        mockDate('2023-12-15');

        const result = service.calculateDeadlines({
          entryDate: '2023-12-15',
        });

        // 90 days from Dec 15 2023 = Mar 14 2024
        expect(result.stay90Days.date).toBe('2024-03-14');
      });

      it('should handle today as entry date', () => {
        mockDate('2024-01-15');

        const result = service.calculateDeadlines({
          entryDate: '2024-01-15',
        });

        expect(result.stay90Days.daysRemaining).toBe(90);
      });
    });

    describe('patent payment cycles', () => {
      it('should calculate next payment after multiple months', () => {
        mockDate('2024-06-15'); // 4.5 months after patent

        const result = service.calculateDeadlines({
          entryDate: '2024-01-01',
          patentDate: '2024-02-01',
        });

        // Next payment should be July 1 (5th month)
        expect(result.patentPayment!.date).toBe('2024-07-01');
      });

      it('should handle patent close to expiry', () => {
        mockDate('2025-01-20'); // Close to 12 months after patent

        const result = service.calculateDeadlines({
          entryDate: '2024-01-01',
          patentDate: '2024-02-01',
        });

        expect(result.patentRenewal!.daysRemaining).toBeLessThan(15);
        // Less than 14 days remaining
        expect(['warning', 'critical']).toContain(result.patentRenewal!.status);
      });
    });
  });
});
