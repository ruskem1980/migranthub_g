'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, type Token, type PushNotificationSchema, type ActionPerformed } from '@capacitor/push-notifications';
import { useRouter } from 'next/navigation';
import { notificationsApi } from '@/lib/api/client';
import type { DevicePlatform, NotificationPreferences } from '@/lib/api/types';
import { useAppStore } from '@/lib/stores/appStore';

export interface UsePushNotificationsReturn {
  /** Whether push notifications are supported on this device */
  isSupported: boolean;
  /** Whether notifications permission is granted */
  isPermissionGranted: boolean;
  /** Whether FCM token is registered */
  isRegistered: boolean;
  /** Current FCM token (if any) */
  fcmToken: string | null;
  /** Whether initialization is in progress */
  isInitializing: boolean;
  /** Error message (if any) */
  error: string | null;
  /** Request notification permissions */
  requestPermission: () => Promise<boolean>;
  /** Register FCM token with backend */
  registerToken: () => Promise<boolean>;
  /** Unregister FCM token from backend */
  unregisterToken: () => Promise<boolean>;
  /** Update notification preferences */
  updatePreferences: (preferences: Partial<NotificationPreferences>) => Promise<boolean>;
  /** Notification preferences */
  preferences: NotificationPreferences | null;
}

/**
 * Hook for managing FCM push notifications with Capacitor
 *
 * @example
 * ```tsx
 * function NotificationSettings() {
 *   const {
 *     isSupported,
 *     isPermissionGranted,
 *     requestPermission,
 *     preferences,
 *     updatePreferences
 *   } = usePushNotifications();
 *
 *   if (!isSupported) return <p>Push notifications not supported</p>;
 *
 *   return (
 *     <button onClick={requestPermission}>
 *       {isPermissionGranted ? 'Enabled' : 'Enable notifications'}
 *     </button>
 *   );
 * }
 * ```
 */
