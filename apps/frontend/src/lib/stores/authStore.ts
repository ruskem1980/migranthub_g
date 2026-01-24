'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ApiUser } from '../api/types';

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
