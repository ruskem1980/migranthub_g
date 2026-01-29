import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  IsObject,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Payment amount in rubles',
    example: 6500,
    minimum: 1,
    maximum: 100000,
  })
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(100000)
  amount!: number;

  @ApiProperty({
    description: 'Payment description',
    example: 'Patent payment for Moscow region, January 2025',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description!: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the payment',
    example: {
      patentRegion: '77',
      patentMonth: 1,
      patentYear: 2025,
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
