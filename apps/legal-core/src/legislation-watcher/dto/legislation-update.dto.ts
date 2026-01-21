import { IsString, IsNumber, IsDate, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export class LegislationUpdateDto {
  @IsString()
  lawId: string;

  @IsString()
  title: string;

  @IsString()
  sourceUrl: string;

  @IsNumber()
  changePercentage: number;

  @IsString()
  diff: string;

  @IsDate()
  timestamp: Date;

  @IsOptional()
  metadata?: {
    oldHash: string;
    newHash: string;
    keywords?: string[];
  };
}

export class AIAnalysisDto {
  @IsString()
  summary: string;

  @IsString()
  impactForMigrants: string;

  @IsEnum(['low', 'medium', 'high', 'critical'])
  urgency: 'low' | 'medium' | 'high' | 'critical';

  @IsBoolean()
  actionRequired: boolean;

  @IsOptional()
  recommendations?: string[];

  @IsDate()
  analyzedAt: Date;
}
