import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class VerifyRecoveryDto {
  @ApiProperty({
    description: 'Device ID for recovery',
    example: 'device_abc123xyz',
    minLength: 8,
    maxLength: 64,
  })
  @IsString()
  @IsNotEmpty()
  @Length(8, 64)
  deviceId!: string;

  @ApiProperty({
    description: 'Recovery code (12-character alphanumeric)',
    example: 'ABC123DEF456',
    minLength: 12,
    maxLength: 12,
  })
  @IsString()
  @IsNotEmpty()
  @Length(12, 12)
  @Matches(/^[A-Z0-9]{12}$/, {
    message: 'Recovery code must be 12 uppercase alphanumeric characters',
  })
  recoveryCode!: string;
}
