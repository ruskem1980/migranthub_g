import { IsString, IsNotEmpty, MaxLength, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'User message',
    example: 'Как получить патент?',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional({
    description: 'Session ID for conversation continuity',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @ApiPropertyOptional({
    description: 'User preferred language code',
    example: 'uz',
  })
  @IsOptional()
  @IsString()
  language?: string;
}

export class AssistantResponseDto {
  @ApiProperty({
    description: 'Session ID for continuing the conversation',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Assistant response message',
    example: 'Для получения патента вам нужно обратиться в миграционную службу...',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Indicates if the question was blocked due to illegal content',
    example: false,
  })
  blocked?: boolean;

  @ApiPropertyOptional({
    description: 'Reason for blocking (in Russian, for logging)',
    example: 'Вопрос о фиктивной регистрации',
  })
  blockReason?: string;
}
