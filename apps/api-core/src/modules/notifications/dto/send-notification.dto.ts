import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsObject, Length, IsArray } from 'class-validator';

export enum NotificationType {
  DOCUMENT_EXPIRY = 'document_expiry',
  PATENT_PAYMENT = 'patent_payment',
  NEWS = 'news',
}

export class SendNotificationDto {
  @IsString()
  @Length(1, 100)
  @ApiProperty({
    description: 'Notification title',
    example: 'Document Expiry Reminder',
    minLength: 1,
    maxLength: 100,
  })
  title!: string;

  @IsString()
  @Length(1, 500)
  @ApiProperty({
    description: 'Notification body',
    example: 'Your passport will expire in 30 days',
    minLength: 1,
    maxLength: 500,
  })
  body!: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({
    description: 'Additional data payload',
    example: { documentType: 'passport', daysRemaining: 30 },
  })
  data?: Record<string, string>;

  @IsEnum(NotificationType)
  @ApiProperty({
    description: 'Notification type for preference filtering',
    enum: NotificationType,
    example: NotificationType.DOCUMENT_EXPIRY,
  })
  type!: NotificationType;
}

export class SendBulkNotificationDto extends SendNotificationDto {
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    description: 'List of device IDs to send notification to',
    example: ['device-id-1', 'device-id-2'],
    type: [String],
  })
  deviceIds!: string[];
}

export class SendTopicNotificationDto {
  @IsString()
  @Length(1, 100)
  @ApiProperty({
    description: 'Notification title',
    example: 'News Update',
    minLength: 1,
    maxLength: 100,
  })
  title!: string;

  @IsString()
  @Length(1, 500)
  @ApiProperty({
    description: 'Notification body',
    example: 'New immigration law changes effective from next month',
    minLength: 1,
    maxLength: 500,
  })
  body!: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({
    description: 'Additional data payload',
    example: { articleId: '123', category: 'legal' },
  })
  data?: Record<string, string>;

  @IsString()
  @Length(1, 50)
  @ApiProperty({
    description: 'Topic name to send notification to',
    example: 'news',
    minLength: 1,
    maxLength: 50,
  })
  topic!: string;
}

export class NotificationResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success!: boolean;

  @ApiPropertyOptional({
    description: 'Firebase message ID',
    example: 'projects/my-project/messages/0:1234567890',
  })
  messageId?: string;

  @ApiPropertyOptional({
    description: 'Number of devices notified (for bulk send)',
    example: 10,
  })
  successCount?: number;

  @ApiPropertyOptional({
    description: 'Number of failed deliveries (for bulk send)',
    example: 2,
  })
  failureCount?: number;
}
