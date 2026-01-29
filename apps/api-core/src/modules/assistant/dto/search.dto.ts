import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsIn,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SearchRequestDto {
  @ApiProperty({
    description: 'Search query',
    example: 'патент документы',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  query!: string;

  @ApiPropertyOptional({
    description: 'Language for search results (ru or en)',
    enum: ['ru', 'en'],
    default: 'ru',
  })
  @IsOptional()
  @IsString()
  @IsIn(['ru', 'en'])
  language?: 'ru' | 'en';

  @ApiPropertyOptional({
    description: 'Maximum number of results (1-10)',
    default: 5,
    minimum: 1,
    maximum: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filter by category',
    example: 'patent',
  })
  @IsOptional()
  @IsString()
  category?: string;
}

export class SearchResultItemDto {
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
    description: 'Question in requested language',
  })
  question!: {
    ru: string;
    en: string;
  };

  @ApiProperty({
    description: 'Answer in requested language',
  })
  answer!: {
    ru: string;
    en: string;
  };

  @ApiProperty({
    description: 'Related tags',
    type: [String],
    example: ['патент', 'документы', 'patent', 'documents'],
  })
  tags!: string[];

  @ApiPropertyOptional({
    description: 'Legal reference',
    example: 'ФЗ-115, ст. 13.3',
  })
  legalReference!: string | null;

  @ApiProperty({
    description: 'Relevance score (0-1)',
    example: 0.92,
  })
  similarity!: number;
}

export class SearchResponseDto {
  @ApiProperty({
    description: 'Search results',
    type: [SearchResultItemDto],
  })
  results!: SearchResultItemDto[];

  @ApiProperty({
    description: 'Total number of results found',
    example: 5,
  })
  total!: number;

  @ApiProperty({
    description: 'Search query that was used',
    example: 'патент документы',
  })
  query!: string;
}
