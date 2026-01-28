import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Статус проверки запрета на въезд
 */
export enum BanStatus {
  /** Запрет не обнаружен */
  NO_BAN = 'no_ban',
  /** Обнаружен запрет на въезд */
  HAS_BAN = 'has_ban',
  /** Не удалось определить статус (сервис недоступен) */
  UNKNOWN = 'unknown',
  /** Ошибка при проверке */
  CHECK_FAILED = 'check_failed',
}

/**
 * Тип запрета на въезд
 */
export enum BanType {
  /** Административный запрет (выдворение, нарушение миграционного законодательства) */
  ADMINISTRATIVE = 'administrative',
  /** Уголовный запрет (связанный с уголовным преследованием) */
  CRIMINAL = 'criminal',
  /** Санитарный запрет (карантин, эпидемиологические ограничения) */
  SANITARY = 'sanitary',
}

/**
 * Источник данных для результата проверки
 */
export enum BanCheckSource {
  /** Результат получен от сервиса МВД (HTTP API) */
  MVD = 'mvd',
  /** Результат получен от сервиса ФМС (Playwright, sid=3000) */
  FMS = 'fms',
  /** Результат получен из кэша */
  CACHE = 'cache',
  /** Fallback результат (mock или при недоступности сервиса) */
  FALLBACK = 'fallback',
}

export class BanCheckResponseDto {
  @ApiProperty({
    enum: BanStatus,
    description: 'Статус проверки запрета на въезд',
    example: BanStatus.NO_BAN,
  })
  status!: BanStatus;

  @ApiProperty({
    enum: BanCheckSource,
    description: 'Источник данных результата',
    example: BanCheckSource.MVD,
  })
  source!: BanCheckSource;

  @ApiPropertyOptional({
    enum: BanType,
    description: 'Тип запрета на въезд (если обнаружен)',
    example: BanType.ADMINISTRATIVE,
  })
  banType?: BanType;

  @ApiPropertyOptional({
    description: 'Причина запрета (если обнаружен)',
    example: 'Нарушение миграционного законодательства',
  })
  reason?: string;

  @ApiPropertyOptional({
    description: 'Дата окончания запрета (ISO формат)',
    example: '2025-12-31',
  })
  expiresAt?: string;

  @ApiProperty({
    description: 'Время выполнения проверки (ISO формат)',
    example: '2024-01-15T10:30:00.000Z',
  })
  checkedAt!: string;

  @ApiPropertyOptional({
    description: 'Сообщение об ошибке (если проверка не удалась)',
    example: 'Сервис МВД временно недоступен',
  })
  error?: string;
}
