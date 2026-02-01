'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Capacitor } from '@capacitor/core';
import { useAuthStore } from '../stores/authStore';
import { useProfileStore } from '../stores/profileStore';
import { useAppStore } from '../stores/appStore';
import { authApi, usersApi } from '../api/client';
import { tokenStorage } from '../api/storage';
import { getOrCreateDeviceId } from '../api/device';
import type { DevicePlatform } from '../api/types';

// App version
const APP_VERSION = '1.0.0';

// Get device platform
const getPlatform = (): DevicePlatform => {
  if (typeof window === 'undefined') return 'web';
  const platform = Capacitor.getPlatform();
  if (platform === 'ios') return 'ios';
  if (platform === 'android') return 'android';
  return 'web';
};

export function useAuth() {
  const router = useRouter();
  const initializingRef = useRef(false);

  // Use stable selectors to prevent unnecessary re-renders
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const error = useAuthStore((state) => state.error);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const setError = useAuthStore((state) => state.setError);
  const logoutStore = useAuthStore((state) => state.logout);

  const resetProfile = useProfileStore((state) => state.reset);
  const resetApp = useAppStore((state) => state.reset);
  const hasCompletedOnboarding = useAppStore((state) => state.hasCompletedOnboarding);

  // Initialize auth on app start - use ref to prevent re-runs
  const initializeAuth = useCallback(async () => {
    // Use ref to prevent concurrent initialization
    if (initializingRef.current || useAuthStore.getState().isInitialized) return;
    initializingRef.current = true;

    setLoading(true);

    try {
      // Check if we have tokens
      const accessToken = await tokenStorage.getAccessToken();

      if (accessToken) {
        // Try to get user profile with existing token
        try {
          const profile = await usersApi.getMe();
          setUser(profile);
          setInitialized(true);
          return;
        } catch {
          // Token might be invalid, try device auth
          await tokenStorage.clearTokens();
        }
      }

      // Perform device auth
      const deviceId = await getOrCreateDeviceId();
      const platform = getPlatform();
      const response = await authApi.deviceAuth(deviceId, platform, APP_VERSION);

      // Validate response structure
      if (!response?.tokens?.accessToken) {
        throw new Error('Ошибка авторизации: неверный ответ сервера');
      }

      // Store tokens
      await tokenStorage.setTokens(
        response.tokens.accessToken,
        response.tokens.refreshToken,
        response.tokens.expiresIn
      );

      // Set user
      setUser(response.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка авторизации';
      setError(message);
    } finally {
      setLoading(false);
      setInitialized(true);
      initializingRef.current = false;
    }
  }, [setLoading, setUser, setInitialized, setError]);

  // Fetch current user profile
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const profile = await usersApi.getMe();
      setUser(profile);
      return profile;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки профиля';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setUser]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await tokenStorage.clearTokens();
    } finally {
      logoutStore();
      resetProfile();
      resetApp();
      router.push('/');
    }
  }, [logoutStore, resetProfile, resetApp, router]);

  // Check if user is authenticated
  // NOTE: Lazy Auth flow - onboarding is optional, no redirect
  const checkAuth = useCallback(() => {
    return isAuthenticated;
  }, [isAuthenticated]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    hasCompletedOnboarding,
    initializeAuth,
    fetchProfile,
    logout,
    checkAuth,
  };
}

// Hook for automatic device auth on app start
export function useDeviceAuth() {
  const { initializeAuth, isInitialized, isLoading } = useAuth();
  const initCalled = useRef(false);

  useEffect(() => {
    // Only call once per mount
    if (!initCalled.current) {
      initCalled.current = true;
      initializeAuth();
    }
  }, [initializeAuth]);

  return { isInitialized, isLoading };
}
