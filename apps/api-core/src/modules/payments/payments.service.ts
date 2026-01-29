import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Payment, PaymentStatus, PaymentProvider } from './entities/payment.entity';
import { YooKassaProvider } from './yookassa.provider';
import { AuditService } from '../audit/audit.service';
import { CacheService } from '../cache/cache.service';
import {
  CreatePaymentDto,
  PaymentResponseDto,
  CreatePaymentResponseDto,
  PaymentStatusResponseDto,
  YooKassaWebhookDto,
} from './dto';

const PAYMENT_CACHE_TTL = 60000; // 1 minute
const PAYMENT_CACHE_PREFIX = 'payment:';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly yooKassaProvider: YooKassaProvider,
    private readonly auditService: AuditService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Create a new payment
   */
  async createPayment(
    userId: string,
    dto: CreatePaymentDto,
    ipAddress: string,
    userAgent: string,
  ): Promise<CreatePaymentResponseDto> {
    const idempotencyKey = uuidv4();

    this.logger.log(`Creating payment for user ${userId}, amount: ${dto.amount}`);

    // Create payment record in pending state
    const payment = this.paymentRepository.create({
      userId,
      amount: dto.amount.toFixed(2),
      currency: 'RUB',
      status: PaymentStatus.PENDING,
      provider: PaymentProvider.YOOKASSA,
      description: dto.description,
      metadata: dto.metadata || null,
      idempotencyKey,
    });

    await this.paymentRepository.save(payment);

    try {
      // Create payment in YooKassa
      const yooKassaResponse = await this.yooKassaProvider.createPayment(
        dto.amount,
        dto.description,
        idempotencyKey,
        {
          ...dto.metadata,
          userId,
          internalPaymentId: payment.id,
        },
      );

      // Update payment with external ID and URL
      payment.externalId = yooKassaResponse.id;
      payment.paymentUrl = yooKassaResponse.confirmation?.confirmation_url || null;
      payment.status = this.mapYooKassaStatus(yooKassaResponse.status);

      await this.paymentRepository.save(payment);

      // Audit log
      await this.auditService.log({
        userId,
        action: 'POST',
        resource: '/payments/create',
        requestBody: { amount: dto.amount, description: dto.description },
        responseStatus: 201,
        ipAddress,
        userAgent,
        durationMs: 0,
      });

      this.logger.log(`Payment created: ${payment.id}, YooKassa ID: ${yooKassaResponse.id}`);

      return this.toCreatePaymentResponse(payment);
    } catch (error) {
      // Mark payment as canceled on error
      payment.status = PaymentStatus.CANCELED;
      payment.cancellationReason = error instanceof Error ? error.message : 'Unknown error';
      payment.canceledAt = new Date();
      await this.paymentRepository.save(payment);

      this.logger.error(`Failed to create payment in YooKassa: ${error}`);
      throw error;
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string, userId: string): Promise<PaymentStatusResponseDto> {
    // Try cache first
    const cacheKey = `${PAYMENT_CACHE_PREFIX}${paymentId}`;
    const cached = await this.cacheService.get<PaymentStatusResponseDto>(cacheKey);

    if (cached) {
      this.logger.debug(`Payment status from cache: ${paymentId}`);
      return cached;
    }

    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId, userId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    // If payment is still pending and has external ID, check YooKassa
    if (payment.status === PaymentStatus.PENDING && payment.externalId) {
      try {
        const yooKassaPayment = await this.yooKassaProvider.getPayment(payment.externalId);
        const newStatus = this.mapYooKassaStatus(yooKassaPayment.status);

        if (newStatus !== payment.status) {
          await this.updatePaymentFromYooKassa(payment, yooKassaPayment);
        }
      } catch (error) {
        this.logger.warn(`Failed to fetch payment status from YooKassa: ${error}`);
        // Continue with DB status
      }
    }

    const response: PaymentStatusResponseDto = {
      id: payment.id,
      status: payment.status,
      paidAt: payment.paidAt,
      cancellationReason: payment.cancellationReason,
    };

    // Cache the response (except for pending payments)
    if (payment.status !== PaymentStatus.PENDING) {
      await this.cacheService.set(cacheKey, response, PAYMENT_CACHE_TTL);
    }

    return response;
  }

  /**
   * Get payment details
   */
  async getPayment(paymentId: string, userId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId, userId },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} not found`);
    }

    return this.toPaymentResponse(payment);
  }

  /**
   * Get user's payment history
   */
  async getUserPayments(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<{ payments: PaymentResponseDto[]; total: number }> {
    const [payments, total] = await this.paymentRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      payments: payments.map((p) => this.toPaymentResponse(p)),
      total,
    };
  }

  /**
   * Process YooKassa webhook
   */
  async processWebhook(dto: YooKassaWebhookDto): Promise<void> {
    const { event, object } = dto;
    const externalId = object.id;

    this.logger.log(`Processing webhook: ${event} for payment ${externalId}`);

    const payment = await this.paymentRepository.findOne({
      where: { externalId },
    });

    if (!payment) {
      this.logger.warn(`Payment not found for external ID: ${externalId}`);
      // Don't throw - YooKassa will retry
      return;
    }

    // Prevent duplicate processing
    const newStatus = this.mapYooKassaStatus(object.status);
    if (payment.status === newStatus) {
      this.logger.debug(`Payment ${payment.id} already in status ${newStatus}`);
      return;
    }

    // Validate status transition
    if (!this.isValidStatusTransition(payment.status, newStatus)) {
      this.logger.warn(
        `Invalid status transition for payment ${payment.id}: ${payment.status} -> ${newStatus}`,
      );
      return;
    }

    await this.updatePaymentFromYooKassa(payment, object);

    // Invalidate cache
    await this.cacheService.del(`${PAYMENT_CACHE_PREFIX}${payment.id}`);

    this.logger.log(`Payment ${payment.id} updated to status ${newStatus}`);
  }

  /**
   * Update payment from YooKassa response
   */
  private async updatePaymentFromYooKassa(
    payment: Payment,
    yooKassaPayment: {
      status: string;
      cancellation_details?: { reason: string };
      captured_at?: string;
    },
  ): Promise<void> {
    const newStatus = this.mapYooKassaStatus(yooKassaPayment.status);

    payment.status = newStatus;

    if (newStatus === PaymentStatus.SUCCEEDED) {
      payment.paidAt = yooKassaPayment.captured_at
        ? new Date(yooKassaPayment.captured_at)
        : new Date();
    }

    if (newStatus === PaymentStatus.CANCELED) {
      payment.canceledAt = new Date();
      payment.cancellationReason = yooKassaPayment.cancellation_details?.reason || 'unknown';
    }

    await this.paymentRepository.save(payment);
  }

  /**
   * Map YooKassa status to internal status
   */
  private mapYooKassaStatus(yooKassaStatus: string): PaymentStatus {
    const statusMap: Record<string, PaymentStatus> = {
      pending: PaymentStatus.PENDING,
      waiting_for_capture: PaymentStatus.WAITING_FOR_CAPTURE,
      succeeded: PaymentStatus.SUCCEEDED,
      canceled: PaymentStatus.CANCELED,
    };

    return statusMap[yooKassaStatus] || PaymentStatus.PENDING;
  }

  /**
   * Validate status transition
   */
  private isValidStatusTransition(from: PaymentStatus, to: PaymentStatus): boolean {
    const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
      [PaymentStatus.PENDING]: [
        PaymentStatus.WAITING_FOR_CAPTURE,
        PaymentStatus.SUCCEEDED,
        PaymentStatus.CANCELED,
      ],
      [PaymentStatus.WAITING_FOR_CAPTURE]: [PaymentStatus.SUCCEEDED, PaymentStatus.CANCELED],
      [PaymentStatus.SUCCEEDED]: [PaymentStatus.REFUNDED],
      [PaymentStatus.CANCELED]: [],
      [PaymentStatus.REFUNDED]: [],
    };

    return validTransitions[from]?.includes(to) ?? false;
  }

  /**
   * Convert to PaymentResponseDto
   */
  private toPaymentResponse(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      externalId: payment.externalId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      provider: payment.provider,
      description: payment.description,
      paymentUrl: payment.paymentUrl,
      createdAt: payment.createdAt,
      paidAt: payment.paidAt,
    };
  }

  /**
   * Convert to CreatePaymentResponseDto
   */
  private toCreatePaymentResponse(payment: Payment): CreatePaymentResponseDto {
    return {
      id: payment.id,
      externalId: payment.externalId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      provider: payment.provider,
      description: payment.description,
      paymentUrl: payment.paymentUrl!,
      createdAt: payment.createdAt,
      paidAt: payment.paidAt,
    };
  }
}
