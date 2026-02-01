'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Capacitor } from '@capacitor/core';
import type { ApiUser, DevicePlatform } from '../api/types';
import { authApi, usersApi } from '../api/client';
import { tokenStorage, deviceStorage } from '../api/storage';
import type { AccessMode, SubscriptionTier, Feature, QuickProfile } from '@/types';
import { canAccessFeature } from '@/types';

// App version from package.json
const APP_VERSION = '1.0.0';

// Get device platform
const getPlatform = (): DevicePlatform => {
  if (typeof window === 'undefined') return 'web';
  const platform = Capacitor.getPlatform();
  if (platform === 'ios') return 'ios';
  if (platform === 'android') return 'android';
  return 'web';
};

// Fallback UUID generator for non-secure contexts
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback for non-secure contexts (HTTP)
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

interface AuthState {
  user: ApiUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  _hasHydrated: boolean;

  // Access Mode (Lazy Auth)
  accessMode: AccessMode;
  subscriptionTier: SubscriptionTier;

  // Computed getters
  isAnonymous: boolean;
  isRegistered: boolean;

  // Actions
  setUser: (user: ApiUser | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  reset: () => void;
  setHasHydrated: (state: boolean) => void;
  recoverAccess: (recoveryCode: string) => Promise<void>;

  // Lazy Auth Actions
  setAccessMode: (mode: AccessMode) => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  canAccess: (feature: Feature) => boolean;
  convertToRegistered: (profile: QuickProfile) => Promise<QuickProfile>;
  initializeAnonymous: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  _hasHydrated: false,
  accessMode: 'anonymous' as AccessMode,
  subscriptionTier: 'free' as SubscriptionTier,
  isAnonymous: true,
  isRegistered: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          accessMode: user ? 'registered' : 'anonymous',
          isAnonymous: !user,
          isRegistered: !!user,
          error: null,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setInitialized: (isInitialized) => set({ isInitialized }),

      setError: (error) => set({ error, isLoading: false }),

      logout: () =>
        set({
          ...initialState,
          isInitialized: true,
          _hasHydrated: true,
        }),

      reset: () => set({ ...initialState, _hasHydrated: true }),

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // Lazy Auth methods
      setAccessMode: (accessMode) =>
        set({
          accessMode,
          isAnonymous: accessMode === 'anonymous',
          isRegistered: accessMode !== 'anonymous',
        }),

      setSubscriptionTier: (subscriptionTier) => set({ subscriptionTier }),

      canAccess: (feature: Feature) => {
        const state = get();
        return canAccessFeature(state.accessMode, state.subscriptionTier, feature);
      },

      initializeAnonymous: () => {
        set({
          accessMode: 'anonymous',
          subscriptionTier: 'free',
          isAnonymous: true,
          isRegistered: false,
          isInitialized: true,
          isAuthenticated: false,
          user: null,
        });
      },

      convertToRegistered: async (profile: QuickProfile) => {
        set({ isLoading: true, error: null });
        try {
          // Get or create deviceId
          let deviceId = await deviceStorage.getDeviceId();
          if (!deviceId) {
            deviceId = generateUUID();
            await deviceStorage.setDeviceId(deviceId);
          }

          // Use device auth to create/get user account
          const platform = getPlatform();
          const response = await authApi.deviceAuth(deviceId, platform, APP_VERSION);

          // Save tokens
          await tokenStorage.setTokens(
            response.tokens.accessToken,
            response.tokens.refreshToken,
            response.tokens.expiresIn
          );

          // Get user data
          const user = await usersApi.getMe();

          // Update user profile with quick registration data
          // Note: Profile data is saved locally via profileStore (Local-First architecture)
          // The quick profile (phone, citizenship, entryDate) will be passed to profileStore
          // by the calling component after this method succeeds

          // Update state to registered
          set({
            user,
            isAuthenticated: true,
            accessMode: 'registered',
            subscriptionTier: 'free',
            isAnonymous: false,
            isRegistered: true,
            isLoading: false,
            error: null,
          });

          // Return profile data for the caller to save to profileStore
          return profile;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : (error as { message?: string })?.message || 'Registration failed';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      recoverAccess: async (recoveryCode: string) => {
        set({ isLoading: true, error: null });
        try {
          // Get or create deviceId
          let deviceId = await deviceStorage.getDeviceId();
          if (!deviceId) {
            // Generate new device ID
            deviceId = generateUUID();
            await deviceStorage.setDeviceId(deviceId);
          }

          // Call recovery API
          const response = await authApi.verifyRecovery(deviceId, recoveryCode);

          // Save tokens
          await tokenStorage.setTokens(
            response.tokens.accessToken,
            response.tokens.refreshToken,
            response.tokens.expiresIn
          );

          // Get user data
          const user = await usersApi.getMe();

          // Update state
          set({
            user,
            isAuthenticated: true,
            accessMode: 'registered',
            isAnonymous: false,
            isRegistered: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage = error instanceof Error
            ? error.message
            : (error as { message?: string })?.message || 'Recovery failed';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },
    }),
    {
      name: 'migranthub-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessMode: state.accessMode,
        subscriptionTier: state.subscriptionTier,
        isAnonymous: state.isAnonymous,
        isRegistered: state.isRegistered,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
