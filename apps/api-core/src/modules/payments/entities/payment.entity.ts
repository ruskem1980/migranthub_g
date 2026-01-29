import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  WAITING_FOR_CAPTURE = 'waiting_for_capture',
  SUCCEEDED = 'succeeded',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
}

export enum PaymentProvider {
  YOOKASSA = 'yookassa',
  SBP = 'sbp',
}

export interface PaymentMetadata {
  patentRegion?: string;
  patentMonth?: number;
  patentYear?: number;
  description?: string;
  [key: string]: unknown;
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index('idx_payments_user_id')
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ name: 'external_id', type: 'varchar', length: 64, nullable: true })
  @Index('idx_payments_external_id')
  externalId!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: string;

  @Column({ type: 'varchar', length: 3, default: 'RUB' })
  currency!: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  @Index('idx_payments_status')
  status!: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentProvider,
    default: PaymentProvider.YOOKASSA,
  })
  provider!: PaymentProvider;

  @Column({ type: 'varchar', length: 255 })
  description!: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: PaymentMetadata | null;

  @Column({ name: 'payment_url', type: 'varchar', length: 512, nullable: true })
  paymentUrl!: string | null;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 64 })
  @Index('idx_payments_idempotency_key')
  idempotencyKey!: string;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt!: Date | null;

  @Column({ name: 'canceled_at', type: 'timestamptz', nullable: true })
  canceledAt!: Date | null;

  @Column({ name: 'cancellation_reason', type: 'varchar', length: 255, nullable: true })
  cancellationReason!: string | null;

  @Column({ name: 'refunded_at', type: 'timestamptz', nullable: true })
  refundedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @Index('idx_payments_created_at')
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
