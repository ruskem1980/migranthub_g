import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';
import {
  ScenarioType,
  StartScenarioDto,
  ContinueConversationDto,
  ScenarioDescriptionDto,
  ScenarioResponseDto,
  SessionHistoryDto,
  SessionMessageDto,
  EvaluationType,
  UserProfileDto,
} from './dto';

interface TrainerSession {
  id: string;
  scenarioType: ScenarioType;
  userProfile?: UserProfileDto;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;
  completed: boolean;
  score: number | null;
  startedAt: Date;
  endedAt: Date | null;
}

interface AIResponse {
  roleResponse: string;
  evaluation: EvaluationType | null;
  feedback: string | null;
  tip: string | null;
  scenarioComplete: boolean;
  score: number | null;
}

@Injectable()
export class TrainerService {
  private readonly logger = new Logger(TrainerService.name);
  private readonly openai: OpenAI;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly temperature: number;
  private readonly sessions: Map<string, TrainerSession> = new Map();

  // Scenario configurations
  private readonly scenarioConfigs: Record<
    ScenarioType,
    {
      name: string;
      description: string;
      difficulty: number;
      estimatedDuration: number;
      role: string;
      initialMessage: string;
    }
  > = {
    [ScenarioType.POLICE_CHECK]: {
      name: 'Проверка документов полицией',
      description:
        'Симуляция проверки документов сотрудником полиции на улице или в общественном месте',
      difficulty: 3,
      estimatedDuration: 10,
      role: 'сотрудник полиции',
      initialMessage:
        'Добрый день. Старший лейтенант полиции Иванов. Предъявите, пожалуйста, ваши документы для проверки.',
    },
    [ScenarioType.MFC_VISIT]: {
      name: 'Визит в МФЦ',
      description: 'Обращение в многофункциональный центр для получения государственных услуг',
      difficulty: 2,
      estimatedDuration: 15,
      role: 'сотрудник МФЦ',
      initialMessage:
        'Здравствуйте! Добро пожаловать в МФЦ. Чем могу вам помочь? Какую услугу вы хотели бы получить?',
    },
    [ScenarioType.MIGRATION_SERVICE]: {
      name: 'Миграционная служба',
      description: 'Посещение отделения по вопросам миграции МВД России',
      difficulty: 4,
      estimatedDuration: 20,
      role: 'сотрудник миграционной службы',
      initialMessage:
        'Здравствуйте. Отделение по вопросам миграции. По какому вопросу вы обращаетесь?',
    },
    [ScenarioType.EMPLOYER_TALK]: {
      name: 'Разговор с работодателем',
      description: 'Обсуждение трудовых вопросов с работодателем',
      difficulty: 2,
      estimatedDuration: 10,
      role: 'работодатель',
      initialMessage:
        'Здравствуйте! Присаживайтесь. Хотел обсудить с вами некоторые рабочие вопросы. Как у вас дела с документами?',
    },
    [ScenarioType.RVP_INTERVIEW]: {
      name: 'Собеседование на РВП',
      description: 'Собеседование при подаче документов на разрешение на временное проживание',
      difficulty: 4,
      estimatedDuration: 25,
      role: 'сотрудник миграционной службы, принимающий документы на РВП',
      initialMessage:
        'Добрый день. Вы подаете документы на разрешение на временное проживание. Давайте проверим ваш пакет документов. Расскажите о цели вашего пребывания в России.',
    },
    [ScenarioType.VNJ_INTERVIEW]: {
      name: 'Собеседование на ВНЖ',
      description: 'Собеседование при подаче документов на вид на жительство',
      difficulty: 5,
      estimatedDuration: 30,
      role: 'сотрудник миграционной службы, принимающий документы на ВНЖ',
      initialMessage:
        'Здравствуйте. Вы обращаетесь за оформлением вида на жительство. Расскажите, сколько времени вы проживаете в России и на каком основании?',
    },
  };

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai.apiKey');

    if (!apiKey) {
      this.logger.warn('OpenAI API key not configured. Trainer service will not work.');
    }

    this.openai = new OpenAI({
      apiKey: apiKey || '',
    });

    this.model = this.configService.get<string>('openai.model') || 'gpt-4o-mini';
    this.maxTokens = this.configService.get<number>('openai.maxTokens') || 1500;
    this.temperature = this.configService.get<number>('openai.temperature') || 0.7;

