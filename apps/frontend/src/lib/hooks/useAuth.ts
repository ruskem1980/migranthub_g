'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/authStore';
import { useProfileStore } from '../stores/profileStore';
import { useAppStore } from '../stores/appStore';
import { authApi, usersApi } from '../api/client';
import { tokenStorage } from '../api/storage';
import { getOrCreateDeviceId } from '../api/device';

export function useAuth() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    setUser,
    setLoading,
    setInitialized,
    setError,
    logout: logoutStore,
  } = useAuthStore();

  const { reset: resetProfile } = useProfileStore();
  const { reset: resetApp, hasCompletedOnboarding } = useAppStore();

  // Initialize auth on app start
  const initializeAuth = useCallback(async () => {
    if (isInitialized) return;

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
      const response = await authApi.deviceAuth(deviceId);

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
    }
  }, [isInitialized, setLoading, setUser, setInitialized, setError]);

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

  // Check if user is authenticated and onboarded
  const checkAuth = useCallback(() => {
    if (!isAuthenticated) {
      return false;
    }

    if (!hasCompletedOnboarding) {
      router.push('/onboarding');
      return false;
    }

    return true;
  }, [isAuthenticated, hasCompletedOnboarding, router]);

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

  useEffect(() => {
    if (!isInitialized && !isLoading) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized, isLoading]);

  return { isInitialized, isLoading };
}
