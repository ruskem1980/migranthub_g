'use client';

import { useCallback, useEffect } from 'react';
import { useLanguageStore, type Language, LANGUAGES } from '@/lib/i18n';

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

/**
 * Sets a cookie with the given name, value, and max-age
 */
function setCookie(name: string, value: string, maxAge: number): void {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Gets a cookie value by name
 */
function getCookie(name: string): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}

// isValidLanguage kept for potential future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function _isValidLanguage(value: string | null): value is Language {
  if (!value) return false;
  return LANGUAGES.some((lang) => lang.code === value);
}

/**
 * Hook for managing language preference with localStorage and cookie persistence.
 *
 * - Reads from zustand store (which persists to localStorage under 'migranthub-language')
 * - Sets NEXT_LOCALE cookie for SSR locale detection
 * - Syncs cookie on mount and when language changes
 *
 * @returns Object with current language and setLanguage function
 */
export function useLanguagePreference() {
  const language = useLanguageStore((state) => state.language);
  const storeSetLanguage = useLanguageStore((state) => state.setLanguage);
  const hasHydrated = useLanguageStore((state) => state._hasHydrated);

  // Sync cookie when language changes or on initial hydration
  useEffect(() => {
    if (hasHydrated && typeof document !== 'undefined') {
      setCookie(LOCALE_COOKIE_NAME, language, COOKIE_MAX_AGE);
    }
  }, [language, hasHydrated]);

  // On mount, check if cookie exists but differs from store
  // This handles the case where cookie was set server-side
  useEffect(() => {
    if (hasHydrated && typeof document !== 'undefined') {
      const cookieLocale = getCookie(LOCALE_COOKIE_NAME);

      // If no cookie exists, set it from store
      if (!cookieLocale) {
        setCookie(LOCALE_COOKIE_NAME, language, COOKIE_MAX_AGE);
      }
    }
  }, [hasHydrated, language]);

  const setLanguage = useCallback(
    (newLanguage: Language) => {
      // Update zustand store (which persists to localStorage)
      storeSetLanguage(newLanguage);

      // Update cookie for SSR
      if (typeof document !== 'undefined') {
        setCookie(LOCALE_COOKIE_NAME, newLanguage, COOKIE_MAX_AGE);
      }
    },
    [storeSetLanguage]
  );

  return {
    language,
    setLanguage,
    isHydrated: hasHydrated,
  };
}

export type UseLanguagePreferenceReturn = ReturnType<typeof useLanguagePreference>;