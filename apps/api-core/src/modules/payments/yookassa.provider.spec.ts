import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { YooKassaProvider } from './yookassa.provider';

describe('YooKassaProvider', () => {
  let provider: YooKassaProvider;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, unknown> = {
        'yookassa.baseUrl': 'https://api.yookassa.ru/v3',
        'yookassa.shopId': 'test-shop-id',
        'yookassa.secretKey': 'test-secret-key',
        'yookassa.returnUrl': 'https://migranthub.ru/payment/success',
        'yookassa.timeout': 30000,
        'yookassa.circuitBreaker.failureThreshold': 5,
        'yookassa.circuitBreaker.successThreshold': 2,
        'yookassa.circuitBreaker.timeout': 60000,
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YooKassaProvider,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    provider = module.get<YooKassaProvider>(YooKassaProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('circuit breaker', () => {
    it('should have initial CLOSED state', () => {
      const state = provider.getCircuitState();
      expect(state.state).toBe('closed');
      expect(state.failureCount).toBe(0);
    });

    it('should track failure count', async () => {
      // Mock fetch to always fail
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      // Make several failing requests
      for (let i = 0; i < 3; i++) {
        try {
          await provider.createPayment(100, 'Test', `idem-${i}`);
        } catch {
          // Expected to fail
        }
      }

      const state = provider.getCircuitState();
      expect(state.failureCount).toBe(3);
    });

    it('should open circuit after threshold failures', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      // Make enough requests to trip the circuit
      for (let i = 0; i < 5; i++) {
        try {
          await provider.createPayment(100, 'Test', `idem-${i}`);
        } catch {
          // Expected to fail
        }
      }

      const state = provider.getCircuitState();
      expect(state.state).toBe('open');
    });

    it('should reject requests when circuit is open', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      // Trip the circuit
      for (let i = 0; i < 5; i++) {
        try {
          await provider.createPayment(100, 'Test', `idem-${i}`);
        } catch {
          // Expected to fail
        }
      }

      // Next request should fail immediately
      await expect(provider.createPayment(100, 'Test', 'idem-next')).rejects.toThrow(
        ServiceUnavailableException,
      );

      // Fetch should not be called when circuit is open
      expect(global.fetch).toHaveBeenCalledTimes(5);
    });
  });

  describe('createPayment', () => {
    it('should make correct API call', async () => {
      const mockResponse = {
        id: 'payment-123',
        status: 'pending',
        paid: false,
        amount: { value: '100.00', currency: 'RUB' },
        confirmation: {
          type: 'redirect',
          confirmation_url: 'https://yoomoney.ru/...',
        },
        created_at: '2025-01-15T10:30:00.000Z',
        description: 'Test payment',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await provider.createPayment(100, 'Test payment', 'idem-123', {
        userId: 'user-123',
      });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.yookassa.ru/v3/payments',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: expect.stringContaining('Basic'),
            'Idempotence-Key': 'idem-123',
          }),
        }),
      );
    });

    it('should throw on API error', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad Request'),
      });

      await expect(provider.createPayment(100, 'Test', 'idem-123')).rejects.toThrow(
        'YooKassa API error: 400',
      );
    });
  });

  describe('getPayment', () => {
    it('should fetch payment by ID', async () => {
      const mockResponse = {
        id: 'payment-123',
        status: 'succeeded',
        paid: true,
        amount: { value: '100.00', currency: 'RUB' },
        created_at: '2025-01-15T10:30:00.000Z',
        description: 'Test payment',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await provider.getPayment('payment-123');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.yookassa.ru/v3/payments/payment-123',
        expect.objectContaining({
          method: 'GET',
        }),
      );
    });
  });

  describe('cancelPayment', () => {
    it('should cancel payment', async () => {
      const mockResponse = {
        id: 'payment-123',
        status: 'canceled',
        paid: false,
        amount: { value: '100.00', currency: 'RUB' },
        created_at: '2025-01-15T10:30:00.000Z',
        description: 'Test payment',
        cancellation_details: {
          party: 'merchant',
          reason: 'canceled_by_merchant',
        },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await provider.cancelPayment('payment-123', 'cancel-idem-123');

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.yookassa.ru/v3/payments/payment-123/cancel',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Idempotence-Key': 'cancel-idem-123',
          }),
        }),
      );
    });
  });
});
