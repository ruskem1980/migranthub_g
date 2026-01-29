import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PermitStatusEnum {
  PENDING = 'PENDING', // На рассмотрении
  APPROVED = 'APPROVED', // Одобрено
  REJECTED = 'REJECTED', // Отказано
  READY_FOR_PICKUP = 'READY_FOR_PICKUP', // Готово к выдаче
  ADDITIONAL_DOCS_REQUIRED = 'ADDITIONAL_DOCS_REQUIRED', // Требуются доп. документы
  NOT_FOUND = 'NOT_FOUND', // Заявление не найдено
  UNKNOWN = 'UNKNOWN', // Не удалось определить
}

/**
 * Источник данных для результата проверки статуса РВП/ВНЖ
 */
export enum PermitStatusSource {
  /** Результат получен от сервиса ФМС (Playwright) */
  FMS = 'fms',
  /** Результат получен из кэша */
  CACHE = 'cache',
  /** Fallback результат (при недоступности сервиса) */
  FALLBACK = 'fallback',
}

export class PermitStatusResponseDto {
  @ApiProperty({ description: 'Найдено ли заявление', example: true })
  found!: boolean;

  @ApiProperty({
    enum: PermitStatusEnum,
    description: 'Статус заявления',
    example: PermitStatusEnum.PENDING,
  })
  status!: PermitStatusEnum;

  @ApiProperty({
    description: 'Текст ответа со страницы',
    example: 'Ваше заявление находится на рассмотрении',
  })
  message!: string;

  @ApiPropertyOptional({
    description: 'Примерная дата готовности (если указана)',
    example: '2024-03-15',
  })
  estimatedDate?: string;

  @ApiProperty({
    description: 'Дата и время проверки',
    example: '2024-01-29T12:00:00.000Z',
  })
  checkedAt!: string;

  @ApiPropertyOptional({
    description: 'Сообщение об ошибке (если есть)',
    example: 'Сервис временно недоступен',
  })
  error?: string;

  @ApiPropertyOptional({
    enum: PermitStatusSource,
    description: 'Источник данных результата',
    example: PermitStatusSource.FMS,
  })
  source?: PermitStatusSource;
}
