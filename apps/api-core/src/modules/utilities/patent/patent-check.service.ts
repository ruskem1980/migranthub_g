import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Page, BrowserContext } from 'playwright';
import { CacheService } from '../../cache/cache.service';
import { BrowserService, CaptchaSolverService } from '../../../common/services';
import { CheckPatentDto, PatentCheckResultDto, PatentStatus } from './dto';

/**
 * Состояние circuit breaker
 */
enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

/**
 * PatentCheckService - сервис для проверки действительности патента
 * через сайт ФМС (services.fms.gov.ru).
 *
 * Особенности:
 * - Использует Playwright для взаимодействия с сайтом
 * - Решает капчу через 2Captcha API
 * - Кэширует результаты в Redis (TTL 6 часов)
 * - Circuit breaker для защиты от каскадных сбоев
 * - Mock режим при PATENT_CHECK_ENABLED=false
 */
@Injectable()
export class PatentCheckService implements OnModuleInit {
  private readonly logger = new Logger(PatentCheckService.name);

  // Конфигурация
  private readonly serviceUrl: string;
  private readonly enabled: boolean;
  private readonly timeout: number;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;
  private readonly cacheTtl: number;
  private readonly circuitBreakerThreshold: number;
  private readonly circuitBreakerResetTime: number;

  // Circuit breaker state
  private circuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;

