import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Информация об исполнительном производстве
 */
export class ExecutiveProceeding {
  @ApiPropertyOptional({
    description: 'Номер исполнительного производства',
    example: '12345/21/77001-ИП',
  })
  number?: string;

  @ApiPropertyOptional({
    description: 'Дата возбуждения исполнительного производства',
    example: '2021-03-15',
  })
  date?: string;

  @ApiPropertyOptional({
    description: 'Предмет исполнения (тип долга)',
    example: 'Госпошлина',
  })
  subject?: string;

  @ApiPropertyOptional({
    description: 'Наименование отдела судебных приставов',
    example: 'ОСП по Центральному АО г. Москвы',
  })
  department?: string;

  @ApiPropertyOptional({
    description: 'ФИО судебного пристава-исполнителя',
    example: 'Петров А.И.',
  })
  bailiff?: string;

  @ApiPropertyOptional({
    description: 'Сумма задолженности по данному производству',
    example: 5000.5,
  })
  amount?: number;

  @ApiPropertyOptional({
    description: 'Реквизиты исполнительного документа',
    example: 'Судебный приказ № 2-1234/2021 от 01.02.2021',
  })
  executiveDocument?: string;
}

/**
 * Источник данных для результата проверки
 */
export enum FsspCheckSource {
  /** Результат получен от сервиса ФССП */
  FSSP = 'fssp',
  /** Результат получен из кэша */
  CACHE = 'cache',
  /** Fallback результат (mock или при недоступности сервиса) */
  FALLBACK = 'fallback',
}

/**
 * DTO для ответа проверки задолженности в ФССП
 */
export class FsspResultDto {
  @ApiProperty({
    description: 'Наличие задолженности',
    example: true,
  })
  hasDebt!: boolean;

  @ApiPropertyOptional({
    description: 'Общая сумма задолженности (в рублях)',
    example: 15000.5,
  })
  totalAmount?: number;

  @ApiPropertyOptional({
    description: 'Список исполнительных производств',
    type: [ExecutiveProceeding],
  })
  execProceedings?: ExecutiveProceeding[];

  @ApiProperty({
    enum: FsspCheckSource,
    description: 'Источник данных результата',
    example: FsspCheckSource.FSSP,
  })
  source!: FsspCheckSource;

  @ApiProperty({
    description: 'Время выполнения проверки (ISO формат)',
    example: '2024-01-15T10:30:00.000Z',
  })
  checkedAt!: string;

  @ApiPropertyOptional({
    description: 'Сообщение об ошибке (если проверка не удалась)',
    example: 'Сервис ФССП временно недоступен',
  })
  error?: string;

  @ApiPropertyOptional({
    description: 'Количество найденных исполнительных производств',
    example: 3,
  })
  totalProceedings?: number;
}
