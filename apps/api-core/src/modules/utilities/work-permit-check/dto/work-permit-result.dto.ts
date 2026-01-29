import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WorkPermitStatus, WorkPermitSource } from './work-permit-status.enum';

/**
 * DTO для ответа проверки разрешения на работу (РНР)
 */
export class WorkPermitResultDto {
  @ApiProperty({
    enum: WorkPermitStatus,
    description: 'Статус разрешения на работу',
    example: WorkPermitStatus.VALID,
  })
  status!: WorkPermitStatus;

  @ApiProperty({
    description: 'Разрешение действительно (true если VALID)',
    example: true,
  })
  isValid!: boolean;

  @ApiProperty({
    description: 'Серия разрешения на работу',
    example: '77',
  })
  series!: string;

  @ApiProperty({
    description: 'Номер разрешения на работу',
    example: '1234567',
  })
  number!: string;

  @ApiPropertyOptional({
    description: 'Регион выдачи разрешения',
    example: 'г. Москва',
  })
  region?: string;

  @ApiPropertyOptional({
    description: 'Наименование работодателя',
    example: 'ООО "Рога и Копыта"',
  })
  employer?: string;

  @ApiPropertyOptional({
    description: 'Срок действия разрешения (ISO формат)',
    example: '2025-12-31T00:00:00.000Z',
  })
  validUntil?: string;

  @ApiPropertyOptional({
    description: 'Дата выдачи разрешения (ISO формат)',
    example: '2024-01-15T00:00:00.000Z',
  })
  issuedAt?: string;

  @ApiProperty({
    enum: WorkPermitSource,
    description: 'Источник данных результата',
    example: WorkPermitSource.FMS,
  })
  source!: WorkPermitSource;

  @ApiProperty({
    description: 'Время выполнения проверки (ISO формат)',
    example: '2024-01-15T10:30:00.000Z',
  })
  checkedAt!: string;

  @ApiPropertyOptional({
    description: 'Подробное сообщение о результате проверки',
    example: 'Разрешение на работу действительно',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Сообщение об ошибке (если проверка не удалась)',
    example: 'Сервис ФМС временно недоступен',
  })
  error?: string;
}
