import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { chromium, Browser, Page, BrowserContext } from 'playwright';

/**
 * BrowserService - сервис для работы с браузером через Playwright.
 *
 * Используется для веб-скрейпинга сайтов с JavaScript-рендерингом,
 * включая работу с капчами и формами.
 */
@Injectable()
export class BrowserService implements OnModuleDestroy {
  private readonly logger = new Logger(BrowserService.name);
  private browser: Browser | null = null;

  private readonly headless: boolean;
  private readonly navigationTimeout: number;
  private readonly selectorTimeout: number;

  constructor(private readonly configService: ConfigService) {
    this.headless = this.configService.get<boolean>(
      'patentCheck.browser.headless',
      true,
    );
    this.navigationTimeout = this.configService.get<number>(
      'patentCheck.browser.navigationTimeout',
      30000,
    );
    this.selectorTimeout = this.configService.get<number>(
      'patentCheck.browser.selectorTimeout',
      10000,
    );
  }

  /**
   * Получение экземпляра браузера (lazy initialization)
   */
  async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.logger.log('Launching Playwright browser...');
      this.browser = await chromium.launch({
        headless: this.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
        ],
      });
    }
    return this.browser;
  }

  /**
   * Создание нового контекста браузера
   */
  async createContext(): Promise<BrowserContext> {
    const browser = await this.getBrowser();
    return browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'ru-RU',
      extraHTTPHeaders: {
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
      },
    });
  }

  /**
   * Создание новой страницы в контексте
   */
  async createPage(context?: BrowserContext): Promise<Page> {
    const ctx = context || (await this.createContext());
    const page = await ctx.newPage();

    // Установка таймаутов по умолчанию
    page.setDefaultTimeout(this.selectorTimeout);
    page.setDefaultNavigationTimeout(this.navigationTimeout);

    return page;
  }

  /**
   * Простое получение HTML страницы
   */
  async fetchPage(url: string, waitSelector?: string): Promise<string> {
    const context = await this.createContext();
    const page = await this.createPage(context);

    try {
      this.logger.debug(`Fetching: ${url}`);

      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.navigationTimeout,
      });

      if (waitSelector) {
        await page
          .waitForSelector(waitSelector, { timeout: this.selectorTimeout })
          .catch(() => {
            this.logger.warn(`Selector ${waitSelector} not found on ${url}`);
          });
      }

      // Дополнительная пауза для JS рендеринга
      await page.waitForTimeout(2000);

      return await page.content();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to fetch ${url}: ${errorMessage}`);
      throw error;
    } finally {
      await page.close();
      await context.close();
    }
  }

  /**
   * Получение страницы с возможностью взаимодействия (возвращает page и context)
   */
  async getInteractivePage(
    url: string,
  ): Promise<{ page: Page; context: BrowserContext }> {
    const context = await this.createContext();
    const page = await this.createPage(context);

    try {
      this.logger.debug(`Opening interactive page: ${url}`);

      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.navigationTimeout,
      });

      return { page, context };
    } catch (error) {
      await page.close();
      await context.close();
      throw error;
    }
  }

  /**
   * Получение скриншота (для отладки и решения капчи)
   */
  async getScreenshot(page: Page): Promise<Buffer> {
    return page.screenshot({ type: 'png' });
  }

  /**
   * Получение скриншота элемента по селектору
   */
  async getElementScreenshot(
    page: Page,
    selector: string,
  ): Promise<Buffer | null> {
    try {
      const element = await page.waitForSelector(selector, {
        timeout: this.selectorTimeout,
      });
      if (element) {
        return (await element.screenshot({ type: 'png' })) as Buffer;
      }
      return null;
    } catch {
      this.logger.warn(`Element ${selector} not found for screenshot`);
      return null;
    }
  }

  /**
   * Закрытие страницы и контекста
   */
  async closePage(page: Page, context: BrowserContext): Promise<void> {
    try {
      await page.close();
      await context.close();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(`Error closing page/context: ${errorMessage}`);
    }
  }

  /**
   * Очистка при завершении модуля
   */
  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      this.logger.log('Closing Playwright browser...');
      await this.browser.close();
      this.browser = null;
    }
  }
}
