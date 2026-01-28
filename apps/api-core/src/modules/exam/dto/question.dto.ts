import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum QuestionCategory {
  RUSSIAN_LANGUAGE = 'russian_language',
  HISTORY = 'history',
  LAW = 'law',
}

export enum QuestionDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export class QuestionDto {
  @ApiProperty({ description: 'Question ID', example: 'q-law-001' })
  id!: string;

  @ApiProperty({ enum: QuestionCategory, description: 'Question category' })
  category!: QuestionCategory;

  @ApiProperty({ enum: QuestionDifficulty, description: 'Difficulty level' })
  difficulty!: QuestionDifficulty;

  @ApiProperty({
    description: 'Question text',
    example: 'Какой документ подтверждает право на работу?',
  })
  question!: string;

  @ApiPropertyOptional({ description: 'Image URL for the question' })
  imageUrl?: string;

  @ApiProperty({ description: 'Answer options', type: [String] })
  options!: string[];

  @ApiProperty({ description: 'Index of correct answer (0-based)', example: 0 })
  correctIndex!: number;

  @ApiProperty({ description: 'Explanation of the correct answer' })
  explanation!: string;

  @ApiProperty({ description: 'Tags for filtering', type: [String] })
  tags!: string[];
}

export class CategoryDto {
  @ApiProperty({ description: 'Category ID', example: 'law' })
  id!: string;

  @ApiProperty({ description: 'Category name', example: 'Основы законодательства' })
  name!: string;

  @ApiProperty({ description: 'Category description' })
  description!: string;

  @ApiProperty({ description: 'Total questions in category', example: 50 })
  totalQuestions!: number;

  @ApiProperty({ description: 'Icon name for UI', example: 'scale' })
  icon!: string;
}

export class GetQuestionsQueryDto {
  @ApiPropertyOptional({ enum: QuestionCategory, description: 'Filter by category' })
  @IsOptional()
  @IsEnum(QuestionCategory)
  category?: QuestionCategory;

  @ApiPropertyOptional({ description: 'Number of questions to return', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  count?: number = 20;

  @ApiPropertyOptional({ enum: QuestionDifficulty, description: 'Filter by difficulty' })
  @IsOptional()
  @IsEnum(QuestionDifficulty)
  difficulty?: QuestionDifficulty;
}
