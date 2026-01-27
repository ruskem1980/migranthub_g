import { ApiProperty } from '@nestjs/swagger';

export class CategoryResultDto {
  @ApiProperty({ description: 'Category name', example: 'law' })
  category!: string;

  @ApiProperty({ description: 'Total questions in category', example: 10 })
  total!: number;

  @ApiProperty({ description: 'Correct answers count', example: 8 })
  correct!: number;

  @ApiProperty({ description: 'Percentage of correct answers', example: 80 })
  percentage!: number;
}

export class ExamResultDto {
  @ApiProperty({ description: 'Total number of questions', example: 20 })
  totalQuestions!: number;

  @ApiProperty({ description: 'Number of correct answers', example: 15 })
  correctAnswers!: number;

  @ApiProperty({ description: 'Percentage score', example: 75 })
  percentage!: number;

  @ApiProperty({ description: 'Whether the exam is passed (>= 70%)', example: true })
  passed!: boolean;

  @ApiProperty({ description: 'Results by category', type: [CategoryResultDto] })
  byCategory!: CategoryResultDto[];

  @ApiProperty({ description: 'Topics that need more practice', type: [String] })
  weakTopics!: string[];

  @ApiProperty({ description: 'Time spent in seconds', example: 1800 })
  timeSpentSeconds!: number;
}

export class CategoryProgressDto {
  @ApiProperty({ description: 'Number of answered questions', example: 25 })
  answered!: number;

  @ApiProperty({ description: 'Number of correct answers', example: 20 })
  correct!: number;
}

export class ExamProgressDto {
  @ApiProperty({ description: 'Total questions answered', example: 100 })
  totalAnswered!: number;

  @ApiProperty({ description: 'Total correct answers', example: 75 })
  correctAnswers!: number;

  @ApiProperty({ description: 'Current streak (days)', example: 5 })
  streak!: number;

  @ApiProperty({ description: 'Last activity date', example: '2024-01-15' })
  lastActivityDate!: string | null;

  @ApiProperty({
    description: 'Progress by category',
    example: { law: { answered: 30, correct: 25 } },
  })
  byCategory!: Record<string, CategoryProgressDto>;

  @ApiProperty({ description: 'Earned achievements', type: [String] })
  achievements!: string[];
}

export class RecentResultDto {
  @ApiProperty({ description: 'Date of the test', example: '2024-01-15' })
  date!: string;

  @ApiProperty({ description: 'Score percentage', example: 80 })
  score!: number;
}

export class ExamStatisticsDto {
  @ApiProperty({ description: 'Average score across all tests', example: 72.5 })
  averageScore!: number;

  @ApiProperty({ description: 'Number of completed tests', example: 10 })
  testsCompleted!: number;

  @ApiProperty({ description: 'Best score achieved', example: 95 })
  bestScore!: number;

  @ApiProperty({ description: 'Category with lowest scores', example: 'history' })
  weakestCategory!: string | null;

  @ApiProperty({ description: 'Category with highest scores', example: 'law' })
  strongestCategory!: string | null;

  @ApiProperty({ description: 'Recent test results', type: [RecentResultDto] })
  recentResults!: RecentResultDto[];
}
