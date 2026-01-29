import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Page, BrowserContext } from 'playwright';
import { BrowserService, CaptchaSolverService } from '../../../common/services';
import { PassportValidityQueryDto } from './dto';
import { PassportValidityStatus } from './dto/passport-validity-result.dto';

/**
 * Результат проверки паспорта от сервиса МВД
 */
export interface PassportCheckResult {
  status: PassportValidityStatus;
  isValid: boolean;
  message?: string;
}

/**
 * Состояние circuit breaker
 */
enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

/**
 * MvdPassportClient - клиент для проверки действительности паспорта через сайт МВД.
 *
 * Особенности:
 * - Использует Playwright для взаимодействия с сайтом services.fms.gov.ru
 * - Решает капчу через CaptchaSolverService (2Captcha API)
 * - Circuit breaker для защиты от каскадных сбоев
 * - Retry с exponential backoff
 */
@Injectable()
export class MvdPassportClient implements OnModuleInit {
  private readonly logger = new Logger(MvdPassportClient.name);

  // Конфигурация
  private readonly serviceUrl: string;
  private readonly enabled: boolean;
  private readonly timeout: number;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;
  private readonly circuitBreakerThreshold: number;
  private readonly circuitBreakerResetTime: number;

  // Circuit breaker state
  private circuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;

  constructor(
    private readonly configService: ConfigService,
    private readonly browserService: BrowserService,
    private readonly captchaSolver: CaptchaSolverService,
  ) {
    this.serviceUrl = this.configService.get<string>(
      'passportValidity.serviceUrl',
      'https://services.fms.gov.ru/info-service.htm?sid=2000',
    );
    this.enabled = this.configService.get<boolean>('passportValidity.enabled', false);
    this.timeout = this.configService.get<number>('passportValidity.timeout', 30000);
    this.retryAttempts = this.configService.get<number>('passportValidity.retryAttempts', 3);
    this.retryDelay = this.configService.get<number>('passportValidity.retryDelay', 2000);
    this.circuitBreakerThreshold = this.configService.get<number>(
      'passportValidity.circuitBreakerThreshold',
      5,
    );
    this.circuitBreakerResetTime = this.configService.get<number>(
      'passportValidity.circuitBreakerResetTime',
      60000,
    );
  }

  onModuleInit(): void {
    this.logger.log(`MvdPassportClient initialized: enabled=${this.enabled}, url=${this.serviceUrl}`);
  }

  /**
   * Проверка доступности сервиса
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Проверка действительности паспорта
   */
  async checkValidity(query: PassportValidityQueryDto): Promise<PassportCheckResult> {
    // Проверка circuit breaker
    if (!this.canMakeRequest()) {
      this.logger.warn('Circuit breaker open, MVD passport request blocked');
      throw new Error('MVD passport service temporarily unavailable (circuit open)');
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        this.logger.debug(
          `Attempt ${attempt}/${this.retryAttempts} for passport check: ${query.series} ${query.number}`,
        );
        const result = await this.executeCheck(query);
        this.onSuccess();
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(`Attempt ${attempt} failed: ${lastError.message}`);

        if (attempt < this.retryAttempts) {
          const delay = this.calculateBackoff(attempt);
          this.logger.debug(`Waiting ${delay}ms before next attempt`);
          await this.delay(delay);
        }
      }
    }

