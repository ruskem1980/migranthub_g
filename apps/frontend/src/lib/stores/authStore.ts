'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ApiUser } from '../api/types';
import { authApi, usersApi } from '../api/client';
import { tokenStorage, deviceStorage } from '../api/storage';

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

  // Actions
  setUser: (user: ApiUser | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  reset: () => void;
  setHasHydrated: (state: boolean) => void;
  recoverAccess: (recoveryCode: string) => Promise<void>;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  _hasHydrated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
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
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
