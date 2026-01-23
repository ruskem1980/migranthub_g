'use client';

import { useState, useEffect, useCallback } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  permission: NotificationPermission | 'default';
  isSubscribed: boolean;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    permission: 'default',
    isSubscribed: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;

    setState((prev) => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : 'default',
    }));
  }, []);

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      setState((prev) => ({ ...prev, permission }));
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [state.isSupported]);

  const subscribe = useCallback(async () => {
    if (!state.isSupported || state.permission !== 'granted') {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Subscribe to push notifications
        // In production, you would use your VAPID public key
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          // applicationServerKey: VAPID_PUBLIC_KEY,
        });
      }

      setState((prev) => ({ ...prev, isSubscribed: true }));
      return subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }, [state.isSupported, state.permission]);

  const unsubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      setState((prev) => ({ ...prev, isSubscribed: false }));
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }, []);

  const showLocalNotification = useCallback(async (
    title: string,
    options?: NotificationOptions
  ) => {
    if (state.permission !== 'granted') return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/icon-192.png',
        badge: '/icon-72.png',
        vibrate: [100, 50, 100],
        ...options,
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [state.permission]);

  return {
    ...state,
    requestPermission,
    subscribe,
    unsubscribe,
    showLocalNotification,
  };
}

// Notification types for the app
export interface AppNotification {
  id: string;
  type: 'patent_expiry' | 'registration_expiry' | 'payment_reminder' | 'news' | 'sos';
  title: string;
  body: string;
  data?: Record<string, string>;
  scheduledFor?: Date;
}

// Schedule local notifications for important dates
export function schedulePatentReminder(expiryDate: Date): AppNotification {
  const reminderDate = new Date(expiryDate);
  reminderDate.setDate(reminderDate.getDate() - 7); // 7 days before

  return {
    id: `patent-reminder-${expiryDate.getTime()}`,
    type: 'patent_expiry',
    title: 'Срок патента истекает',
    body: 'Через 7 дней истекает срок действия вашего патента. Не забудьте оплатить продление.',
    scheduledFor: reminderDate,
  };
}

export function scheduleRegistrationReminder(expiryDate: Date): AppNotification {
  const reminderDate = new Date(expiryDate);
  reminderDate.setDate(reminderDate.getDate() - 3); // 3 days before

  return {
    id: `registration-reminder-${expiryDate.getTime()}`,
    type: 'registration_expiry',
    title: 'Срок регистрации истекает',
    body: 'Через 3 дня истекает срок вашей регистрации. Необходимо продлить миграционный учёт.',
    scheduledFor: reminderDate,
  };
}
