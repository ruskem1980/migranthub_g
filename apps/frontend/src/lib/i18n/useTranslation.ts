'use client';

import { useState, useEffect } from 'react';
import { useLanguageStore, Language, LANGUAGES, getLanguageInfo } from '../stores/languageStore';
import { getTranslation, TranslationKey, hasTranslation } from './translations';

export interface UseTranslationReturn {
  /** Current language code */
  language: Language;
  /** Translate a key to current language */
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  /** Change the current language */
  setLanguage: (language: Language) => void;
  /** Check if a translation exists */
  exists: (key: TranslationKey) => boolean;
  /** List of available languages */
  languages: typeof LANGUAGES;
  /** Get info about a language */
  getLanguageInfo: typeof getLanguageInfo;
  /** Whether the store has hydrated from localStorage */
  isReady: boolean;
}

// Helper to get language from localStorage directly (for immediate hydration)
function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'ru';
  try {
    const stored = localStorage.getItem('migranthub-language');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.language) {
        return parsed.state.language as Language;
      }
    }
  } catch {
    // Ignore parsing errors
  }
  return 'ru';
}

/**
 * Hook for translations and language management
 *
 * @example
 * const { t, language, setLanguage } = useTranslation();
 *
 * // Simple translation
 * <h1>{t('auth.phone.title')}</h1>
 *
 * // Translation with parameters
 * <p>{t('common.welcome', { name: 'John' })}</p>
 *
 * // Change language
 * <button onClick={() => setLanguage('uz')}>Switch to Uzbek</button>
 */
export function useTranslation(): UseTranslationReturn {
  // Subscribe to zustand store
  const storeLanguage = useLanguageStore((state) => state.language);
  const setStoreLanguage = useLanguageStore((state) => state.setLanguage);
  const _hasHydrated = useLanguageStore((state) => state._hasHydrated);

  // Local state - start with 'ru' for SSR, then update after hydration
  const [language, setLocalLanguage] = useState<Language>('ru');

  // After hydration, read from localStorage
  useEffect(() => {
    setLocalLanguage(getStoredLanguage());
  }, []);

  // Sync with zustand store changes
  useEffect(() => {
    if (_hasHydrated) {
      setLocalLanguage(storeLanguage);
    }
  }, [storeLanguage, _hasHydrated]);

  // Combined setter that updates both local and store
  const setLanguage = (lang: Language) => {
    setLocalLanguage(lang);
    setStoreLanguage(lang);
  };

  // Use local language for translations (reactive)
  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    return getTranslation(language, key, params);
  };

  const exists = (key: TranslationKey): boolean => {
    return hasTranslation(language, key);
  };

  return {
    language,
    t,
    setLanguage,
    exists,
    languages: LANGUAGES,
    getLanguageInfo,
    isReady: _hasHydrated,
  };
}

/**
 * Get a translation function for a specific namespace
 * Useful when you have many translations in one component
 *
 * @example
 * const { t } = useTranslation();
 * const tAuth = useNamespacedTranslation('auth.phone');
 * // Instead of t('auth.phone.title'), use tAuth('title')
 */
export function useNamespacedTranslation(namespace: string) {
  const { t, ...rest } = useTranslation();

  const namespacedT = (key: string, params?: Record<string, string | number>): string => {
    return t(`${namespace}.${key}`, params);
  };

  return { t: namespacedT, ...rest };
}

export default useTranslation;
