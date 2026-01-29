import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  Matches,
  Length,
  ValidateIf,
} from 'class-validator';

/**
 * Тип проверки штрафов ГИБДД
 */
export enum GibddCheckType {
  /** По СТС (свидетельство о регистрации ТС) */
  STS = 'sts',
  /** По ВУ (водительское удостоверение) */
  LICENSE = 'license',
}

/**
 * DTO для запроса проверки штрафов ГИБДД
 */
export class GibddQueryDto {
  @ApiProperty({
    enum: GibddCheckType,
    description: 'Тип проверки: по СТС или по водительскому удостоверению',
    example: GibddCheckType.STS,
  })
  @IsEnum(GibddCheckType)
  checkType!: GibddCheckType;

  // ---- Поля для проверки по СТС ----

  @ApiPropertyOptional({
    description: 'Государственный регистрационный номер (формат А000АА000 или А000АА00)',
    example: 'А123БВ777',
  })
  @ValidateIf((o) => o.checkType === GibddCheckType.STS)
  @IsString()
  @IsNotEmpty()
  @Matches(/^[АВЕКМНОРСТУХ]\d{3}[АВЕКМНОРСТУХ]{2}\d{2,3}$/i, {
    message: 'Госномер должен быть в формате А000АА000 (кириллица)',
  })
  regNumber?: string;

  @ApiPropertyOptional({
    description: 'Номер СТС (10 цифр)',
    example: '7700123456',
  })
  @ValidateIf((o) => o.checkType === GibddCheckType.STS)
  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  @Matches(/^\d{10}$/, {
    message: 'Номер СТС должен содержать ровно 10 цифр',
  })
  stsNumber?: string;

  // ---- Поля для проверки по ВУ ----

  @ApiPropertyOptional({
    description: 'Серия и номер водительского удостоверения (10 символов)',
    example: '7700123456',
  })
  @ValidateIf((o) => o.checkType === GibddCheckType.LICENSE)
  @IsString()
  @IsNotEmpty()
  @Length(10, 10)
  @Matches(/^[0-9А-Яа-яA-Za-z]{10}$/, {
    message: 'Серия и номер ВУ должны содержать 10 символов',
  })
  licenseNumber?: string;

  @ApiPropertyOptional({
    description: 'Дата выдачи ВУ в формате ISO (YYYY-MM-DD)',
    example: '2020-05-15',
  })
  @ValidateIf((o) => o.checkType === GibddCheckType.LICENSE)
  @IsDateString()
  issueDate?: string;
}
