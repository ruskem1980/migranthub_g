import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ExamMode {
  PRACTICE = 'practice',
  EXAM = 'exam',
  LEARNING = 'learning',
  MARATHON = 'marathon',
}

export class AnswerDto {
  @ApiProperty({ description: 'Question ID', example: 'q-law-001' })
  @IsString()
  questionId!: string;

  @ApiProperty({ description: 'Selected answer index (0-based)', example: 2 })
  @IsInt()
  @Min(0)
  selectedIndex!: number;
}

export class SubmitExamDto {
  @ApiProperty({ description: 'Array of answers', type: [AnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers!: AnswerDto[];

  @ApiProperty({ enum: ExamMode, description: 'Exam mode', example: 'exam' })
  @IsEnum(ExamMode)
  mode!: ExamMode;

  @ApiProperty({ description: 'Time spent in seconds', example: 1800 })
  @IsInt()
  @Min(0)
  timeSpentSeconds!: number;
}
