import { Injectable, Logger } from '@nestjs/common';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number; // ms to wait before trying again
}

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

/**
 * Circuit Breaker pattern implementation for OpenAI API
 * Prevents cascading failures when the API is unavailable
 */
@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime: number | null = null;
  private readonly config: CircuitBreakerConfig;

  constructor() {
    this.config = {
      failureThreshold: 5, // Open circuit after 5 failures
      successThreshold: 2, // Close circuit after 2 successes in half-open
      timeout: 30000, // Try again after 30 seconds
    };
  }

  /**
   * Check if circuit allows requests
   */
  canExecute(): boolean {
    if (this.state === 'CLOSED') {
      return true;
    }

    if (this.state === 'OPEN') {
      const now = Date.now();
      if (this.lastFailureTime && now - this.lastFailureTime >= this.config.timeout) {
        this.logger.log('Circuit breaker transitioning to HALF_OPEN');
        this.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }

    // HALF_OPEN - allow limited requests to test
    return true;
  }

  /**
   * Record a successful request
   */
  recordSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.logger.log('Circuit breaker CLOSED after successful recovery');
        this.reset();
      }
    } else if (this.state === 'CLOSED') {
      // Reset failure count on success in closed state
      this.failureCount = 0;
    }
  }

  /**
   * Record a failed request
   */
  recordFailure(error?: Error): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.logger.warn('Circuit breaker OPEN - failure in half-open state');
      this.state = 'OPEN';
      this.successCount = 0;
    } else if (this.state === 'CLOSED' && this.failureCount >= this.config.failureThreshold) {
      this.logger.warn(
        `Circuit breaker OPEN after ${this.failureCount} failures. ` +
          `Last error: ${error?.message || 'Unknown'}`,
      );
      this.state = 'OPEN';
    }
  }

  /**
   * Reset circuit breaker to initial state
   */
  private reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
  }

  /**
   * Get current circuit state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Check if circuit is open (blocking requests)
   */
  isOpen(): boolean {
    return this.state === 'OPEN' && !this.canExecute();
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (!this.canExecute()) {
      throw new Error('Circuit breaker is OPEN. Service temporarily unavailable.');
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure(error instanceof Error ? error : undefined);
      throw error;
    }
  }
}
