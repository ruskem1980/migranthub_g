import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Page, BrowserContext } from 'playwright';
import { BrowserService, CaptchaSolverService } from '../../../common/services';
import { GibddQueryDto, GibddCheckType, GibddFine } from './dto';

/**
 * Результат проверки штрафов от ГИБДД
 */
export interface GibddCheckResult {
  hasFines: boolean;
  totalAmount?: number;
  fines: GibddFine[];
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
 * GibddClient - клиент для проверки штрафов через сайт ГИБДД.
 *
 * Особенности:
 * - Использует Playwright для взаимодействия с сайтом гибдд.рф/check/fines
 * - Поддерживает два режима: по СТС и по водительскому удостоверению
 * - Решает капчу через CaptchaSolverService
 * - Circuit breaker для защиты от каскадных сбоев
 * - Retry с exponential backoff
 */
@Injectable()
export class GibddClient implements OnModuleInit {
  private readonly logger = new Logger(GibddClient.name);

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
      'gibdd.serviceUrl',
      'https://xn--90adear.xn--p1ai/check/fines',
    );
    this.enabled = this.configService.get<boolean>('gibdd.enabled', false);
    this.timeout = this.configService.get<number>('gibdd.timeout', 30000);
    this.retryAttempts = this.configService.get<number>('gibdd.retryAttempts', 3);
    this.retryDelay = this.configService.get<number>('gibdd.retryDelay', 2000);
    this.circuitBreakerThreshold = this.configService.get<number>(
      'gibdd.circuitBreakerThreshold',
      5,
    );
    this.circuitBreakerResetTime = this.configService.get<number>(
      'gibdd.circuitBreakerResetTime',
      60000,
    );
  }

  onModuleInit(): void {
    this.logger.log(`GibddClient initialized: enabled=${this.enabled}, url=${this.serviceUrl}`);
  }

  /**
   * Проверка доступности сервиса
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Проверка штрафов ГИБДД
   */
  async checkFines(query: GibddQueryDto): Promise<GibddCheckResult> {
    // Проверка circuit breaker
    if (!this.canMakeRequest()) {
      this.logger.warn('Circuit breaker open, GIBDD request blocked');
      throw new Error('GIBDD service temporarily unavailable (circuit open)');
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        this.logger.debug(
          `Attempt ${attempt}/${this.retryAttempts} for GIBDD check: type=${query.checkType}`,
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
  private async executeCheck(query: GibddQueryDto): Promise<GibddCheckResult> {
    let page: Page | null = null;
    let context: BrowserContext | null = null;

    try {
      // Открываем страницу сервиса
      const result = await this.browserService.getInteractivePage(this.serviceUrl);
      page = result.page;
      context = result.context;

      // Ждем загрузки формы
      await page.waitForSelector('form, .check-form, #fines-form', { timeout: this.timeout });

      // Заполняем форму в зависимости от типа проверки
      if (query.checkType === GibddCheckType.STS) {
        await this.fillStsForm(page, query);
      } else {
        await this.fillLicenseForm(page, query);
      }

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
   * Заполнение формы проверки по СТС
   */
  private async fillStsForm(page: Page, query: GibddQueryDto): Promise<void> {
    this.logger.debug('Filling STS form...');

    // Выбираем вкладку "По СТС" если есть
    const stsTabSelectors = [
      'a:has-text("СТС"), button:has-text("СТС")',
      '[data-tab="sts"], [href="#sts"]',
      '.tab-sts, #tab-sts',
    ];

    for (const selector of stsTabSelectors) {
      try {
        const tab = await page.$(selector);
        if (tab) {
          await tab.click();
          await page.waitForTimeout(500);
          break;
        }
      } catch {
        // Продолжаем
      }
    }

    // Госномер
    const regNumberSelectors = [
      'input[name="regNumber"], input[name="rz"]',
      'input#regNumber, input#rz',
      'input[placeholder*="госномер"], input[placeholder*="номер"]',
    ];

    for (const selector of regNumberSelectors) {
      const input = await page.$(selector);
      if (input && query.regNumber) {
        await input.fill(query.regNumber.toUpperCase());
        break;
      }
    }

    // Номер СТС
    const stsSelectors = [
      'input[name="stsNumber"], input[name="sts"]',
      'input#stsNumber, input#sts',
      'input[placeholder*="СТС"], input[placeholder*="свидетельство"]',
    ];

    for (const selector of stsSelectors) {
      const input = await page.$(selector);
      if (input && query.stsNumber) {
        await input.fill(query.stsNumber);
        break;
      }
    }
  }

  /**
   * Заполнение формы проверки по водительскому удостоверению
   */
  private async fillLicenseForm(page: Page, query: GibddQueryDto): Promise<void> {
    this.logger.debug('Filling license form...');

    // Выбираем вкладку "По ВУ" если есть
    const licenseTabSelectors = [
      'a:has-text("ВУ"), button:has-text("ВУ")',
      'a:has-text("водительск"), button:has-text("водительск")',
      '[data-tab="license"], [href="#license"]',
      '.tab-license, #tab-license',
    ];

    for (const selector of licenseTabSelectors) {
      try {
        const tab = await page.$(selector);
        if (tab) {
          await tab.click();
          await page.waitForTimeout(500);
          break;
        }
      } catch {
        // Продолжаем
      }
    }

    // Номер ВУ
    const licenseSelectors = [
      'input[name="licenseNumber"], input[name="vu"]',
      'input#licenseNumber, input#vu',
      'input[placeholder*="ВУ"], input[placeholder*="удостоверен"]',
    ];

    for (const selector of licenseSelectors) {
      const input = await page.$(selector);
      if (input && query.licenseNumber) {
        await input.fill(query.licenseNumber);
        break;
      }
    }

    // Дата выдачи ВУ
    if (query.issueDate) {
      const dateSelectors = [
        'input[name="issueDate"], input[name="vuDate"]',
        'input#issueDate, input#vuDate',
        'input[type="date"][name*="date"]',
      ];

      const formattedDate = this.formatDate(query.issueDate);

      for (const selector of dateSelectors) {
        const input = await page.$(selector);
        if (input) {
          await input.fill(formattedDate);
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
      'button:has-text("Проверить"), button:has-text("Запросить")',
      'input[value="Проверить"], input[value="Запросить"]',
      '.check-btn, .btn-check, #checkButton',
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
  private parseResult(html: string): GibddCheckResult {
    const normalizedHtml = html.toLowerCase();
    const fines: GibddFine[] = [];
    let totalAmount = 0;

    // Индикаторы отсутствия штрафов
    const noFinesIndicators = [
      'штрафов не найдено',
      'штрафы не найдены',
      'нарушений не найдено',
      'нарушения не найдены',
      'по вашему запросу ничего не найдено',
      'данных не обнаружено',
      'задолженности нет',
      '0 штрафов',
    ];

    // Проверяем на отсутствие штрафов
    for (const indicator of noFinesIndicators) {
      if (normalizedHtml.includes(indicator)) {
        this.logger.log('No fines found');
        return {
          hasFines: false,
          totalAmount: 0,
          fines: [],
        };
      }
    }

    // Парсим штрафы из таблицы
    const tableRowPattern = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const matches = html.match(tableRowPattern) || [];

    for (const row of matches) {
      // Пропускаем строки заголовков
      if (row.includes('<th') || row.includes('class="header"')) {
        continue;
      }

      const fine = this.parseTableRow(row);
      if (fine) {
        fines.push(fine);
        if (fine.amount) {
          totalAmount += fine.amount;
        }
      }
    }

    // Если найдены штрафы
    if (fines.length > 0) {
      this.logger.log(`Found ${fines.length} fines, total: ${totalAmount}`);
      return {
        hasFines: true,
        totalAmount,
        fines,
      };
    }

    // Пробуем извлечь сумму из текста
    const amountMatch = html.match(/(?:сумма|итого)[^:]*:\s*([\d\s,.]+)\s*(руб|₽|рублей)/i);
    if (amountMatch) {
      const amount = parseFloat(amountMatch[1].replace(/\s/g, '').replace(',', '.'));
      if (!isNaN(amount) && amount > 0) {
        this.logger.log(`Found fines amount: ${amount}`);
        return {
          hasFines: true,
          totalAmount: amount,
          fines: [],
        };
      }
    }

    // Проверяем наличие индикаторов штрафов в тексте
    const hasFinesIndicators = ['штраф', 'нарушение', 'постановление', 'коап'];

    for (const indicator of hasFinesIndicators) {
      if (normalizedHtml.includes(indicator)) {
        // Пробуем извлечь количество штрафов
        const countMatch = html.match(/(\d+)\s*(?:штраф|нарушени)/i);
        if (countMatch) {
          const count = parseInt(countMatch[1], 10);
          if (count > 0) {
            this.logger.log(`Found ${count} fines indicator in page`);
            return {
              hasFines: true,
              totalAmount: 0,
              fines: [],
            };
          }
        }
      }
    }

    // Если не удалось определить - считаем что штрафов нет
    this.logger.debug('Could not determine fines status, assuming no fines');
    return {
      hasFines: false,
      totalAmount: 0,
      fines: [],
    };
  }

  /**
   * Парсинг строки таблицы со штрафом
   */
  private parseTableRow(row: string): GibddFine | null {
    // Извлекаем ячейки
    const cellPattern = /<td[^>]*>([\s\S]*?)<\/td>/gi;
    const cells: string[] = [];
    let match;

    while ((match = cellPattern.exec(row)) !== null) {
      // Очищаем HTML теги
      const text = match[1].replace(/<[^>]+>/g, '').trim();
      cells.push(text);
    }

    if (cells.length < 2) {
      return null;
    }

    // Парсим данные из ячеек
    const fine: GibddFine = {};

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];

      // Дата (формат DD.MM.YYYY)
      if (/^\d{2}\.\d{2}\.\d{4}$/.test(cell)) {
        if (!fine.date) {
          fine.date = this.parseDateToIso(cell);
        } else if (!fine.discountDeadline) {
          fine.discountDeadline = this.parseDateToIso(cell);
        }
      }

      // Статья КоАП (формат XX.X или XX.X ч.X)
      if (/^\d+\.\d+(\s*ч\.?\s*\d+)?$/i.test(cell)) {
        fine.article = cell;
      }

      // Сумма (число с копейками)
      const amountMatch = cell.match(/^[\d\s,.]+\s*(руб|₽)?$/);
      if (amountMatch) {
        const amount = parseFloat(cell.replace(/[^\d,.]/g, '').replace(',', '.'));
        if (!isNaN(amount) && amount > 0) {
          if (!fine.amount) {
            fine.amount = amount;
          } else if (!fine.discountAmount && amount < fine.amount) {
            fine.discountAmount = amount;
          }
        }
      }

      // УИН (20-25 цифр)
      if (/^\d{20,25}$/.test(cell)) {
        fine.uin = cell;
        fine.paymentUrl = `https://www.gosuslugi.ru/pay?uin=${cell}`;
      }

      // Описание нарушения
      if (
        cell.includes('превышение') ||
        cell.includes('проезд') ||
        cell.includes('парковк') ||
        cell.includes('нарушение') ||
        cell.length > 30
      ) {
        fine.description = cell;
      }

      // Место нарушения
      if (cell.includes('г.') || cell.includes('ул.') || cell.includes('пр.')) {
        fine.location = cell;
      }

      // Подразделение
      if (cell.includes('ГИБДД') || cell.includes('ЦАФАП') || cell.includes('ОДД')) {
        fine.department = cell;
      }
    }

    // Возвращаем только если есть хотя бы сумма или статья
    if (fine.amount || fine.article) {
      return fine;
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
