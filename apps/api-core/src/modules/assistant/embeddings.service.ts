import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import OpenAI from 'openai';
import { KnowledgeEmbedding } from './entities';
import { KNOWLEDGE_BASE, KnowledgeItem } from './data/knowledge-base';

export interface SearchResult {
  knowledgeId: string;
  category: string;
  question: { ru: string; en: string };
  answer: { ru: string; en: string };
  tags: string[];
  legalReference: string | null;
  similarity: number;
}

@Injectable()
export class EmbeddingsService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingsService.name);
  private readonly openai: OpenAI;
  private readonly embeddingModel = 'text-embedding-3-small';
  private isInitialized = false;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(KnowledgeEmbedding)
    private readonly embeddingRepository: Repository<KnowledgeEmbedding>,
    private readonly dataSource: DataSource,
  ) {
    const apiKey = this.configService.get<string>('openai.apiKey');

    this.openai = new OpenAI({
      apiKey: apiKey || '',
    });

    if (!apiKey) {
      this.logger.warn('OpenAI API key not configured. Embeddings service will not work.');
    }
  }

  async onModuleInit(): Promise<void> {
    try {
      // Check if pgvector extension exists
      await this.initializePgVector();

      // Sync knowledge base on startup (in development)
      const nodeEnv = this.configService.get<string>('app.nodeEnv');
      if (nodeEnv === 'development') {
        await this.syncKnowledgeBase();
      }

      this.isInitialized = true;
      this.logger.log('EmbeddingsService initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize embeddings service: ${error}`);
    }
  }

  /**
   * Initialize pgvector extension if not exists
   */
  private async initializePgVector(): Promise<void> {
    try {
      await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS vector');
      this.logger.log('pgvector extension enabled');
    } catch (error) {
      this.logger.warn(`pgvector may not be available: ${error}`);
    }
  }

  /**
   * Generate embedding vector for text
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: text.slice(0, 8000), // Limit input size
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error(`Failed to generate embedding: ${error}`);
      throw error;
    }
  }

  /**
   * Sync knowledge base with embeddings table
   */
  async syncKnowledgeBase(): Promise<{ added: number; updated: number }> {
    this.logger.log('Syncing knowledge base...');

    let added = 0;
    let updated = 0;

    for (const item of KNOWLEDGE_BASE) {
      try {
        let existing = await this.embeddingRepository.findOne({
          where: { knowledgeId: item.id },
        });

        const contentRu = `${item.question.ru}\n\n${item.answer.ru}`;
        const contentEn = `${item.question.en}\n\n${item.answer.en}`;

        const needsUpdate = !existing ||
          existing.questionRu !== item.question.ru ||
          existing.answerRu !== item.answer.ru;

        if (!existing) {
          existing = this.embeddingRepository.create({
            knowledgeId: item.id,
            category: item.category,
            questionRu: item.question.ru,
            questionEn: item.question.en,
            answerRu: item.answer.ru,
            answerEn: item.answer.en,
            tags: item.tags,
            legalReference: item.legalReference || null,
          });
          added++;
        } else if (needsUpdate) {
          existing.category = item.category;
          existing.questionRu = item.question.ru;
          existing.questionEn = item.question.en;
          existing.answerRu = item.answer.ru;
          existing.answerEn = item.answer.en;
          existing.tags = item.tags;
          existing.legalReference = item.legalReference || null;
          updated++;
        } else {
          // No changes needed
          continue;
        }

        // Generate embeddings if missing or content changed
        if (needsUpdate || !existing.embeddingRu) {
          try {
            const embeddingRu = await this.generateEmbedding(contentRu);
            const embeddingEn = await this.generateEmbedding(contentEn);

            existing.embeddingRu = JSON.stringify(embeddingRu);
            existing.embeddingEn = JSON.stringify(embeddingEn);
          } catch (error) {
            this.logger.warn(`Failed to generate embedding for ${item.id}: ${error}`);
          }
        }

        await this.embeddingRepository.save(existing);
      } catch (error) {
        this.logger.error(`Failed to sync item ${item.id}: ${error}`);
      }
    }

    this.logger.log(`Knowledge base synced: ${added} added, ${updated} updated`);
    return { added, updated };
  }

  /**
   * Search knowledge base using vector similarity
   */
  async searchSimilar(
    query: string,
    lang: 'ru' | 'en' = 'ru',
    limit: number = 5,
  ): Promise<SearchResult[]> {
    // If pgvector not available, fallback to text search
    if (!this.isInitialized) {
      return this.fallbackTextSearch(query, lang, limit);
    }

    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);

      // For now, use text-based search since pgvector requires specific column type
      // In production, this would use cosine similarity with the vector column
      return this.fallbackTextSearch(query, lang, limit);
    } catch (error) {
      this.logger.error(`Vector search failed, using fallback: ${error}`);
      return this.fallbackTextSearch(query, lang, limit);
    }
  }

  /**
   * Fallback text-based search when vector search is unavailable
   */
  private async fallbackTextSearch(
    query: string,
    lang: 'ru' | 'en',
    limit: number,
  ): Promise<SearchResult[]> {
    const normalizedQuery = query.toLowerCase().trim();
    const keywords = normalizedQuery.split(/\s+/).filter((k) => k.length > 2);

    if (keywords.length === 0) {
      return [];
    }

    const embeddings = await this.embeddingRepository.find();

    const results = embeddings
      .map((embedding) => {
        const searchText = lang === 'ru'
          ? `${embedding.questionRu} ${embedding.answerRu} ${(embedding.tags || []).join(' ')}`
          : `${embedding.questionEn} ${embedding.answerEn} ${(embedding.tags || []).join(' ')}`;

        const searchTextLower = searchText.toLowerCase();
        const matchCount = keywords.filter((k) => searchTextLower.includes(k)).length;
        const similarity = matchCount / keywords.length;

        return {
          knowledgeId: embedding.knowledgeId,
          category: embedding.category,
          question: { ru: embedding.questionRu, en: embedding.questionEn },
          answer: { ru: embedding.answerRu, en: embedding.answerEn },
          tags: embedding.tags || [],
          legalReference: embedding.legalReference,
          similarity,
        };
      })
      .filter((r) => r.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return results;
  }

  /**
   * Get all embeddings for a category
   */
  async getByCategory(category: string): Promise<SearchResult[]> {
    const embeddings = await this.embeddingRepository.find({
      where: { category },
    });

    return embeddings.map((e) => ({
      knowledgeId: e.knowledgeId,
      category: e.category,
      question: { ru: e.questionRu, en: e.questionEn },
      answer: { ru: e.answerRu, en: e.answerEn },
      tags: e.tags || [],
      legalReference: e.legalReference,
      similarity: 1,
    }));
  }

  /**
   * Get single knowledge item by ID
   */
  async getById(knowledgeId: string): Promise<SearchResult | null> {
    const embedding = await this.embeddingRepository.findOne({
      where: { knowledgeId },
    });

    if (!embedding) {
      return null;
    }

    return {
      knowledgeId: embedding.knowledgeId,
      category: embedding.category,
      question: { ru: embedding.questionRu, en: embedding.questionEn },
      answer: { ru: embedding.answerRu, en: embedding.answerEn },
      tags: embedding.tags || [],
      legalReference: embedding.legalReference,
      similarity: 1,
    };
  }
}
