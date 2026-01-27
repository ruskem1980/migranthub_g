import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MvdClient } from './mvd.client';

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('MvdClient', () => {
  let client: MvdClient;
  let configService: jest.Mocked<ConfigService>;

  const mockQuery = {
    lastName: 'Иванов',
    firstName: 'Иван',
    birthDate: '1990-01-01',
  };

  const defaultConfig: Record<string, any> = {
    'mvd.apiUrl': 'https://services.fms.gov.ru/info-service.htm?sid=2000',
    'mvd.enabled': true,
    'mvd.timeout': 10000,
    'mvd.retryAttempts': 3,
    'mvd.retryDelay': 100, // Short delay for tests
    'mvd.circuitBreakerThreshold': 5,
    'mvd.circuitBreakerResetTime': 60000,
  };

  beforeEach(async () => {
    jest.useFakeTimers();
    mockFetch.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MvdClient,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string, defaultValue?: any) => {
              return defaultConfig[key] ?? defaultValue;
            }),
          },
        },
      ],
    }).compile();

    client = module.get<MvdClient>(MvdClient);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('isEnabled', () => {
    it('should return enabled status from config', () => {
      expect(client.isEnabled()).toBe(true);
    });
  });

  describe('checkBan', () => {
    it('should make request to MVD API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Данные отсутствуют'),
      });

      const promise = client.checkBan(mockQuery);
      jest.runAllTimers();
      await promise;

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('services.fms.gov.ru'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.any(Object),
        }),
      );
    });

    it('should retry on failure', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          text: () => Promise.resolve('Данные отсутствуют'),
        });

      const promise = client.checkBan(mockQuery);

      // Process all retries
      for (let i = 0; i < 5; i++) {
        await Promise.resolve();
        jest.advanceTimersByTime(1000);
      }

      const result = await promise;

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result.hasBan).toBe(false);
    });

    it('should fail after all retry attempts', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const promise = client.checkBan(mockQuery);

      // Process all retries
      for (let i = 0; i < 10; i++) {
        await Promise.resolve();
        jest.advanceTimersByTime(5000);
      }

      await expect(promise).rejects.toThrow('Network error');
      expect(mockFetch).toHaveBeenCalledTimes(3); // retryAttempts = 3
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const promise = client.checkBan(mockQuery);

      // Process all retries
      for (let i = 0; i < 10; i++) {
        await Promise.resolve();
        jest.advanceTimersByTime(5000);
      }

      await expect(promise).rejects.toThrow('HTTP 500');
    });
  });

  describe('parseResponse', () => {
    it('should detect ban indicators', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () =>
          Promise.resolve('Запрет на въезд в Российскую Федерацию. Причина: нарушение сроков пребывания'),
      });

      const promise = client.checkBan(mockQuery);
      jest.runAllTimers();
      const result = await promise;

      expect(result.hasBan).toBe(true);
    });

    it('should detect no-ban indicators', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () =>
          Promise.resolve('Оснований не въезд не имеется. Проверка завершена.'),
      });

      const promise = client.checkBan(mockQuery);
      jest.runAllTimers();
      const result = await promise;

      expect(result.hasBan).toBe(false);
    });

    it('should extract reason from HTML', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () =>
          Promise.resolve(
            '<html><body>Запрет на въезд. Причина: нарушение миграционного законодательства</body></html>',
          ),
      });

      const promise = client.checkBan(mockQuery);
      jest.runAllTimers();
      const result = await promise;

      expect(result.hasBan).toBe(true);
      expect(result.reason).toContain('нарушение миграционного законодательства');
    });

    it('should extract expiration date', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () =>
          Promise.resolve('Запрет на въезд до: 31.12.2025. Причина: административное выдворение'),
      });

      const promise = client.checkBan(mockQuery);
      jest.runAllTimers();
      const result = await promise;

      expect(result.hasBan).toBe(true);
      expect(result.expiresAt).toBe('2025-12-31');
    });

    it('should detect deportation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Депортация из Российской Федерации'),
      });

      const promise = client.checkBan(mockQuery);
      jest.runAllTimers();
      const result = await promise;

      expect(result.hasBan).toBe(true);
    });

    it('should detect administrative expulsion', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Административное выдворение за пределы РФ'),
      });

      const promise = client.checkBan(mockQuery);
      jest.runAllTimers();
      const result = await promise;

      expect(result.hasBan).toBe(true);
    });

    it('should return no ban for ambiguous response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () =>
          Promise.resolve('Некорректные данные. Повторите запрос позже.'),
      });

      const promise = client.checkBan(mockQuery);
      jest.runAllTimers();
      const result = await promise;

      // Conservative approach - assume no ban if can't determine
      expect(result.hasBan).toBe(false);
    });
  });

  describe('circuit breaker', () => {
    it('should open after threshold failures', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      // Perform multiple failed requests to trip the circuit breaker
      for (let i = 0; i < 5; i++) {
        const promise = client.checkBan(mockQuery);

        // Process retries
        for (let j = 0; j < 10; j++) {
          await Promise.resolve();
          jest.advanceTimersByTime(5000);
        }

        try {
          await promise;
        } catch {
          // Expected to fail
        }
      }

      const state = client.getCircuitState();
      expect(state.state).toBe('OPEN');
    });

    it('should block requests when open', async () => {
      // Force circuit breaker to open
      mockFetch.mockRejectedValue(new Error('Network error'));

      for (let i = 0; i < 5; i++) {
        const promise = client.checkBan(mockQuery);

        for (let j = 0; j < 10; j++) {
          await Promise.resolve();
          jest.advanceTimersByTime(5000);
        }

        try {
          await promise;
        } catch {
          // Expected
        }
      }

      // Now circuit should be open
      const state = client.getCircuitState();
      expect(state.state).toBe('OPEN');

      // Next request should fail immediately
      await expect(client.checkBan(mockQuery)).rejects.toThrow(
        'circuit open',
      );
    });

    it('should transition to half-open after reset time', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      // Trip the circuit breaker
      for (let i = 0; i < 5; i++) {
        const promise = client.checkBan(mockQuery);

        for (let j = 0; j < 10; j++) {
          await Promise.resolve();
          jest.advanceTimersByTime(5000);
        }

        try {
          await promise;
        } catch {
          // Expected
        }
      }

      expect(client.getCircuitState().state).toBe('OPEN');

      // Advance time past reset time (60 seconds)
      jest.advanceTimersByTime(61000);

      // Now provide a successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Данные отсутствуют'),
      });

      const promise = client.checkBan(mockQuery);
      jest.runAllTimers();
      const result = await promise;

      expect(result.hasBan).toBe(false);
      expect(client.getCircuitState().state).toBe('CLOSED');
    });

    it('should close after successful request in half-open', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      // Trip circuit breaker
      for (let i = 0; i < 5; i++) {
        const promise = client.checkBan(mockQuery);

        for (let j = 0; j < 10; j++) {
          await Promise.resolve();
          jest.advanceTimersByTime(5000);
        }

        try {
          await promise;
        } catch {
          // Expected
        }
      }

      // Advance past reset time
      jest.advanceTimersByTime(61000);

      // Successful request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Данные отсутствуют'),
      });

      const promise = client.checkBan(mockQuery);
      jest.runAllTimers();
      await promise;

      const state = client.getCircuitState();
      expect(state.state).toBe('CLOSED');
      expect(state.failures).toBe(0);
    });
  });

  describe('getCircuitState', () => {
    it('should return current state and failure count', () => {
      const state = client.getCircuitState();

      expect(state).toHaveProperty('state');
      expect(state).toHaveProperty('failures');
      expect(state.state).toBe('CLOSED');
      expect(state.failures).toBe(0);
    });
  });

  describe('date formatting', () => {
    it('should format birth date correctly for MVD', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve('Данные отсутствуют'),
      });

      const promise = client.checkBan({
        lastName: 'Test',
        firstName: 'User',
        birthDate: '1990-05-15',
      });
      jest.runAllTimers();
      await promise;

      // Should convert ISO date to DD.MM.YYYY
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('dat=15.05.1990'),
        expect.any(Object),
      );
    });
  });
});