export function usePushNotifications(): UsePushNotificationsReturn {
  const router = useRouter();
  const addNotification = useAppStore((state) => state.addNotification);

  const [isSupported, setIsSupported] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

  const listenersSetup = useRef(false);

  // Get device platform
  const getPlatform = useCallback((): DevicePlatform => {
    const platform = Capacitor.getPlatform();
    if (platform === 'ios') return 'ios';
    if (platform === 'android') return 'android';
    return 'web';
  }, []);

  // Handle incoming notification (foreground)
  const handleNotificationReceived = useCallback((notification: PushNotificationSchema) => {
    console.log('[usePushNotifications] Notification received:', notification);

    // Add to local notifications
    addNotification({
      type: 'info',
      title: notification.title || 'Notification',
      message: notification.body || '',
    });
  }, [addNotification]);

  // Handle notification tap (action performed)
  const handleNotificationAction = useCallback((action: ActionPerformed) => {
    console.log('[usePushNotifications] Notification action:', action);

    const data = action.notification.data;

    // Navigate based on notification data
    if (data?.route) {
      router.push(data.route as string);
    } else if (data?.type) {
      // Handle specific notification types
      switch (data.type) {
        case 'document_expiry':
          router.push('/documents');
          break;
        case 'patent_payment':
          router.push('/services/payment');
          break;
        case 'news':
          router.push('/');
          break;
        default:
          // Default to home
          router.push('/');
      }
    }
  }, [router]);

  // Setup push notification listeners
  const setupListeners = useCallback(async () => {
    if (listenersSetup.current) return;
    listenersSetup.current = true;

    try {
      // Listener for registration success
      await PushNotifications.addListener('registration', (token: Token) => {
        console.log('[usePushNotifications] Registration success, token:', token.value);
        setFcmToken(token.value);
      });

      // Listener for registration errors
      await PushNotifications.addListener('registrationError', (err) => {
        console.error('[usePushNotifications] Registration error:', err);
        setError(err.error || 'Registration failed');
      });

      // Listener for received notifications (foreground)
      await PushNotifications.addListener('pushNotificationReceived', handleNotificationReceived);

      // Listener for notification tap
      await PushNotifications.addListener('pushNotificationActionPerformed', handleNotificationAction);

      console.log('[usePushNotifications] Listeners setup complete');
    } catch (err) {
      console.error('[usePushNotifications] Failed to setup listeners:', err);
      setError('Failed to setup notification listeners');
    }
  }, [handleNotificationReceived, handleNotificationAction]);

  // Check current permission status
  const checkPermissionStatus = useCallback(async (): Promise<boolean> => {
    try {
      const result = await PushNotifications.checkPermissions();
      const granted = result.receive === 'granted';
      setIsPermissionGranted(granted);
      return granted;
    } catch (err) {
      console.error('[usePushNotifications] Failed to check permissions:', err);
      return false;
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications not supported on this device');
      return false;
    }

    try {
      setError(null);

      // Check current status first
      const currentStatus = await PushNotifications.checkPermissions();

      if (currentStatus.receive === 'granted') {
        setIsPermissionGranted(true);
        // Register to get token
        await PushNotifications.register();
        return true;
      }

      // Request permission
      const result = await PushNotifications.requestPermissions();
      const granted = result.receive === 'granted';
      setIsPermissionGranted(granted);

      if (granted) {
        // Register to get FCM token
        await PushNotifications.register();
        return true;
      } else {
        setError('Notification permission denied');
        return false;
      }
    } catch (err) {
      console.error('[usePushNotifications] Failed to request permission:', err);
      setError('Failed to request permission');
      return false;
    }
  }, [isSupported]);

  // Register FCM token with backend
  const registerToken = useCallback(async (): Promise<boolean> => {
    if (!fcmToken) {
      setError('No FCM token available');
      return false;
    }

    try {
      setError(null);
      const platform = getPlatform();
      const response = await notificationsApi.registerToken(fcmToken, platform);

      if (response.success) {
        setIsRegistered(true);
        console.log('[usePushNotifications] Token registered with backend');
        return true;
      } else {
        setError(response.message || 'Failed to register token');
        return false;
      }
    } catch (err) {
      console.error('[usePushNotifications] Failed to register token:', err);
      setError('Failed to register token with server');
      return false;
    }
  }, [fcmToken, getPlatform]);

  // Unregister FCM token from backend
  const unregisterToken = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const response = await notificationsApi.unregisterToken();

      if (response.success) {
        setIsRegistered(false);
        console.log('[usePushNotifications] Token unregistered from backend');
        return true;
      } else {
        setError(response.message || 'Failed to unregister token');
        return false;
      }
    } catch (err) {
      console.error('[usePushNotifications] Failed to unregister token:', err);
      setError('Failed to unregister token from server');
      return false;
    }
  }, []);

  // Update notification preferences
  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>): Promise<boolean> => {
    try {
      setError(null);
      const response = await notificationsApi.updatePreferences(newPreferences);

      if (response.success) {
        setPreferences(response.preferences);
        console.log('[usePushNotifications] Preferences updated');
        return true;
      } else {
        setError('Failed to update preferences');
        return false;
      }
    } catch (err) {
      console.error('[usePushNotifications] Failed to update preferences:', err);
      setError('Failed to update preferences');
      return false;
    }
  }, []);

  // Fetch current preferences from backend
  const fetchPreferences = useCallback(async () => {
    try {
      const response = await notificationsApi.getPreferences();
      setPreferences(response.preferences);
      setIsRegistered(response.enabled);
    } catch (err) {
      console.error('[usePushNotifications] Failed to fetch preferences:', err);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      // Check if we're on a native platform
      const isNative = Capacitor.isNativePlatform();
      setIsSupported(isNative);

      if (!isNative) {
        console.log('[usePushNotifications] Not a native platform, skipping initialization');
        setIsInitializing(false);
        return;
      }

      try {
        // Setup listeners first
        await setupListeners();

        // Check permission status
        await checkPermissionStatus();

        // Fetch preferences from backend
        await fetchPreferences();
      } catch (err) {
        console.error('[usePushNotifications] Initialization error:', err);
        setError('Failed to initialize push notifications');
      } finally {
        setIsInitializing(false);
      }
    };

    initialize();
  }, [setupListeners, checkPermissionStatus, fetchPreferences]);

  // Auto-register token when we get one
  useEffect(() => {
    if (fcmToken && isPermissionGranted && !isRegistered) {
      registerToken();
    }
  }, [fcmToken, isPermissionGranted, isRegistered, registerToken]);

  return {
    isSupported,
    isPermissionGranted,
    isRegistered,
    fcmToken,
    isInitializing,
    error,
    requestPermission,
    registerToken,
    unregisterToken,
    updatePreferences,
    preferences,
  };
}

export default usePushNotifications;
