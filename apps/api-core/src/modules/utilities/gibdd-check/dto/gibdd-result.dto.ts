import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Информация о штрафе ГИБДД
 */
export class GibddFine {
  @ApiPropertyOptional({
    description: 'Дата нарушения',
    example: '2024-01-15',
  })
  date?: string;

  @ApiPropertyOptional({
    description: 'Статья КоАП РФ',
    example: '12.9 ч.2',
  })
  article?: string;

  @ApiPropertyOptional({
    description: 'Описание нарушения',
    example: 'Превышение скорости на 20-40 км/ч',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Сумма штрафа (в рублях)',
    example: 500,
  })
  amount?: number;

  @ApiPropertyOptional({
    description: 'Сумма со скидкой 50% (если доступна)',
    example: 250,
  })
  discountAmount?: number;

  @ApiPropertyOptional({
    description: 'Дата окончания скидки',
    example: '2024-02-04',
  })
  discountDeadline?: string;

  @ApiPropertyOptional({
    description: 'Номер постановления (УИН)',
    example: '18810177220123456789',
  })
  uin?: string;

  @ApiPropertyOptional({
    description: 'Ссылка для оплаты на Госуслугах',
    example: 'https://www.gosuslugi.ru/pay?uin=18810177220123456789',
  })
  paymentUrl?: string;

  @ApiPropertyOptional({
    description: 'Место нарушения',
    example: 'г. Москва, ул. Тверская, д. 1',
  })
  location?: string;

  @ApiPropertyOptional({
    description: 'Подразделение ГИБДД',
    example: 'ЦАФАП ОДД ГИБДД ГУ МВД России по г. Москве',
  })
  department?: string;
}

/**
 * Источник данных для результата проверки
 */
export enum GibddCheckSource {
  /** Результат получен от сервиса ГИБДД */
  GIBDD = 'gibdd',
  /** Результат получен из кэша */
  CACHE = 'cache',
  /** Fallback результат (mock или при недоступности сервиса) */
  FALLBACK = 'fallback',
}

/**
 * DTO для ответа проверки штрафов ГИБДД
 */
export class GibddResultDto {
  @ApiProperty({
    description: 'Наличие штрафов',
    example: true,
  })
  hasFines!: boolean;

  @ApiPropertyOptional({
    description: 'Общая сумма штрафов (в рублях)',
    example: 3500,
  })
  totalAmount?: number;

  @ApiPropertyOptional({
    description: 'Количество найденных штрафов',
    example: 2,
  })
  finesCount?: number;

  @ApiPropertyOptional({
    description: 'Список штрафов',
    type: [GibddFine],
  })
  fines?: GibddFine[];

  @ApiProperty({
    enum: GibddCheckSource,
    description: 'Источник данных результата',
    example: GibddCheckSource.GIBDD,
  })
  source!: GibddCheckSource;

  @ApiProperty({
    description: 'Время выполнения проверки (ISO формат)',
    example: '2024-01-15T10:30:00.000Z',
  })
  checkedAt!: string;

  @ApiPropertyOptional({
    description: 'Сообщение об ошибке (если проверка не удалась)',
    example: 'Сервис ГИБДД временно недоступен',
  })
  error?: string;

  @ApiPropertyOptional({
    description: 'Дополнительное сообщение',
    example: 'Штрафы актуальны на момент проверки',
  })
  message?: string;
}