    this.onFailure();
    throw lastError || new Error('All retry attempts failed');
  }

  /**
   * Выполнение проверки через браузер
   */
  private async executeCheck(query: PassportValidityQueryDto): Promise<PassportCheckResult> {
    let page: Page | null = null;
    let context: BrowserContext | null = null;

    try {
      // Открываем страницу сервиса
      const result = await this.browserService.getInteractivePage(this.serviceUrl);
      page = result.page;
      context = result.context;

      // Ждем загрузки формы
      await page.waitForSelector('form, input[name="sid"]', { timeout: this.timeout });

      // Заполняем форму
      await this.fillForm(page, query);

      // Обрабатываем капчу если есть
      await this.handleCaptcha(page);

      // Отправляем форму
      await this.submitForm(page);

      // Ждем результатов
      await page.waitForTimeout(3000);

      // Парсим результат
      const pageContent = await page.content();
      return this.parseResult(pageContent);
    } finally {
      if (page && context) {
        await this.browserService.closePage(page, context);
      }
    }
  }

  /**
   * Заполнение формы проверки паспорта
   */
  private async fillForm(page: Page, query: PassportValidityQueryDto): Promise<void> {
    this.logger.debug('Filling passport check form...');

    // Серия паспорта
    const seriesSelectors = [
      'input[name="sid"]',
      'input[name="series"]',
      'input#seria',
      'input[placeholder*="серия"]',
      'input[placeholder*="Серия"]',
    ];

    for (const selector of seriesSelectors) {
      const input = await page.$(selector);
      if (input) {
        await input.fill(query.series);
        this.logger.debug(`Filled series via: ${selector}`);
        break;
      }
    }

    // Номер паспорта
    const numberSelectors = [
      'input[name="num"]',
      'input[name="number"]',
      'input#num',
      'input[placeholder*="номер"]',
      'input[placeholder*="Номер"]',
    ];

    for (const selector of numberSelectors) {
      const input = await page.$(selector);
      if (input) {
        await input.fill(query.number);
        this.logger.debug(`Filled number via: ${selector}`);
        break;
      }
    }
  }

  /**
   * Обработка капчи на странице
   */
  private async handleCaptcha(page: Page): Promise<void> {
    // Проверяем наличие капчи
    const captchaImage = await page.$(
      'img.captcha, img[name="captcha"], #captchaImage, img[src*="captcha"], .captcha-img, img[alt*="captcha"], img[src*="getImage"]',
    );

    if (!captchaImage) {
      this.logger.debug('No captcha found on page');
      return;
    }

    if (!this.captchaSolver.isEnabled()) {
      this.logger.warn('Captcha found but solver is not enabled');
      throw new Error('Captcha required but solver is not configured');
    }

    this.logger.debug('Solving captcha...');

    // Получаем изображение капчи
    const captchaScreenshot = await captchaImage.screenshot({ type: 'png' });
    const base64Image = captchaScreenshot.toString('base64');

    // Решаем капчу
    const solution = await this.captchaSolver.solveImageCaptcha(base64Image);

    if (!solution.success || !solution.solution) {
      throw new Error(`Failed to solve captcha: ${solution.error}`);
    }

    // Вводим решение капчи
    const captchaInputSelectors = [
      'input[name="captcha"]',
      'input[name="code"]',
      'input[name="captchaCode"]',
      '#captchaInput',
      'input#captcha',
      '.captcha-input',
      'input[name="captchaword"]',
    ];

    for (const selector of captchaInputSelectors) {
      const captchaInput = await page.$(selector);
      if (captchaInput) {
        await captchaInput.fill(solution.solution);
        this.logger.debug('Captcha solution entered');
        return;
      }
    }

    this.logger.warn('Captcha input field not found');
  }

  /**
   * Отправка формы
   */
  private async submitForm(page: Page): Promise<void> {
    this.logger.debug('Submitting form...');

    // Ищем кнопку отправки
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Отправить")',
      'button:has-text("Проверить")',
      'button:has-text("отправить")',
      'button:has-text("проверить")',
      'input[value="Отправить"]',
      'input[value="Проверить"]',
      '.btn-search',
      '#submitButton',
    ];

    for (const selector of submitSelectors) {
      const submitButton = await page.$(selector);
      if (submitButton) {
        try {
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle', timeout: this.timeout }).catch(() => {}),
            submitButton.click(),
          ]);
          return;
        } catch {
          // Пробуем другой селектор
        }
      }
    }

    // Пробуем отправить форму напрямую
    try {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: this.timeout }).catch(() => {}),
        page.evaluate(() => {
          const form = document.querySelector('form');
          if (form) form.submit();
        }),
      ]);
    } catch (error) {
      this.logger.warn('Form submission might have failed');
    }

    // Даем время на загрузку результатов
    await page.waitForTimeout(3000);
  }

  /**
   * Парсинг результата проверки из HTML
   */
  private parseResult(html: string): PassportCheckResult {
    const normalizedHtml = html.toLowerCase();

    // Индикаторы недействительного паспорта
    const invalidIndicators = [
      'недействителен',
      'не действителен',
      'не является действительным',
      'входит в базу недействительных',
      'числится в базе',
      'значится недействительным',
      'аннулирован',
    ];

    // Проверяем на недействительность
    for (const indicator of invalidIndicators) {
      if (normalizedHtml.includes(indicator)) {
        this.logger.log('Passport is INVALID');
        return {
          status: PassportValidityStatus.INVALID,
          isValid: false,
          message: 'Паспорт числится в базе недействительных паспортов МВД',
        };
      }
    }

    // Индикаторы действительного паспорта / не найден в базе
    const validIndicators = [
      'не значится',
      'не числится',
      'не входит в базу недействительных',
      'среди недействительных не значится',
      'не найден в базе недействительных',
      'паспорт действителен',
      'является действительным',
    ];

    for (const indicator of validIndicators) {
      if (normalizedHtml.includes(indicator)) {
        this.logger.log('Passport NOT FOUND in invalid database (considered valid)');
        return {
          status: PassportValidityStatus.NOT_FOUND,
          isValid: true,
          message: 'Паспорт не найден в базе недействительных паспортов',
        };
      }
    }

    // Если есть результат проверки, но не удалось определить статус
    const resultIndicators = ['результат проверки', 'проверка завершена', 'данные о паспорте'];

    for (const indicator of resultIndicators) {
      if (normalizedHtml.includes(indicator)) {
        this.logger.debug('Result found but status unclear');
        // Если в результате нет явных признаков недействительности - считаем действительным
        return {
          status: PassportValidityStatus.NOT_FOUND,
          isValid: true,
          message: 'Паспорт не найден в базе недействительных паспортов',
        };
      }
    }

    // Проверяем наличие ошибок
    const errorIndicators = ['ошибка', 'повторите попытку', 'неверный код', 'попробуйте позже'];

    for (const indicator of errorIndicators) {
      if (normalizedHtml.includes(indicator)) {
        this.logger.warn('Error indicator found in response');
        return {
          status: PassportValidityStatus.UNKNOWN,
          isValid: false,
          message: 'Ошибка при проверке. Повторите попытку позже.',
        };
      }
    }

    // Не удалось определить статус
    this.logger.warn('Could not determine passport validity status');
    return {
      status: PassportValidityStatus.UNKNOWN,
      isValid: false,
      message: 'Не удалось определить статус паспорта',
    };
  }

  /**
   * Проверка возможности запроса (circuit breaker)
   */
  private canMakeRequest(): boolean {
    const now = Date.now();

    switch (this.circuitState) {
      case CircuitState.CLOSED:
        return true;

      case CircuitState.OPEN:
        if (now - this.lastFailureTime >= this.circuitBreakerResetTime) {
          this.circuitState = CircuitState.HALF_OPEN;
          this.logger.log('Circuit breaker switched to HALF_OPEN');
          return true;
        }
        return false;

      case CircuitState.HALF_OPEN:
        return true;

      default:
        return true;
    }
  }

  /**
   * Обработка успешного запроса
   */
  private onSuccess(): void {
    if (this.circuitState === CircuitState.HALF_OPEN) {
      this.logger.log('Circuit breaker closed after successful request');
    }
    this.circuitState = CircuitState.CLOSED;
    this.failureCount = 0;
  }

  /**
   * Обработка неудачного запроса
   */
  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.circuitState === CircuitState.HALF_OPEN) {
      this.circuitState = CircuitState.OPEN;
      this.logger.warn('Circuit breaker opened after failed probe request');
    } else if (this.failureCount >= this.circuitBreakerThreshold) {
      this.circuitState = CircuitState.OPEN;
      this.logger.warn(`Circuit breaker opened after ${this.failureCount} failures`);
    }
  }

  /**
   * Расчет задержки с exponential backoff
   */
  private calculateBackoff(attempt: number): number {
    const exponentialDelay = this.retryDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.3 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, 30000);
  }

  /**
   * Утилита для задержки
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Получение состояния circuit breaker (для мониторинга)
   */
  getCircuitState(): { state: string; failures: number } {
    return {
      state: this.circuitState,
      failures: this.failureCount,
    };
  }
}
