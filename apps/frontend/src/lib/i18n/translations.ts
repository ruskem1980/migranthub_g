'use client';

import { Language } from '../stores/languageStore';

// Import all translations
import ru from '@/locales/ru.json';
import uz from '@/locales/uz.json';
import tg from '@/locales/tg.json';
import ky from '@/locales/ky.json';

export type TranslationKey = string;

type NestedObject = {
  [key: string]: string | NestedObject;
};

const translations: Record<Language, NestedObject> = {
  ru,
  uz,
  tg,
  ky,
};

/**
 * Get a nested value from an object using dot notation
 * Example: getNestedValue(obj, 'auth.phone.title') returns obj.auth.phone.title
 */
function getNestedValue(obj: NestedObject, path: string): string | undefined {
  const keys = path.split('.');
  let current: NestedObject | string | undefined = obj;

  for (const key of keys) {
    if (current === undefined || current === null || typeof current === 'string') {
      return undefined;
    }
    current = current[key];
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Replace placeholders in a string with values
 * Example: interpolate('Hello, {name}!', { name: 'John' }) returns 'Hello, John!'
 */
function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;

  return str.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key]?.toString() ?? `{${key}}`;
  });
}

/**
 * Get translation for a key in a specific language
 */
export function getTranslation(
  language: Language,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const translation = getNestedValue(translations[language], key);

  if (!translation) {
    // Fallback to Russian if translation not found
    const fallback = getNestedValue(translations.ru, key);
    if (fallback) {
      return interpolate(fallback, params);
    }
    // Return key as last resort (helps identify missing translations)
    console.warn(`Missing translation for key: ${key}`);
    return key;
  }

  return interpolate(translation, params);
}

/**
 * Get all translations for a specific language
 */
export function getTranslations(language: Language): NestedObject {
  return translations[language];
}

/**
 * Check if a translation key exists
 */
export function hasTranslation(language: Language, key: TranslationKey): boolean {
  return getNestedValue(translations[language], key) !== undefined;
}
