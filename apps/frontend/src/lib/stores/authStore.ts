'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi, apiClient } from '@/lib/api/client';

// Cookie helper functions for middleware auth
const setCookie = (name: string, value: string, days: number = 7) => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

export interface User {
  id: string;
  phone: string;
  telegramId?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  _hasHydrated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  reset: () => void;
  setHasHydrated: (state: boolean) => void;
  validateSession: () => Promise<boolean>;
}

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  _hasHydrated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        }),

      setToken: (token) => {
        if (token) {
          setCookie('migranthub-token', token);
        } else {
          deleteCookie('migranthub-token');
        }
        set({ token, isAuthenticated: !!token });
      },

      setLoading: (isLoading) =>
        set({ isLoading }),

      setError: (error) =>
        set({ error, isLoading: false }),

      logout: () => {
        deleteCookie('migranthub-token');
        set({
          ...initialState,
          _hasHydrated: true,
        });
      },

      reset: () =>
        set({ ...initialState, _hasHydrated: true }),

      setHasHydrated: (state) =>
        set({ _hasHydrated: state }),

      validateSession: async () => {
        const state = get();
        if (!state.token) return false;

        // Set token in API client
        apiClient.setToken(state.token);

        try {
          const { valid, user } = await authApi.validateToken();
          if (valid && user) {
            set({
              user: { ...user, createdAt: user.createdAt || new Date().toISOString() },
              isAuthenticated: true
            });
            return true;
          } else {
            // Token is invalid - logout
            get().logout();
            return false;
          }
        } catch {
          // On network error - keep current state (offline mode)
          return state.isAuthenticated;
        }
      },
    }),
    {
      name: 'migranthub-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
