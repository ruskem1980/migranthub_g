import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Expose } from 'class-transformer';
import { VisitPurpose } from './complete-onboarding.dto';

export class CalculateDeadlinesDto {
  @ApiProperty({
    description: 'Дата въезда в Россию',
    example: '2024-01-15',
  })
  @IsNotEmpty()
  @IsDateString()
  entryDate!: string;

  @ApiPropertyOptional({
    description: 'Дата регистрации по месту пребывания',
    example: '2024-01-20',
  })
  @IsOptional()
  @IsDateString()
  registrationDate?: string;

  @ApiPropertyOptional({
    description: 'Дата оформления патента на работу',
    example: '2024-02-01',
  })
  @IsOptional()
  @IsDateString()
  patentDate?: string;

  @ApiPropertyOptional({
    description: 'Цель визита (влияет на расчёт некоторых дедлайнов)',
    enum: VisitPurpose,
    example: VisitPurpose.WORK,
  })
  @IsOptional()
  @IsEnum(VisitPurpose)
  purpose?: VisitPurpose;
}

/**
 * Информация об одном дедлайне
 */
export class DeadlineInfo {
  @ApiProperty({
    description: 'Дата дедлайна',
    example: '2024-04-14',
  })
  @Expose()
  date!: string;

  @ApiProperty({
    description: 'Количество дней до дедлайна (отрицательное = просрочен)',
    example: 30,
  })
  @Expose()
  daysRemaining!: number;

  @ApiProperty({
    description: 'Статус дедлайна',
    enum: ['ok', 'warning', 'critical', 'expired'],
    example: 'ok',
  })
  @Expose()
  status!: 'ok' | 'warning' | 'critical' | 'expired';

  @ApiPropertyOptional({
    description: 'Описание дедлайна',
    example: 'Срок регистрации по месту пребывания',
  })
  @Expose()
  description?: string;
}

export class DeadlinesResponseDto {
  @ApiProperty({
    description: 'Срок регистрации по месту пребывания (7 рабочих дней с въезда)',
    type: DeadlineInfo,
  })
  @Expose()
  registration!: DeadlineInfo;

  @ApiProperty({
    description: 'Окончание 90-дневного периода пребывания',
    type: DeadlineInfo,
  })
  @Expose()
  stay90Days!: DeadlineInfo;

  @ApiProperty({
    description: 'Ограничение 90 из 180 дней',
    type: DeadlineInfo,
  })
  @Expose()
  stayLimit180!: DeadlineInfo;

  @ApiPropertyOptional({
    description: 'Срок оплаты патента (если применимо)',
    type: DeadlineInfo,
  })
  @Expose()
  patentPayment?: DeadlineInfo;

  @ApiPropertyOptional({
    description: 'Срок продления патента (если применимо)',
    type: DeadlineInfo,
  })
  @Expose()
  patentRenewal?: DeadlineInfo;

  @ApiProperty({
    description: 'Дата расчёта',
    example: '2024-02-15',
  })
  @Expose()
  calculatedAt!: string;
}
