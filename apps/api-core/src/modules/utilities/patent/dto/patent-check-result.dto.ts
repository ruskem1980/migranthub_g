import { ApiProperty } from '@nestjs/swagger';

/**
 * Статус патента
 */
export enum PatentStatus {
  VALID = 'valid',
  INVALID = 'invalid',
  EXPIRED = 'expired',
  NOT_FOUND = 'not_found',
  ERROR = 'error',
}

/**
 * DTO результата проверки патента
 */
export class PatentCheckResultDto {
  @ApiProperty({
    description: 'Статус патента',
    enum: PatentStatus,
    example: PatentStatus.VALID,
  })
  status!: PatentStatus;

  @ApiProperty({
    description: 'Патент действителен',
    example: true,
  })
  isValid!: boolean;

  @ApiProperty({
    description: 'Сообщение с описанием результата',
    example: 'Патент действителен до 31.12.2025',
    required: false,
  })
  message?: string;

  @ApiProperty({
    description: 'Серия патента',
    example: '77',
  })
  series!: string;

  @ApiProperty({
    description: 'Номер патента',
    example: '12345678',
  })
  number!: string;

  @ApiProperty({
    description: 'Регион выдачи патента',
    example: 'Москва',
    required: false,
  })
  region?: string;

  @ApiProperty({
    description: 'Дата выдачи патента (ISO формат)',
    example: '2024-01-15',
    required: false,
  })
  issueDate?: string;

  @ApiProperty({
    description: 'Дата окончания действия патента (ISO формат)',
    example: '2025-12-31',
    required: false,
  })
  expirationDate?: string;

  @ApiProperty({
    description: 'ФИО владельца патента',
    example: 'IVANOV IVAN',
    required: false,
  })
  ownerName?: string;

  @ApiProperty({
    description: 'Данные получены из кэша',
    example: false,
  })
  fromCache!: boolean;

  @ApiProperty({
    description: 'Время проверки (ISO формат)',
    example: '2024-01-15T10:30:00.000Z',
  })
  checkedAt!: string;

  @ApiProperty({
    description: 'Источник данных (mock или real)',
    example: 'real',
  })
  source!: 'mock' | 'real';
}

/**
 * DTO ошибки проверки патента
 */
export class PatentCheckErrorDto {
  @ApiProperty({
    description: 'Код ошибки',
    example: 'SERVICE_UNAVAILABLE',
  })
  errorCode!: string;

  @ApiProperty({
    description: 'Описание ошибки',
    example: 'Сервис проверки патентов временно недоступен',
  })
  message!: string;

  @ApiProperty({
    description: 'Можно ли повторить запрос',
    example: true,
  })
  retryable!: boolean;

  @ApiProperty({
    description: 'Рекомендуемое время для повторного запроса (секунды)',
    example: 60,
    required: false,
  })
  retryAfter?: number;
}
