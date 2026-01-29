import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class YooKassaAmount {
  @ApiProperty({ example: '6500.00' })
  @IsString()
  value!: string;

  @ApiProperty({ example: 'RUB' })
  @IsString()
  currency!: string;
}

export class YooKassaCancellationDetails {
  @ApiProperty({ example: 'yoo_money' })
  @IsString()
  party!: string;

  @ApiProperty({ example: 'expired_on_confirmation' })
  @IsString()
  reason!: string;
}

export class YooKassaPaymentObject {
  @ApiProperty({ example: '2c1f2e5d-000f-5000-9000-1a5c5c1b3d3e' })
  @IsString()
  id!: string;

  @ApiProperty({ example: 'succeeded' })
  @IsString()
  status!: string;

  @ApiProperty({ type: YooKassaAmount })
  @IsObject()
  @ValidateNested()
  @Type(() => YooKassaAmount)
  amount!: YooKassaAmount;

  @ApiProperty({ example: 'Patent payment for Moscow region' })
  @IsString()
  description!: string;

  @ApiProperty({ example: true })
  paid!: boolean;

  @ApiProperty({ example: false })
  refundable!: boolean;

  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  @IsString()
  created_at!: string;

  @ApiProperty({ example: '2025-01-15T10:35:00.000Z', required: false })
  captured_at?: string;

  @ApiProperty({ type: YooKassaCancellationDetails, required: false })
  cancellation_details?: YooKassaCancellationDetails;

  @ApiProperty({ example: { userId: '550e8400-e29b-41d4-a716-446655440000' }, required: false })
  metadata?: Record<string, unknown>;
}

export class YooKassaWebhookDto {
  @ApiProperty({
    description: 'Event type',
    example: 'payment.succeeded',
  })
  @IsString()
  @IsNotEmpty()
  type!: string;

  @ApiProperty({
    description: 'Event name',
    example: 'payment.succeeded',
  })
  @IsString()
  @IsNotEmpty()
  event!: string;

  @ApiProperty({
    description: 'Payment object',
    type: YooKassaPaymentObject,
  })
  @IsObject()
  @ValidateNested()
  @Type(() => YooKassaPaymentObject)
  object!: YooKassaPaymentObject;
}
