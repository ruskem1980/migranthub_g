'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// NOTE: Language is managed exclusively by languageStore to avoid duplication
// Use useTranslation() hook from '@/lib/i18n' for language operations

type Theme = 'light' | 'dark' | 'system';

// Push notification preferences (synced with backend)
export interface PushNotificationPreferences {
  document_expiry: boolean;
  patent_payment: boolean;
  news: boolean;
}

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// Anonymous usage statistics for Lazy Auth
export interface AnonymousUsageStats {
  calculatorUses: number;
  examQuestions: number;
  aiQuestions: number;
  lastResetDate: string; // ISO date string for daily limit reset
}

interface AppState {
  // UI State
  theme: Theme;
  isOnline: boolean;
  isAppReady: boolean;

  // Navigation
  currentTab: 'home' | 'documents' | 'services' | 'assistant' | 'sos';

  // Notifications
  notifications: Notification[];
  unreadCount: number;

  // Onboarding
  hasCompletedOnboarding: boolean;
  onboardingStep: number;

  // Law Sync
  lawSyncDate: string | null;
  lawSyncSuccess: boolean;
  lawSyncNoChanges: boolean;

  // Accessibility
  ttsEnabled: boolean;

  // Push Notifications
  pushNotificationsEnabled: boolean;
  fcmToken: string | null;
  pushPreferences: PushNotificationPreferences;

  // Lazy Auth: Welcome & Anonymous Usage
  hasSeenWelcome: boolean;
  anonymousUsageStats: AnonymousUsageStats;

  // Actions
  setTheme: (theme: Theme) => void;
  setOnline: (isOnline: boolean) => void;
  setAppReady: (ready: boolean) => void;
  setCurrentTab: (tab: AppState['currentTab']) => void;
  setTtsEnabled: (enabled: boolean) => void;

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Onboarding actions
  setOnboardingCompleted: (completed: boolean) => void;
  setOnboardingStep: (step: number) => void;

  // Law Sync actions
  setLawSyncStatus: (date: string, success: boolean, noChanges?: boolean) => void;

  // Push Notification actions
  setPushNotificationsEnabled: (enabled: boolean) => void;
  setFcmToken: (token: string | null) => void;
  setPushPreferences: (preferences: PushNotificationPreferences) => void;
  updatePushPreference: (key: keyof PushNotificationPreferences, value: boolean) => void;

  // Lazy Auth actions
  setHasSeenWelcome: (seen: boolean) => void;
  incrementAnonymousUsage: (type: keyof Omit<AnonymousUsageStats, 'lastResetDate'>) => void;
  resetDailyAnonymousStats: () => void;

  reset: () => void;
}

const getInitialAnonymousStats = (): AnonymousUsageStats => ({
  calculatorUses: 0,
  examQuestions: 0,
  aiQuestions: 0,
  lastResetDate: new Date().toISOString().split('T')[0],
});

const initialState = {
  theme: 'system' as Theme,
  isOnline: true,
  isAppReady: false,
  currentTab: 'home' as const,
  notifications: [] as Notification[],
  unreadCount: 0,
  hasCompletedOnboarding: false,
  onboardingStep: 0,
  lawSyncDate: null as string | null,
  lawSyncSuccess: false,
  lawSyncNoChanges: false,
  ttsEnabled: true,
  pushNotificationsEnabled: false,
  fcmToken: null as string | null,
  pushPreferences: {
    document_expiry: true,
    patent_payment: true,
    news: true,
  } as PushNotificationPreferences,
  hasSeenWelcome: false,
  anonymousUsageStats: getInitialAnonymousStats(),
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setTheme: (theme) =>
        set({ theme }),

      setOnline: (isOnline) =>
        set({ isOnline }),

      setAppReady: (isAppReady) =>
        set({ isAppReady }),

      setCurrentTab: (currentTab) =>
        set({ currentTab }),

      addNotification: (notification) =>
        set((state) => {
          const newNotification: Notification = {
            ...notification,
            id: crypto.randomUUID(),
            read: false,
            createdAt: new Date().toISOString(),
          };
          return {
            notifications: [newNotification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          };
        }),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        })),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        })),

      clearNotifications: () =>
        set({ notifications: [], unreadCount: 0 }),

      setOnboardingCompleted: (hasCompletedOnboarding) =>
        set({ hasCompletedOnboarding }),

      setOnboardingStep: (onboardingStep) =>
        set({ onboardingStep }),

      setLawSyncStatus: (lawSyncDate, lawSyncSuccess, lawSyncNoChanges = false) =>
        set({ lawSyncDate, lawSyncSuccess, lawSyncNoChanges }),

      setTtsEnabled: (ttsEnabled) =>
        set({ ttsEnabled }),

      setPushNotificationsEnabled: (pushNotificationsEnabled) =>
        set({ pushNotificationsEnabled }),

      setFcmToken: (fcmToken) =>
        set({ fcmToken }),

      setPushPreferences: (pushPreferences) =>
        set({ pushPreferences }),

      updatePushPreference: (key, value) =>
        set((state) => ({
          pushPreferences: {
            ...state.pushPreferences,
            [key]: value,
          },
        })),

      // Lazy Auth methods
      setHasSeenWelcome: (hasSeenWelcome) => set({ hasSeenWelcome }),

      incrementAnonymousUsage: (type) =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const stats = state.anonymousUsageStats;

          // Reset if day changed
          if (stats.lastResetDate !== today) {
            return {
              anonymousUsageStats: {
                calculatorUses: type === 'calculatorUses' ? 1 : 0,
                examQuestions: type === 'examQuestions' ? 1 : 0,
                aiQuestions: type === 'aiQuestions' ? 1 : 0,
                lastResetDate: today,
              },
            };
          }

          return {
            anonymousUsageStats: {
              ...stats,
              [type]: stats[type] + 1,
            },
          };
        }),

      resetDailyAnonymousStats: () =>
        set((state) => ({
          anonymousUsageStats: {
            ...state.anonymousUsageStats,
            examQuestions: 0,
            aiQuestions: 0,
            lastResetDate: new Date().toISOString().split('T')[0],
          },
        })),

      reset: () =>
        set(initialState),
    }),
    {
      name: 'migranthub-app',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        onboardingStep: state.onboardingStep,
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        lawSyncDate: state.lawSyncDate,
        lawSyncSuccess: state.lawSyncSuccess,
        lawSyncNoChanges: state.lawSyncNoChanges,
        ttsEnabled: state.ttsEnabled,
        pushNotificationsEnabled: state.pushNotificationsEnabled,
        fcmToken: state.fcmToken,
        pushPreferences: state.pushPreferences,
        hasSeenWelcome: state.hasSeenWelcome,
        anonymousUsageStats: state.anonymousUsageStats,
      }),
    }
  )
);
