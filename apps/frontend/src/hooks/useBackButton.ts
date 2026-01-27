'use client';

import { useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { backButtonService } from '@/lib/backButton';

interface UseBackButtonOptions {
  onBack?: () => boolean;
  confirmExit?: boolean;
  exitMessage?: string;
}

/**
 * Main back button handler hook - use in app root
 * Handles default navigation and exit confirmation
 */
export function useBackButton(options: UseBackButtonOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();

  const defaultHandler = useCallback((): boolean => {
    if (options.onBack) {
      return options.onBack();
    }

    if (window.history.length > 1) {
      router.back();
      return true;
    }

    if (pathname === '/' && options.confirmExit !== false) {
      const message = options.exitMessage || 'Выйти из приложения?';
      if (confirm(message)) {
        App.exitApp();
      }
      return true;
    }

    return false;
  }, [router, pathname, options]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = App.addListener('backButton', () => {
      const handled = backButtonService.handle();

      if (!handled) {
        defaultHandler();
      }
    });

    return () => {
      listener.remove();
    };
  }, [defaultHandler]);
}

/**
 * Hook for registering custom back button handler (for Modal, Sheet, etc.)
 * Handlers are called in LIFO order - last registered handler is called first
 */
export function useBackButtonHandler(
  handler: () => boolean,
  deps: unknown[] = []
) {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const unregister = backButtonService.register(handler);
    return unregister;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
