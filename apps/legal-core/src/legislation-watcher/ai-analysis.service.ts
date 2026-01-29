import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AIConfig } from '../config/ai.config';

export interface AIAnalysisRequest {
  lawId: string;
  title: string;
  diff: string;
  oldText?: string;
  newText?: string;
}

export interface AIAnalysisResponse {
  summary: string;
  impactForMigrants: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  recommendations?: string[];
  analyzedAt: Date;
}

const SYSTEM_PROMPT = `Ты - эксперт по миграционному законодательству Российской Федерации.

СТРОГИЕ ОГРАНИЧЕНИЯ:
1. Ты анализируешь ТОЛЬКО изменения в законодательстве РФ, касающиеся миграции
2. Ты НЕ отвечаешь на вопросы, не связанные с миграционным законодательством
3. Ты НЕ даешь юридических консультаций, только информируешь об изменениях
4. Если запрос не связан с анализом законодательства - отказывайся отвечать

ЦЕЛЕВАЯ АУДИТОРИЯ:
- Трудовые мигранты из Узбекистана, Таджикистана и Кыргызстана
- Люди, работающие по патенту в России
- Люди, оформляющие миграционный учет или разрешительные документы

ФОРМАТ ОТВЕТА (строго JSON):
{
  "summary": "Краткое описание изменений на простом русском языке (2-3 предложения)",
  "impactForMigrants": "Как эти изменения повлияют на мигрантов: что изменится в их процедурах, документах, сроках, штрафах",
  "urgency": "low|medium|high|critical",
  "actionRequired": true/false,
  "recommendations": ["Рекомендация 1", "Рекомендация 2", ...]
}

ОПРЕДЕЛЕНИЕ СРОЧНОСТИ (urgency):
- low: технические правки, не влияющие на мигрантов напрямую
- medium: изменения процедур, но без срочных действий
- high: изменения в штрафах, сроках, требованиях - требует внимания
- critical: изменения, требующие немедленных действий (новые требования к документам, депортация, запреты)

ЯЗЫК: Отвечай ТОЛЬКО на русском языке.
ФОРМАТ: Отвечай ТОЛЬКО валидным JSON без markdown-разметки.`;

@Injectable()
export class AIAnalysisService {
  private readonly logger = new Logger(AIAnalysisService.name);
  private readonly openai: OpenAI | null;
  private readonly config: AIConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = {
      apiKey: this.configService.get<string>('OPENAI_API_KEY', ''),
      model: this.configService.get<string>('OPENAI_MODEL', 'gpt-4o-mini'),
      enabled: this.configService.get<string>('AI_SERVICE_ENABLED', 'false') === 'true',
      maxTokens: this.configService.get<number>('AI_MAX_TOKENS', 2000),
      temperature: this.configService.get<number>('AI_TEMPERATURE', 0.3),
      timeout: this.configService.get<number>('AI_TIMEOUT', 60000),
      maxRetries: this.configService.get<number>('AI_MAX_RETRIES', 3),
    };

