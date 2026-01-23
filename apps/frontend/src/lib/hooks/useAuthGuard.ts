'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';

/**
 * Hook for protecting routes on the client side
 * Use in pages that require authentication
 */
export function useAuthGuard(options: {
  requireAuth?: boolean;
  redirectTo?: string;
} = {}) {
  const { requireAuth = true, redirectTo = '/welcome' } = options;
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (requireAuth && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [_hasHydrated, isAuthenticated, requireAuth, redirectTo, router]);

  return {
    isLoading: !_hasHydrated,
    isAuthenticated,
  };
}

/**
 * Hook for pages that should redirect authenticated users away
 * (e.g., login page should redirect to app if already logged in)
 */
export function useGuestGuard(redirectTo: string = '/prototype') {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [_hasHydrated, isAuthenticated, redirectTo, router]);

  return {
    isLoading: !_hasHydrated,
    isAuthenticated,
  };
}
