import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

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

@Injectable()
export class AIAnalysisService {
  private readonly logger = new Logger(AIAnalysisService.name);
  private readonly axiosInstance: AxiosInstance;
  private readonly enabled: boolean;
  private readonly aiServiceUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('AI_SERVICE_ENABLED', false);
    this.aiServiceUrl = this.configService.get<string>(
      'AI_SERVICE_URL',
      'http://localhost:3001/api/analyze'
    );

    this.axiosInstance = axios.create({
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
        'X-Service': 'legal-core'
      }
    });
  }

  async analyzeLegislationChange(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    if (!this.enabled) {
      this.logger.warn('AI Analysis is disabled. Returning stub response.');
      return this.generateStubResponse(request);
    }

    try {
      this.logger.log(`Sending legislation change to AI for analysis: ${request.lawId}`);
      
      const response = await this.axiosInstance.post<AIAnalysisResponse>(
        this.aiServiceUrl,
        {
          lawId: request.lawId,
          title: request.title,
          diff: request.diff,
          oldText: request.oldText,
          newText: request.newText,
          context: 'migration_law_russia',
          targetAudience: 'migrants_uz_tj_kg'
        }
      );

      this.logger.log(`AI analysis completed for law: ${request.lawId}`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `AI analysis failed for law ${request.lawId}: ${error.message}`,
        error.stack
      );
      
      return this.generateStubResponse(request);
    }
  }

  private generateStubResponse(request: AIAnalysisRequest): AIAnalysisResponse {
    const diffLength = request.diff.length;
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
        'Следить за обновлениями в приложении MigrantHub'
      ],
      analyzedAt: new Date()
    };
  }

  async analyzeMultipleChanges(requests: AIAnalysisRequest[]): Promise<AIAnalysisResponse[]> {
    this.logger.log(`Analyzing ${requests.length} legislation changes`);
    
    const results = await Promise.allSettled(
      requests.map(request => this.analyzeLegislationChange(request))
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
    return this.enabled;
  }

  getServiceUrl(): string {
    return this.aiServiceUrl;
  }
}
