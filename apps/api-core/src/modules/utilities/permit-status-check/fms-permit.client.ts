import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Page, BrowserContext } from 'playwright';
import { BrowserService, CaptchaSolverService } from '../../../common/services';
import { CheckPermitDto, PermitType, PermitStatusResponseDto, PermitStatusEnum } from './dto';

/**
 * Состояние circuit breaker
 */
enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

/**
 * FmsPermitClient - клиент для проверки статуса РВП/ВНЖ через сайт ФМС.
 *
 * Особенности:
 * - Использует Playwright для взаимодействия с сайтом
 * - sid=2060 для РВП, sid=2070 для ВНЖ
 * - Решает капчу через 2Captcha API (если настроено)
 * - Circuit breaker для защиты от каскадных сбоев
 * - Mock режим при PERMIT_STATUS_ENABLED=false
 */
@Injectable()
export class FmsPermitClient implements OnModuleInit {
  private readonly logger = new Logger(FmsPermitClient.name);

  // Конфигурация
  private readonly serviceUrlRvp: string;
  private readonly serviceUrlVnj: string;
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
    this.serviceUrlRvp = this.configService.get<string>(
      'permitStatus.serviceUrlRvp',
      'https://services.fms.gov.ru/info-service.htm?sid=2060',
    );
    this.serviceUrlVnj = this.configService.get<string>(
      'permitStatus.serviceUrlVnj',
      'https://services.fms.gov.ru/info-service.htm?sid=2070',
    );
    this.enabled = this.configService.get<boolean>('permitStatus.enabled', false);
    this.timeout = this.configService.get<number>('permitStatus.timeout', 30000);
    this.retryAttempts = this.configService.get<number>('permitStatus.retryAttempts', 3);
    this.retryDelay = this.configService.get<number>('permitStatus.retryDelay', 2000);
    this.circuitBreakerThreshold = this.configService.get<number>(
      'permitStatus.circuitBreakerThreshold',
      5,
    );
    this.circuitBreakerResetTime = this.configService.get<number>(
      'permitStatus.circuitBreakerResetTime',
      60000,
    );
  }

  onModuleInit(): void {
    this.logger.log(
      `FmsPermitClient initialized: enabled=${this.enabled}, rvp_url=${this.serviceUrlRvp}, vnj_url=${this.serviceUrlVnj}`,
    );
  }

  /**
   * Проверка доступности сервиса
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Получение URL в зависимости от типа разрешения
   */
  private getServiceUrl(permitType: PermitType): string {
    return permitType === PermitType.RVP ? this.serviceUrlRvp : this.serviceUrlVnj;
  }

  /**
   * Проверка статуса РВП/ВНЖ через сайт ФМС
   */
  async checkPermitStatus(query: CheckPermitDto): Promise<PermitStatusResponseDto> {
    // Проверка circuit breaker
    if (!this.canMakeRequest()) {
      this.logger.warn('Circuit breaker open, permit status request blocked');
      return {
        found: false,
        status: PermitStatusEnum.UNKNOWN,
        message: 'Сервис временно недоступен (circuit open)',
        checkedAt: new Date().toISOString(),
        error: 'FMS service temporarily unavailable (circuit open)',
      };
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        this.logger.debug(
          `Attempt ${attempt}/${this.retryAttempts} for permit status check: ${query.lastName} ${query.firstName}, type: ${query.permitType}`,
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
    return {
      found: false,
      status: PermitStatusEnum.UNKNOWN,
      message: 'Не удалось получить информацию о статусе заявления',
      checkedAt: new Date().toISOString(),
      error: lastError?.message || 'All retry attempts failed',
    };
  }

  /**
   * Выполнение проверки через браузер
   */
  private async executeCheck(query: CheckPermitDto): Promise<PermitStatusResponseDto> {
    let page: Page | null = null;
    let context: BrowserContext | null = null;

    try {
      const serviceUrl = this.getServiceUrl(query.permitType);

      // Открываем страницу сервиса
      const result = await this.browserService.getInteractivePage(serviceUrl);
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
   * Заполнение формы проверки статуса РВП/ВНЖ
   */
  private async fillForm(page: Page, query: CheckPermitDto): Promise<void> {
    this.logger.debug(`Filling permit status form for ${query.permitType}...`);

    // Код региона
    const regionInput = await page.$(
      'input[name="region"], input[name="reg"], select[name="region"], #region',
    );
    if (regionInput) {
      const tagName = await regionInput.evaluate((el) => el.tagName.toLowerCase());
      if (tagName === 'select') {
        await regionInput.selectOption({ value: query.region });
      } else {
        await regionInput.fill(query.region);
      }
    }

    // Дата подачи заявления (DD.MM.YYYY)
    const applicationDateInput = await page.$(
      'input[name="dat"], input[name="date"], input[name="applicationDate"], #dat',
    );
    if (applicationDateInput) {
      const formattedDate = this.formatDate(query.applicationDate);
      await applicationDateInput.fill(formattedDate);
    }

    // Номер заявления (если есть)
    if (query.applicationNumber) {
      const applicationNumberInput = await page.$(
        'input[name="num"], input[name="number"], input[name="applicationNumber"], #num',
      );
      if (applicationNumberInput) {
        await applicationNumberInput.fill(query.applicationNumber);
      }
    }

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
      'input[name="bdat"], input[name="birthDate"], input[name="birthday"], #bdat',
    );
    if (birthDateInput) {
      const formattedBirthDate = this.formatDate(query.birthDate);
      await birthDateInput.fill(formattedBirthDate);
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
  private parseResult(html: string): PermitStatusResponseDto {
    const normalizedHtml = html.toLowerCase();

    // Индикаторы статусов (порядок важен - более специфичные паттерны первыми)
    const statusIndicators = {
      APPROVED: [
        'решение о выдаче',
        'разрешение выдано',
        'одобрено',
        'положительное решение',
        'принято решение о выдаче',
        'удовлетворено',
      ],
      REJECTED: [
        'отказано',
        'отказ',
        'отрицательное решение',
        'не удовлетворено',
        'принято решение об отказе',
      ],
      READY_FOR_PICKUP: [
        'готово к выдаче',
        'можете получить',
        'для получения',
        'обратитесь для получения',
        'документ готов',
      ],
      ADDITIONAL_DOCS_REQUIRED: [
        'дополнительные документы',
        'истребованы документы',
        'предоставить документы',
        'необходимо представить',
        'требуется предоставить',
      ],
      PENDING: [
        'на рассмотрении',
        'рассматривается',
        'в работе',
        'принято к рассмотрению',
        'находится на рассмотрении',
        'ожидает рассмотрения',
      ],
      NOT_FOUND: [
        'не найдено',
        'сведения отсутствуют',
        'заявление не обнаружено',
        'информация не найдена',
        'данные отсутствуют',
        'заявления с указанными данными не найдено',
      ],
    };

    // Проверяем статусы в порядке приоритета
    for (const [status, indicators] of Object.entries(statusIndicators)) {
      for (const indicator of indicators) {
        if (normalizedHtml.includes(indicator)) {
          this.logger.log(`Permit status detected: ${status} (indicator: ${indicator})`);

          const permitStatus = PermitStatusEnum[status as keyof typeof PermitStatusEnum];
          const found = status !== 'NOT_FOUND';

          return {
            found,
            status: permitStatus,
            message: this.extractMessage(html),
            estimatedDate: this.extractEstimatedDate(html),
            checkedAt: new Date().toISOString(),
          };
        }
      }
    }

    // Если не удалось определить статус
    this.logger.warn('Could not determine permit status from response');
    return {
      found: false,
      status: PermitStatusEnum.UNKNOWN,
      message: 'Не удалось определить статус заявления',
      checkedAt: new Date().toISOString(),
    };
  }

  /**
   * Извлечение основного сообщения из HTML
   */
  private extractMessage(html: string): string {
    // Ищем текст в типичных контейнерах результата
    const patterns = [
      /<div[^>]*class="[^"]*result[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<div[^>]*class="[^"]*message[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
      /<p[^>]*class="[^"]*result[^"]*"[^>]*>([\s\S]*?)<\/p>/i,
      /<td[^>]*>([\s\S]*?статус[\s\S]*?)<\/td>/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        // Очищаем от HTML тегов
        const text = match[1]
          .replace(/<[^>]*>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (text.length > 10 && text.length < 1000) {
          return text;
        }
      }
    }

    return 'Информация о статусе получена';
  }

  /**
   * Извлечение примерной даты готовности из HTML
   */
  private extractEstimatedDate(html: string): string | undefined {
    const datePatterns = [
      /готов[а-я]*\s*(?:к|до|после)[:\s]*(\d{2}\.\d{2}\.\d{4})/i,
      /ориентировочн[а-я]*\s*дат[а-я]*[:\s]*(\d{2}\.\d{2}\.\d{4})/i,
      /срок[:\s]*(\d{2}\.\d{2}\.\d{4})/i,
      /до[:\s]*(\d{2}\.\d{2}\.\d{4})/i,
    ];

    for (const pattern of datePatterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        // Конвертируем DD.MM.YYYY в ISO формат
        const [day, month, year] = match[1].split('.');
        return `${year}-${month}-${day}`;
      }
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
