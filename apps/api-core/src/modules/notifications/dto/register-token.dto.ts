import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, Length } from 'class-validator';

export enum PlatformEnum {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web',
}

export class RegisterTokenDto {
  @IsString()
  @Length(1, 255)
  @ApiProperty({
    description: 'Firebase Cloud Messaging device token',
    example: 'dGVzdF90b2tlbl9mb3JfZmNt...',
    minLength: 1,
    maxLength: 255,
  })
  token!: string;

  @IsEnum(PlatformEnum)
  @ApiProperty({
    description: 'Device platform',
    enum: PlatformEnum,
    example: PlatformEnum.ANDROID,
  })
  platform!: PlatformEnum;
}
