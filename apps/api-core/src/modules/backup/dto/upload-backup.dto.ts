import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class UploadBackupDto {
  @IsString()
  @Length(16, 64)
  @ApiProperty({
    description: 'PBKDF2 salt (base64)',
    minLength: 16,
    maxLength: 64,
  })
  salt!: string;

  @IsString()
  @Length(16, 64)
  @ApiProperty({
    description: 'AES-GCM IV (base64)',
    minLength: 16,
    maxLength: 64,
  })
  iv!: string;
}
