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

export class PermitStatusResponseDto {
  @ApiProperty({ description: 'Найдено ли заявление' })
  found: boolean;

  @ApiProperty({ enum: PermitStatusEnum, description: 'Статус заявления' })
  status: PermitStatusEnum;

  @ApiProperty({ description: 'Текст ответа со страницы' })
  message: string;

  @ApiPropertyOptional({ description: 'Примерная дата готовности (если указана)' })
  estimatedDate?: string;

  @ApiProperty({ description: 'Дата и время проверки' })
  checkedAt: string;

  @ApiPropertyOptional({ description: 'Сообщение об ошибке (если есть)' })
  error?: string;
}
