import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  @Index('idx_audit_log_user_id')
  userId!: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @Column({ type: 'varchar', length: 10 })
  action!: string;

  @Column({ type: 'varchar', length: 255 })
  @Index('idx_audit_log_resource')
  resource!: string;

  @Column({ name: 'request_body', type: 'jsonb', nullable: true })
  requestBody!: Record<string, unknown> | null;

  @Column({ name: 'response_status', type: 'int' })
  responseStatus!: number;

  @Column({ name: 'ip_address', type: 'varchar', length: 45 })
  ipAddress!: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 500 })
  userAgent!: string;

  @Column({ name: 'duration_ms', type: 'int' })
  durationMs!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @Index('idx_audit_log_created_at')
  createdAt!: Date;
}