    if (this.config.enabled && this.config.apiKey) {
      this.openai = new OpenAI({
        apiKey: this.config.apiKey,
        timeout: this.config.timeout,
        maxRetries: this.config.maxRetries,
      });
      this.logger.log('OpenAI client initialized successfully');
    } else {
      this.openai = null;
      if (!this.config.enabled) {
        this.logger.warn('AI Analysis is disabled via configuration');
      } else if (!this.config.apiKey) {
        this.logger.warn('OpenAI API key is not configured');
      }
    }
  }

  async analyzeLegislationChange(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    if (!this.config.enabled || !this.openai) {
      this.logger.warn('AI Analysis is disabled. Returning stub response.');
      return this.generateStubResponse(request);
    }

    try {
      this.logger.log(`Analyzing legislation change: ${request.lawId}`);

      const userMessage = this.buildUserMessage(request);
      const response = await this.callOpenAI(userMessage);

      this.logger.log(`AI analysis completed for law: ${request.lawId}`);
      return response;
    } catch (error) {
      this.logger.error(
        `AI analysis failed for law ${request.lawId}: ${error.message}`,
        error.stack
      );

      return this.generateStubResponse(request);
    }
  }

  private buildUserMessage(request: AIAnalysisRequest): string {
    let message = `Проанализируй следующие изменения в законодательстве:\n\n`;
    message += `НАЗВАНИЕ ЗАКОНА: ${request.title}\n`;
    message += `ID: ${request.lawId}\n\n`;

    if (request.diff) {
      message += `ИЗМЕНЕНИЯ (diff):\n${request.diff}\n\n`;
    }

    if (request.oldText) {
      message += `СТАРАЯ РЕДАКЦИЯ:\n${request.oldText.substring(0, 3000)}\n\n`;
    }

    if (request.newText) {
      message += `НОВАЯ РЕДАКЦИЯ:\n${request.newText.substring(0, 3000)}\n\n`;
    }

    message += `Дай анализ этих изменений с точки зрения влияния на трудовых мигрантов.`;

    return message;
  }

  private async callOpenAI(userMessage: string): Promise<AIAnalysisResponse> {
    const completion = await this.openai!.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    const parsed = this.parseAIResponse(content);
    return parsed;
  }

  private parseAIResponse(content: string): AIAnalysisResponse {
    try {
      const parsed = JSON.parse(content);

      // Validate required fields
      if (!parsed.summary || typeof parsed.summary !== 'string') {
        throw new Error('Missing or invalid summary field');
      }
      if (!parsed.impactForMigrants || typeof parsed.impactForMigrants !== 'string') {
        throw new Error('Missing or invalid impactForMigrants field');
      }
      if (!['low', 'medium', 'high', 'critical'].includes(parsed.urgency)) {
        parsed.urgency = 'medium'; // Default to medium if invalid
      }
      if (typeof parsed.actionRequired !== 'boolean') {
        parsed.actionRequired = parsed.urgency === 'high' || parsed.urgency === 'critical';
      }
      if (parsed.recommendations && !Array.isArray(parsed.recommendations)) {
        parsed.recommendations = [String(parsed.recommendations)];
      }

      return {
        summary: parsed.summary,
        impactForMigrants: parsed.impactForMigrants,
        urgency: parsed.urgency,
        actionRequired: parsed.actionRequired,
        recommendations: parsed.recommendations || [],
        analyzedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to parse AI response: ${error.message}`);
      throw new Error(`Invalid AI response format: ${error.message}`);
    }
  }

  private generateStubResponse(request: AIAnalysisRequest): AIAnalysisResponse {
    const diffLength = request.diff?.length || 0;
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium';

    if (request.title.includes('КоАП') || request.title.includes('штраф')) {
      urgency = 'high';
    } else if (request.title.includes('патент') || request.title.includes('миграционный учет')) {
      urgency = 'critical';
    } else if (diffLength < 500) {
      urgency = 'low';
    }

    return {
      summary: `Обнаружены изменения в законодательстве: "${request.title}". ` +
               `Изменения затрагивают ${diffLength} символов текста. ` +
               `Требуется детальный анализ для определения влияния на мигрантов.`,
      impactForMigrants:
        'ВНИМАНИЕ: Это автоматически сгенерированный ответ (AI сервис отключен). ' +
        'Обнаружены изменения в законодательстве, которые могут повлиять на: ' +
        '1) Процедуры миграционного учета; ' +
        '2) Требования к получению патента; ' +
        '3) Административную ответственность. ' +
        'Рекомендуется проконсультироваться с юристом.',
      urgency,
      actionRequired: urgency === 'high' || urgency === 'critical',
      recommendations: [
        'Проверить актуальность документов',
        'Обратиться к миграционному специалисту',
        'Следить за обновлениями в приложении MigrantHub',
      ],
      analyzedAt: new Date(),
    };
  }

  async analyzeMultipleChanges(requests: AIAnalysisRequest[]): Promise<AIAnalysisResponse[]> {
    this.logger.log(`Analyzing ${requests.length} legislation changes`);

    const results = await Promise.allSettled(
      requests.map((request) => this.analyzeLegislationChange(request))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        this.logger.error(`Failed to analyze request ${index}: ${result.reason}`);
        return this.generateStubResponse(requests[index]);
      }
    });
  }

  isEnabled(): boolean {
    return this.config.enabled && this.openai !== null;
  }

  getModel(): string {
    return this.config.model;
  }
}
