import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export type ReportChangeUrgency = 'low' | 'medium' | 'high' | 'critical';

export interface ReportChange {
  lawId: string;
  title: string;
  changePercentage: number;
  urgency: ReportChangeUrgency;
  summary: string;
  impactForMigrants: string;
  recommendations: string[];
  actionRequired: boolean;
}

@Entity('daily_reports')
@Index(['date'], { unique: true })
@Index(['generatedAt'])
export class DailyReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'int', default: 0 })
  changesCount: number;

  @Column({ type: 'jsonb', default: [] })
  changes: ReportChange[];

  @CreateDateColumn()
  generatedAt: Date;
}
