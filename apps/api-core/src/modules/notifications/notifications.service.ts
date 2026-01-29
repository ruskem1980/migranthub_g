import {
  Injectable,
  Logger,
  OnModuleInit,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as admin from 'firebase-admin';
import { FcmToken, NotificationPreferences, Platform } from './entities/fcm-token.entity';
import {
  NotificationType,
  NotificationResponseDto,
} from './dto';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private firebaseApp: admin.app.App | null = null;

  constructor(
    @InjectRepository(FcmToken)
    private readonly fcmTokenRepository: Repository<FcmToken>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Initialize Firebase Admin SDK on module init
   */
  onModuleInit() {
    this.initFirebaseAdmin();
  }

  /**
   * Initialize Firebase Admin SDK
   */
  private initFirebaseAdmin(): void {
    const projectId = this.configService.get<string>('firebase.projectId');
    const privateKey = this.configService.get<string>('firebase.privateKey');
    const clientEmail = this.configService.get<string>('firebase.clientEmail');

    if (!projectId || !privateKey || !clientEmail) {
      this.logger.warn(
        'Firebase credentials not configured. Push notifications will be disabled.',
      );
      return;
    }

    try {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          privateKey,
          clientEmail,
        }),
      });
      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK', error);
    }
  }

  /**
   * Check if Firebase is configured and ready
   */
  private isFirebaseReady(): boolean {
    return this.firebaseApp !== null;
  }

  /**
   * Register or update FCM token for a device
   */
  async registerToken(
    deviceId: string,
    token: string,
    platform: Platform,
  ): Promise<FcmToken> {
    this.logger.log(
      `Registering FCM token for device ${deviceId}, platform: ${platform}`,
    );

    // Check if token already exists (could be from another device)
    const existingToken = await this.fcmTokenRepository.findOne({
      where: { token },
    });

    if (existingToken) {
      // Update existing token with new device info
      existingToken.deviceId = deviceId;
      existingToken.platform = platform;
      return this.fcmTokenRepository.save(existingToken);
    }

    // Check if device already has a token
    const existingDeviceToken = await this.fcmTokenRepository.findOne({
      where: { deviceId },
    });

    if (existingDeviceToken) {
      // Update token for existing device
      existingDeviceToken.token = token;
      existingDeviceToken.platform = platform;
      return this.fcmTokenRepository.save(existingDeviceToken);
    }

    // Create new token record
    const fcmToken = this.fcmTokenRepository.create({
      deviceId,
      token,
      platform,
      notificationPreferences: {
        document_expiry: true,
        patent_payment: true,
        news: true,
      },
    });

    return this.fcmTokenRepository.save(fcmToken);
  }

  /**
   * Unregister FCM token for a device
   */
  async unregisterToken(deviceId: string): Promise<void> {
    this.logger.log(`Unregistering FCM token for device ${deviceId}`);

    const result = await this.fcmTokenRepository.delete({ deviceId });

    if (result.affected === 0) {
      throw new NotFoundException(
        `No FCM token found for device ${deviceId}`,
      );
    }
  }

  /**
   * Update notification preferences for a device
   */
  async updatePreferences(
    deviceId: string,
    preferences: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    const fcmToken = await this.fcmTokenRepository.findOne({
      where: { deviceId },
    });

    if (!fcmToken) {
      throw new NotFoundException(
        `No FCM token found for device ${deviceId}. Please register a token first.`,
      );
    }

    fcmToken.notificationPreferences = {
      ...fcmToken.notificationPreferences,
      ...preferences,
    };

    await this.fcmTokenRepository.save(fcmToken);

    this.logger.log(`Updated preferences for device ${deviceId}`);

    return fcmToken.notificationPreferences;
  }

  /**
   * Get notification preferences for a device
   */
  async getPreferences(deviceId: string): Promise<NotificationPreferences> {
    const fcmToken = await this.fcmTokenRepository.findOne({
      where: { deviceId },
    });

    if (!fcmToken) {
      // Return default preferences if no token registered
      return {
        document_expiry: true,
        patent_payment: true,
        news: true,
      };
    }

    return fcmToken.notificationPreferences;
  }

  /**
   * Send push notification to a single device
   */
  async sendPush(
    deviceId: string,
    title: string,
    body: string,
    type: NotificationType,
    data?: Record<string, string>,
  ): Promise<NotificationResponseDto> {
    if (!this.isFirebaseReady()) {
      this.logger.warn('Firebase not configured, skipping push notification');
      return { success: false };
    }

    const fcmToken = await this.fcmTokenRepository.findOne({
      where: { deviceId },
    });

    if (!fcmToken) {
      this.logger.warn(`No FCM token found for device ${deviceId}`);
      return { success: false };
    }

    // Check if notification type is enabled in preferences
    const preferenceKey = type as keyof NotificationPreferences;
    if (!fcmToken.notificationPreferences[preferenceKey]) {
      this.logger.log(
        `Notification type ${type} is disabled for device ${deviceId}`,
      );
      return { success: false };
    }

    try {
      const message: admin.messaging.Message = {
        token: fcmToken.token,
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          type,
        },
        android: {
          priority: 'high',
          notification: {
            channelId: type,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);

      this.logger.log(
        `Push notification sent to device ${deviceId}: ${response}`,
      );

      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      this.logger.error(
        `Failed to send push notification to device ${deviceId}`,
        error,
      );

      // Handle invalid token
      if (
        error instanceof Error &&
        (error.message.includes('not-registered') ||
          error.message.includes('invalid-registration-token'))
      ) {
        await this.fcmTokenRepository.delete({ deviceId });
        this.logger.log(`Removed invalid token for device ${deviceId}`);
      }

      return { success: false };
    }
  }

  /**
   * Send push notification to multiple devices
   */
  async sendBulkPush(
    deviceIds: string[],
    title: string,
    body: string,
    type: NotificationType,
    data?: Record<string, string>,
  ): Promise<NotificationResponseDto> {
    if (!this.isFirebaseReady()) {
      this.logger.warn('Firebase not configured, skipping bulk push');
      return { success: false, successCount: 0, failureCount: deviceIds.length };
    }

    const fcmTokens = await this.fcmTokenRepository.find({
      where: { deviceId: In(deviceIds) },
    });

    if (fcmTokens.length === 0) {
      this.logger.warn('No FCM tokens found for provided device IDs');
      return { success: false, successCount: 0, failureCount: deviceIds.length };
    }

    // Filter tokens based on notification preferences
    const preferenceKey = type as keyof NotificationPreferences;
    const eligibleTokens = fcmTokens.filter(
      (t) => t.notificationPreferences[preferenceKey],
    );

    if (eligibleTokens.length === 0) {
      this.logger.log(
        `No devices have notification type ${type} enabled`,
      );
      return { success: true, successCount: 0, failureCount: 0 };
    }

    const tokens = eligibleTokens.map((t) => t.token);

    try {
      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          type,
        },
        android: {
          priority: 'high',
          notification: {
            channelId: type,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      this.logger.log(
        `Bulk push sent: ${response.successCount} success, ${response.failureCount} failed`,
      );

      // Handle invalid tokens
      const invalidTokenDeviceIds: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (
          !resp.success &&
          resp.error &&
          (resp.error.code === 'messaging/registration-token-not-registered' ||
            resp.error.code === 'messaging/invalid-registration-token')
        ) {
          invalidTokenDeviceIds.push(eligibleTokens[idx].deviceId);
        }
      });

      if (invalidTokenDeviceIds.length > 0) {
        await this.fcmTokenRepository.delete({
          deviceId: In(invalidTokenDeviceIds),
        });
        this.logger.log(
          `Removed ${invalidTokenDeviceIds.length} invalid tokens`,
        );
      }

      return {
        success: response.successCount > 0,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      this.logger.error('Failed to send bulk push notification', error);
      return {
        success: false,
        successCount: 0,
        failureCount: tokens.length,
      };
    }
  }

  /**
   * Send push notification to a topic
   */
  async sendToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<NotificationResponseDto> {
    if (!this.isFirebaseReady()) {
      this.logger.warn('Firebase not configured, skipping topic push');
      return { success: false };
    }

    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          topic,
        },
        android: {
          priority: 'high',
          notification: {
            channelId: topic,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);

      this.logger.log(`Topic push sent to ${topic}: ${response}`);

      return {
        success: true,
        messageId: response,
      };
    } catch (error) {
      this.logger.error(`Failed to send topic push to ${topic}`, error);
      return { success: false };
    }
  }

  /**
   * Subscribe device to a topic
   */
  async subscribeToTopic(deviceId: string, topic: string): Promise<boolean> {
    if (!this.isFirebaseReady()) {
      return false;
    }

    const fcmToken = await this.fcmTokenRepository.findOne({
      where: { deviceId },
    });

    if (!fcmToken) {
      return false;
    }

    try {
      await admin.messaging().subscribeToTopic([fcmToken.token], topic);
      this.logger.log(`Device ${deviceId} subscribed to topic ${topic}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to subscribe device ${deviceId} to topic ${topic}`,
        error,
      );
      return false;
    }
  }

  /**
   * Unsubscribe device from a topic
   */
  async unsubscribeFromTopic(deviceId: string, topic: string): Promise<boolean> {
    if (!this.isFirebaseReady()) {
      return false;
    }

    const fcmToken = await this.fcmTokenRepository.findOne({
      where: { deviceId },
    });

    if (!fcmToken) {
      return false;
    }

    try {
      await admin.messaging().unsubscribeFromTopic([fcmToken.token], topic);
      this.logger.log(`Device ${deviceId} unsubscribed from topic ${topic}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to unsubscribe device ${deviceId} from topic ${topic}`,
        error,
      );
      return false;
    }
  }
}
