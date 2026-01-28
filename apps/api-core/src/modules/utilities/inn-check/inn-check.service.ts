import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Page, BrowserContext } from 'playwright';
import { CacheService } from '../../cache/cache.service';
import { BrowserService, CaptchaSolverService } from '../../../common/services';
import { GetInnDto, InnResultDto, InnCheckSource, ForeignDocumentType } from './dto';

/**
 * Состояние circuit breaker
 */
enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

/**
 * Маппинг типов документов на коды ФНС
 */
const DOCUMENT_TYPE_CODES: Record<ForeignDocumentType, string> = {
  [ForeignDocumentType.FOREIGN_PASSPORT]: '10', // Паспорт иностранного гражданина
  [ForeignDocumentType.RVP]: '15', // Разрешение на временное проживание
  [ForeignDocumentType.VNJ]: '12', // Вид на жительство
};

/**
 * InnCheckService - сервис для получения ИНН иностранного гражданина
 * через сайт ФНС (service.nalog.ru/inn.do).
 *
 * Особенности:
 * - Использует Playwright для взаимодействия с сайтом
 * - Решает капчу через 2Captcha API
 * - Кэширует результаты в Redis (TTL 30 дней - ИНН не меняется)
 * - Circuit breaker для защиты от каскадных сбоев
 * - Mock режим при INN_CHECK_ENABLED=false
 */
