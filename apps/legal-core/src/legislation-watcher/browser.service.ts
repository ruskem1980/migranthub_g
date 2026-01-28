import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { chromium, Browser, Page } from 'playwright';

@Injectable()
export class BrowserService implements OnModuleDestroy {
  private readonly logger = new Logger(BrowserService.name);
  private browser: Browser | null = null;

  async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.logger.log('Launching Playwright browser...');
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  async fetchPage(url: string, waitSelector?: string): Promise<string> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      this.logger.debug(`Fetching: ${url}`);

      // Set realistic user agent
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
      });

      await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: 30000,
      });

      if (waitSelector) {
        await page.waitForSelector(waitSelector, { timeout: 10000 }).catch(() => {
          this.logger.warn(`Selector ${waitSelector} not found on ${url}`);
        });
      }

      // Additional pause for JS rendering
      await page.waitForTimeout(2000);

      return await page.content();
    } catch (error) {
      this.logger.error(`Failed to fetch ${url}: ${error.message}`);
      throw error;
    } finally {
      await page.close();
    }
  }

  async onModuleDestroy() {
    if (this.browser) {
      this.logger.log('Closing Playwright browser...');
      await this.browser.close();
      this.browser = null;
    }
  }
}
