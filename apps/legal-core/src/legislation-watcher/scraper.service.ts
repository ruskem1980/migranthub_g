import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedLaw {
  title: string;
  sourceUrl: string;
  rawText: string;
  scrapedAt: Date;
}

export interface ScraperSource {
  name: string;
  baseUrl: string;
  searchPath: string;
  keywords: string[];
  selectors: {
    title: string;
    content: string;
    link?: string;
  };
}

// Well-known document IDs for migration-related laws on base.garant.ru
const GARANT_KNOWN_DOCUMENTS = [
  { id: '184755', name: '115-ФЗ О правовом положении иностранных граждан' },
  { id: '12148419', name: '109-ФЗ О миграционном учете иностранных граждан' },
  { id: '12125267', name: 'КоАП РФ (Кодекс об административных правонарушениях)' },
];

// Well-known document paths for pravo.gov.ru IPS (Законодательство России)
const PRAVO_KNOWN_SEARCHES = [
  { query: '115-ФЗ', description: 'О правовом положении иностранных граждан' },
  { query: '109-ФЗ', description: 'О миграционном учете' },
  { query: 'миграционный учет', description: 'Документы по миграционному учету' },
];

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private readonly axiosInstance: AxiosInstance;

  private readonly sources: ScraperSource[] = [
    {
      name: 'pravo.gov.ru',
      baseUrl: 'http://pravo.gov.ru',
      searchPath: '/proxy/ips/',
      keywords: ['115-ФЗ', '109-ФЗ', 'миграционный учет'],
      selectors: {
        // pravo.gov.ru uses frames, search results are in searchlist frame
        title: 'a.npa_title, .doctitle, span.sh1',
        content: '.document-text, .docbody, #document_text',
        link: 'a[href*="doc="], a[href*="docbody="]'
      }
    },
    {
      name: 'base.garant.ru',
      baseUrl: 'https://base.garant.ru',
      searchPath: '/',
      keywords: ['115-ФЗ', '109-ФЗ', 'КоАП 18.8'],
      selectors: {
        // Garant uses title tag and h1 for document title
        title: 'h1.long, h1.short, h1, title',
        content: '#doc_content, section.content, .breadcrumps + div',
        link: 'a[href^="/"][href$="/"]'
      }
    }
  ];

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MigrantHub-LegalBot/1.0; +https://migranthub.ru/bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive'
      },
      // Handle various response encodings
      responseType: 'arraybuffer',
      transformResponse: [(data) => {
        // Try to decode as UTF-8 first, fall back to windows-1251
        try {
          const decoder = new TextDecoder('utf-8', { fatal: true });
          return decoder.decode(data);
        } catch {
          try {
            const decoder = new TextDecoder('windows-1251');
            return decoder.decode(data);
          } catch {
            return data.toString();
          }
        }
      }]
    });
  }

  async scrapeAllSources(): Promise<ScrapedLaw[]> {
    const allResults: ScrapedLaw[] = [];

    // First, scrape known documents from Garant (more reliable)
    try {
      this.logger.log('Scraping known documents from base.garant.ru');
      const garantResults = await this.scrapeKnownGarantDocuments();
      allResults.push(...garantResults);
      this.logger.log(`Scraped ${garantResults.length} documents from Garant`);
    } catch (error) {
      this.logger.error(`Failed to scrape Garant: ${error.message}`, error.stack);
    }

    // Then try pravo.gov.ru search
    try {
      this.logger.log('Searching documents on pravo.gov.ru');
      const pravoResults = await this.scrapePravoGov();
      allResults.push(...pravoResults);
      this.logger.log(`Scraped ${pravoResults.length} documents from Pravo.gov.ru`);
    } catch (error) {
      this.logger.error(`Failed to scrape Pravo.gov.ru: ${error.message}`, error.stack);
    }

    return allResults;
  }

  /**
   * Scrape known migration-related documents from base.garant.ru
   * Uses direct document URLs which are more reliable than search
   */
  private async scrapeKnownGarantDocuments(): Promise<ScrapedLaw[]> {
    const results: ScrapedLaw[] = [];
    const source = this.sources.find(s => s.name === 'base.garant.ru')!;

    for (const doc of GARANT_KNOWN_DOCUMENTS) {
      try {
        const url = `${source.baseUrl}/${doc.id}/`;
        this.logger.debug(`Fetching Garant document: ${url}`);

        const response = await this.axiosInstance.get(url);
        const $ = cheerio.load(response.data);

        // Extract title from multiple possible locations
        let title = '';
        const titleSelectors = ['h1.long', 'h1.short', 'h1', 'title'];
        for (const selector of titleSelectors) {
          const found = $(selector).first().text().trim();
          if (found && found.length > 10) {
            title = found.replace(/\s*\|\s*ГАРАНТ$/, '').trim();
            break;
          }
        }

        // Extract document structure/content
        let content = '';
        const contentEl = $('#doc_content');
        if (contentEl.length) {
          // Get all article/section links text
          contentEl.find('li a').each((_, el) => {
            const text = $(el).text().trim();
            if (text) {
              content += text + '\n';
            }
          });
        }

        // Fallback to meta description
        if (!content) {
          content = $('meta[name="description"]').attr('content') || '';
        }

        if (title) {
          results.push({
            title: title || doc.name,
            sourceUrl: url,
            rawText: content || `Документ: ${doc.name}`,
            scrapedAt: new Date()
          });
        }

        await this.delay(1500); // Be polite to servers
      } catch (error) {
        this.logger.warn(`Failed to fetch Garant document ${doc.id}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Search and scrape documents from pravo.gov.ru IPS system
   */
  private async scrapePravoGov(): Promise<ScrapedLaw[]> {
    const results: ScrapedLaw[] = [];
    const source = this.sources.find(s => s.name === 'pravo.gov.ru')!;

    for (const search of PRAVO_KNOWN_SEARCHES) {
      try {
        // pravo.gov.ru uses a specific search URL format
        const searchUrl = `${source.baseUrl}${source.searchPath}?searchlist=&bpas=cd00000&intelsearch=${encodeURIComponent(search.query)}`;
        this.logger.debug(`Searching Pravo.gov.ru: ${searchUrl}`);

        const response = await this.axiosInstance.get(searchUrl);
        const $ = cheerio.load(response.data);

        // Extract search results - pravo.gov.ru returns a list with links
        const documentLinks: { href: string; title: string }[] = [];

        // Try various selectors for search results
        $('a[href*="doc="], a[href*="docbody="], .doctitle a, table.menu_workspace a').each((_, el) => {
          const href = $(el).attr('href');
          const title = $(el).text().trim();
          if (href && title && title.length > 5) {
            documentLinks.push({ href, title });
          }
        });

        // Process first few results
        for (const link of documentLinks.slice(0, 5)) {
          const fullUrl = link.href.startsWith('http')
            ? link.href
            : `${source.baseUrl}${source.searchPath}${link.href.replace(/^\?/, '')}`;

          results.push({
            title: link.title,
            sourceUrl: fullUrl,
            rawText: `${search.description}: ${link.title}`,
            scrapedAt: new Date()
          });
        }

        await this.delay(2000);
      } catch (error) {
        this.logger.warn(`Failed to search Pravo.gov.ru for "${search.query}": ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Fetch detailed content for a specific document URL
   * Can be used to get full text of a document after initial scraping
   */
  async scrapeDocumentDetails(documentUrl: string): Promise<ScrapedLaw | null> {
    try {
      const response = await this.axiosInstance.get(documentUrl);
      const $ = cheerio.load(response.data);

      // Try multiple selectors for title
      let title = '';
      const titleSelectors = ['h1.long', 'h1.short', 'h1', 'title', '.doctitle'];
      for (const selector of titleSelectors) {
        const found = $(selector).first().text().trim();
        if (found && found.length > 5) {
          title = found.replace(/\s*\|\s*ГАРАНТ$/, '').trim();
          break;
        }
      }

      // Try multiple selectors for content
      let content = '';
      const contentSelectors = ['#doc_content', 'section.content', '.docbody', '#document_text'];
      for (const selector of contentSelectors) {
        const found = $(selector).text().trim();
        if (found && found.length > 50) {
          content = found;
          break;
        }
      }

      // Fallback to meta description
      if (!content) {
        content = $('meta[name="description"]').attr('content') || '';
      }

      if (!title && !content) {
        return null;
      }

      return {
        title: title || 'Untitled Document',
        sourceUrl: documentUrl,
        rawText: content || 'Content not found',
        scrapedAt: new Date()
      };
    } catch (error) {
      this.logger.warn(`Failed to scrape document ${documentUrl}: ${error.message}`);
      return null;
    }
  }

  /**
   * Get list of available sources for external reference
   */
  getSources(): ScraperSource[] {
    return this.sources;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async testConnection(url: string): Promise<boolean> {
    try {
      const response = await this.axiosInstance.get(url);
      return response.status === 200;
    } catch (error) {
      this.logger.error(`Connection test failed for ${url}: ${error.message}`);
      return false;
    }
  }
}
