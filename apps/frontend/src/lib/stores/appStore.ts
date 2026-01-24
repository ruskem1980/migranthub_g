'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// NOTE: Language is managed exclusively by languageStore to avoid duplication
// Use useTranslation() hook from '@/lib/i18n' for language operations

type Theme = 'light' | 'dark' | 'system';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
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

  // Actions
  setTheme: (theme: Theme) => void;
  setOnline: (isOnline: boolean) => void;
  setAppReady: (ready: boolean) => void;
  setCurrentTab: (tab: AppState['currentTab']) => void;

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Onboarding actions
  setOnboardingCompleted: (completed: boolean) => void;
  setOnboardingStep: (step: number) => void;

  reset: () => void;
}

const initialState = {
  theme: 'system' as Theme,
  isOnline: true,
  isAppReady: false,
  currentTab: 'home' as const,
  notifications: [],
  unreadCount: 0,
  hasCompletedOnboarding: false,
  onboardingStep: 0,
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
      }),
    }
  )
);
