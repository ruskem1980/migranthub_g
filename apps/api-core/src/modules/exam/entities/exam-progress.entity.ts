import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export interface CategoryProgress {
  answered: number;
  correct: number;
}

@Entity('exam_progress')
export class ExamProgress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'device_id', type: 'varchar', length: 64 })
  @Index('idx_exam_progress_device_id')
  deviceId!: string;

  @Column('jsonb', { name: 'category_progress', default: {} })
  categoryProgress!: Record<string, CategoryProgress>;

  @Column('jsonb', { name: 'answered_question_ids', default: [] })
  answeredQuestionIds!: string[];

  @Column({ type: 'int', default: 0 })
  streak!: number;

  @Column({ name: 'last_activity_date', type: 'date', nullable: true })
  lastActivityDate!: Date | null;

  @Column('jsonb', { default: [] })
  achievements!: string[];

  @Column({ name: 'tests_completed', type: 'int', default: 0 })
  testsCompleted!: number;

  @Column({ name: 'best_score', type: 'int', default: 0 })
  bestScore!: number;

  @Column('jsonb', { name: 'recent_results', default: [] })
  recentResults!: { date: string; score: number }[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
