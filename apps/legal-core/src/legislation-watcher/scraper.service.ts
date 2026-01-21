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

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);
  private readonly axiosInstance: AxiosInstance;
  
  private readonly sources: ScraperSource[] = [
    {
      name: 'pravo.gov.ru',
      baseUrl: 'http://pravo.gov.ru',
      searchPath: '/search',
      keywords: ['миграционный учет', 'патент', '115-ФЗ'],
      selectors: {
        title: '.document-title',
        content: '.document-content',
        link: 'a.document-link'
      }
    },
    {
      name: 'base.garant.ru',
      baseUrl: 'https://base.garant.ru',
      searchPath: '/search',
      keywords: ['КоАП 18.8', 'миграционный учет', 'патент'],
      selectors: {
        title: 'h1, .doc-title',
        content: '.doc-content, .article-content',
        link: 'a[href*="/document/"]'
      }
    }
  ];

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'User-Agent': 'MigrantHub-LegalBot/1.0 (Legislation Monitoring)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ru-RU,ru;q=0.9'
      }
    });
  }

  async scrapeAllSources(): Promise<ScrapedLaw[]> {
    const allResults: ScrapedLaw[] = [];

    for (const source of this.sources) {
      try {
        this.logger.log(`Starting scrape for source: ${source.name}`);
        const results = await this.scrapeSource(source);
        allResults.push(...results);
        this.logger.log(`Scraped ${results.length} documents from ${source.name}`);
      } catch (error) {
        this.logger.error(`Failed to scrape ${source.name}: ${error.message}`, error.stack);
      }
    }

    return allResults;
  }

  private async scrapeSource(source: ScraperSource): Promise<ScrapedLaw[]> {
    const results: ScrapedLaw[] = [];

    for (const keyword of source.keywords) {
      try {
        const documents = await this.searchByKeyword(source, keyword);
        results.push(...documents);
        
        await this.delay(2000);
      } catch (error) {
        this.logger.warn(`Failed to search for keyword "${keyword}" in ${source.name}: ${error.message}`);
      }
    }

    return results;
  }

  private async searchByKeyword(source: ScraperSource, keyword: string): Promise<ScrapedLaw[]> {
    const searchUrl = `${source.baseUrl}${source.searchPath}?q=${encodeURIComponent(keyword)}`;
    
    try {
      const response = await this.axiosInstance.get(searchUrl);
      const $ = cheerio.load(response.data);
      
      const documents: ScrapedLaw[] = [];
      
      $(source.selectors.link || 'a').each((_, element) => {
        const $el = $(element);
        const href = $el.attr('href');
        
        if (href && this.isRelevantLink(href, keyword)) {
          const fullUrl = href.startsWith('http') ? href : `${source.baseUrl}${href}`;
          documents.push({
            title: $el.text().trim() || 'Untitled Document',
            sourceUrl: fullUrl,
            rawText: '',
            scrapedAt: new Date()
          });
        }
      });

      const detailedDocuments = await Promise.all(
        documents.slice(0, 10).map(doc => this.scrapeDocumentDetails(doc, source))
      );

      return detailedDocuments.filter(doc => doc.rawText.length > 0);
    } catch (error) {
      this.logger.error(`Search failed for keyword "${keyword}": ${error.message}`);
      return [];
    }
  }

  private async scrapeDocumentDetails(
    document: ScrapedLaw,
    source: ScraperSource
  ): Promise<ScrapedLaw> {
    try {
      const response = await this.axiosInstance.get(document.sourceUrl);
      const $ = cheerio.load(response.data);
      
      const title = $(source.selectors.title).first().text().trim() || document.title;
      const content = $(source.selectors.content).text().trim();
      
      return {
        ...document,
        title,
        rawText: content || 'Content not found',
        scrapedAt: new Date()
      };
    } catch (error) {
      this.logger.warn(`Failed to scrape document ${document.sourceUrl}: ${error.message}`);
      return document;
    }
  }

  private isRelevantLink(href: string, keyword: string): boolean {
    const relevantPatterns = [
      /document/i,
      /law/i,
      /legislation/i,
      /kodeks/i,
      /federal/i,
      /\d{2,3}-фз/i
    ];
    
    return relevantPatterns.some(pattern => pattern.test(href));
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
