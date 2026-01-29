import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type Platform = 'ios' | 'android' | 'web';

export interface NotificationPreferences {
  document_expiry: boolean;
  patent_payment: boolean;
  news: boolean;
}

@Entity('fcm_tokens')
export class FcmToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'device_id', type: 'varchar', length: 64 })
  @Index('idx_fcm_tokens_device_id')
  deviceId!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index('idx_fcm_tokens_token')
  token!: string;

  @Column({ type: 'varchar', length: 10 })
  platform!: Platform;

  @Column({
    name: 'notification_preferences',
    type: 'jsonb',
    default: { document_expiry: true, patent_payment: true, news: true },
  })
  notificationPreferences!: NotificationPreferences;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
