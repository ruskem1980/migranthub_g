import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Статус действительности паспорта
 */
export enum PassportValidityStatus {
  /** Паспорт действителен */
  VALID = 'VALID',
  /** Паспорт недействителен (есть в базе недействительных) */
  INVALID = 'INVALID',
  /** Паспорт не найден в базе недействительных */
  NOT_FOUND = 'NOT_FOUND',
  /** Статус неизвестен (ошибка проверки) */
  UNKNOWN = 'UNKNOWN',
}

/**
 * Источник данных для результата проверки
 */
export enum PassportValiditySource {
  /** Результат получен от сервиса МВД */
  MVD = 'mvd',
  /** Результат получен из кэша */
  CACHE = 'cache',
  /** Fallback результат (mock или при недоступности сервиса) */
  FALLBACK = 'fallback',
}

/**
 * DTO для ответа проверки действительности паспорта РФ
 */
export class PassportValidityResultDto {
  @ApiProperty({
    enum: PassportValidityStatus,
    description: 'Статус действительности паспорта',
    example: PassportValidityStatus.VALID,
  })
  status!: PassportValidityStatus;

  @ApiProperty({
    description: 'Паспорт действителен (true если VALID или NOT_FOUND)',
    example: true,
  })
  isValid!: boolean;

  @ApiProperty({
    description: 'Серия паспорта',
    example: '4510',
  })
  series!: string;

  @ApiProperty({
    description: 'Номер паспорта',
    example: '123456',
  })
  number!: string;

  @ApiProperty({
    enum: PassportValiditySource,
    description: 'Источник данных результата',
    example: PassportValiditySource.MVD,
  })
  source!: PassportValiditySource;

  @ApiProperty({
    description: 'Время выполнения проверки (ISO формат)',
    example: '2024-01-15T10:30:00.000Z',
  })
  checkedAt!: string;

  @ApiPropertyOptional({
    description: 'Подробное сообщение о результате проверки',
    example: 'Паспорт не найден в базе недействительных паспортов',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Сообщение об ошибке (если проверка не удалась)',
    example: 'Сервис МВД временно недоступен',
  })
  error?: string;
}
