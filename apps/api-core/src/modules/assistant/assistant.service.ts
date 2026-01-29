import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import { SendMessageDto, AssistantResponseDto } from './dto';

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

  // System prompt for the migration assistant
  private readonly systemPrompt = `Ты — AI-ассистент по миграционным вопросам в Российской Федерации.

КЛЮЧЕВОЕ ПРАВИЛО ЯЗЫКА:
- Определяй язык пользователя автоматически из его сообщения
- ВСЕГДА отвечай на том же языке, на котором написано сообщение пользователя
- Если пользователь пишет на узбекском — отвечай на узбекском
- Если на таджикском — на таджикском
- Если на русском — на русском
- И так далее для любого языка

БАЗА ЗНАНИЙ (темы, по которым ты можешь консультировать):
- Патент на работу: получение, продление, оплата, сроки, документы
- Регистрация по месту пребывания: сроки, процедура, документы
- РВП (разрешение на временное проживание): требования, документы, сроки
- ВНЖ (вид на жительство): требования, документы, сроки, права
- Миграционная карта: заполнение, сроки действия, продление
- Документы для миграционных процедур
- МФЦ и МВД: какие услуги, как обращаться, часы работы
- Сроки пребывания и ответственность за нарушения
- Штрафы за миграционные нарушения
- ЕАЭС: особенности для граждан стран-членов (Армения, Беларусь, Казахстан, Кыргызстан)
- Медицинский осмотр для мигрантов
- Экзамен по русскому языку, истории и основам законодательства
- Трудовые права мигрантов
- Гражданство РФ: общий порядок и упрощенный

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
- Если не уверен — честно скажи и посоветуй обратиться в МФЦ или к юристу
- Давай конкретные практические советы
- При необходимости уточняй ситуацию пользователя для более точного ответа

ВАЖНО: Отвечай ТОЛЬКО в формате JSON. Никакого текста вне JSON.`;

  constructor(private readonly configService: ConfigService) {
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
    setInterval(
      () => this.cleanupOldSessions(),
      60 * 60 * 1000,
    );
  }

  /**
   * Send a message to the assistant and get a response
   */
  async sendMessage(dto: SendMessageDto): Promise<AssistantResponseDto> {
    const { message, sessionId, language } = dto;

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
        messages: [
          {
            role: 'system',
            content: this.systemPrompt,
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        lastActivityAt: new Date(),
      };
      this.sessions.set(session.id, session);
      this.logger.log(`Created new session: ${session.id}`);
    }

    // Add language hint if provided
    const userMessage = language
      ? `[User language preference: ${language}]\n\n${message}`
      : message;

    // Add user message to session
    session.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    });

    // Build messages for OpenAI
    const openAIMessages = session.messages.map((m) => ({
      role: m.role as 'system' | 'user' | 'assistant',
      content: m.content,
    }));

    try {
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

      let aiResponse: AIResponse;
      try {
        aiResponse = JSON.parse(responseContent);
      } catch (parseError) {
        this.logger.error(`Failed to parse AI response: ${responseContent}`);
        // Fallback: treat the whole response as text
        aiResponse = {
          response: responseContent,
          blocked: false,
          blockReason: null,
        };
      }

      // Add assistant response to session
      session.messages.push({
        role: 'assistant',
        content: aiResponse.response,
        timestamp: new Date(),
      });

      // Log if blocked
      if (aiResponse.blocked) {
        this.logger.warn(
          `Blocked question in session ${session.id}: ${aiResponse.blockReason}`,
        );
      }

      return {
        sessionId: session.id,
        message: aiResponse.response,
        blocked: aiResponse.blocked || undefined,
        blockReason: aiResponse.blocked ? aiResponse.blockReason || undefined : undefined,
      };
    } catch (error) {
      this.logger.error(`OpenAI API error: ${error}`);

      // Remove the failed user message
      session.messages.pop();

      // If it's a new session with only system message, remove it
      if (isNewSession && session.messages.length === 1) {
        this.sessions.delete(session.id);
      }

      throw new BadRequestException(
        'Failed to generate response. Please try again.',
      );
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
