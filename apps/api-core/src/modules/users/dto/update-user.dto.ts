import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDateString,
  Length,
  IsObject,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

class NotificationSettingsDto {
  @ApiPropertyOptional({ description: 'Enable push notifications' })
  @IsOptional()
  @IsBoolean()
  push?: boolean;

  @ApiPropertyOptional({ description: 'Enable Telegram notifications' })
  @IsOptional()
  @IsBoolean()
  telegram?: boolean;

  @ApiPropertyOptional({ description: 'Enable deadline reminders' })
  @IsOptional()
  @IsBoolean()
  deadlines?: boolean;

  @ApiPropertyOptional({ description: 'Enable news notifications' })
  @IsOptional()
  @IsBoolean()
  news?: boolean;
}

class UserSettingsDto {
  @ApiPropertyOptional({ description: 'User locale', example: 'ru' })
  @IsOptional()
  @IsString()
  @Length(2, 5)
  locale?: string;

  @ApiPropertyOptional({ description: 'User timezone', example: 'Europe/Moscow' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Notification settings' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notifications?: NotificationSettingsDto;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Citizenship country code (ISO 3166-1 alpha-3)',
    example: 'UZB',
    minLength: 3,
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  citizenshipCode?: string;

  @ApiPropertyOptional({
    description: 'Region code in Russia',
    example: '77',
    maxLength: 10,
  })
  @IsOptional()
  @IsString()
  @Length(1, 10)
  regionCode?: string;

  @ApiPropertyOptional({
    description: 'Entry date to Russia',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  entryDate?: string;

  @ApiPropertyOptional({ description: 'User settings' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UserSettingsDto)
  settings?: UserSettingsDto;
}
