import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsArray, IsOptional } from 'class-validator';

export class StayPeriodDto {
  @ApiProperty({ example: '2024-01-15' })
  startDate!: string;

  @ApiProperty({ example: '2024-03-01' })
  endDate!: string;

  @ApiProperty({ example: 45 })
  days!: number;
}

export class StayCalcRequestDto {
  @ApiProperty({ example: '2024-01-15', description: 'Entry date to Russia' })
  @IsDateString()
  entryDate!: string;

  @ApiPropertyOptional({ type: [String], description: 'Exit dates from Russia' })
  @IsOptional()
  @IsArray()
  exitDates?: string[];
}

export class StayCalcResponseDto {
  @ApiProperty({ example: '2024-01-15' })
  entryDate!: string;

  @ApiProperty({ example: 45 })
  daysInRussia!: number;

  @ApiProperty({ example: 45 })
  daysRemaining!: number;

  @ApiProperty({ example: '2024-04-14' })
  maxStayDate!: string;

  @ApiProperty({ example: false })
  isOverstay!: boolean;

  @ApiProperty({ type: [StayPeriodDto] })
  periods!: StayPeriodDto[];
}
