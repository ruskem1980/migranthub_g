'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { parseDeepLink, getPathForRoute, type ParsedDeepLink, type DeepLinkRoute } from '../deepLinks';

interface DeepLinkState {
  lastDeepLink: ParsedDeepLink | null;
  isReady: boolean;
}

interface UseDeepLinksOptions {
  onDeepLink?: (parsed: ParsedDeepLink) => void;
}

export function useDeepLinks(options?: UseDeepLinksOptions) {
  const router = useRouter();
  const [state, setState] = useState<DeepLinkState>({
    lastDeepLink: null,
    isReady: false,
  });
  const listenerRef = useRef<{ remove: () => void } | null>(null);

  const handleDeepLink = useCallback((url: string) => {
    const parsed = parseDeepLink(url);

    if (!parsed.route) {
      console.warn('[DeepLinks] Unknown route:', url);
      return;
    }

    console.log('[DeepLinks] Handling:', parsed);

    setState(prev => ({
      ...prev,
      lastDeepLink: parsed,
    }));

    // Call custom handler if provided
    if (options?.onDeepLink) {
      options.onDeepLink(parsed);
    }

    // Navigate to the route
    const path = getPathForRoute(parsed.route);
    const queryString = Object.keys(parsed.params).length > 0
      ? '?' + new URLSearchParams(parsed.params).toString()
      : '';

    router.push(path + queryString);
  }, [router, options]);

  const navigateTo = useCallback((route: DeepLinkRoute, params?: Record<string, string>) => {
    const path = getPathForRoute(route);
    const queryString = params && Object.keys(params).length > 0
      ? '?' + new URLSearchParams(params).toString()
      : '';

    router.push(path + queryString);
  }, [router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initDeepLinks = async () => {
      try {
        // Dynamically import Capacitor App plugin
        const { App } = await import('@capacitor/app');

        // Listen for app URL open events (deep links)
        const listener = await App.addListener('appUrlOpen', (event) => {
          console.log('[DeepLinks] App URL opened:', event.url);
          handleDeepLink(event.url);
        });

        listenerRef.current = listener;

        // Check if app was opened with a URL (cold start)
        const launchUrl = await App.getLaunchUrl();
        if (launchUrl?.url) {
          console.log('[DeepLinks] Launch URL:', launchUrl.url);
          handleDeepLink(launchUrl.url);
        }

        setState(prev => ({ ...prev, isReady: true }));
      } catch {
        // Capacitor not available (running in browser)
        console.log('[DeepLinks] Running in browser mode, Capacitor not available');
        setState(prev => ({ ...prev, isReady: true }));

        // Handle browser URL hash for web deep links
        if (window.location.hash) {
          const hash = window.location.hash.substring(1);
          if (hash.startsWith('migranthub://')) {
            handleDeepLink(hash);
          }
        }
      }
    };

    initDeepLinks();

    return () => {
      if (listenerRef.current) {
        listenerRef.current.remove();
      }
    };
  }, [handleDeepLink]);

  return {
    ...state,
    navigateTo,
  };
}