    this.logger.log(`TrainerService initialized with model: ${this.model}`);
  }

  /**
   * Get list of available training scenarios
   */
  getAvailableScenarios(): ScenarioDescriptionDto[] {
    return Object.entries(this.scenarioConfigs).map(([type, config]) => ({
      type: type as ScenarioType,
      name: config.name,
      description: config.description,
      difficulty: config.difficulty,
      estimatedDuration: config.estimatedDuration,
    }));
  }

  /**
   * Start a new training scenario
   */
  async startScenario(dto: StartScenarioDto): Promise<ScenarioResponseDto> {
    const { scenarioType, userProfile } = dto;
    const config = this.scenarioConfigs[scenarioType];

    if (!config) {
      throw new BadRequestException(`Unknown scenario type: ${scenarioType}`);
    }

    const sessionId = uuidv4();
    const systemPrompt = this.buildSystemPrompt(scenarioType, config.role, userProfile);

    const session: TrainerSession = {
      id: sessionId,
      scenarioType,
      userProfile,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
          timestamp: new Date(),
        },
        {
          role: 'assistant',
          content: JSON.stringify({
            roleResponse: config.initialMessage,
            evaluation: null,
            feedback: null,
            tip: 'Представьтесь вежливо и покажите, что вы готовы сотрудничать.',
            scenarioComplete: false,
            score: null,
          } as AIResponse),
          timestamp: new Date(),
        },
      ],
      completed: false,
      score: null,
      startedAt: new Date(),
      endedAt: null,
    };

    this.sessions.set(sessionId, session);
    this.logger.log(`Started new scenario: ${scenarioType}, sessionId: ${sessionId}`);

    return {
      sessionId,
      roleResponse: config.initialMessage,
      evaluation: null,
      feedback: null,
      tip: 'Представьтесь вежливо и покажите, что вы готовы сотрудничать.',
      scenarioComplete: false,
      score: null,
    };
  }

  /**
   * Continue conversation in a training scenario
   */
  async continueConversation(dto: ContinueConversationDto): Promise<ScenarioResponseDto> {
    const { sessionId, message } = dto;
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundException(`Session not found: ${sessionId}`);
    }

    if (session.completed) {
      throw new BadRequestException('This session is already completed');
    }

    // Add user message
    session.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Build messages for OpenAI (excluding timestamps)
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

      const aiResponse: AIResponse = JSON.parse(responseContent);

      // Add assistant response to session
      session.messages.push({
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      });

      // Check if scenario is complete
      if (aiResponse.scenarioComplete) {
        session.completed = true;
        session.score = aiResponse.score;
        session.endedAt = new Date();
        this.logger.log(`Scenario completed: ${sessionId}, score: ${aiResponse.score}`);
      }

      return {
        sessionId,
        roleResponse: aiResponse.roleResponse,
        evaluation: aiResponse.evaluation,
        feedback: aiResponse.feedback,
        tip: aiResponse.tip,
        scenarioComplete: aiResponse.scenarioComplete,
        score: aiResponse.score,
      };
    } catch (error) {
      this.logger.error(`OpenAI API error: ${error}`);

      // Remove the failed user message
      session.messages.pop();

      throw new BadRequestException('Failed to generate response. Please try again.');
    }
  }

  /**
   * Get session history
   */
  getSessionHistory(sessionId: string): SessionHistoryDto {
    const session = this.sessions.get(sessionId);

    if (!session) {
      throw new NotFoundException(`Session not found: ${sessionId}`);
    }

    // Convert messages, parsing assistant messages for roleResponse only
    const messages: SessionMessageDto[] = session.messages
      .filter((m) => m.role !== 'system')
      .map((m) => {
        if (m.role === 'assistant') {
          try {
            const parsed = JSON.parse(m.content) as AIResponse;
            return {
              role: 'assistant' as const,
              content: parsed.roleResponse,
              timestamp: m.timestamp,
            };
          } catch {
            return {
              role: 'assistant' as const,
              content: m.content,
              timestamp: m.timestamp,
            };
          }
        }
        return {
          role: m.role as 'user',
          content: m.content,
          timestamp: m.timestamp,
        };
      });

    return {
      sessionId: session.id,
      scenarioType: session.scenarioType,
      completed: session.completed,
      score: session.score,
      messages,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
    };
  }

  /**
   * Build the system prompt for AI with strict constraints
   */
  private buildSystemPrompt(
    scenarioType: ScenarioType,
    role: string,
    userProfile?: UserProfileDto,
  ): string {
    const profileContext = userProfile
      ? `
ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:
- Гражданство: ${userProfile.nationality || 'не указано'}
- Миграционный статус: ${userProfile.migrationStatus || 'не указан'}
- Уровень русского: ${userProfile.russianLevel || 'не указан'}
`
      : '';

    return `Ты - тренажер для подготовки мигрантов к типичным юридическим ситуациям в России.

СТРОГИЕ ОГРАНИЧЕНИЯ:
- Ты можешь ТОЛЬКО симулировать роль должностного лица (${role})
- Ты НЕ даёшь юридических консультаций вне контекста тренировки
- Ты НЕ отвечаешь на вопросы, не связанные с текущим сценарием
- Если пользователь пытается обсудить другие темы, вежливо верни его к сценарию
- После каждого ответа пользователя ты оцениваешь его действия (correct/partial/incorrect)
- Ты объясняешь, как лучше было бы ответить в реальной ситуации
- Веди себя реалистично, как настоящий ${role}
- Говори на русском языке, используй официальный, но вежливый тон

СЦЕНАРИЙ: ${scenarioType}
РОЛЬ: ${role}
${profileContext}

ПРАВИЛА ОЦЕНКИ:
- "correct" - пользователь ведет себя правильно: вежлив, предоставляет нужные документы/информацию, знает свои права
- "partial" - пользователь частично прав, но упустил важные детали или мог ответить лучше
- "incorrect" - пользователь допустил ошибку: грубость, неправильная информация, незнание процедур

ПРАВИЛА ЗАВЕРШЕНИЯ СЦЕНАРИЯ:
- Сценарий завершается после 5-8 обменов репликами ИЛИ когда логически завершена ситуация
- При завершении выставь итоговую оценку от 0 до 100 на основе всех ответов пользователя
- Учитывай: вежливость, знание документов, понимание процедур, уверенность

ФОРМАТ ОТВЕТА - ТОЛЬКО JSON:
{
  "roleResponse": "Что говорит должностное лицо (${role})",
  "evaluation": "correct" | "partial" | "incorrect" | null,
  "feedback": "Обратная связь для пользователя - почему такая оценка (или null для первого сообщения)",
  "tip": "Практический совет, как лучше действовать в подобной ситуации",
  "scenarioComplete": false,
  "score": null
}

Когда сценарий завершен:
{
  "roleResponse": "Финальная реплика должностного лица",
  "evaluation": "correct" | "partial" | "incorrect",
  "feedback": "Итоговая обратная связь",
  "tip": "Главный совет по итогам тренировки",
  "scenarioComplete": true,
  "score": 75
}

ВАЖНО: Отвечай ТОЛЬКО в формате JSON. Никакого текста вне JSON.`;
  }
}
