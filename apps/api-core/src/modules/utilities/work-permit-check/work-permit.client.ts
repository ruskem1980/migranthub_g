import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Page, BrowserContext } from 'playwright';
import { BrowserService, CaptchaSolverService } from '../../../common/services';
import { WorkPermitQueryDto } from './dto';
import { WorkPermitStatus } from './dto/work-permit-status.enum';

/**
 * Результат проверки разрешения на работу от сервиса ФМС
 */
export interface WorkPermitCheckResult {
  status: WorkPermitStatus;
  isValid: boolean;
  region?: string;
  employer?: string;
  validUntil?: string;
  issuedAt?: string;
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
 * WorkPermitClient - клиент для проверки разрешения на работу через сайт ФМС.
 *
 * Особенности:
 * - Использует Playwright для взаимодействия с сайтом services.fms.gov.ru
 * - Решает капчу через CaptchaSolverService (2Captcha API)
 * - Circuit breaker для защиты от каскадных сбоев
 * - Retry с exponential backoff
 */
@Injectable()
export class WorkPermitClient implements OnModuleInit {
  private readonly logger = new Logger(WorkPermitClient.name);

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
      'workPermit.serviceUrl',
      'https://services.fms.gov.ru/info-service.htm?sid=2010',
    );
    this.enabled = this.configService.get<boolean>('workPermit.enabled', false);
    this.timeout = this.configService.get<number>('workPermit.timeout', 30000);
    this.retryAttempts = this.configService.get<number>('workPermit.retryAttempts', 3);
    this.retryDelay = this.configService.get<number>('workPermit.retryDelay', 2000);
    this.circuitBreakerThreshold = this.configService.get<number>(
      'workPermit.circuitBreakerThreshold',
      5,
    );
    this.circuitBreakerResetTime = this.configService.get<number>(
      'workPermit.circuitBreakerResetTime',
      60000,
    );
  }

  onModuleInit(): void {
    this.logger.log(
      `WorkPermitClient initialized: enabled=${this.enabled}, url=${this.serviceUrl}`,
    );
  }

  /**
   * Проверка доступности сервиса
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Проверка разрешения на работу
   */
  async checkPermit(query: WorkPermitQueryDto): Promise<WorkPermitCheckResult> {
    // Проверка circuit breaker
    if (!this.canMakeRequest()) {
      this.logger.warn('Circuit breaker open, work permit request blocked');
      throw new Error('Work permit service temporarily unavailable (circuit open)');
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        this.logger.debug(
          `Attempt ${attempt}/${this.retryAttempts} for work permit check: ${query.series} ${query.number}`,
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
  private async executeCheck(query: WorkPermitQueryDto): Promise<WorkPermitCheckResult> {
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
   * Заполнение формы проверки разрешения на работу
   */
  private async fillForm(page: Page, query: WorkPermitQueryDto): Promise<void> {
    this.logger.debug('Filling work permit check form...');

    // Серия разрешения
    const seriesSelectors = [
      'input[name="sid"]',
      'input[name="series"]',
      'input[name="seria"]',
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

    // Номер разрешения
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

    // ФИО (опционально, для уточнения поиска)
    if (query.lastName) {
      const lastNameSelectors = [
        'input[name="lastName"]',
        'input[name="surname"]',
        'input[name="fam"]',
        'input[placeholder*="фамилия"]',
        'input[placeholder*="Фамилия"]',
      ];

      for (const selector of lastNameSelectors) {
        const input = await page.$(selector);
        if (input) {
          await input.fill(query.lastName);
          this.logger.debug(`Filled lastName via: ${selector}`);
          break;
        }
      }
    }

    if (query.firstName) {
      const firstNameSelectors = [
        'input[name="firstName"]',
        'input[name="name"]',
        'input[name="im"]',
        'input[placeholder*="имя"]',
        'input[placeholder*="Имя"]',
      ];

      for (const selector of firstNameSelectors) {
        const input = await page.$(selector);
        if (input) {
          await input.fill(query.firstName);
          this.logger.debug(`Filled firstName via: ${selector}`);
          break;
        }
      }
    }

    if (query.middleName) {
      const middleNameSelectors = [
        'input[name="middleName"]',
        'input[name="patronymic"]',
        'input[name="ot"]',
        'input[placeholder*="отчество"]',
        'input[placeholder*="Отчество"]',
      ];

      for (const selector of middleNameSelectors) {
        const input = await page.$(selector);
        if (input) {
          await input.fill(query.middleName);
          this.logger.debug(`Filled middleName via: ${selector}`);
          break;
        }
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
            page
              .waitForNavigation({ waitUntil: 'networkidle', timeout: this.timeout })
              .catch(() => {}),
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
  private parseResult(html: string): WorkPermitCheckResult {
    const normalizedHtml = html.toLowerCase();

    // Парсинг дополнительных данных
    const region = this.extractField(html, [
      /регион[:\s]+([а-яё\s\-\.]+)/i,
      /субъект[:\s]+([а-яё\s\-\.]+)/i,
      /место выдачи[:\s]+([а-яё\s\-\.]+)/i,
    ]);

    const employer = this.extractField(html, [
      /работодатель[:\s]+([а-яё\w\s\"\'\-\.\,]+)/i,
      /организация[:\s]+([а-яё\w\s\"\'\-\.\,]+)/i,
      /наниматель[:\s]+([а-яё\w\s\"\'\-\.\,]+)/i,
    ]);

    const validUntil = this.extractDate(html, [
      /действительно до[:\s]+(\d{2}[\.\-\/]\d{2}[\.\-\/]\d{4})/i,
      /срок действия до[:\s]+(\d{2}[\.\-\/]\d{2}[\.\-\/]\d{4})/i,
      /дата окончания[:\s]+(\d{2}[\.\-\/]\d{2}[\.\-\/]\d{4})/i,
    ]);

    const issuedAt = this.extractDate(html, [
      /дата выдачи[:\s]+(\d{2}[\.\-\/]\d{2}[\.\-\/]\d{4})/i,
      /выдано[:\s]+(\d{2}[\.\-\/]\d{2}[\.\-\/]\d{4})/i,
    ]);

    // Индикаторы истекшего срока действия
    const expiredIndicators = [
      'срок действия истек',
      'истёк срок действия',
      'просрочено',
      'недействительно по сроку',
    ];

    for (const indicator of expiredIndicators) {
      if (normalizedHtml.includes(indicator)) {
        this.logger.log('Work permit is EXPIRED');
        return {
          status: WorkPermitStatus.EXPIRED,
          isValid: false,
          region,
          employer,
          validUntil,
          issuedAt,
          message: 'Срок действия разрешения на работу истек',
        };
      }
    }

    // Индикаторы недействительного разрешения
    const invalidIndicators = [
      'недействительно',
      'не действительно',
      'аннулировано',
      'отозвано',
      'отменено',
      'признано недействительным',
    ];

    for (const indicator of invalidIndicators) {
      if (normalizedHtml.includes(indicator)) {
        this.logger.log('Work permit is INVALID');
        return {
          status: WorkPermitStatus.INVALID,
          isValid: false,
          region,
          employer,
          validUntil,
          issuedAt,
          message: 'Разрешение на работу недействительно (аннулировано)',
        };
      }
    }

    // Индикаторы действительного разрешения
    const validIndicators = [
      'действительно',
      'является действительным',
      'разрешение действует',
      'статус: действующее',
      'актуальное',
    ];

    for (const indicator of validIndicators) {
      if (normalizedHtml.includes(indicator)) {
        this.logger.log('Work permit is VALID');
        return {
          status: WorkPermitStatus.VALID,
          isValid: true,
          region,
          employer,
          validUntil,
          issuedAt,
          message: 'Разрешение на работу действительно',
        };
      }
    }

    // Индикаторы не найденного разрешения
    const notFoundIndicators = [
      'не найдено',
      'не найден',
      'не значится',
      'не числится',
      'отсутствует в базе',
      'нет данных',
      'информация не найдена',
    ];

    for (const indicator of notFoundIndicators) {
      if (normalizedHtml.includes(indicator)) {
        this.logger.log('Work permit NOT_FOUND');
        return {
          status: WorkPermitStatus.NOT_FOUND,
          isValid: false,
          message: 'Разрешение на работу не найдено в базе данных',
        };
      }
    }

    // Проверяем наличие ошибок
    const errorIndicators = ['ошибка', 'повторите попытку', 'неверный код', 'попробуйте позже'];

    for (const indicator of errorIndicators) {
      if (normalizedHtml.includes(indicator)) {
        this.logger.warn('Error indicator found in response');
        return {
          status: WorkPermitStatus.UNKNOWN,
          isValid: false,
          message: 'Ошибка при проверке. Повторите попытку позже.',
        };
      }
    }

    // Если есть какие-то результаты но не можем определить статус
    const resultIndicators = ['результат проверки', 'проверка завершена', 'данные о разрешении'];

    for (const indicator of resultIndicators) {
      if (normalizedHtml.includes(indicator)) {
        // Есть результат, но статус неясен - возвращаем UNKNOWN
        this.logger.debug('Result found but status unclear');
        return {
          status: WorkPermitStatus.UNKNOWN,
          isValid: false,
          region,
          employer,
          validUntil,
          issuedAt,
          message: 'Статус разрешения не определен. Рекомендуем проверить на официальном сайте.',
        };
      }
    }

    // Не удалось определить статус
    this.logger.warn('Could not determine work permit status');
    return {
      status: WorkPermitStatus.UNKNOWN,
      isValid: false,
      message: 'Не удалось определить статус разрешения на работу',
    };
  }

  /**
   * Извлечение значения поля из HTML по паттернам
   */
  private extractField(html: string, patterns: RegExp[]): string | undefined {
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return undefined;
  }

  /**
   * Извлечение и конвертация даты из HTML
   */
  private extractDate(html: string, patterns: RegExp[]): string | undefined {
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        try {
          // Парсим дату в формате DD.MM.YYYY или DD-MM-YYYY или DD/MM/YYYY
          const dateStr = match[1];
          const parts = dateStr.split(/[\.\-\/]/);
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10);
            const date = new Date(year, month, day);
            if (!isNaN(date.getTime())) {
              return date.toISOString();
            }
          }
        } catch {
          // Ignore parsing errors
        }
      }
    }
    return undefined;
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
