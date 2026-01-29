import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Payment, PaymentStatus, PaymentProvider } from './entities/payment.entity';
import { YooKassaProvider } from './yookassa.provider';
import { AuditService } from '../audit/audit.service';
import { CacheService } from '../cache/cache.service';
import { YooKassaWebhookDto } from './dto';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let paymentRepository: jest.Mocked<Repository<Payment>>;
  let yooKassaProvider: jest.Mocked<YooKassaProvider>;
  let cacheService: jest.Mocked<CacheService>;

  const mockPayment: Payment = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    userId: 'user-123',
    externalId: 'yookassa-123',
    amount: '6500.00',
    currency: 'RUB',
    status: PaymentStatus.PENDING,
    provider: PaymentProvider.YOOKASSA,
    description: 'Patent payment',
    metadata: null,
    paymentUrl: 'https://yoomoney.ru/checkout/...',
    idempotencyKey: 'idem-key-123',
    paidAt: null,
    canceledAt: null,
    cancellationReason: null,
    refundedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockYooKassaResponse = {
    id: 'yookassa-123',
    status: 'pending',
    paid: false,
    amount: {
      value: '6500.00',
      currency: 'RUB',
    },
    confirmation: {
      type: 'redirect',
      confirmation_url: 'https://yoomoney.ru/checkout/...',
    },
    created_at: '2025-01-15T10:30:00.000Z',
    description: 'Patent payment',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getRepositoryToken(Payment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: YooKassaProvider,
          useValue: {
            createPayment: jest.fn(),
            getPayment: jest.fn(),
          },
        },
        {
          provide: AuditService,
          useValue: {
            log: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    paymentRepository = module.get(getRepositoryToken(Payment));
    yooKassaProvider = module.get(YooKassaProvider);
    cacheService = module.get(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPayment', () => {
    it('should create a new payment successfully', async () => {
      const createDto = {
        amount: 6500,
        description: 'Patent payment',
      };

      paymentRepository.create.mockReturnValue(mockPayment);
      paymentRepository.save.mockResolvedValue(mockPayment);
      yooKassaProvider.createPayment.mockResolvedValue(mockYooKassaResponse);

      const result = await service.createPayment('user-123', createDto, '127.0.0.1', 'Mozilla/5.0');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('paymentUrl');
      expect(paymentRepository.create).toHaveBeenCalled();
      expect(yooKassaProvider.createPayment).toHaveBeenCalledWith(
        6500,
        'Patent payment',
        expect.any(String),
        expect.objectContaining({ userId: 'user-123' }),
      );
    });

    it('should mark payment as canceled if YooKassa fails', async () => {
      const createDto = {
        amount: 6500,
        description: 'Patent payment',
      };

      paymentRepository.create.mockReturnValue({ ...mockPayment });
      paymentRepository.save.mockResolvedValue(mockPayment);
      yooKassaProvider.createPayment.mockRejectedValue(new Error('API error'));

      await expect(
        service.createPayment('user-123', createDto, '127.0.0.1', 'Mozilla/5.0'),
      ).rejects.toThrow('API error');

      expect(paymentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: PaymentStatus.CANCELED,
          cancellationReason: 'API error',
        }),
      );
    });
  });

  describe('getPaymentStatus', () => {
    it('should return cached payment status', async () => {
      const cachedStatus = {
        id: mockPayment.id,
        status: PaymentStatus.SUCCEEDED,
        paidAt: new Date(),
        cancellationReason: null,
      };

      cacheService.get.mockResolvedValue(cachedStatus);

      const result = await service.getPaymentStatus(mockPayment.id, 'user-123');

      expect(result).toEqual(cachedStatus);
      expect(paymentRepository.findOne).not.toHaveBeenCalled();
    });

    it('should fetch from database if not cached', async () => {
      cacheService.get.mockResolvedValue(null);
      paymentRepository.findOne.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.SUCCEEDED,
      });

      const result = await service.getPaymentStatus(mockPayment.id, 'user-123');

      expect(result.status).toBe(PaymentStatus.SUCCEEDED);
      expect(paymentRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPayment.id, userId: 'user-123' },
      });
    });

    it('should throw NotFoundException if payment not found', async () => {
      cacheService.get.mockResolvedValue(null);
      paymentRepository.findOne.mockResolvedValue(null);

      await expect(service.getPaymentStatus('non-existent-id', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should check YooKassa for pending payments', async () => {
      cacheService.get.mockResolvedValue(null);
      paymentRepository.findOne.mockResolvedValue(mockPayment);
      yooKassaProvider.getPayment.mockResolvedValue({
        id: 'yookassa-123',
        status: 'succeeded',
        paid: true,
        amount: { value: '6500.00', currency: 'RUB' },
        created_at: '2025-01-15T10:30:00.000Z',
        captured_at: '2025-01-15T10:35:00.000Z',
        description: 'Patent payment',
      });
      paymentRepository.save.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.SUCCEEDED,
      });

      const result = await service.getPaymentStatus(mockPayment.id, 'user-123');

      expect(yooKassaProvider.getPayment).toHaveBeenCalledWith('yookassa-123');
      expect(paymentRepository.save).toHaveBeenCalled();
    });
  });

  describe('getPayment', () => {
    it('should return payment details', async () => {
      paymentRepository.findOne.mockResolvedValue(mockPayment);

      const result = await service.getPayment(mockPayment.id, 'user-123');

      expect(result).toHaveProperty('id', mockPayment.id);
      expect(result).toHaveProperty('amount', mockPayment.amount);
    });

    it('should throw NotFoundException if payment not found', async () => {
      paymentRepository.findOne.mockResolvedValue(null);

      await expect(service.getPayment('non-existent-id', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserPayments', () => {
    it('should return paginated payment list', async () => {
      paymentRepository.findAndCount.mockResolvedValue([[mockPayment], 1]);

      const result = await service.getUserPayments('user-123', 20, 0);

      expect(result.payments).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(paymentRepository.findAndCount).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        order: { createdAt: 'DESC' },
        take: 20,
        skip: 0,
      });
    });
  });

  describe('processWebhook', () => {
    it('should update payment status on webhook', async () => {
      const webhookDto = {
        type: 'notification',
        event: 'payment.succeeded',
        object: {
          id: 'yookassa-123',
          status: 'succeeded',
          paid: true,
          refundable: true,
          amount: { value: '6500.00', currency: 'RUB' },
          description: 'Patent payment',
          created_at: '2025-01-15T10:30:00.000Z',
          captured_at: '2025-01-15T10:35:00.000Z',
        },
      } as YooKassaWebhookDto;

      // Create a fresh mock payment for this test
      const pendingPayment = {
        ...mockPayment,
        status: PaymentStatus.PENDING,
      };

      paymentRepository.findOne.mockResolvedValue(pendingPayment);
      paymentRepository.save.mockResolvedValue({
        ...pendingPayment,
        status: PaymentStatus.SUCCEEDED,
      });

      await service.processWebhook(webhookDto);

      expect(paymentRepository.findOne).toHaveBeenCalledWith({
        where: { externalId: 'yookassa-123' },
      });
      expect(paymentRepository.save).toHaveBeenCalled();
      expect(cacheService.del).toHaveBeenCalled();
    });

    it('should skip if payment not found', async () => {
      const webhookDto = {
        type: 'notification',
        event: 'payment.succeeded',
        object: {
          id: 'unknown-id',
          status: 'succeeded',
          paid: true,
          refundable: true,
          amount: { value: '6500.00', currency: 'RUB' },
          description: 'Patent payment',
          created_at: '2025-01-15T10:30:00.000Z',
        },
      } as YooKassaWebhookDto;

      paymentRepository.findOne.mockResolvedValue(null);

      // Should not throw
      await service.processWebhook(webhookDto);

      expect(paymentRepository.save).not.toHaveBeenCalled();
    });

    it('should skip duplicate status updates', async () => {
      const webhookDto = {
        type: 'notification',
        event: 'payment.succeeded',
        object: {
          id: 'yookassa-123',
          status: 'succeeded',
          paid: true,
          refundable: true,
          amount: { value: '6500.00', currency: 'RUB' },
          description: 'Patent payment',
          created_at: '2025-01-15T10:30:00.000Z',
        },
      } as YooKassaWebhookDto;

      paymentRepository.findOne.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.SUCCEEDED,
      });

      await service.processWebhook(webhookDto);

      expect(paymentRepository.save).not.toHaveBeenCalled();
    });
  });
});
