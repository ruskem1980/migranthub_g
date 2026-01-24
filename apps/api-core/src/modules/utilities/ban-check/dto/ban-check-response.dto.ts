import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BanStatus {
  NO_BAN = 'no_ban',
  BAN_FOUND = 'ban_found',
  CHECK_FAILED = 'check_failed',
}

export class BanCheckResponseDto {
  @ApiProperty({
    enum: BanStatus,
    description: 'Ban check status',
    example: BanStatus.NO_BAN,
  })
  status!: BanStatus;

  @ApiPropertyOptional({
    description: 'Ban reason if found',
    example: 'Violation of migration rules',
  })
  reason?: string;

  @ApiPropertyOptional({
    description: 'Ban expiration date if applicable',
    example: '2025-12-31',
  })
  expiresAt?: string;

  @ApiProperty({
    description: 'Timestamp of the check',
    example: '2024-01-15T10:30:00.000Z',
  })
  checkedAt!: string;

  @ApiPropertyOptional({
    description: 'Error message if check failed',
  })
  error?: string;
}
