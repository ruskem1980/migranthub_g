import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsInt, Min, Max, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PatentCalcRequestDto {
  @ApiProperty({
    description: 'Region code',
    example: '77',
  })
  @IsString()
  @IsNotEmpty()
  regionCode!: string;

  @ApiProperty({
    description: 'Number of months (1-12)',
    example: 3,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  months!: number;
}

export class PatentCalcBreakdownDto {
  @ApiProperty({
    description: 'Month number',
    example: 1,
  })
  @IsInt()
  month!: number;

  @ApiProperty({
    description: 'Price for this month',
    example: 7500,
  })
  @IsNumber()
  price!: number;
}

export class PatentCalcResponseDto {
  @ApiProperty({
    description: 'Region code',
    example: '77',
  })
  @IsString()
  regionCode!: string;

  @ApiProperty({
    description: 'Region name',
    example: 'Москва',
  })
  @IsString()
  regionName!: string;

  @ApiProperty({
    description: 'Base NDFL rate (fixed income)',
    example: 1200,
  })
  @IsNumber()
  baseRate!: number;

  @ApiProperty({
    description: 'Regional coefficient',
    example: 2.5,
  })
  @IsNumber()
  coefficient!: number;

  @ApiProperty({
    description: 'Number of months',
    example: 3,
  })
  @IsInt()
  months!: number;

  @ApiProperty({
    description: 'Total price in rubles',
    example: 22500,
  })
  @IsNumber()
  totalPrice!: number;

  @ApiProperty({
    description: 'Price breakdown by month',
    type: [PatentCalcBreakdownDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PatentCalcBreakdownDto)
  breakdown!: PatentCalcBreakdownDto[];
}
