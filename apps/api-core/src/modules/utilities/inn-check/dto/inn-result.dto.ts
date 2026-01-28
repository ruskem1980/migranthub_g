import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum InnCheckSource {
  FNS = 'fns',
  CACHE = 'cache',
  MOCK = 'mock',
  FALLBACK = 'fallback',
}

export class InnResultDto {
  @ApiProperty({ description: 'ИНН найден', example: true })
  found!: boolean;

  @ApiPropertyOptional({
    description: 'ИНН (12 цифр для физлиц)',
    example: '123456789012',
  })
  inn?: string;

  @ApiProperty({ enum: InnCheckSource, description: 'Источник данных' })
  source!: InnCheckSource;

  @ApiProperty({ description: 'Время проверки (ISO)' })
  checkedAt!: string;

  @ApiPropertyOptional({ description: 'Сообщение об ошибке' })
  error?: string;

  @ApiPropertyOptional({ description: 'Дополнительное сообщение' })
  message?: string;
}
