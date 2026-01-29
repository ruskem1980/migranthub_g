import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ChatMessageDto {
  @ApiProperty({
    description: 'Message role',
    enum: ['user', 'assistant'],
    example: 'user',
  })
  @IsString()
  @IsIn(['user', 'assistant'])
  role!: 'user' | 'assistant';

  @ApiProperty({
    description: 'Message content',
    example: 'Как получить патент?',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;
}

export class ChatRequestDto {
  @ApiProperty({
    description: 'User message',
    example: 'Как получить патент на работу?',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message!: string;

  @ApiPropertyOptional({
    description: 'Conversation history for context',
    type: [ChatMessageDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];

  @ApiPropertyOptional({
    description: 'Session ID for conversation continuity',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @ApiPropertyOptional({
    description: 'User preferred language code (ru, en, uz, tg, etc.)',
    example: 'ru',
  })
  @IsOptional()
  @IsString()
  language?: string;
}

export class ContextDocumentDto {
  @ApiProperty({
    description: 'Knowledge base item ID',
    example: 'patent-001',
  })
  knowledgeId!: string;

  @ApiProperty({
    description: 'Category of the knowledge item',
    example: 'patent',
  })
  category!: string;

  @ApiProperty({
    description: 'Question text',
    example: 'Как получить патент на работу?',
  })
  question!: string;

  @ApiProperty({
    description: 'Relevance score (0-1)',
    example: 0.85,
  })
  similarity!: number;
}

export class ChatResponseDto {
  @ApiProperty({
    description: 'Session ID for continuing the conversation',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  sessionId!: string;

  @ApiProperty({
    description: 'Assistant response message',
    example: 'Для получения патента вам нужно обратиться в миграционную службу...',
  })
  message!: string;

  @ApiPropertyOptional({
    description: 'Related knowledge base documents used for context',
    type: [ContextDocumentDto],
  })
  context?: ContextDocumentDto[];

  @ApiPropertyOptional({
    description: 'Indicates if the question was blocked due to illegal content',
    example: false,
  })
  blocked?: boolean;

  @ApiPropertyOptional({
    description: 'Reason for blocking (for logging)',
    example: 'Question about illegal registration',
  })
  blockReason?: string;

  @ApiPropertyOptional({
    description: 'Warnings about detected PII in the message (data was masked before processing)',
    example: ['Detected passport number (1)', 'Detected phone number (1)'],
    type: [String],
  })
  piiWarnings?: string[];
}
