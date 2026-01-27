import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

export interface UserSettings {
  locale: string;
  notifications: {
    push: boolean;
    telegram: boolean;
    deadlines: boolean;
    news: boolean;
  };
  timezone: string;
}

const defaultSettings: UserSettings = {
  locale: 'ru',
  notifications: {
    push: true,
    telegram: false,
    deadlines: true,
    news: true,
  },
  timezone: 'Europe/Moscow',
};

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'device_id', type: 'varchar', length: 64, unique: true })
  @Index('idx_users_device_id')
  deviceId!: string;

  @Column({ name: 'citizenship_code', type: 'varchar', length: 3, nullable: true })
  citizenshipCode!: string | null;

  @Column({ name: 'region_code', type: 'varchar', length: 10, nullable: true })
  regionCode!: string | null;

  @Column({ name: 'entry_date', type: 'date', nullable: true })
  entryDate!: Date | null;

  @Column({ name: 'visit_purpose', type: 'varchar', length: 20, nullable: true })
  visitPurpose!: string | null;

  @Column({ name: 'registration_date', type: 'date', nullable: true })
  registrationDate!: Date | null;

  @Column({ name: 'patent_date', type: 'date', nullable: true })
  patentDate!: Date | null;

  @Column({ name: 'onboarding_completed_at', type: 'timestamptz', nullable: true })
  onboardingCompletedAt!: Date | null;

  @Column({
    name: 'subscription_type',
    type: 'varchar',
    length: 20,
    default: 'free',
  })
  subscriptionType!: string;

  @Column({
    name: 'subscription_expires_at',
    type: 'timestamptz',
    nullable: true,
  })
  subscriptionExpiresAt!: Date | null;

  @Column('jsonb', { default: defaultSettings })
  settings!: UserSettings;

  @Column({ name: 'refresh_token_hash', type: 'varchar', length: 64, nullable: true })
  refreshTokenHash!: string | null;

  @Column({ name: 'signing_key', type: 'varchar', length: 64, nullable: true })
  signingKey!: string | null;

  @Column({ name: 'recovery_code_hash', type: 'varchar', length: 64, nullable: true })
  recoveryCodeHash!: string | null;

  @Column({ name: 'recovery_attempts', type: 'int', default: 0 })
  recoveryAttempts!: number;

  @Column({ name: 'recovery_blocked_until', type: 'timestamptz', nullable: true })
  recoveryBlockedUntil!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
