import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsDateString, IsArray, IsOptional, IsInt, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StayCalcRequestDto {
  @ApiProperty({
    description: 'Entry date in ISO format',
    example: '2024-01-15',
  })
  @IsDateString()
  @IsNotEmpty()
  entryDate!: string;

  @ApiProperty({
    description: 'Array of exit dates (for multiple entries)',
    example: ['2024-03-01', '2024-04-15'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsDateString({}, { each: true })
  exitDates?: string[];
}

export class StayPeriodDto {
  @ApiProperty({
    description: 'Period start date',
    example: '2024-01-15',
  })
  @IsDateString()
  startDate!: string;

  @ApiProperty({
    description: 'Period end date',
    example: '2024-03-01',
  })
  @IsDateString()
  endDate!: string;

  @ApiProperty({
    description: 'Days in this period',
    example: 46,
  })
  @IsInt()
  days!: number;
}

export class StayCalcResponseDto {
  @ApiProperty({
    description: 'Entry date',
    example: '2024-01-15',
  })
  @IsDateString()
  entryDate!: string;

  @ApiProperty({
    description: 'Total days spent in Russia within 180-day period',
    example: 45,
  })
  @IsInt()
  daysInRussia!: number;

  @ApiProperty({
    description: 'Days remaining until 90-day limit',
    example: 45,
  })
  @IsInt()
  daysRemaining!: number;

  @ApiProperty({
    description: 'Maximum allowed stay date',
    example: '2024-04-14',
  })
  @IsDateString()
  maxStayDate!: string;

  @ApiProperty({
    description: 'Whether the stay exceeds allowed limit',
    example: false,
  })
  @IsBoolean()
  isOverstay!: boolean;

  @ApiProperty({
    description: 'Breakdown of stay periods',
    type: [StayPeriodDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StayPeriodDto)
  periods!: StayPeriodDto[];
}
