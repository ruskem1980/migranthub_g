'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import {
  parseDeepLink,
  createDeepLink as createDeepLinkUrl,
  getPathForRoute,
  DeepLinkRoute,
  type ParsedDeepLink,
} from '@/lib/deepLinks';

export interface UseDeepLinksReturn {
  /**
   * Handle a deep link URL manually
   * Parses and navigates to the target route
   */
  handleDeepLink: (url: string) => void;

  /**
   * Create a deep link URL for a given route
   */
  createLink: (route: DeepLinkRoute, params?: Record<string, string>) => string;

  /**
   * Get the last parsed deep link (if any)
   */
  lastDeepLink: ParsedDeepLink | null;
}

/**
 * Hook for handling deep links from Capacitor and manual URL parsing
 * Automatically listens for App deep link events on mount
 *
 * @example
 * ```tsx
 * function App() {
 *   const { handleDeepLink, createLink } = useDeepLinks();
 *
 *   // Deep links are automatically handled on mount
 *   // You can also manually handle them:
 *   const recoveryLink = createLink('recovery', { code: '123' });
 * }
 * ```
 */
export function useDeepLinks(): UseDeepLinksReturn {
  const router = useRouter();

  // Handle deep link by parsing and navigating
  const handleDeepLink = useCallback(
    (url: string) => {
      const parsed = parseDeepLink(url);

      if (!parsed.route) {
        console.warn('[useDeepLinks] Invalid deep link:', url);
        return;
      }

      const path = getPathForRoute(parsed.route);

      // Build URL with params
      const queryString =
        Object.keys(parsed.params).length > 0
          ? '?' + new URLSearchParams(parsed.params).toString()
          : '';

      const fullPath = path + queryString;

      // Navigate using Next.js router
      router.push(fullPath);
    },
    [router]
  );

  // Create a deep link URL
  const createLink = useCallback(
    (route: DeepLinkRoute, params?: Record<string, string>) => {
      return createDeepLinkUrl(route, params);
    },
    []
  );

  // Set up Capacitor deep link listener
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let listenerHandle: Awaited<ReturnType<typeof App.addListener>> | null =
      null;

    const setupListener = async () => {
      try {
        listenerHandle = await App.addListener('appUrlOpen', (data) => {
          const url = data.url;
          console.log('[useDeepLinks] Received deep link:', url);
          handleDeepLink(url);
        });
      } catch (error) {
        console.error('[useDeepLinks] Failed to set up listener:', error);
      }
    };

    setupListener();

    return () => {
      listenerHandle?.remove();
    };
  }, [handleDeepLink]);

  return {
    handleDeepLink,
    createLink,
    lastDeepLink: null,
  };
}
