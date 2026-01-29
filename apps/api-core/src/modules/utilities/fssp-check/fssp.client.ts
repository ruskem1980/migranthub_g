import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Page, BrowserContext } from 'playwright';
import { BrowserService, CaptchaSolverService } from '../../../common/services';
import { FsspQueryDto, ExecutiveProceeding } from './dto';

/**
 * Результат проверки задолженности от ФССП
 */
export interface FsspCheckResult {
  hasDebt: boolean;
  totalAmount?: number;
  execProceedings: ExecutiveProceeding[];
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
 * Коды регионов ФССП
 */
const REGION_CODES: Record<number, string> = {
  1: 'Республика Адыгея',
  2: 'Республика Башкортостан',
  3: 'Республика Бурятия',
  4: 'Республика Алтай',
  5: 'Республика Дагестан',
  6: 'Республика Ингушетия',
  7: 'Кабардино-Балкарская Республика',
  8: 'Республика Калмыкия',
  9: 'Карачаево-Черкесская Республика',
  10: 'Республика Карелия',
  11: 'Республика Коми',
  12: 'Республика Марий Эл',
  13: 'Республика Мордовия',
  14: 'Республика Саха (Якутия)',
  15: 'Республика Северная Осетия - Алания',
  16: 'Республика Татарстан',
  17: 'Республика Тыва',
  18: 'Удмуртская Республика',
  19: 'Республика Хакасия',
  20: 'Чеченская Республика',
  21: 'Чувашская Республика',
  22: 'Алтайский край',
  23: 'Краснодарский край',
  24: 'Красноярский край',
  25: 'Приморский край',
  26: 'Ставропольский край',
  27: 'Хабаровский край',
  28: 'Амурская область',
  29: 'Архангельская область',
  30: 'Астраханская область',
  31: 'Белгородская область',
  32: 'Брянская область',
  33: 'Владимирская область',
  34: 'Волгоградская область',
  35: 'Вологодская область',
  36: 'Воронежская область',
  37: 'Ивановская область',
  38: 'Иркутская область',
  39: 'Калининградская область',
  40: 'Калужская область',
  41: 'Камчатский край',
  42: 'Кемеровская область',
  43: 'Кировская область',
  44: 'Костромская область',
  45: 'Курганская область',
  46: 'Курская область',
  47: 'Ленинградская область',
  48: 'Липецкая область',
  49: 'Магаданская область',
  50: 'Московская область',
  51: 'Мурманская область',
  52: 'Нижегородская область',
  53: 'Новгородская область',
  54: 'Новосибирская область',
  55: 'Омская область',
  56: 'Оренбургская область',
  57: 'Орловская область',
  58: 'Пензенская область',
  59: 'Пермский край',
  60: 'Псковская область',
  61: 'Ростовская область',
  62: 'Рязанская область',
  63: 'Самарская область',
  64: 'Саратовская область',
  65: 'Сахалинская область',
  66: 'Свердловская область',
  67: 'Смоленская область',
  68: 'Тамбовская область',
  69: 'Тверская область',
  70: 'Томская область',
  71: 'Тульская область',
  72: 'Тюменская область',
  73: 'Ульяновская область',
  74: 'Челябинская область',
  75: 'Забайкальский край',
  76: 'Ярославская область',
  77: 'г. Москва',
  78: 'г. Санкт-Петербург',
  79: 'Еврейская автономная область',
  83: 'Ненецкий автономный округ',
  86: 'Ханты-Мансийский автономный округ - Югра',
  87: 'Чукотский автономный округ',
  89: 'Ямало-Ненецкий автономный округ',
  91: 'Республика Крым',
  92: 'г. Севастополь',
  99: 'Байконур',
};

/**
 * FsspClient - клиент для проверки задолженности через сайт ФССП.
 *
 * Особенности:
 * - Использует Playwright для взаимодействия с сайтом fssp.gov.ru/iss/ip
 * - Решает капчу через 2Captcha API
 * - Circuit breaker для защиты от каскадных сбоев
 * - Retry с exponential backoff
 */
@Injectable()
export class FsspClient implements OnModuleInit {
  private readonly logger = new Logger(FsspClient.name);

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
      'fssp.serviceUrl',
      'https://fssp.gov.ru/iss/ip',
    );
    this.enabled = this.configService.get<boolean>('fssp.enabled', false);
    this.timeout = this.configService.get<number>('fssp.timeout', 30000);
    this.retryAttempts = this.configService.get<number>('fssp.retryAttempts', 3);
    this.retryDelay = this.configService.get<number>('fssp.retryDelay', 2000);
    this.circuitBreakerThreshold = this.configService.get<number>(
      'fssp.circuitBreakerThreshold',
      5,
    );
    this.circuitBreakerResetTime = this.configService.get<number>(
      'fssp.circuitBreakerResetTime',
      60000,
    );
  }

  onModuleInit(): void {
    this.logger.log(`FsspClient initialized: enabled=${this.enabled}, url=${this.serviceUrl}`);
  }

  /**
   * Проверка доступности сервиса
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Проверка задолженности в ФССП
   */
  async checkDebt(query: FsspQueryDto): Promise<FsspCheckResult> {
    // Проверка circuit breaker
    if (!this.canMakeRequest()) {
      this.logger.warn('Circuit breaker open, FSSP request blocked');
      throw new Error('FSSP service temporarily unavailable (circuit open)');
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        this.logger.debug(
          `Attempt ${attempt}/${this.retryAttempts} for FSSP check: ${query.lastName} ${query.firstName}`,
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
  private async executeCheck(query: FsspQueryDto): Promise<FsspCheckResult> {
    let page: Page | null = null;
    let context: BrowserContext | null = null;

    try {
      // Открываем страницу сервиса
      const result = await this.browserService.getInteractivePage(this.serviceUrl);
      page = result.page;
      context = result.context;

      // Ждем загрузки формы
      await page.waitForSelector('form, .search-form, #searchForm, .ip-search', {
        timeout: this.timeout,
      });

      // Выбираем поиск по физическим лицам
      await this.selectPhysicalPersonSearch(page);

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
   * Выбор поиска по физическим лицам
   */
  private async selectPhysicalPersonSearch(page: Page): Promise<void> {
    this.logger.debug('Selecting physical person search...');

    // Пробуем разные варианты селектора для выбора типа поиска
    const selectors = [
      'input[value="physical"], input[name="searchType"][value="1"]',
      'label:has-text("физическ"), label:has-text("Физическ")',
      'a:has-text("физическ"), a:has-text("Физическ")',
      'button:has-text("физическ"), button:has-text("Физическ")',
      '#is_ip_extended', // Расширенный поиск
    ];

    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          await element.click();
          this.logger.debug(`Selected physical person search via: ${selector}`);
          await page.waitForTimeout(500);
          return;
        }
      } catch {
        // Продолжаем с другим селектором
      }
    }

    // Если не нашли селектор, предполагаем что поиск по физ.лицам уже выбран по умолчанию
    this.logger.debug('Physical person search selector not found, assuming default');
  }

  /**
   * Заполнение формы проверки задолженности ФССП
   */
  private async fillForm(page: Page, query: FsspQueryDto): Promise<void> {
    this.logger.debug('Filling FSSP debt check form...');

    // Выбор региона
    const regionSelect = await page.$(
      'select[name="region"], select[name="is[region_id]"], select#region, #is_region_id',
    );
    if (regionSelect) {
      const regionCode = query.region.toString().padStart(2, '0');
      try {
        await regionSelect.selectOption({ value: regionCode });
      } catch {
        // Пробуем выбрать по тексту
        const regionName = REGION_CODES[query.region];
        if (regionName) {
          try {
            await regionSelect.selectOption({ label: regionName });
          } catch {
            this.logger.warn(`Could not select region ${query.region}`);
          }
        }
      }
    }

    // Фамилия
    const lastNameSelectors = [
      'input[name="lastname"], input[name="is[lastname]"], input#lastname, input[name="fam"]',
    ];
    for (const selector of lastNameSelectors) {
      const input = await page.$(selector);
      if (input) {
        await input.fill(query.lastName);
        break;
      }
    }

    // Имя
    const firstNameSelectors = [
      'input[name="firstname"], input[name="is[firstname]"], input#firstname, input[name="nam"]',
    ];
    for (const selector of firstNameSelectors) {
      const input = await page.$(selector);
      if (input) {
        await input.fill(query.firstName);
        break;
      }
    }

    // Отчество (опционально)
    if (query.middleName) {
      const middleNameSelectors = [
        'input[name="secondname"], input[name="is[secondname]"], input#secondname, input[name="otch"]',
      ];
      for (const selector of middleNameSelectors) {
        const input = await page.$(selector);
        if (input) {
          await input.fill(query.middleName);
          break;
        }
      }
    }

    // Дата рождения
    const birthDateSelectors = [
      'input[name="birthdate"], input[name="is[date]"], input#birthdate, input[name="dat"]',
    ];
    const formattedDate = this.formatDate(query.birthDate);
    for (const selector of birthDateSelectors) {
      const input = await page.$(selector);
      if (input) {
        await input.fill(formattedDate);
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
      'img.captcha, img[name="captcha"], #captchaImage, img[src*="captcha"], .captcha-img, img[alt*="captcha"]',
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
      'input[name="captcha"], input[name="code"], input[name="captchaCode"]',
      '#captchaInput, input#captcha, .captcha-input',
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
      'button[type="submit"], input[type="submit"]',
      'button:has-text("Найти"), button:has-text("Поиск"), button:has-text("найти")',
      'input[value="Найти"], input[value="Поиск"]',
      '.search-btn, .btn-search, #searchButton',
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
  private parseResult(html: string): FsspCheckResult {
    const normalizedHtml = html.toLowerCase();
    const execProceedings: ExecutiveProceeding[] = [];
    let totalAmount = 0;

    // Индикаторы отсутствия задолженности
    const noDebtIndicators = [
      'по вашему запросу ничего не найдено',
      'данных не обнаружено',
      'информация отсутствует',
      'записей не найдено',
      'ничего не найдено',
      'нет данных',
      'результатов не найдено',
    ];

    // Проверяем на отсутствие задолженности
    for (const indicator of noDebtIndicators) {
      if (normalizedHtml.includes(indicator)) {
        this.logger.log('No debt found');
        return {
          hasDebt: false,
          totalAmount: 0,
          execProceedings: [],
        };
      }
    }

    // Парсим исполнительные производства
    // Ищем таблицу с результатами
    const tableRowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const matches = html.match(tableRowPattern) || [];

    for (const row of matches) {
      // Пропускаем строки заголовков
      if (row.includes('<th') || row.includes('class="header"')) {
        continue;
      }

      const proceeding = this.parseTableRow(row);
      if (proceeding) {
        execProceedings.push(proceeding);
        if (proceeding.amount) {
          totalAmount += proceeding.amount;
        }
      }
    }

    // Если найдены производства, значит есть долг
    if (execProceedings.length > 0) {
      this.logger.log(
        `Found ${execProceedings.length} executive proceedings, total: ${totalAmount}`,
      );
      return {
        hasDebt: true,
        totalAmount,
        execProceedings,
      };
    }

    // Пробуем извлечь сумму из текста
    const amountMatch = html.match(/сумма[^:]*:\s*([\d\s,.]+)\s*(руб|₽|рублей)/i);
    if (amountMatch) {
      const amount = parseFloat(amountMatch[1].replace(/\s/g, '').replace(',', '.'));
      if (!isNaN(amount) && amount > 0) {
        this.logger.log(`Found debt amount: ${amount}`);
        return {
          hasDebt: true,
          totalAmount: amount,
          execProceedings: [],
        };
      }
    }

    // Проверяем наличие индикаторов долга в тексте
    const hasDebtIndicators = [
      'исполнительное производство',
      'судебный пристав',
      'взыскатель',
      'должник',
    ];

    for (const indicator of hasDebtIndicators) {
      if (normalizedHtml.includes(indicator)) {
        this.logger.log('Debt indicators found in page');
        return {
          hasDebt: true,
          totalAmount: 0,
          execProceedings: [],
        };
      }
    }

    // Если не удалось определить - считаем что долга нет
    this.logger.debug('Could not determine debt status, assuming no debt');
    return {
      hasDebt: false,
      totalAmount: 0,
      execProceedings: [],
    };
  }

  /**
   * Парсинг строки таблицы с исполнительным производством
   */
  private parseTableRow(row: string): ExecutiveProceeding | null {
    // Извлекаем ячейки
    const cellPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells: string[] = [];
    let match;

    while ((match = cellPattern.exec(row)) !== null) {
      // Очищаем HTML теги
      const text = match[1].replace(/<[^>]+>/g, '').trim();
      cells.push(text);
    }

    if (cells.length < 3) {
      return null;
    }

    // Парсим данные из ячеек (структура может отличаться)
    const proceeding: ExecutiveProceeding = {};

    // Пробуем определить структуру данных
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];

      // Номер ИП (содержит /ИП или формат XXXXX/YY/ZZZZZ-ИП)
      if (cell.includes('ИП') || /\d{5,}\/\d{2}\/\d+/.test(cell)) {
        proceeding.number = cell;
      }

      // Дата (формат DD.MM.YYYY)
      if (/^\d{2}\.\d{2}\.\d{4}$/.test(cell)) {
        if (!proceeding.date) {
          proceeding.date = this.parseDateToIso(cell);
        }
      }

      // Сумма (число с копейками)
      const amountMatch = cell.match(/^[\d\s,.]+$/);
      if (amountMatch) {
        const amount = parseFloat(cell.replace(/\s/g, '').replace(',', '.'));
        if (!isNaN(amount) && amount > 0) {
          proceeding.amount = amount;
        }
      }

      // Предмет исполнения
      if (
        cell.includes('долг') ||
        cell.includes('пошлин') ||
        cell.includes('штраф') ||
        cell.includes('алимент') ||
        cell.includes('налог')
      ) {
        proceeding.subject = cell;
      }

      // Отдел судебных приставов
      if (cell.includes('ОСП') || cell.includes('отдел')) {
        proceeding.department = cell;
      }

      // Пристав (ФИО)
      if (/^[А-ЯЁ][а-яё]+\s+[А-ЯЁ]\.[А-ЯЁ]\.?$/u.test(cell)) {
        proceeding.bailiff = cell;
      }
    }

    // Возвращаем только если есть хотя бы номер или сумма
    if (proceeding.number || proceeding.amount) {
      return proceeding;
    }

    return null;
  }

  /**
   * Преобразование даты из DD.MM.YYYY в ISO формат
   */
  private parseDateToIso(dateStr: string): string {
    const [day, month, year] = dateStr.split('.');
    return `${year}-${month}-${day}`;
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
