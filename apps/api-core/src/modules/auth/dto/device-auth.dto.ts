import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn, Length, IsOptional } from 'class-validator';

export class DeviceAuthDto {
  @ApiProperty({
    description: 'Unique device identifier (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  @Length(36, 64)
  deviceId!: string;

  @ApiProperty({
    description: 'Device platform',
    enum: ['ios', 'android', 'web'],
    example: 'android',
  })
  @IsString()
  @IsIn(['ios', 'android', 'web'])
  platform!: 'ios' | 'android' | 'web';

  @ApiProperty({
    description: 'Application version',
    example: '1.0.0',
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  appVersion!: string;

  @ApiProperty({
    description: 'User locale',
    example: 'ru',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(2, 5)
  locale?: string;
}
