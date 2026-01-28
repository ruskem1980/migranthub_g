import { IsEnum, IsString, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PermitType {
  RVP = 'RVP', // Разрешение на временное проживание
  VNJ = 'VNJ', // Вид на жительство
}

export class CheckPermitDto {
  @ApiProperty({ enum: PermitType, description: 'Тип разрешения: RVP или VNJ' })
  @IsEnum(PermitType)
  permitType: PermitType;

  @ApiProperty({ description: 'Код региона подачи заявления (например, "77" для Москвы)' })
  @IsString()
  region: string;

  @ApiProperty({ description: 'Дата подачи заявления в формате YYYY-MM-DD' })
  @IsDateString()
  applicationDate: string;

  @ApiPropertyOptional({ description: 'Номер заявления (если известен)' })
  @IsString()
  @IsOptional()
  applicationNumber?: string;

  @ApiProperty({ description: 'Фамилия заявителя (латиница)' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Имя заявителя (латиница)' })
  @IsString()
  firstName: string;

  @ApiPropertyOptional({ description: 'Отчество заявителя (латиница)' })
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiProperty({ description: 'Дата рождения в формате YYYY-MM-DD' })
  @IsDateString()
  birthDate: string;
}
