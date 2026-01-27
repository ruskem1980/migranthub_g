import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class LawDto {
  @ApiProperty({ example: 'fz-115' })
  id!: string;

  @ApiProperty({ example: 'registration' })
  categoryId!: string;

  @ApiProperty({ example: 'О правовом положении иностранных граждан в РФ' })
  title!: string;

  @ApiProperty({ example: '115-ФЗ' })
  number!: string;

  @ApiProperty({ example: '2002-07-25' })
  date!: string;

  @ApiProperty({ example: 'http://consultant.ru/...' })
  url!: string;

  @ApiProperty({ example: 'Основной закон о статусе иностранцев' })
  summary!: string;
}

export class LawFilterDto {
  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Search in title' })
  @IsOptional()
  @IsString()
  search?: string;
}
