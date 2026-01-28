import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  Length,
  IsNotEmpty,
  IsOptional,
  IsEnum,
} from 'class-validator';

/**
 * Источник для проверки запрета на въезд
 */
export enum BanCheckSourceRequest {
  /** Проверка через МВД (HTTP API) */
  MVD = 'mvd',
  /** Проверка через ФМС (Playwright, требует citizenship) */
  FMS = 'fms',
}

export class BanCheckQueryDto {
  @ApiProperty({
    description: 'Last name (surname) in Latin characters',
    example: 'IVANOV',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  lastName!: string;

  @ApiProperty({
    description: 'First name in Latin characters',
    example: 'IVAN',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  firstName!: string;

  @ApiPropertyOptional({
    description: 'Middle name (patronymic) in Latin characters',
    example: 'PETROVICH',
  })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  middleName?: string;

  @ApiProperty({
    description: 'Birth date in ISO format',
    example: '1990-01-15',
  })
  @IsDateString()
  birthDate!: string;

  @ApiPropertyOptional({
    description: 'Citizenship country code (required for FMS source)',
    example: 'UZB',
  })
  @IsString()
  @IsOptional()
  @Length(2, 10)
  citizenship?: string;

  @ApiPropertyOptional({
    enum: BanCheckSourceRequest,
    description: 'Source for ban check (mvd or fms). FMS requires citizenship field.',
    example: BanCheckSourceRequest.MVD,
    default: BanCheckSourceRequest.MVD,
  })
  @IsEnum(BanCheckSourceRequest)
  @IsOptional()
  source?: BanCheckSourceRequest;
}
