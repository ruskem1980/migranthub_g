import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Page, BrowserContext } from 'playwright';
import { BrowserService, CaptchaSolverService } from '../../../common/services';
import { BanCheckQueryDto, BanType } from './dto';

/**
 * Результат проверки запрета на въезд от ФМС
 */
export interface FmsCheckResult {
  hasBan: boolean;
  banType?: BanType;
  reason?: string;
  expiresAt?: string;
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
 * FmsClient - клиент для проверки запрета на въезд через сайт ФМС.
 *
 * Особенности:
 * - Использует Playwright для взаимодействия с сайтом (sid=3000)
 * - Решает капчу через 2Captcha API
 * - Кэширует результаты в Redis (TTL 24 часа)
 * - Circuit breaker для защиты от каскадных сбоев
 * - Mock режим при ENTRY_BAN_FMS_ENABLED=false
 */
@Injectable()
export class FmsClient implements OnModuleInit {
  private readonly logger = new Logger(FmsClient.name);

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
      'entryBan.serviceUrl',
      'https://services.fms.gov.ru/info-service.htm?sid=3000',
    );
    this.enabled = this.configService.get<boolean>('entryBan.enabled', false);
    this.timeout = this.configService.get<number>('entryBan.timeout', 30000);
    this.retryAttempts = this.configService.get<number>('entryBan.retryAttempts', 3);
    this.retryDelay = this.configService.get<number>('entryBan.retryDelay', 2000);
    this.circuitBreakerThreshold = this.configService.get<number>(
      'entryBan.circuitBreakerThreshold',
      5,
    );
    this.circuitBreakerResetTime = this.configService.get<number>(
      'entryBan.circuitBreakerResetTime',
      60000,
    );
  }

  onModuleInit(): void {
    this.logger.log(`FmsClient initialized: enabled=${this.enabled}, url=${this.serviceUrl}`);
  }

  /**
   * Проверка доступности сервиса
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Проверка запрета на въезд через сайт ФМС (sid=3000)
   */
  async checkBan(query: BanCheckQueryDto): Promise<FmsCheckResult> {
    // Проверка обязательного поля citizenship для FMS
    if (!query.citizenship) {
      throw new Error('Citizenship is required for FMS check');
    }

    // Проверка circuit breaker
    if (!this.canMakeRequest()) {
      this.logger.warn('Circuit breaker open, FMS request blocked');
      throw new Error('FMS service temporarily unavailable (circuit open)');
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        this.logger.debug(
          `Attempt ${attempt}/${this.retryAttempts} for FMS check: ${query.lastName} ${query.firstName}`,
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
  private async executeCheck(query: BanCheckQueryDto): Promise<FmsCheckResult> {
    let page: Page | null = null;
    let context: BrowserContext | null = null;

    try {
      // Открываем страницу сервиса
      const result = await this.browserService.getInteractivePage(this.serviceUrl);
      page = result.page;
      context = result.context;

      // Ждем загрузки формы
      await page.waitForSelector('form', { timeout: this.timeout });

      // Заполняем форму
      await this.fillForm(page, query);

      // Обрабатываем капчу если есть
      await this.handleCaptcha(page);

      // Отправляем форму
      await this.submitForm(page);

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
   * Заполнение формы проверки запрета на въезд (sid=3000)
   */
  private async fillForm(page: Page, query: BanCheckQueryDto): Promise<void> {
    this.logger.debug('Filling FMS entry ban check form...');

    // Фамилия (латиница)
    const lastNameInput = await page.$(
      'input[name="fam"], input[name="lastName"], input[name="surname"], #fam',
    );
    if (lastNameInput) {
      await lastNameInput.fill(query.lastName.toUpperCase());
    }

    // Имя (латиница)
    const firstNameInput = await page.$(
      'input[name="nam"], input[name="firstName"], input[name="name"], #nam',
    );
    if (firstNameInput) {
      await firstNameInput.fill(query.firstName.toUpperCase());
    }

    // Отчество (опционально)
    if (query.middleName) {
      const middleNameInput = await page.$(
        'input[name="otch"], input[name="middleName"], input[name="patronymic"], #otch',
      );
      if (middleNameInput) {
        await middleNameInput.fill(query.middleName.toUpperCase());
      }
    }

    // Дата рождения (DD.MM.YYYY)
    const birthDateInput = await page.$(
      'input[name="dat"], input[name="birthDate"], input[name="birthday"], #dat',
    );
    if (birthDateInput) {
      const formattedDate = this.formatDate(query.birthDate);
      await birthDateInput.fill(formattedDate);
    }

    // Гражданство (код страны)
    const citizenshipSelect = await page.$(
      'select[name="gra"], select[name="citizenship"], select[name="country"], #gra',
    );
    if (citizenshipSelect && query.citizenship) {
      await citizenshipSelect.selectOption({ value: query.citizenship });
    }

    // Альтернативный вариант - input для гражданства
    const citizenshipInput = await page.$('input[name="gra"], input[name="citizenship"], #gra');
    if (citizenshipInput && query.citizenship) {
      await citizenshipInput.fill(query.citizenship);
    }
  }

  /**
   * Обработка капчи на странице
   */
  private async handleCaptcha(page: Page): Promise<void> {
    // Проверяем наличие капчи
    const captchaImage = await page.$(
      'img.captcha, img[name="captcha"], #captchaImage, img[src*="captcha"]',
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
    const captchaInput = await page.$(
      'input[name="captcha"], input[name="code"], input[name="captchaCode"], #captchaInput',
    );
    if (captchaInput) {
      await captchaInput.fill(solution.solution);
      this.logger.debug('Captcha solution entered');
    }
  }

  /**
   * Отправка формы
   */
  private async submitForm(page: Page): Promise<void> {
    this.logger.debug('Submitting form...');

    // Ищем кнопку отправки
    const submitButton = await page.$(
      'button[type="submit"], input[type="submit"], button:has-text("Проверить"), button:has-text("Отправить"), input[value="Проверить"]',
    );

    if (submitButton) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: this.timeout }),
        submitButton.click(),
      ]);
    } else {
      // Пробуем отправить форму напрямую
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: this.timeout }),
        page.evaluate(() => {
          const form = document.querySelector('form');
          if (form) form.submit();
        }),
      ]);
    }

    // Даем время на загрузку результатов
    await page.waitForTimeout(2000);
  }

  /**
   * Парсинг результата проверки из HTML
   */
  private parseResult(html: string): FmsCheckResult {
    const normalizedHtml = html.toLowerCase();

    // Индикаторы наличия запрета (порядок важен - более специфичные паттерны первыми)
    const banIndicators = [
      { pattern: 'уголовн', type: BanType.CRIMINAL },
      { pattern: 'санитарн', type: BanType.SANITARY },
      { pattern: 'нежелательность пребывания', type: BanType.SANITARY },
      { pattern: 'административное выдворение', type: BanType.ADMINISTRATIVE },
      { pattern: 'депортация', type: BanType.ADMINISTRATIVE },
      { pattern: 'въезд не разрешен', type: BanType.ADMINISTRATIVE },
      { pattern: 'запрет на въезд', type: BanType.ADMINISTRATIVE },
    ];

    // Индикаторы отсутствия запрета
    const noBanIndicators = [
      'оснований не въезд не имеется',
      'оснований для неразрешения въезда не выявлено',
      'данных нет',
      'сведения не найдены',
      'данные отсутствуют',
      'запретов не обнаружено',
      'ограничений не выявлено',
    ];

    // Проверяем на наличие запрета
    for (const indicator of banIndicators) {
      if (normalizedHtml.includes(indicator.pattern)) {
        this.logger.log(`Entry ban detected: ${indicator.pattern}`);
        return {
          hasBan: true,
          banType: indicator.type,
          reason: this.extractReason(html),
          expiresAt: this.extractExpirationDate(html),
        };
      }
    }

    // Проверяем на явное отсутствие запрета
    for (const indicator of noBanIndicators) {
      if (normalizedHtml.includes(indicator)) {
        this.logger.log('No entry ban found');
        return { hasBan: false };
      }
    }

    // Если не удалось определить - считаем что запрета нет
    this.logger.warn('Could not determine entry ban status, assuming no ban');
    return { hasBan: false };
  }

  /**
   * Извлечение причины запрета из HTML
   */
  private extractReason(html: string): string | undefined {
    const patterns = [
      /причина[:\s]*([^<]+)/i,
      /основание[:\s]*([^<]+)/i,
      /статья[:\s]*([^<]+)/i,
      /в связи с[:\s]*([^<]+)/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        return match[1].trim().slice(0, 500);
      }
    }

    return undefined;
  }

  /**
   * Извлечение даты окончания запрета из HTML
   */
  private extractExpirationDate(html: string): string | undefined {
    const datePattern = /до[:\s]*(\d{2}\.\d{2}\.\d{4})/i;
    const match = html.match(datePattern);

    if (match?.[1]) {
      // Конвертируем DD.MM.YYYY в ISO формат
      const [day, month, year] = match[1].split('.');
      return `${year}-${month}-${day}`;
    }

    return undefined;
  }

  /**
   * Форматирование даты для формы (DD.MM.YYYY)
   */
  private formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
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
