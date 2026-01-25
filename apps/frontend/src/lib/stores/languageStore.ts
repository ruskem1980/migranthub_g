'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 5 supported languages
export type Language = 'ru' | 'en' | 'uz' | 'tg' | 'ky';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

// All 5 supported languages
export const LANGUAGES: LanguageInfo[] = [
  { code: 'ru', name: 'Русский', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'uz', name: 'Узбекский', nativeName: "O'zbek", flag: '🇺🇿' },
  { code: 'tg', name: 'Таджикский', nativeName: 'Тоҷикӣ', flag: '🇹🇯' },
  { code: 'ky', name: 'Кыргызский', nativeName: 'Кыргызча', flag: '🇰🇬' },
];

// For backwards compatibility, EXTENDED_LANGUAGES now equals LANGUAGES
export const EXTENDED_LANGUAGES: LanguageInfo[] = LANGUAGES;

interface LanguageState {
  language: Language;
  _hasHydrated: boolean;

  // Actions
  setLanguage: (language: Language) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ru',
      _hasHydrated: false,

      setLanguage: (language) => set({ language }),

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'migranthub-language',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        language: state.language,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export const getLanguageInfo = (code: Language): LanguageInfo => {
  return EXTENDED_LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
};
