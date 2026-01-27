import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max } from 'class-validator';

export class PatentCalcRequestDto {
  @ApiProperty({ example: '77', description: 'Region code' })
  @IsString()
  regionCode!: string;

  @ApiProperty({ example: 3, description: 'Number of months (1-12)' })
  @IsInt()
  @Min(1)
  @Max(12)
  months!: number;
}

export class PatentCalcBreakdownDto {
  @ApiProperty({ example: 1 })
  month!: number;

  @ApiProperty({ example: 6502 })
  price!: number;
}

export class PatentCalcResponseDto {
  @ApiProperty({ example: '77' })
  regionCode!: string;

  @ApiProperty({ example: 'Москва' })
  regionName!: string;

  @ApiProperty({ example: 1200 })
  baseRate!: number;

  @ApiProperty({ example: 2.2591 })
  coefficient!: number;

  @ApiProperty({ example: 3 })
  months!: number;

  @ApiProperty({ example: 19506 })
  totalPrice!: number;

  @ApiProperty({ type: [PatentCalcBreakdownDto] })
  breakdown!: PatentCalcBreakdownDto[];
}
