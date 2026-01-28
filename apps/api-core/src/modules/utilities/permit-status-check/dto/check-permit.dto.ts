import { IsEnum, IsString, IsDateString, IsOptional, IsNotEmpty, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PermitType {
  RVP = 'RVP', // Разрешение на временное проживание
  VNJ = 'VNJ', // Вид на жительство
}

export class CheckPermitDto {
  @ApiProperty({ enum: PermitType, description: 'Тип разрешения: RVP или VNJ' })
  @IsEnum(PermitType)
  permitType!: PermitType;

  @ApiProperty({
    description: 'Код региона подачи заявления (например, "77" для Москвы)',
    example: '77',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 10)
  region!: string;

  @ApiProperty({
    description: 'Дата подачи заявления в формате YYYY-MM-DD',
    example: '2024-01-15',
  })
  @IsDateString()
  applicationDate!: string;

  @ApiPropertyOptional({
    description: 'Номер заявления (если известен)',
    example: '123456789',
  })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  applicationNumber?: string;

  @ApiProperty({
    description: 'Фамилия заявителя (латиница)',
    example: 'IVANOV',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  lastName!: string;

  @ApiProperty({
    description: 'Имя заявителя (латиница)',
    example: 'IVAN',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  firstName!: string;

  @ApiPropertyOptional({
    description: 'Отчество заявителя (латиница)',
    example: 'PETROVICH',
  })
  @IsString()
  @IsOptional()
  @Length(1, 100)
  middleName?: string;

  @ApiProperty({
    description: 'Дата рождения в формате YYYY-MM-DD',
    example: '1990-01-15',
  })
  @IsDateString()
  birthDate!: string;
}