@Injectable()
export class InnCheckService implements OnModuleInit {
  private readonly logger = new Logger(InnCheckService.name);

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
  private readonly CACHE_KEY_PREFIX = 'inn:check:';

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly browserService: BrowserService,
    private readonly captchaSolver: CaptchaSolverService,
  ) {
    this.serviceUrl = this.configService.get<string>(
      'innCheck.serviceUrl',
      'https://service.nalog.ru/inn.do',
    );
    this.enabled = this.configService.get<boolean>('innCheck.enabled', false);
    this.timeout = this.configService.get<number>('innCheck.timeout', 30000);
    this.retryAttempts = this.configService.get<number>('innCheck.retryAttempts', 3);
    this.retryDelay = this.configService.get<number>('innCheck.retryDelay', 2000);
    this.cacheTtl = this.configService.get<number>(
      'innCheck.cacheTtl',
      30 * 24 * 60 * 60 * 1000, // 30 дней
    );
    this.circuitBreakerThreshold = this.configService.get<number>(
      'innCheck.circuitBreakerThreshold',
      5,
    );
    this.circuitBreakerResetTime = this.configService.get<number>(
      'innCheck.circuitBreakerResetTime',
      60000,
    );
  }

  onModuleInit(): void {
    this.logger.log(`InnCheckService initialized: enabled=${this.enabled}, url=${this.serviceUrl}`);
  }

  /**
   * Проверка доступности сервиса
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Получение ИНН по паспортным данным
   */
  async getInn(dto: GetInnDto): Promise<InnResultDto> {
    const cacheKey = this.getCacheKey(dto);

    // Пробуем получить из кэша
    const cached = await this.cacheService.get<InnResultDto>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache HIT for ${dto.lastName} ${dto.documentSeries}${dto.documentNumber}`);
      return {
        ...cached,
        source: InnCheckSource.CACHE,
        checkedAt: new Date().toISOString(),
      };
    }

    // Если сервис отключен - возвращаем mock
    if (!this.enabled) {
      this.logger.debug('INN check service disabled, returning mock data');
      return this.getMockResult(dto);
    }

    // Проверка circuit breaker
    if (!this.canMakeRequest()) {
      this.logger.warn('Circuit breaker open, returning graceful degradation');
      return this.getGracefulDegradationResult();
    }

    // Выполняем реальную проверку с retry
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        this.logger.debug(
          `Attempt ${attempt}/${this.retryAttempts} for ${dto.lastName} ${dto.documentSeries}${dto.documentNumber}`,
        );
        const result = await this.executeCheck(dto);
        this.onSuccess();

        // Кэшируем успешный результат (только если найден ИНН)
        if (result.found && result.inn) {
          await this.cacheService.set(cacheKey, result, this.cacheTtl);
        }

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
    this.logger.error(
      `All attempts failed for ${dto.lastName} ${dto.documentSeries}${dto.documentNumber}: ${lastError?.message}`,
    );

    // Возвращаем graceful degradation вместо ошибки
    return this.getGracefulDegradationResult();
  }

  /**
   * Выполнение проверки через браузер
   */
  private async executeCheck(dto: GetInnDto): Promise<InnResultDto> {
    let page: Page | null = null;
    let context: BrowserContext | null = null;

    try {
      // Открываем страницу сервиса
      const result = await this.browserService.getInteractivePage(this.serviceUrl);
      page = result.page;
      context = result.context;

      // Ждем загрузки страницы
      await page.waitForLoadState('networkidle', { timeout: this.timeout });

      // Выбираем тип "Иностранный гражданин"
      await this.selectForeignCitizen(page);

      // Заполняем форму
      await this.fillForm(page, dto);

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
   * Выбор типа "Иностранный гражданин" на форме ФНС
   */
  private async selectForeignCitizen(page: Page): Promise<void> {
    this.logger.debug('Selecting "Foreign citizen" option...');

    // На сайте ФНС есть радиокнопка или таб для выбора типа лица
    // Ищем вариант "Иностранный гражданин" или "Иностранец"
    const foreignCitizenSelectors = [
      'input[value="F"]', // Возможный value для иностранца
      'input[name="ffl"][value="fl"]', // Физлицо (общий)
      '#ffl_fl', // ID для физлица
      'label:has-text("Иностранный")',
      'label:has-text("иностранного")',
      'input[type="radio"]:near(:text("Иностранный"))',
    ];

    for (const selector of foreignCitizenSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.click();
          this.logger.debug(`Selected foreign citizen option: ${selector}`);
          await page.waitForTimeout(500); // Даем время на обновление формы
          return;
        }
      } catch {
        // Продолжаем пробовать другие селекторы
      }
    }

    // Если не нашли специфичную опцию, форма может работать и без нее
    this.logger.debug('Foreign citizen selector not found, proceeding with default form');
  }

  /**
   * Заполнение формы получения ИНН
   */
  private async fillForm(page: Page, dto: GetInnDto): Promise<void> {
    this.logger.debug('Filling INN request form...');

    // Фамилия
    await this.fillField(
      page,
      ['input[name="fam"]', '#fam', 'input[placeholder*="Фамилия"]'],
      dto.lastName.toUpperCase(),
    );

    // Имя
    await this.fillField(
      page,
      ['input[name="nam"]', '#nam', 'input[placeholder*="Имя"]'],
      dto.firstName.toUpperCase(),
    );

    // Отчество (если есть)
    if (dto.middleName) {
      await this.fillField(
        page,
        ['input[name="otch"]', '#otch', 'input[placeholder*="Отчество"]'],
        dto.middleName.toUpperCase(),
      );
    } else {
      // Отмечаем чекбокс "Нет отчества" если есть
      const noMiddleNameCheckbox = await page.$(
        'input[name="opt_otch"], input[type="checkbox"]:near(:text("отчеств"))',
      );
      if (noMiddleNameCheckbox) {
        await noMiddleNameCheckbox.check();
      }
    }

    // Дата рождения (форматируем из ISO в DD.MM.YYYY)
    const birthDateFormatted = this.formatDateToDDMMYYYY(dto.birthDate);
    await this.fillField(
      page,
      [
        'input[name="bdate"]',
        '#bdate',
        'input[placeholder*="дата рождения"]',
        'input[placeholder*="ДД.ММ.ГГГГ"]',
      ],
      birthDateFormatted,
    );

    // Тип документа (выпадающий список)
    const documentCode = DOCUMENT_TYPE_CODES[dto.documentType];
    await this.selectDocumentType(page, documentCode);

    // Серия документа
    await this.fillField(
      page,
      ['input[name="docser"]', '#docser', 'input[name="docno"]', 'input[placeholder*="Серия"]'],
      dto.documentSeries,
    );

    // Номер документа
    await this.fillField(
      page,
      ['input[name="docnum"]', '#docnum', 'input[placeholder*="Номер"]'],
      dto.documentNumber,
    );

    // Дата выдачи документа
    const docDateFormatted = this.formatDateToDDMMYYYY(dto.documentDate);
    await this.fillField(
      page,
      ['input[name="docdt"]', '#docdt', 'input[placeholder*="дата выдачи"]'],
      docDateFormatted,
    );
  }

  /**
   * Вспомогательный метод для заполнения поля
   */
  private async fillField(page: Page, selectors: string[], value: string): Promise<void> {
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.fill(value);
          this.logger.debug(`Filled field ${selector} with value`);
          return;
        }
      } catch {
        // Продолжаем пробовать другие селекторы
      }
    }
    this.logger.warn(`Could not find field with selectors: ${selectors.join(', ')}`);
  }

  /**
   * Выбор типа документа в выпадающем списке
   */
  private async selectDocumentType(page: Page, documentCode: string): Promise<void> {
    const selectSelectors = ['select[name="doctype"]', '#doctype', 'select[name="doc"]'];

    for (const selector of selectSelectors) {
      try {
        const select = await page.$(selector);
        if (select) {
          await select.selectOption({ value: documentCode });
          this.logger.debug(`Selected document type: ${documentCode}`);
          return;
        }
      } catch {
        // Пробуем следующий селектор
      }
    }

    // Альтернативно пробуем кликнуть по опции напрямую
    this.logger.warn('Could not select document type from dropdown');
  }

  /**
   * Обработка капчи на странице ФНС
   */
  private async handleCaptcha(page: Page): Promise<void> {
    // Проверяем наличие капчи (ФНС использует изображение капчи)
    const captchaSelectors = [
      'img.captcha',
      'img[alt*="captcha"]',
      'img[alt*="код"]',
      '#captchaImage',
      'img[src*="captcha"]',
    ];

    let captchaImage = null;
    for (const selector of captchaSelectors) {
      captchaImage = await page.$(selector);
      if (captchaImage) break;
    }

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
      'input[name="captchaText"]',
      '#captcha',
      '#captchaInput',
      'input[placeholder*="код"]',
    ];

    for (const selector of captchaInputSelectors) {
      const captchaInput = await page.$(selector);
      if (captchaInput) {
        await captchaInput.fill(solution.solution);
        this.logger.debug('Captcha solution entered');
        return;
      }
    }

    this.logger.warn('Could not find captcha input field');
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
      'button:has-text("Узнать ИНН")',
      'button:has-text("Отправить")',
      'button:has-text("Получить")',
      '#btn_send',
      '.btn-send',
    ];

    for (const selector of submitSelectors) {
      const submitButton = await page.$(selector);
      if (submitButton) {
        await Promise.all([
          page.waitForLoadState('networkidle', { timeout: this.timeout }),
          submitButton.click(),
        ]);
        // Даем время на загрузку результатов
        await page.waitForTimeout(2000);
        return;
      }
    }

    // Пробуем отправить форму напрямую
    this.logger.debug('Submit button not found, trying form.submit()');
    await Promise.all([
      page.waitForLoadState('networkidle', { timeout: this.timeout }),
      page.evaluate(() => {
        const form = document.querySelector('form');
        if (form) form.submit();
      }),
    ]);
    await page.waitForTimeout(2000);
  }

  /**
   * Парсинг результата из HTML ответа
   */
  private parseResult(html: string): InnResultDto {
    const now = new Date().toISOString();
    const normalizedHtml = html.toLowerCase();

    // Ищем ИНН в ответе (12 цифр для физлиц)
    const innPatterns = [
      /инн[:\s]*(\d{12})/i,
      /inn[:\s]*(\d{12})/i,
      /результат[:\s]*(\d{12})/i,
      /<[^>]*inn[^>]*>(\d{12})</i,
      />\s*(\d{12})\s*</,
    ];

    for (const pattern of innPatterns) {
      const match = html.match(pattern);
      if (match?.[1]) {
        return {
          found: true,
          inn: match[1],
          source: InnCheckSource.FNS,
          checkedAt: now,
          message: 'ИНН успешно найден',
        };
      }
    }

    // Проверяем сообщения об отсутствии ИНН
    const notFoundIndicators = [
      'инн не найден',
      'не найден',
      'не зарегистрирован',
      'сведения отсутствуют',
      'не обнаружен',
      'данные не найдены',
    ];

    for (const indicator of notFoundIndicators) {
      if (normalizedHtml.includes(indicator)) {
        return {
          found: false,
          source: InnCheckSource.FNS,
          checkedAt: now,
          message: 'ИНН не найден в базе ФНС',
        };
      }
    }

    // Проверяем ошибки валидации
    const errorIndicators = ['ошибка', 'неверн', 'некорректн', 'error', 'invalid'];

    for (const indicator of errorIndicators) {
      if (normalizedHtml.includes(indicator)) {
        return {
          found: false,
          source: InnCheckSource.FNS,
          checkedAt: now,
          error: 'Ошибка при проверке данных на сайте ФНС',
        };
      }
    }

    // Не удалось определить результат
    this.logger.warn('Could not parse INN check result from response');
    return {
      found: false,
      source: InnCheckSource.FNS,
      checkedAt: now,
      error: 'Не удалось распознать ответ от сервиса ФНС',
    };
  }

  /**
   * Форматирование даты из ISO в DD.MM.YYYY
   */
  private formatDateToDDMMYYYY(isoDate: string): string {
    const [year, month, day] = isoDate.split('-');
    return `${day}.${month}.${year}`;
  }

  /**
   * Получение mock результата (для тестирования и отключенного сервиса)
   */
  private getMockResult(dto: GetInnDto): InnResultDto {
    const now = new Date().toISOString();

    // Генерируем детерминированный результат на основе номера документа
    const lastDigit = parseInt(dto.documentNumber.slice(-1), 10);
    const found = lastDigit < 8; // 80% шанс что ИНН найден

    if (found) {
      // Генерируем фейковый ИНН (12 цифр)
      const fakeInn = `7707${dto.documentNumber.padStart(8, '0').slice(-8)}`;
      return {
        found: true,
        inn: fakeInn,
        source: InnCheckSource.MOCK,
        checkedAt: now,
        message: 'ИНН найден (mock данные)',
      };
    }

    return {
      found: false,
      source: InnCheckSource.MOCK,
      checkedAt: now,
      message: 'ИНН не найден в базе ФНС (mock данные)',
    };
  }

  /**
   * Результат при graceful degradation
   */
  private getGracefulDegradationResult(): InnResultDto {
    return {
      found: false,
      source: InnCheckSource.FALLBACK,
      checkedAt: new Date().toISOString(),
      error:
        'Сервис проверки ИНН временно недоступен. Попробуйте позже или проверьте на официальном сайте ФНС: https://service.nalog.ru/inn.do',
    };
  }

  /**
   * Генерация ключа кэша
   */
  private getCacheKey(dto: GetInnDto): string {
    // Используем хэш от всех параметров для уникальности
    const key = `${dto.lastName}:${dto.firstName}:${dto.birthDate}:${dto.documentType}:${dto.documentSeries}:${dto.documentNumber}`;
    return `${this.CACHE_KEY_PREFIX}${key}`;
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
