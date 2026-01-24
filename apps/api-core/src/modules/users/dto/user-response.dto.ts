import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { User, UserSettings } from '../entities/user.entity';

class NotificationSettingsResponse {
  @ApiProperty()
  @Expose()
  push!: boolean;

  @ApiProperty()
  @Expose()
  telegram!: boolean;

  @ApiProperty()
  @Expose()
  deadlines!: boolean;

  @ApiProperty()
  @Expose()
  news!: boolean;
}

class UserSettingsResponse {
  @ApiProperty({ example: 'ru' })
  @Expose()
  locale!: string;

  @ApiProperty({ example: 'Europe/Moscow' })
  @Expose()
  timezone!: string;

  @ApiProperty()
  @Expose()
  @Type(() => NotificationSettingsResponse)
  notifications!: NotificationSettingsResponse;
}

@Exclude()
export class UserResponseDto {
  @ApiProperty({ description: 'User ID', example: '550e8400-e29b-41d4-a716-446655440000' })
  @Expose()
  id!: string;

  @ApiPropertyOptional({ description: 'Citizenship code', example: 'UZB' })
  @Expose()
  citizenshipCode!: string | null;

  @ApiPropertyOptional({ description: 'Region code', example: '77' })
  @Expose()
  regionCode!: string | null;

  @ApiPropertyOptional({ description: 'Entry date', example: '2024-01-15' })
  @Expose()
  entryDate!: Date | null;

  @ApiProperty({ description: 'Subscription type', example: 'free' })
  @Expose()
  subscriptionType!: string;

  @ApiPropertyOptional({ description: 'Subscription expiration date' })
  @Expose()
  subscriptionExpiresAt!: Date | null;

  @ApiProperty({ description: 'User settings' })
  @Expose()
  @Type(() => UserSettingsResponse)
  settings!: UserSettings;

  @ApiProperty({ description: 'Account creation date' })
  @Expose()
  createdAt!: Date;

  @ApiProperty({ description: 'Last update date' })
  @Expose()
  updatedAt!: Date;

  static fromEntity(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.citizenshipCode = user.citizenshipCode;
    dto.regionCode = user.regionCode;
    dto.entryDate = user.entryDate;
    dto.subscriptionType = user.subscriptionType;
    dto.subscriptionExpiresAt = user.subscriptionExpiresAt;
    dto.settings = user.settings;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}
