import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsDateString, Length, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';

/**
 * DTO для запроса проверки задолженности в ФССП
 */
export class FsspQueryDto {
  @ApiProperty({
    description: 'Фамилия (на русском языке)',
    example: 'Иванов',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  lastName!: string;

  @ApiProperty({
    description: 'Имя (на русском языке)',
    example: 'Иван',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  firstName!: string;

  @ApiPropertyOptional({
    description: 'Отчество (на русском языке)',
    example: 'Петрович',
  })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  middleName?: string;

  @ApiProperty({
    description: 'Дата рождения в формате ISO (YYYY-MM-DD)',
    example: '1990-01-15',
  })
  @IsDateString()
  birthDate!: string;

  @ApiProperty({
    description: 'Код региона (1-99)',
    example: 77,
    minimum: 1,
    maximum: 99,
  })
  @IsInt()
  @Min(1)
  @Max(99)
  region!: number;
}
