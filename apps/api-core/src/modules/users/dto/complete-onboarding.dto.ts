import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  Length,
  IsEnum,
} from 'class-validator';

/**
 * Цель визита в РФ
 */
export enum VisitPurpose {
  WORK = 'work',
  STUDY = 'study',
  TOURISM = 'tourism',
  FAMILY = 'family',
  BUSINESS = 'business',
  OTHER = 'other',
}

export class CompleteOnboardingDto {
  @ApiProperty({
    description: 'Код гражданства (ISO 3166-1 alpha-3)',
    example: 'UZB',
    minLength: 3,
    maxLength: 3,
  })
  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  citizenshipCode!: string;

  @ApiProperty({
    description: 'Дата въезда в Россию',
    example: '2024-01-15',
  })
  @IsNotEmpty()
  @IsDateString()
  entryDate!: string;

  @ApiProperty({
    description: 'Цель визита',
    enum: VisitPurpose,
    example: VisitPurpose.WORK,
  })
  @IsNotEmpty()
  @IsEnum(VisitPurpose)
  purpose!: VisitPurpose;

  @ApiPropertyOptional({
    description: 'Код региона пребывания в России',
    example: '77',
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  regionCode?: string;

  @ApiPropertyOptional({
    description: 'Дата регистрации по месту пребывания',
    example: '2024-01-20',
  })
  @IsOptional()
  @IsDateString()
  registrationDate?: string;

  @ApiPropertyOptional({
    description: 'Дата оформления патента на работу',
    example: '2024-02-01',
  })
  @IsOptional()
  @IsDateString()
  patentDate?: string;
}
