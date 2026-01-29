import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators';
import {
  RegisterTokenDto,
  UpdatePreferencesDto,
  PreferencesResponseDto,
  SendNotificationDto,
  SendBulkNotificationDto,
  SendTopicNotificationDto,
  NotificationResponseDto,
} from './dto';

@ApiTags('notifications')
@Controller({
  path: 'notifications',
  version: '1',
})
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 registrations per minute
  @ApiOperation({
    summary: 'Register FCM token',
    description:
      'Registers or updates the Firebase Cloud Messaging token for the current device. Required for receiving push notifications.',
  })
  @ApiResponse({
    status: 201,
    description: 'Token registered successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Token registered successfully' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid token or platform',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  async register(
    @Body() dto: RegisterTokenDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<{ success: boolean; message: string }> {
    await this.notificationsService.registerToken(user.deviceId, dto.token, dto.platform);

    return {
      success: true,
      message: 'Token registered successfully',
    };
  }

  @Delete('unregister')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Unregister FCM token',
    description:
      'Removes the FCM token for the current device. The device will no longer receive push notifications.',
  })
  @ApiResponse({
    status: 204,
    description: 'Token unregistered successfully',
  })
  @ApiNotFoundResponse({
    description: 'No token found for this device',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  async unregister(@CurrentUser() user: CurrentUserPayload): Promise<void> {
    await this.notificationsService.unregisterToken(user.deviceId);
  }

  @Get('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get notification preferences',
    description: 'Returns the current notification preferences for the device.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification preferences returned',
    type: PreferencesResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  async getPreferences(@CurrentUser() user: CurrentUserPayload): Promise<PreferencesResponseDto> {
    return this.notificationsService.getPreferences(user.deviceId);
  }

  @Patch('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update notification preferences',
    description:
      'Updates notification preferences for the device. Only provided fields will be updated.',
  })
  @ApiResponse({
    status: 200,
    description: 'Preferences updated successfully',
    type: PreferencesResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'No token found for this device. Register a token first.',
  })
  @ApiBadRequestResponse({
    description: 'Invalid preference values',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  async updatePreferences(
    @Body() dto: UpdatePreferencesDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<PreferencesResponseDto> {
    return this.notificationsService.updatePreferences(user.deviceId, dto);
  }

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 sends per minute
  @ApiOperation({
    summary: 'Send push notification to current device',
    description: 'Sends a push notification to the current device. Useful for testing.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification sent',
    type: NotificationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid notification data',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  async send(
    @Body() dto: SendNotificationDto,
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.sendPush(
      user.deviceId,
      dto.title,
      dto.body,
      dto.type,
      dto.data,
    );
  }

  @Post('send/bulk')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 2, ttl: 60000 } }) // 2 bulk sends per minute
  @ApiOperation({
    summary: 'Send push notification to multiple devices',
    description:
      'Sends a push notification to multiple devices by their device IDs. For internal/admin use.',
  })
  @ApiResponse({
    status: 200,
    description: 'Bulk notification sent',
    type: NotificationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid notification data',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  async sendBulk(@Body() dto: SendBulkNotificationDto): Promise<NotificationResponseDto> {
    return this.notificationsService.sendBulkPush(
      dto.deviceIds,
      dto.title,
      dto.body,
      dto.type,
      dto.data,
    );
  }

  @Post('send/topic')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 2, ttl: 60000 } }) // 2 topic sends per minute
  @ApiOperation({
    summary: 'Send push notification to a topic',
    description:
      'Sends a push notification to all devices subscribed to a topic. For internal/admin use.',
  })
  @ApiResponse({
    status: 200,
    description: 'Topic notification sent',
    type: NotificationResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid notification data',
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  async sendToTopic(@Body() dto: SendTopicNotificationDto): Promise<NotificationResponseDto> {
    return this.notificationsService.sendToTopic(dto.topic, dto.title, dto.body, dto.data);
  }

  @Post('subscribe/:topic')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Subscribe to a topic',
    description: 'Subscribes the current device to a notification topic.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscribed to topic',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  async subscribeToTopic(
    @CurrentUser() user: CurrentUserPayload,
    @Param('topic') topic: string,
  ): Promise<{ success: boolean }> {
    const success = await this.notificationsService.subscribeToTopic(user.deviceId, topic);
    return { success };
  }

  @Delete('unsubscribe/:topic')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Unsubscribe from a topic',
    description: 'Unsubscribes the current device from a notification topic.',
  })
  @ApiResponse({
    status: 200,
    description: 'Unsubscribed from topic',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated',
  })
  async unsubscribeFromTopic(
    @CurrentUser() user: CurrentUserPayload,
    @Param('topic') topic: string,
  ): Promise<{ success: boolean }> {
    const success = await this.notificationsService.unsubscribeFromTopic(user.deviceId, topic);
    return { success };
  }
}
