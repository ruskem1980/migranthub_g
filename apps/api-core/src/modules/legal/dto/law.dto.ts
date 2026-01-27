import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsUrl, IsOptional } from 'class-validator';

export class LawDto {
  @ApiProperty({
    description: 'Unique law identifier',
    example: 'fz-115',
  })
  @IsString()
  @IsNotEmpty()
  id!: string;

  @ApiProperty({
    description: 'Law title',
    example: 'О правовом положении иностранных граждан в Российской Федерации',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: 'Law number',
    example: '115-ФЗ',
  })
  @IsString()
  @IsNotEmpty()
  number!: string;

  @ApiProperty({
    description: 'Law description',
    example: 'Федеральный закон определяющий правовое положение иностранных граждан в РФ',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'Law effective date',
    example: '2002-07-25',
  })
  @IsDateString()
  effectiveDate!: string;

  @ApiProperty({
    description: 'URL to official law text',
    example: 'http://pravo.gov.ru/proxy/ips/?docbody=&nd=102078073',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiProperty({
    description: 'Category ID this law belongs to',
    example: 'registration',
  })
  @IsString()
  @IsNotEmpty()
  categoryId!: string;
}
