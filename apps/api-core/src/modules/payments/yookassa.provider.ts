import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface YooKassaPaymentRequest {
  amount: {
    value: string;
    currency: string;
  };
  capture: boolean;
  confirmation: {
    type: string;
    return_url: string;
  };
  description: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface YooKassaPaymentResponse {
  id: string;
  status: string;
  paid: boolean;
  amount: {
    value: string;
    currency: string;
  };
  confirmation?: {
    type: string;
    confirmation_url: string;
  };
  created_at: string;
  captured_at?: string;
  description: string;
  metadata?: Record<string, unknown>;
  cancellation_details?: {
    party: string;
    reason: string;
  };
}

enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open',
}

/**
 * YooKassa API provider with circuit breaker pattern
 * Prevents cascading failures when YooKassa is unavailable
 */
@Injectable()
export class YooKassaProvider {
  private readonly logger = new Logger(YooKassaProvider.name);
  private readonly baseUrl: string;
  private readonly shopId: string;
  private readonly secretKey: string;
  private readonly returnUrl: string;
  private readonly timeout: number;

  // Circuit breaker state
  private circuitState: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold: number;
  private readonly successThreshold: number;
  private readonly circuitTimeout: number;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('yookassa.baseUrl')!;
    this.shopId = this.configService.get<string>('yookassa.shopId')!;
    this.secretKey = this.configService.get<string>('yookassa.secretKey')!;
    this.returnUrl = this.configService.get<string>('yookassa.returnUrl')!;
    this.timeout = this.configService.get<number>('yookassa.timeout')!;

    // Circuit breaker settings
    this.failureThreshold = this.configService.get<number>('yookassa.circuitBreaker.failureThreshold')!;
    this.successThreshold = this.configService.get<number>('yookassa.circuitBreaker.successThreshold')!;
    this.circuitTimeout = this.configService.get<number>('yookassa.circuitBreaker.timeout')!;

    this.logger.log(`YooKassa provider initialized with shop ID: ${this.shopId ? '***' + this.shopId.slice(-4) : 'NOT SET'}`);
  }

  /**
   * Create a new payment in YooKassa
   */
  async createPayment(
    amount: number,
    description: string,
    idempotencyKey: string,
    metadata?: Record<string, unknown>,
  ): Promise<YooKassaPaymentResponse> {
    this.checkCircuit();

    const request: YooKassaPaymentRequest = {
      amount: {
        value: amount.toFixed(2),
        currency: 'RUB',
      },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: this.returnUrl,
      },
      description,
      metadata,
    };

    try {
      const response = await this.makeRequest<YooKassaPaymentResponse>(
        'POST',
        '/payments',
        request,
        idempotencyKey,
      );

      this.onSuccess();
      return response;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * Get payment status from YooKassa
   */
  async getPayment(paymentId: string): Promise<YooKassaPaymentResponse> {
    this.checkCircuit();

    try {
      const response = await this.makeRequest<YooKassaPaymentResponse>(
        'GET',
        `/payments/${paymentId}`,
      );

      this.onSuccess();
      return response;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * Cancel a pending payment
   */
  async cancelPayment(paymentId: string, idempotencyKey: string): Promise<YooKassaPaymentResponse> {
    this.checkCircuit();

    try {
      const response = await this.makeRequest<YooKassaPaymentResponse>(
        'POST',
        `/payments/${paymentId}/cancel`,
        {},
        idempotencyKey,
      );

      this.onSuccess();
      return response;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * Make HTTP request to YooKassa API
   */
  private async makeRequest<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    idempotencyKey?: string,
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const auth = Buffer.from(`${this.shopId}:${this.secretKey}`).toString('base64');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    };

    if (idempotencyKey) {
      headers['Idempotence-Key'] = idempotencyKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`YooKassa API error: ${response.status} - ${errorText}`);
        throw new Error(`YooKassa API error: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ServiceUnavailableException('YooKassa API timeout');
      }

      throw error;
    }
  }

  /**
   * Check circuit breaker state
   */
  private checkCircuit(): void {
    if (this.circuitState === CircuitState.OPEN) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;

      if (timeSinceLastFailure >= this.circuitTimeout) {
        this.logger.log('Circuit breaker transitioning to HALF_OPEN');
        this.circuitState = CircuitState.HALF_OPEN;
        this.successCount = 0;
      } else {
        throw new ServiceUnavailableException(
          'Payment service temporarily unavailable. Please try again later.',
        );
      }
    }
  }

  /**
   * Handle successful request
   */
  private onSuccess(): void {
    if (this.circuitState === CircuitState.HALF_OPEN) {
      this.successCount++;

      if (this.successCount >= this.successThreshold) {
        this.logger.log('Circuit breaker CLOSED after successful requests');
        this.circuitState = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
      }
    } else if (this.circuitState === CircuitState.CLOSED) {
      this.failureCount = 0;
    }
  }

  /**
   * Handle failed request
   */
  private onFailure(error: unknown): void {
    const message = error instanceof Error ? error.message : 'Unknown error';
    this.logger.warn(`YooKassa request failed: ${message}`);

    if (this.circuitState === CircuitState.HALF_OPEN) {
      this.logger.warn('Circuit breaker OPEN after failure in HALF_OPEN state');
      this.circuitState = CircuitState.OPEN;
      this.lastFailureTime = Date.now();
    } else if (this.circuitState === CircuitState.CLOSED) {
      this.failureCount++;

      if (this.failureCount >= this.failureThreshold) {
        this.logger.warn(`Circuit breaker OPEN after ${this.failureCount} failures`);
        this.circuitState = CircuitState.OPEN;
        this.lastFailureTime = Date.now();
      }
    }
  }

  /**
   * Get current circuit breaker state (for monitoring)
   */
  getCircuitState(): { state: string; failureCount: number } {
    return {
      state: this.circuitState,
      failureCount: this.failureCount,
    };
  }
}
