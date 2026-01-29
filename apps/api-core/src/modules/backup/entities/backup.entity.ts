import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('backups')
export class Backup {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'device_id', type: 'varchar', length: 64 })
  @Index('idx_backups_device_id')
  deviceId!: string;

  @Column({ name: 'encrypted_data', type: 'bytea' })
  encryptedData!: Buffer;

  @Column({ type: 'varchar', length: 64 })
  salt!: string;

  @Column({ type: 'varchar', length: 64 })
  iv!: string;

  @Column({ name: 'size_bytes', type: 'int' })
  sizeBytes!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
