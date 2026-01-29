import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Enable notifications for document expiry reminders',
    example: true,
  })
  document_expiry?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Enable notifications for patent payment reminders',
    example: true,
  })
  patent_payment?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional({
    description: 'Enable notifications for news and updates',
    example: false,
  })
  news?: boolean;
}

export class PreferencesResponseDto {
  @ApiPropertyOptional({
    description: 'Document expiry notifications enabled',
    example: true,
  })
  document_expiry!: boolean;

  @ApiPropertyOptional({
    description: 'Patent payment notifications enabled',
    example: true,
  })
  patent_payment!: boolean;

  @ApiPropertyOptional({
    description: 'News notifications enabled',
    example: true,
  })
  news!: boolean;
}
