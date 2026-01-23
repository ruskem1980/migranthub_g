'use client';

import { useCallback, useMemo } from 'react';
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
  const { language, setLanguage, _hasHydrated } = useLanguageStore();

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      return getTranslation(language, key, params);
    },
    [language]
  );

  const exists = useCallback(
    (key: TranslationKey): boolean => {
      return hasTranslation(language, key);
    },
    [language]
  );

  return useMemo(
    () => ({
      language,
      t,
      setLanguage,
      exists,
      languages: LANGUAGES,
      getLanguageInfo,
      isReady: _hasHydrated,
    }),
    [language, t, setLanguage, exists, _hasHydrated]
  );
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

  const namespacedT = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      return t(`${namespace}.${key}`, params);
    },
    [t, namespace]
  );

  return { t: namespacedT, ...rest };
}

export default useTranslation;
