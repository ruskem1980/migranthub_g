import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Solver } from '2captcha-ts';

/**
 * Типы капчи, поддерживаемые сервисом
 */
export enum CaptchaType {
  IMAGE = 'image',
  RECAPTCHA_V2 = 'recaptcha_v2',
  RECAPTCHA_V3 = 'recaptcha_v3',
}

/**
 * Результат решения капчи
 */
export interface CaptchaSolution {
  success: boolean;
  solution?: string;
  error?: string;
}

/**
 * CaptchaSolverService - сервис для решения капчи через 2Captcha API.
 *
 * Поддерживает:
 * - Обычные изображения с капчей
 * - reCAPTCHA v2
 * - reCAPTCHA v3
 */
@Injectable()
export class CaptchaSolverService implements OnModuleInit {
  private readonly logger = new Logger(CaptchaSolverService.name);
  private solver: Solver | null = null;

  private readonly enabled: boolean;
  private readonly apiKey: string;
  private readonly timeout: number;
  private readonly pollingInterval: number;

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('patentCheck.captcha.enabled', false);
    this.apiKey = this.configService.get<string>('patentCheck.captcha.apiKey', '');
    this.timeout = this.configService.get<number>('patentCheck.captcha.timeout', 120000);
    this.pollingInterval = this.configService.get<number>(
      'patentCheck.captcha.pollingInterval',
      5000,
    );
  }

  onModuleInit(): void {
    if (this.enabled && this.apiKey) {
      this.solver = new Solver(this.apiKey);
      this.logger.log('2Captcha service initialized');
    } else {
      this.logger.warn(
        '2Captcha service disabled or API key not provided. Captcha solving will not be available.',
      );
    }
  }

  /**
   * Проверка доступности сервиса
   */
  isEnabled(): boolean {
    return this.enabled && !!this.solver;
  }

  /**
   * Решение капчи с изображения (base64)
   */
  async solveImageCaptcha(base64Image: string): Promise<CaptchaSolution> {
    if (!this.isEnabled()) {
      return {
        success: false,
        error: 'Captcha solver is not enabled or configured',
      };
    }

    try {
      this.logger.debug('Solving image captcha...');

      const result = await Promise.race([
        this.solver!.imageCaptcha({
          body: base64Image,
          numeric: 0, // Любые символы
          lang: 'ru',
        }),
        this.timeoutPromise(this.timeout),
      ]);

      if (result && typeof result === 'object' && 'data' in result) {
        this.logger.debug('Image captcha solved successfully');
        return {
          success: true,
          solution: result.data,
        };
      }

      return {
        success: false,
        error: 'Timeout or invalid response from captcha service',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to solve image captcha: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Решение reCAPTCHA v2
   */
  async solveRecaptchaV2(siteKey: string, pageUrl: string): Promise<CaptchaSolution> {
    if (!this.isEnabled()) {
      return {
        success: false,
        error: 'Captcha solver is not enabled or configured',
      };
    }

    try {
      this.logger.debug(`Solving reCAPTCHA v2 for ${pageUrl}...`);

      const result = await Promise.race([
        this.solver!.recaptcha({
          pageurl: pageUrl,
          googlekey: siteKey,
        }),
        this.timeoutPromise(this.timeout),
      ]);

      if (result && typeof result === 'object' && 'data' in result) {
        this.logger.debug('reCAPTCHA v2 solved successfully');
        return {
          success: true,
          solution: result.data,
        };
      }

      return {
        success: false,
        error: 'Timeout or invalid response from captcha service',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to solve reCAPTCHA v2: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Решение reCAPTCHA v3
   */
  async solveRecaptchaV3(
    siteKey: string,
    pageUrl: string,
    action = 'verify',
    minScore = 0.5,
  ): Promise<CaptchaSolution> {
    if (!this.isEnabled()) {
      return {
        success: false,
        error: 'Captcha solver is not enabled or configured',
      };
    }

    try {
      this.logger.debug(`Solving reCAPTCHA v3 for ${pageUrl}...`);

      const result = await Promise.race([
        this.solver!.recaptcha({
          pageurl: pageUrl,
          googlekey: siteKey,
          version: 'v3',
          action,
          min_score: minScore,
        }),
        this.timeoutPromise(this.timeout),
      ]);

      if (result && typeof result === 'object' && 'data' in result) {
        this.logger.debug('reCAPTCHA v3 solved successfully');
        return {
          success: true,
          solution: result.data,
        };
      }

      return {
        success: false,
        error: 'Timeout or invalid response from captcha service',
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to solve reCAPTCHA v3: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Проверка баланса 2Captcha аккаунта
   */
  async getBalance(): Promise<number | null> {
    if (!this.isEnabled()) {
      return null;
    }

    try {
      const balance = await this.solver!.balance();
      return balance;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to get 2Captcha balance: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Промис с таймаутом
   */
  private timeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Captcha solving timeout')), ms);
    });
  }
}
