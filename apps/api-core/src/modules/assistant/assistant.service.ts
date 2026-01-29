import {
  Injectable,
  Logger,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import {
  SendMessageDto,
  AssistantResponseDto,
  ChatRequestDto,
  ChatResponseDto,
  ContextDocumentDto,
} from './dto';
import { EmbeddingsService, SearchResult } from './embeddings.service';
import { CircuitBreakerService } from './circuit-breaker.service';
import { PiiFilterService } from './pii-filter.service';

interface AssistantSession {
  id: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  lastActivityAt: Date;
}

interface AIResponse {
  response: string;
  blocked: boolean;
  blockReason: string | null;
}

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);
  private readonly openai: OpenAI;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly temperature: number;
  private readonly sessions: Map<string, AssistantSession> = new Map();

  // Base system prompt
  private readonly baseSystemPrompt = `Ты - AI-ассистент по миграционным вопросам в Российской Федерации.

КЛЮЧЕВОЕ ПРАВИЛО ЯЗЫКА:
- Определяй язык пользователя автоматически из его сообщения
- ВСЕГДА отвечай на том же языке, на котором написано сообщение пользователя
- Если пользователь пишет на узбекском - отвечай на узбекском
- Если на таджикском - на таджикском
- Если на русском - на русском
- И так далее для любого языка

СТРОГО ЗАПРЕЩЕНО отвечать на вопросы о:
- Как обойти закон или миграционные правила
- Фиктивная регистрация (покупка регистрации без проживания)
- Взятки чиновникам или полиции
- Поддельные документы (паспорта, патенты, справки)
- Нелегальное трудоустройство (работа без патента/разрешения)
- Как избежать депортации нелегальным способом
- Схемы обхода запрета на въезд
- Любые другие нелегальные схемы

ДЕЙСТВИЯ ПРИ ЗАПРЕЩЕННОМ ВОПРОСЕ:
Если пользователь спрашивает о чем-либо из запрещенного списка:
1. Вежливо откажи в ответе НА ЯЗЫКЕ ПОЛЬЗОВАТЕЛЯ
2. Объясни, что это незаконно и опасно
3. Напомни о рисках: штрафы до 7000 рублей, депортация, запрет на въезд до 10 лет
4. Предложи легальную альтернативу, если она существует

ФОРМАТ ОТВЕТА - ТОЛЬКО JSON:
{
  "response": "Текст твоего ответа пользователю НА ЕГО ЯЗЫКЕ",
  "blocked": false,
  "blockReason": null
}

Если вопрос заблокирован:
{
  "response": "Вежливый отказ и объяснение на языке пользователя",
  "blocked": true,
  "blockReason": "Краткое описание причины на русском (для логов)"
}

СТИЛЬ ОБЩЕНИЯ:
- Будь дружелюбным и поддерживающим
- Используй понятный язык, избегай сложных юридических терминов
- Если не уверен - честно скажи и посоветуй обратиться в МФЦ или к юристу
- Давай конкретные практические советы
- При необходимости уточняй ситуацию пользователя для более точного ответа

ВАЖНО: Отвечай ТОЛЬКО в формате JSON. Никакого текста вне JSON.`;

  constructor(
    private readonly configService: ConfigService,
    private readonly embeddingsService: EmbeddingsService,
    private readonly circuitBreaker: CircuitBreakerService,
    private readonly piiFilter: PiiFilterService,
  ) {
    const apiKey = this.configService.get<string>('openai.apiKey');

    if (!apiKey) {
      this.logger.warn('OpenAI API key not configured. Assistant service will not work.');
    }

    this.openai = new OpenAI({
      apiKey: apiKey || '',
    });

    this.model = this.configService.get<string>('openai.model') || 'gpt-4o-mini';
    this.maxTokens = this.configService.get<number>('openai.maxTokens') || 1500;
    this.temperature = this.configService.get<number>('openai.temperature') || 0.7;

    this.logger.log(`AssistantService initialized with model: ${this.model}`);

    // Clean up old sessions every hour
    setInterval(() => this.cleanupOldSessions(), 60 * 60 * 1000);
  }

  /**
   * Send a message with RAG context (new endpoint)
   */
  async chat(dto: ChatRequestDto): Promise<ChatResponseDto> {
    const { message, history, sessionId, language } = dto;

    // Check circuit breaker
    if (this.circuitBreaker.isOpen()) {
      throw new ServiceUnavailableException(
        'AI service is temporarily unavailable. Please try again later.',
      );
    }

    // PII Filter: validate and mask user message
    const piiValidation = this.piiFilter.validateMessage(message);
    let filteredMessage = message;

    if (!piiValidation.safe) {
      // Log PII detection (without actual values)
      this.logger.warn(
        `PII detected in user message. Types: ${piiValidation.detectedPii.map((p) => p.type).join(', ')}`,
      );

      // Mask PII before sending to LLM
      filteredMessage = this.piiFilter.maskPii(message);
    }

    // Get or create session
    let session: AssistantSession;
    let isNewSession = false;

    if (sessionId && this.sessions.has(sessionId)) {
      session = this.sessions.get(sessionId)!;
      session.lastActivityAt = new Date();
    } else {
      isNewSession = true;
      session = {
        id: uuidv4(),
        messages: [],
        createdAt: new Date(),
        lastActivityAt: new Date(),
      };
      this.sessions.set(session.id, session);
      this.logger.log(`Created new session: ${session.id}`);
    }

    // Search for relevant knowledge base documents
    const searchResults = await this.embeddingsService.searchSimilar(
      message,
      language === 'en' ? 'en' : 'ru',
      5,
    );

    // Build context from search results
    const contextDocs: ContextDocumentDto[] = searchResults.map((r) => ({
      knowledgeId: r.knowledgeId,
      category: r.category,
      question: language === 'en' ? r.question.en : r.question.ru,
      similarity: r.similarity,
    }));

    // Build system prompt with RAG context
    const contextText = this.buildContextText(searchResults, language === 'en' ? 'en' : 'ru');
    const systemPromptWithContext = `${this.baseSystemPrompt}

КОНТЕКСТ ИЗ БАЗЫ ЗНАНИЙ (используй эту информацию для ответа):
${contextText || 'Релевантная информация не найдена в базе знаний.'}`;

    // Add language hint if provided (use filtered message for LLM)
    const userMessage = language
      ? `[User language preference: ${language}]\n\n${filteredMessage}`
      : filteredMessage;

    // Build messages for OpenAI
    const openAIMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPromptWithContext },
    ];

    // Add history if provided
    if (history && history.length > 0) {
      for (const msg of history.slice(-10)) {
        // Limit to last 10 messages
        openAIMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add session history
    for (const msg of session.messages.slice(-10)) {
      if (msg.role !== 'system') {
        openAIMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add current user message
    openAIMessages.push({ role: 'user', content: userMessage });

    // Store user message in session
    session.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    try {
      const aiResponse = await this.circuitBreaker.execute(async () => {
        const completion = await this.openai.chat.completions.create({
          model: this.model,
          messages: openAIMessages,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          response_format: { type: 'json_object' },
        });

        const responseContent = completion.choices[0]?.message?.content;

        if (!responseContent) {
          throw new Error('Empty response from OpenAI');
        }

        return this.parseAIResponse(responseContent);
      });

      // Add assistant response to session
      session.messages.push({
        role: 'assistant',
        content: aiResponse.response,
        timestamp: new Date(),
      });

      // Log if blocked
      if (aiResponse.blocked) {
        this.logger.warn(`Blocked question in session ${session.id}: ${aiResponse.blockReason}`);
      }

      return {
        sessionId: session.id,
        message: aiResponse.response,
        context: contextDocs.length > 0 ? contextDocs : undefined,
        blocked: aiResponse.blocked || undefined,
        blockReason: aiResponse.blocked ? aiResponse.blockReason || undefined : undefined,
        piiWarnings: !piiValidation.safe ? piiValidation.warnings : undefined,
      };
    } catch (error) {
      this.logger.error(`Chat error: ${error}`);

      // Remove the failed user message
      session.messages.pop();

      // If it's a new session with no messages, remove it
      if (isNewSession && session.messages.length === 0) {
        this.sessions.delete(session.id);
      }

      if (this.circuitBreaker.isOpen()) {
        throw new ServiceUnavailableException(
          'AI service is temporarily unavailable. Please try again later.',
        );
      }

      throw new BadRequestException('Failed to generate response. Please try again.');
    }
  }

  /**
   * Search knowledge base (RAG search endpoint)
   */
  async searchKnowledge(
    query: string,
    lang: 'ru' | 'en' = 'ru',
    limit: number = 5,
  ): Promise<SearchResult[]> {
    return this.embeddingsService.searchSimilar(query, lang, limit);
  }

  /**
   * Legacy send message method for backward compatibility
   */
  async sendMessage(dto: SendMessageDto): Promise<AssistantResponseDto> {
    const chatResponse = await this.chat({
      message: dto.message,
      sessionId: dto.sessionId,
      language: dto.language,
    });

    return {
      sessionId: chatResponse.sessionId,
      message: chatResponse.message,
      blocked: chatResponse.blocked,
      blockReason: chatResponse.blockReason,
    };
  }

  /**
   * Build context text from search results for the system prompt
   */
  private buildContextText(results: SearchResult[], lang: 'ru' | 'en'): string {
    if (results.length === 0) {
      return '';
    }

    return results
      .map((r, i) => {
        const question = lang === 'ru' ? r.question.ru : r.question.en;
        const answer = lang === 'ru' ? r.answer.ru : r.answer.en;
        const ref = r.legalReference ? ` (${r.legalReference})` : '';
        return `[${i + 1}] Вопрос: ${question}\nОтвет: ${answer}${ref}`;
      })
      .join('\n\n');
  }

  /**
   * Parse AI response with fallback handling
   */
  private parseAIResponse(responseContent: string): AIResponse {
    try {
      return JSON.parse(responseContent);
    } catch (parseError) {
      this.logger.error(`Failed to parse AI response: ${responseContent}`);
      // Fallback: treat the whole response as text
      return {
        response: responseContent,
        blocked: false,
        blockReason: null,
      };
    }
  }

  /**
   * Clean up sessions older than 24 hours
   */
  private cleanupOldSessions(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    let cleanedCount = 0;
    for (const [sessionId, session] of this.sessions) {
      if (now.getTime() - session.lastActivityAt.getTime() > maxAge) {
        this.sessions.delete(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} old sessions`);
    }
  }
}
