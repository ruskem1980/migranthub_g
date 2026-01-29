import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * Available training scenarios for migrants
 */
export enum ScenarioType {
  POLICE_CHECK = 'police_check', // Проверка документов полицией
  MFC_VISIT = 'mfc_visit', // Визит в МФЦ
  MIGRATION_SERVICE = 'migration_service', // Миграционная служба
  EMPLOYER_TALK = 'employer_talk', // Разговор с работодателем
  RVP_INTERVIEW = 'rvp_interview', // Собеседование на РВП
  VNJ_INTERVIEW = 'vnj_interview', // Собеседование на ВНЖ
}

/**
 * Evaluation result for user's response
 */
export enum EvaluationType {
  CORRECT = 'correct',
  PARTIAL = 'partial',
  INCORRECT = 'incorrect',
}

/**
 * User profile for personalized scenarios
 */
export class UserProfileDto {
  @ApiPropertyOptional({ description: 'User nationality' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ description: 'Current migration status (e.g., patent, RVP, VNJ)' })
  @IsOptional()
  @IsString()
  migrationStatus?: string;

  @ApiPropertyOptional({ description: 'Russian language level (basic, intermediate, advanced)' })
  @IsOptional()
  @IsString()
  russianLevel?: string;
}

/**
 * DTO for starting a new training scenario
 */
export class StartScenarioDto {
  @ApiProperty({
    enum: ScenarioType,
    description: 'Type of scenario to start',
    example: ScenarioType.POLICE_CHECK,
  })
  @IsEnum(ScenarioType)
  @IsNotEmpty()
  scenarioType!: ScenarioType;

  @ApiPropertyOptional({
    type: UserProfileDto,
    description: 'Optional user profile for personalized scenarios',
  })
  @IsOptional()
  userProfile?: UserProfileDto;
}

/**
 * DTO for continuing a conversation
 */
export class ContinueConversationDto {
  @ApiProperty({
    description: 'Session ID from startScenario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  sessionId!: string;

  @ApiProperty({
    description: 'User message/response',
    example: 'Здравствуйте, вот мой паспорт и миграционная карта',
  })
  @IsString()
  @IsNotEmpty()
  message!: string;
}

/**
 * Scenario description for listing available scenarios
 */
export class ScenarioDescriptionDto {
  @ApiProperty({ enum: ScenarioType })
  type!: ScenarioType;

  @ApiProperty({ description: 'Scenario name in Russian' })
  name!: string;

  @ApiProperty({ description: 'Scenario description' })
  description!: string;

  @ApiProperty({ description: 'Difficulty level (1-5)' })
  difficulty!: number;

  @ApiProperty({ description: 'Estimated duration in minutes' })
  estimatedDuration!: number;
}

/**
 * Response from AI in the training scenario
 */
export class ScenarioResponseDto {
  @ApiProperty({
    description: 'Session ID for this conversation',
  })
  sessionId!: string;

  @ApiProperty({
    description: 'Response from the official/authority figure',
    example: 'Здравствуйте. Предъявите, пожалуйста, ваши документы.',
  })
  roleResponse!: string;

  @ApiPropertyOptional({
    enum: EvaluationType,
    description: 'Evaluation of user response (null for initial message)',
    nullable: true,
  })
  evaluation!: EvaluationType | null;

  @ApiPropertyOptional({
    description: 'Feedback for the user about their response',
    nullable: true,
  })
  feedback!: string | null;

  @ApiPropertyOptional({
    description: 'Tip on how to better respond in such situation',
    nullable: true,
  })
  tip!: string | null;

  @ApiProperty({
    description: 'Whether the scenario is complete',
  })
  scenarioComplete!: boolean;

  @ApiPropertyOptional({
    description: 'Final score (0-100), only present when scenarioComplete is true',
    nullable: true,
  })
  score!: number | null;
}

/**
 * Session history entry
 */
export class SessionMessageDto {
  @ApiProperty({ description: 'Message role (user or assistant)' })
  role!: 'user' | 'assistant';

  @ApiProperty({ description: 'Message content' })
  content!: string;

  @ApiProperty({ description: 'Timestamp of the message' })
  timestamp!: Date;
}

/**
 * Full session history
 */
export class SessionHistoryDto {
  @ApiProperty({ description: 'Session ID' })
  sessionId!: string;

  @ApiProperty({ enum: ScenarioType, description: 'Scenario type' })
  scenarioType!: ScenarioType;

  @ApiProperty({ description: 'Whether the session is completed' })
  completed!: boolean;

  @ApiPropertyOptional({ description: 'Final score if completed', nullable: true })
  score!: number | null;

  @ApiProperty({ type: [SessionMessageDto], description: 'Message history' })
  messages!: SessionMessageDto[];

  @ApiProperty({ description: 'Session start time' })
  startedAt!: Date;

  @ApiPropertyOptional({ description: 'Session end time', nullable: true })
  endedAt!: Date | null;
}