  // Ключ кэша
  private readonly CACHE_KEY_PREFIX = 'patent:check:';

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly browserService: BrowserService,
    private readonly captchaSolver: CaptchaSolverService,
  ) {
    this.serviceUrl = this.configService.get<string>(
      'patentCheck.serviceUrl',
      'https://services.fms.gov.ru/info-service.htm?sid=2000',
    );
    this.enabled = this.configService.get<boolean>(
      'patentCheck.enabled',
      false,
    );
    this.timeout = this.configService.get<number>(
      'patentCheck.timeout',
      30000,
    );
    this.retryAttempts = this.configService.get<number>(
      'patentCheck.retryAttempts',
      3,
    );
    this.retryDelay = this.configService.get<number>(
      'patentCheck.retryDelay',
      2000,
    );
    this.cacheTtl = this.configService.get<number>(
      'patentCheck.cacheTtl',
      6 * 60 * 60 * 1000, // 6 часов
    );
    this.circuitBreakerThreshold = this.configService.get<number>(
      'patentCheck.circuitBreakerThreshold',
      5,
    );
    this.circuitBreakerResetTime = this.configService.get<number>(
      'patentCheck.circuitBreakerResetTime',
      60000,
    );
  }

  onModuleInit(): void {
    this.logger.log(
      `PatentCheckService initialized: enabled=${this.enabled}, url=${this.serviceUrl}`,
    );
  }

  /**
   * Проверка доступности сервиса
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Проверка действительности патента
   */
  async checkPatent(dto: CheckPatentDto): Promise<PatentCheckResultDto> {
    const cacheKey = this.getCacheKey(dto);

    // Пробуем получить из кэша
    const cached = await this.cacheService.get<PatentCheckResultDto>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT for patent ${dto.series}${dto.number}`);
      return {
        ...cached,
        fromCache: true,
        checkedAt: new Date().toISOString(),
      };
    }

    // Если сервис отключен - возвращаем mock
    if (!this.enabled) {
      this.logger.debug('Patent check service disabled, returning mock data');
      return this.getMockResult(dto);
    }

    // Проверка circuit breaker
    if (!this.canMakeRequest()) {
      this.logger.warn('Circuit breaker open, returning graceful degradation');
      return this.getGracefulDegradationResult(dto);
    }

    // Выполняем реальную проверку с retry
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        this.logger.debug(
          `Attempt ${attempt}/${this.retryAttempts} for patent ${dto.series}${dto.number}`,
        );
        const result = await this.executeCheck(dto);
        this.onSuccess();

        // Кэшируем успешный результат
        await this.cacheService.set(cacheKey, result, this.cacheTtl);

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(
          `Attempt ${attempt} failed: ${lastError.message}`,
        );

        if (attempt < this.retryAttempts) {
          const delay = this.calculateBackoff(attempt);
          this.logger.debug(`Waiting ${delay}ms before next attempt`);
          await this.delay(delay);
        }
      }
    }

    this.onFailure();
    this.logger.error(
      `All attempts failed for patent ${dto.series}${dto.number}: ${lastError?.message}`,
    );

    // Возвращаем graceful degradation вместо ошибки
    return this.getGracefulDegradationResult(dto);
  }

  /**
   * Выполнение проверки через браузер
   */
  private async executeCheck(dto: CheckPatentDto): Promise<PatentCheckResultDto> {
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
      await this.fillForm(page, dto);

      // Обрабатываем капчу если есть
      await this.handleCaptcha(page);

      // Отправляем форму
      await this.submitForm(page);

      // Парсим результат
      const pageContent = await page.content();
      return this.parseResult(pageContent, dto);
    } finally {
      if (page && context) {
        await this.browserService.closePage(page, context);
      }
    }
  }

  /**
   * Заполнение формы проверки патента
   */
  private async fillForm(page: Page, dto: CheckPatentDto): Promise<void> {
    this.logger.debug('Filling patent check form...');

    // Селекторы могут отличаться на реальном сайте
    // Это примерные селекторы, которые нужно адаптировать
    const seriesInput = await page.$('input[name="series"], input[name="ser"], #series');
    const numberInput = await page.$('input[name="number"], input[name="num"], #number');

    if (seriesInput) {
      await seriesInput.fill(dto.series);
    }

    if (numberInput) {
      await numberInput.fill(dto.number);
    }

    // Опционально: заполнение ФИО
    if (dto.lastName) {
      const lastNameInput = await page.$('input[name="lastName"], input[name="fam"], #lastName');
      if (lastNameInput) {
        await lastNameInput.fill(dto.lastName.toUpperCase());
      }
    }

    if (dto.firstName) {
      const firstNameInput = await page.$('input[name="firstName"], input[name="nam"], #firstName');
      if (firstNameInput) {
        await firstNameInput.fill(dto.firstName.toUpperCase());
      }
    }
  }

  /**
   * Обработка капчи на странице
   */
  private async handleCaptcha(page: Page): Promise<void> {
    // Проверяем наличие капчи
    const captchaImage = await page.$('img.captcha, img[name="captcha"], #captchaImage');

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
    const captchaInput = await page.$('input[name="captcha"], input[name="code"], #captchaInput');
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
      'button[type="submit"], input[type="submit"], button:has-text("Проверить"), button:has-text("Отправить")',
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
  private parseResult(html: string, dto: CheckPatentDto): PatentCheckResultDto {
    const normalizedHtml = html.toLowerCase();
    const now = new Date().toISOString();

    // Индикаторы действительного патента
    const validIndicators = [
      'патент действителен',
      'patent is valid',
      'патент актуален',
      'срок действия не истек',
    ];

    // Индикаторы недействительного патента
    const invalidIndicators = [
      'патент недействителен',
      'patent is invalid',
      'патент аннулирован',
      'срок действия истек',
      'срок действия патента истек',
      'патент просрочен',
    ];

    // Индикаторы "не найден"
    const notFoundIndicators = [
      'патент не найден',
      'patent not found',
      'данные не найдены',
      'сведения отсутствуют',
      'нет данных',
    ];

    // Проверяем статус
    for (const indicator of validIndicators) {
      if (normalizedHtml.includes(indicator)) {
        return {
          status: PatentStatus.VALID,
          isValid: true,
          message: 'Патент действителен',
          series: dto.series,
          number: dto.number,
          region: this.extractRegion(html),
          issueDate: this.extractDate(html, 'issue'),
          expirationDate: this.extractDate(html, 'expiration'),
          ownerName: this.extractOwnerName(html),
          fromCache: false,
          checkedAt: now,
          source: 'real',
        };
      }
    }

    for (const indicator of invalidIndicators) {
      if (normalizedHtml.includes(indicator)) {
        const isExpired = normalizedHtml.includes('истек') || normalizedHtml.includes('просрочен');
        return {
          status: isExpired ? PatentStatus.EXPIRED : PatentStatus.INVALID,
          isValid: false,
          message: isExpired ? 'Срок действия патента истек' : 'Патент недействителен',
          series: dto.series,
          number: dto.number,
          expirationDate: this.extractDate(html, 'expiration'),
          fromCache: false,
          checkedAt: now,
          source: 'real',
        };
      }
    }

    for (const indicator of notFoundIndicators) {
      if (normalizedHtml.includes(indicator)) {
        return {
          status: PatentStatus.NOT_FOUND,
          isValid: false,
          message: 'Патент не найден в базе данных',
          series: dto.series,
          number: dto.number,
          fromCache: false,
          checkedAt: now,
          source: 'real',
        };
      }
    }

    // Не удалось определить - возвращаем ERROR
    this.logger.warn('Could not determine patent status from response');
    return {
      status: PatentStatus.ERROR,
      isValid: false,
      message: 'Не удалось определить статус патента',
      series: dto.series,
      number: dto.number,
      fromCache: false,
      checkedAt: now,
      source: 'real',
    };
  }

  /**
   * Извлечение региона из HTML
   */
  private extractRegion(html: string): string | undefined {
    const patterns = [
      /регион[:\s]*([^<\n]+)/i,
      /субъект[:\s]*([^<\n]+)/i,
      /место выдачи[:\s]*([^<\n]+)/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        return match[1].trim().slice(0, 200);
      }
    }

    return undefined;
  }

  /**
   * Извлечение даты из HTML
   */
  private extractDate(html: string, type: 'issue' | 'expiration'): string | undefined {
    const patterns =
      type === 'issue'
        ? [/дата выдачи[:\s]*(\d{2}\.\d{2}\.\d{4})/i, /выдан[:\s]*(\d{2}\.\d{2}\.\d{4})/i]
        : [/действителен до[:\s]*(\d{2}\.\d{2}\.\d{4})/i, /срок действия[:\s]*до[:\s]*(\d{2}\.\d{2}\.\d{4})/i];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        // Конвертируем DD.MM.YYYY в ISO
        const [day, month, year] = match[1].split('.');
        return `${year}-${month}-${day}`;
      }
    }

    return undefined;
  }

  /**
   * Извлечение ФИО владельца
   */
  private extractOwnerName(html: string): string | undefined {
    const patterns = [
      /(?:фио|владелец|держатель)[:\s]*([A-Za-z\s\-]+)/i,
      /(?:фамилия|имя)[:\s]*([A-Za-z\s\-]+)/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        return match[1].trim().slice(0, 200);
      }
    }

    return undefined;
  }

  /**
   * Получение mock результата (для тестирования и отключенного сервиса)
   */
  private getMockResult(dto: CheckPatentDto): PatentCheckResultDto {
    const now = new Date().toISOString();

    // Генерируем детерминированный результат на основе номера патента
    const lastDigit = parseInt(dto.number.slice(-1), 10);
    const isValid = lastDigit < 7; // 70% шанс что патент действителен

    if (isValid) {
      return {
        status: PatentStatus.VALID,
        isValid: true,
        message: 'Патент действителен (mock данные)',
        series: dto.series,
        number: dto.number,
        region: 'Москва',
        issueDate: '2024-01-15',
        expirationDate: '2025-12-31',
        ownerName: dto.lastName
          ? `${dto.lastName.toUpperCase()} ${dto.firstName?.toUpperCase() || ''}`
          : undefined,
        fromCache: false,
        checkedAt: now,
        source: 'mock',
      };
    }

    return {
      status: lastDigit === 9 ? PatentStatus.NOT_FOUND : PatentStatus.EXPIRED,
      isValid: false,
      message:
        lastDigit === 9
          ? 'Патент не найден в базе данных (mock данные)'
          : 'Срок действия патента истек (mock данные)',
      series: dto.series,
      number: dto.number,
      expirationDate: lastDigit === 9 ? undefined : '2023-06-30',
      fromCache: false,
      checkedAt: now,
      source: 'mock',
    };
  }

  /**
   * Результат при graceful degradation
   */
  private getGracefulDegradationResult(dto: CheckPatentDto): PatentCheckResultDto {
    return {
      status: PatentStatus.ERROR,
      isValid: false,
      message:
        'Сервис проверки временно недоступен. Попробуйте позже или проверьте на официальном сайте ФМС.',
      series: dto.series,
      number: dto.number,
      fromCache: false,
      checkedAt: new Date().toISOString(),
      source: 'real',
    };
  }

  /**
   * Генерация ключа кэша
   */
  private getCacheKey(dto: CheckPatentDto): string {
    return `${this.CACHE_KEY_PREFIX}${dto.series}:${dto.number}`;
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
      this.logger.warn(
        `Circuit breaker opened after ${this.failureCount} failures`,
      );
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
