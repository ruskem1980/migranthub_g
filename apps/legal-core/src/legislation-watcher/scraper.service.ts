import { Injectable, Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { BrowserService } from './browser.service';

export interface ScrapedLaw {
  title: string;
  sourceUrl: string;
  rawText: string;
  scrapedAt: Date;
  lastModified?: Date;
}

export interface LegislationSource {
  name: string;
  url: string;
  contentSelector: string;
  titleSelector: string;
  dateSelector?: string;
}

export interface SearchConfig {
  name: string;
  searchUrl: string; // с {keyword} placeholder
  resultSelector: string;
  linkAttribute?: string; // default: 'href'
  maxResults: number;
  baseUrl?: string; // для относительных ссылок
}

export interface SearchResult {
  title: string;
  url: string;
  source: string;
}

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  // Ключевые слова для поиска законодательства
  private readonly SEARCH_KEYWORDS = [
    '109-ФЗ миграционный учет',
    '115-ФЗ иностранные граждане',
    '62-ФЗ гражданство',
    '114-ФЗ въезд выезд',
    'КоАП 18.8 нарушение миграционного',
    'КоАП 18.9 принимающая сторона',
    'КоАП 18.10 незаконная трудовая',
    'патент иностранный работник',
    'миграционный учет 2026',
    'НК 227.1 НДФЛ патент',
  ];

  // Конфигурация поисковых страниц
  private readonly searchSources: SearchConfig[] = [
    {
      name: 'base.garant.ru',
      searchUrl: 'https://base.garant.ru/search/?q={keyword}',
      resultSelector: 'a.search-result__link, .search-result-item a, .search-results a[href*="/"], a[href*="garant.ru"]',
      maxResults: 5,
      baseUrl: 'https://base.garant.ru',
    },
    {
      name: 'consultant.ru',
      searchUrl: 'https://www.consultant.ru/search/?q={keyword}',
      resultSelector: '.search-result a, .document-link, a[href*="/document/"], .search-results__item a',
      maxResults: 5,
      baseUrl: 'https://www.consultant.ru',
    },
    {
      name: 'pravo.gov.ru',
      searchUrl: 'http://pravo.gov.ru/proxy/ips/?searchres=&bpas=cd00000&intelsearch={keyword}',
      resultSelector: 'a[href*="doc="], a[href*="docbody"], .result-item a, table a[href*="proxy/ips"]',
      maxResults: 5,
      baseUrl: 'http://pravo.gov.ru',
    },
  ];

  // Real URLs for migration-related legislation
  private readonly sources: LegislationSource[] = [
    // 109-ФЗ О миграционном учёте
    {
      name: 'pravo.gov.ru - 109-ФЗ',
      url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102108015',
      contentSelector: '#docbody, .docbody, .document-body, body',
      titleSelector: 'title, h1, .doc-title',
      dateSelector: '.doc-date, .date',
    },
    {
      name: 'consultant.ru - 109-ФЗ',
      url: 'https://www.consultant.ru/document/cons_doc_LAW_61569/',
      contentSelector: '.document-page__content, .doc-body, article, main',
      titleSelector: 'h1, .document-page__title, title',
      dateSelector: '.document-page__date, .date',
    },
    // 115-ФЗ Об иностранных гражданах
    {
      name: 'pravo.gov.ru - 115-ФЗ',
      url: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102084473',
      contentSelector: '#docbody, .docbody, .document-body, body',
      titleSelector: 'title, h1, .doc-title',
      dateSelector: '.doc-date, .date',
    },
    {
      name: 'consultant.ru - 115-ФЗ',
      url: 'https://www.consultant.ru/document/cons_doc_LAW_37868/',
      contentSelector: '.document-page__content, .doc-body, article, main',
      titleSelector: 'h1, .document-page__title, title',
      dateSelector: '.document-page__date, .date',
    },
    // Garant - изменения в законодательстве
    {
      name: 'garant.ru - Изменения в миграционном законодательстве',
      url: 'https://www.garant.ru/products/ipo/prime/doc/412750335/',
      contentSelector: '.doc-content, .article-content, article, main, .text',
      titleSelector: 'h1, .doc-title, title',
      dateSelector: '.doc-date, .date, .pub-date',
    },
    // КоАП статья 18.8 (нарушение правил въезда)
    {
      name: 'garant.ru - КоАП 18.8',
      url: 'https://base.garant.ru/12125267/888134b28b1397ffae77a02372ed70be/',
      contentSelector: '#doc_content, section.content, .doc-body, article',
      titleSelector: 'h1.long, h1.short, h1, title',
      dateSelector: '.doc-date',
    },
    // КоАП статья 18.9 (нарушения принимающей стороной)
    {
      name: 'garant.ru - КоАП 18.9',
      url: 'https://base.garant.ru/12125267/32e4c7439b4ab21f48e43701fa2c4584/',
      contentSelector: '#doc_content, section.content, .doc-body, article',
      titleSelector: 'h1.long, h1.short, h1, title',
      dateSelector: '.doc-date',
    },
    // КоАП статья 18.10 (незаконная трудовая деятельность)
    {
      name: 'garant.ru - КоАП 18.10',
      url: 'https://base.garant.ru/12125267/238e3b09bb6c5a55c0c5c683e9448bb4/',
      contentSelector: '#doc_content, section.content, .doc-body, article',
      titleSelector: 'h1.long, h1.short, h1, title',
      dateSelector: '.doc-date',
    },
    // КоАП статья 18.15 (незаконное привлечение к труду)
    {
      name: 'garant.ru - КоАП 18.15',
      url: 'https://base.garant.ru/12125267/0f2583f24a8a34c7ebf9ab3c7d3b9d69/',
      contentSelector: '#doc_content, section.content, .doc-body, article',
      titleSelector: 'h1.long, h1.short, h1, title',
      dateSelector: '.doc-date',
    },
    // 62-ФЗ О гражданстве Российской Федерации
    {
      name: 'consultant.ru - 62-ФЗ О гражданстве',
      url: 'https://www.consultant.ru/document/cons_doc_LAW_36927/',
      contentSelector: '.document-page__content, .doc-body, article, main',
      titleSelector: 'h1, .document-page__title, title',
      dateSelector: '.document-page__date, .date',
    },
    {
      name: 'garant.ru - 62-ФЗ О гражданстве',
      url: 'https://base.garant.ru/185698/',
      contentSelector: '#doc_content, section.content, .doc-body, article',
      titleSelector: 'h1.long, h1.short, h1, title',
      dateSelector: '.doc-date',
    },
    // 114-ФЗ О порядке выезда из РФ и въезда в РФ
    {
      name: 'consultant.ru - 114-ФЗ О въезде и выезде',
      url: 'https://www.consultant.ru/document/cons_doc_LAW_11376/',
      contentSelector: '.document-page__content, .doc-body, article, main',
      titleSelector: 'h1, .document-page__title, title',
      dateSelector: '.document-page__date, .date',
    },
    {
      name: 'garant.ru - 114-ФЗ О въезде и выезде',
      url: 'https://base.garant.ru/10135803/',
      contentSelector: '#doc_content, section.content, .doc-body, article',
      titleSelector: 'h1.long, h1.short, h1, title',
      dateSelector: '.doc-date',
    },
    // НК РФ статья 227.1 (патентный НДФЛ для иностранных работников)
    {
      name: 'garant.ru - НК РФ 227.1 патентный НДФЛ',
      url: 'https://base.garant.ru/10900200/3e22f1919bcadf030444e656a1e71053/',
      contentSelector: '#doc_content, section.content, .doc-body, article',
      titleSelector: 'h1.long, h1.short, h1, title',
      dateSelector: '.doc-date',
    },
    // Normativ Kontur
    {
      name: 'normativ.kontur.ru - Миграционный учёт',
      url: 'https://normativ.kontur.ru/document?moduleId=1&documentId=500958',
      contentSelector: '.document-content, .doc-body, article, main, .content',
      titleSelector: 'h1, .document-title, title',
      dateSelector: '.document-date, .date',
    },
  ];

  constructor(private readonly browserService: BrowserService) {}

  async scrapeAllSources(): Promise<ScrapedLaw[]> {
    const results: ScrapedLaw[] = [];
    const seenUrls = new Set<string>();

    // 1. Сначала парсим прямые URL (существующая логика)
    this.logger.log('=== Phase 1: Scraping direct URLs ===');
    for (const source of this.sources) {
      try {
        this.logger.log(`Scraping: ${source.name}`);
        const doc = await this.scrapeSource(source);
        if (doc) {
          results.push(doc);
          seenUrls.add(this.normalizeUrl(doc.sourceUrl));
          this.logger.log(`Successfully scraped: ${source.name} (${doc.rawText.length} chars)`);
        }
        // Be polite to servers
        await this.delay(2000);
      } catch (error) {
        this.logger.error(`Failed to scrape ${source.name}: ${error.message}`);
      }
    }

    // 2. Затем ищем через поисковые страницы (новая логика)
    this.logger.log('=== Phase 2: Scraping via search ===');
    const searchResults = await this.scrapeViaSearch(seenUrls);
    results.push(...searchResults);

    this.logger.log(`Total scraped documents: ${results.length}`);
    return results;
  }

  /**
   * Поиск документов через поисковые страницы сайтов
   */
  async scrapeViaSearch(existingUrls: Set<string>): Promise<ScrapedLaw[]> {
    const results: ScrapedLaw[] = [];
    const seenUrls = new Set<string>(existingUrls);

    for (const keyword of this.SEARCH_KEYWORDS) {
      this.logger.log(`Searching for: "${keyword}"`);

      for (const searchConfig of this.searchSources) {
        try {
          const searchResults = await this.searchSource(searchConfig, keyword);

          for (const result of searchResults) {
            const normalizedUrl = this.normalizeUrl(result.url);

            // Дедупликация по URL
            if (seenUrls.has(normalizedUrl)) {
              this.logger.debug(`Skipping duplicate: ${result.url}`);
              continue;
            }

            seenUrls.add(normalizedUrl);

            // Парсим найденный документ
            const doc = await this.scrapeDocumentDetails(result.url);
            if (doc && doc.rawText.length > 100) {
              results.push(doc);
              this.logger.log(`Found via search: ${doc.title.substring(0, 50)}... (${doc.rawText.length} chars)`);
            }

            // Задержка между запросами документов
            await this.delay(2000);
          }

          // Задержка между поисковыми запросами
          await this.delay(3000);
        } catch (error) {
          this.logger.warn(`Search failed on ${searchConfig.name} for "${keyword}": ${error.message}`);
        }
      }
    }

    this.logger.log(`Found ${results.length} new documents via search`);
    return results;
  }

  /**
   * Поиск по одному источнику
   */
  private async searchSource(config: SearchConfig, keyword: string): Promise<SearchResult[]> {
    const searchUrl = config.searchUrl.replace('{keyword}', encodeURIComponent(keyword));
    this.logger.debug(`Searching: ${searchUrl}`);

    try {
      const html = await this.browserService.fetchPage(searchUrl, config.resultSelector);
      const $ = cheerio.load(html);

      return this.extractSearchResults($, config);
    } catch (error) {
      this.logger.warn(`Failed to search ${config.name}: ${error.message}`);
      return [];
    }
  }

  /**
   * Извлечение ссылок из результатов поиска
   */
  private extractSearchResults($: cheerio.CheerioAPI, config: SearchConfig): SearchResult[] {
    const results: SearchResult[] = [];
    const selectors = config.resultSelector.split(', ');

    for (const selector of selectors) {
      $(selector).each((_, element) => {
        if (results.length >= config.maxResults) return false;

        const $el = $(element);
        const href = $el.attr(config.linkAttribute || 'href');
        const title = $el.text().trim() || $el.attr('title') || '';

        if (!href || href === '#' || href.startsWith('javascript:')) {
          return;
        }

        // Преобразуем относительные ссылки в абсолютные
        let absoluteUrl = href;
        if (href.startsWith('/')) {
          absoluteUrl = (config.baseUrl || '') + href;
        } else if (!href.startsWith('http')) {
          absoluteUrl = (config.baseUrl || '') + '/' + href;
        }

        // Фильтруем нерелевантные ссылки
        if (this.isRelevantUrl(absoluteUrl)) {
          results.push({
            title: title.substring(0, 200),
            url: absoluteUrl,
            source: config.name,
          });
        }
      });

      if (results.length >= config.maxResults) break;
    }

    this.logger.debug(`Extracted ${results.length} results from ${config.name}`);
    return results;
  }

  /**
   * Проверка релевантности URL
   */
  private isRelevantUrl(url: string): boolean {
    // Исключаем служебные страницы
    const excludePatterns = [
      /\/search\?/,
      /\/login/,
      /\/register/,
      /\/help/,
      /\/about/,
      /\/contacts?/,
      /javascript:/,
      /mailto:/,
      /#$/,
    ];

    for (const pattern of excludePatterns) {
      if (pattern.test(url)) {
        return false;
      }
    }

    // Включаем только ссылки на документы
    const includePatterns = [
      /garant\.ru.*\/\d+/,
      /consultant\.ru.*\/document\//,
      /pravo\.gov\.ru.*doc/,
      /pravo\.gov\.ru.*nd=/,
    ];

    for (const pattern of includePatterns) {
      if (pattern.test(url)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Нормализация URL для дедупликации
   */
  private normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Убираем trailing slash и параметры сессии
      let normalized = parsed.origin + parsed.pathname.replace(/\/$/, '');
      // Сохраняем важные query параметры
      const importantParams = ['nd', 'doc', 'documentId'];
      const params = new URLSearchParams();
      for (const param of importantParams) {
        const value = parsed.searchParams.get(param);
        if (value) {
          params.set(param, value);
        }
      }
      if (params.toString()) {
        normalized += '?' + params.toString();
      }
      return normalized.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  }

  private async scrapeSource(source: LegislationSource): Promise<ScrapedLaw | null> {
    try {
      const html = await this.browserService.fetchPage(source.url, source.contentSelector);
      const $ = cheerio.load(html);

      // Extract title from multiple possible selectors
      let title = '';
      for (const selector of source.titleSelector.split(', ')) {
        const found = $(selector).first().text().trim();
        if (found && found.length > 5) {
          title = this.cleanTitle(found);
          break;
        }
      }

      // Extract content from multiple possible selectors
      let content = '';
      for (const selector of source.contentSelector.split(', ')) {
        const found = $(selector).first().text().trim();
        if (found && found.length > 100) {
          content = found;
          break;
        }
      }

      // Fallback to body text
      if (!content || content.length < 100) {
        content = $('body').text().trim();
      }

      if (!content || content.length < 50) {
        this.logger.warn(`No meaningful content found for ${source.name}`);
        return null;
      }

      // Extract date if available
      let lastModified: Date | undefined;
      if (source.dateSelector) {
        for (const selector of source.dateSelector.split(', ')) {
          const dateText = $(selector).first().text().trim();
          if (dateText) {
            const parsed = this.parseRussianDate(dateText);
            if (parsed) {
              lastModified = parsed;
              break;
            }
          }
        }
      }

      return {
        title: title || source.name,
        sourceUrl: source.url,
        rawText: this.cleanContent(content),
        scrapedAt: new Date(),
        lastModified,
      };
    } catch (error) {
      this.logger.error(`Error scraping ${source.url}: ${error.message}`);
      return null;
    }
  }

  /**
   * Fetch detailed content for a specific document URL
   */
  async scrapeDocumentDetails(documentUrl: string): Promise<ScrapedLaw | null> {
    try {
      const html = await this.browserService.fetchPage(documentUrl);
      const $ = cheerio.load(html);

      // Try multiple selectors for title
      let title = '';
      const titleSelectors = ['h1.long', 'h1.short', 'h1', 'title', '.doctitle', '.document-title'];
      for (const selector of titleSelectors) {
        const found = $(selector).first().text().trim();
        if (found && found.length > 5) {
          title = this.cleanTitle(found);
          break;
        }
      }

      // Try multiple selectors for content
      let content = '';
      const contentSelectors = [
        '#doc_content',
        '#docbody',
        '.document-page__content',
        'section.content',
        '.docbody',
        '#document_text',
        'article',
        'main',
      ];
      for (const selector of contentSelectors) {
        const found = $(selector).text().trim();
        if (found && found.length > 50) {
          content = found;
          break;
        }
      }

      // Fallback to body
      if (!content) {
        content = $('body').text().trim();
      }

      if (!title && !content) {
        return null;
      }

      return {
        title: title || 'Untitled Document',
        sourceUrl: documentUrl,
        rawText: this.cleanContent(content),
        scrapedAt: new Date(),
      };
    } catch (error) {
      this.logger.warn(`Failed to scrape document ${documentUrl}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get list of available sources
   */
  getSources(): LegislationSource[] {
    return this.sources;
  }

  /**
   * Test connection to a URL
   */
  async testConnection(url: string): Promise<boolean> {
    try {
      await this.browserService.fetchPage(url);
      return true;
    } catch (error) {
      this.logger.error(`Connection test failed for ${url}: ${error.message}`);
      return false;
    }
  }

  private cleanTitle(text: string): string {
    return text
      .replace(/\s*\|\s*(ГАРАНТ|Консультант|КонсультантПлюс).*$/i, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 500);
  }

  private cleanContent(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .substring(0, 100000); // Limit content size
  }

  private parseRussianDate(text: string): Date | null {
    // Patterns: "01.01.2024", "1 января 2024"
    const patterns = [
      /(\d{1,2})\.(\d{1,2})\.(\d{4})/,
      /(\d{1,2})\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)\s+(\d{4})/i,
    ];

    const months: Record<string, number> = {
      января: 0,
      февраля: 1,
      марта: 2,
      апреля: 3,
      мая: 4,
      июня: 5,
      июля: 6,
      августа: 7,
      сентября: 8,
      октября: 9,
      ноября: 10,
      декабря: 11,
    };

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        if (match[2] in months) {
          return new Date(parseInt(match[3]), months[match[2]], parseInt(match[1]));
        } else {
          return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
        }
      }
    }
    return null;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
