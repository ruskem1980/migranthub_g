import { ApiProperty } from '@nestjs/swagger';

export class BackupResponseDto {
  @ApiProperty({
    description: 'Backup unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Size of the encrypted backup in bytes',
    example: 1048576,
  })
  sizeBytes!: number;

  @ApiProperty({
    description: 'Backup creation timestamp',
  })
  createdAt!: Date;
}

export class BackupListResponseDto {
  @ApiProperty({
    type: [BackupResponseDto],
    description: 'List of backups',
  })
  backups!: BackupResponseDto[];

  @ApiProperty({
    description: 'Total number of backups',
    example: 3,
  })
  total!: number;
}

export class BackupDownloadResponseDto {
  @ApiProperty({
    description: 'Backup unique identifier',
  })
  id!: string;

  @ApiProperty({
    description: 'PBKDF2 salt (base64)',
  })
  salt!: string;

  @ApiProperty({
    description: 'AES-GCM IV (base64)',
  })
  iv!: string;

  @ApiProperty({
    description: 'Size of the encrypted backup in bytes',
  })
  sizeBytes!: number;

  @ApiProperty({
    description: 'Backup creation timestamp',
  })
  createdAt!: Date;
}
