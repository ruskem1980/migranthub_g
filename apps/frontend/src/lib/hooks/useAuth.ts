'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useProfileStore, useAppStore } from '../stores';
import { authApi } from '../api/client';

export function useAuth() {
  const router = useRouter();
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setToken,
    setLoading,
    setError,
    logout: logoutStore,
  } = useAuthStore();

  const { reset: resetProfile } = useProfileStore();
  const { reset: resetApp, hasCompletedOnboarding } = useAppStore();

  const sendOtp = useCallback(async (phone: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.sendOtp(phone);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка отправки SMS';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const verifyOtp = useCallback(async (phone: string, code: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.verifyOtp(phone, code);
      setUser({
        id: response.user.id,
        phone: response.user.phone,
        createdAt: new Date().toISOString(),
      });
      setToken(response.token);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Неверный код';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setUser, setToken, setLoading, setError]);

  const loginWithTelegram = useCallback(async (telegramData: {
    id: number;
    first_name: string;
    auth_date: number;
    hash: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.telegramAuth(telegramData);
      setUser({
        id: response.user.id,
        phone: '',
        telegramId: response.user.telegramId,
        createdAt: new Date().toISOString(),
      });
      setToken(response.token);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка авторизации через Telegram';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setUser, setToken, setLoading, setError]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      logoutStore();
      resetProfile();
      resetApp();
      router.push('/auth/phone');
    }
  }, [logoutStore, resetProfile, resetApp, router]);

  const checkAuth = useCallback(() => {
    if (!isAuthenticated) {
      router.push('/auth/phone');
      return false;
    }

    if (!hasCompletedOnboarding) {
      router.push('/auth/onboarding');
      return false;
    }

    return true;
  }, [isAuthenticated, hasCompletedOnboarding, router]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    hasCompletedOnboarding,
    sendOtp,
    verifyOtp,
    loginWithTelegram,
    logout,
    checkAuth,
  };
}
