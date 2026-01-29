import { registerAs } from '@nestjs/config';

export interface AIConfig {
  apiKey: string;
  model: string;
  enabled: boolean;
  maxTokens: number;
  temperature: number;
  timeout: number;
  maxRetries: number;
}

export default registerAs('ai', (): AIConfig => ({
  apiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  enabled: process.env.AI_SERVICE_ENABLED === 'true',
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '2000', 10),
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.3'),
  timeout: parseInt(process.env.AI_TIMEOUT || '60000', 10),
  maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3', 10),
}));
