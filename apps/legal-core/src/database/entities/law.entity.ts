import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum LawStatus {
  ACTIVE = 'active',
  DEPRECATED = 'deprecated',
  PENDING_REVIEW = 'pending_review',
  ARCHIVED = 'archived'
}

@Entity('laws')
@Index(['source_url'])
@Index(['last_updated'])
export class Law {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 1000, unique: true })
  source_url: string;

  @Column({ type: 'timestamp', nullable: true })
  last_updated: Date;

  @Column({ type: 'varchar', length: 64 })
  content_hash: string;

  @Column({ type: 'text' })
  raw_text: string;

  @Column({
    type: 'enum',
    enum: LawStatus,
    default: LawStatus.ACTIVE
  })
  status: LawStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    keywords?: string[];
    source_type?: string;
    last_scrape_attempt?: Date;
    scrape_errors?: number;
  };

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
