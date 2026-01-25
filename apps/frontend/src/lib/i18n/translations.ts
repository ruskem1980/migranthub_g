'use client';

import { Language } from '../stores/languageStore';

// Import all translations (5 supported languages)
import ru from '@/locales/ru.json';
import en from '@/locales/en.json';
import uz from '@/locales/uz.json';
import tg from '@/locales/tg.json';
import ky from '@/locales/ky.json';

export type TranslationKey = string;

type NestedObject = {
  [key: string]: string | string[] | NestedObject;
};

// All supported languages with full translations
const mainTranslations: Record<string, NestedObject> = {
  ru,
  en,
  uz,
  tg,
  ky,
};

// For extended languages, fallback to Russian
const translations: Record<Language, NestedObject> = new Proxy(mainTranslations as Record<Language, NestedObject>, {
  get(target, prop: string) {
    return (target as Record<string, NestedObject>)[prop] || target.ru;
  }
});

/**
 * Get a nested value from an object using dot notation
 * Example: getNestedValue(obj, 'auth.phone.title') returns obj.auth.phone.title
 */
function getNestedValue(obj: NestedObject, path: string): string | string[] | undefined {
  const keys = path.split('.');
  let current: NestedObject | string | string[] | undefined = obj;

  for (const key of keys) {
    if (current === undefined || current === null || typeof current === 'string' || Array.isArray(current)) {
      return undefined;
    }
    current = current[key];
  }

  return typeof current === 'string' || Array.isArray(current) ? current : undefined;
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
      // If it's an array, join with newlines (for steps lists)
      if (Array.isArray(fallback)) {
        return fallback.join('\n');
      }
      return interpolate(fallback, params);
    }
    // Return key as last resort (helps identify missing translations)
    console.warn(`Missing translation for key: ${key}`);
    return key;
  }

  // If it's an array, join with newlines (for steps lists)
  if (Array.isArray(translation)) {
    return translation.join('\n');
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
