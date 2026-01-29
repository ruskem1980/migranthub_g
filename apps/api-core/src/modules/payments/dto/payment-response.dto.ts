import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus, PaymentProvider } from '../entities/payment.entity';

export class PaymentResponseDto {
  @ApiProperty({
    description: 'Payment ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'External payment ID from provider',
    example: '2c1f2e5d-000f-5000-9000-1a5c5c1b3d3e',
    nullable: true,
  })
  externalId!: string | null;

  @ApiProperty({
    description: 'Payment amount in rubles',
    example: '6500.00',
  })
  amount!: string;

  @ApiProperty({
    description: 'Currency code',
    example: 'RUB',
  })
  currency!: string;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.PENDING,
  })
  status!: PaymentStatus;

  @ApiProperty({
    description: 'Payment provider',
    enum: PaymentProvider,
    example: PaymentProvider.YOOKASSA,
  })
  provider!: PaymentProvider;

  @ApiProperty({
    description: 'Payment description',
    example: 'Patent payment for Moscow region, January 2025',
  })
  description!: string;

  @ApiPropertyOptional({
    description: 'URL to complete payment',
    example: 'https://yoomoney.ru/checkout/payments/v2/contract/...',
  })
  paymentUrl?: string | null;

  @ApiProperty({
    description: 'Payment creation timestamp',
    example: '2025-01-15T10:30:00.000Z',
  })
  createdAt!: Date;

  @ApiPropertyOptional({
    description: 'Payment completion timestamp',
    example: '2025-01-15T10:35:00.000Z',
    nullable: true,
  })
  paidAt?: Date | null;
}

export class CreatePaymentResponseDto extends PaymentResponseDto {
  @ApiProperty({
    description: 'URL to redirect user for payment',
    example: 'https://yoomoney.ru/checkout/payments/v2/contract/...',
  })
  paymentUrl!: string;
}

export class PaymentStatusResponseDto {
  @ApiProperty({
    description: 'Payment ID (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.SUCCEEDED,
  })
  status!: PaymentStatus;

  @ApiPropertyOptional({
    description: 'Payment completion timestamp',
    example: '2025-01-15T10:35:00.000Z',
    nullable: true,
  })
  paidAt?: Date | null;

  @ApiPropertyOptional({
    description: 'Cancellation reason if payment was canceled',
    example: 'expired_on_confirmation',
    nullable: true,
  })
  cancellationReason?: string | null;
}
