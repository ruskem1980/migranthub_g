'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Language = 'ru' | 'uz' | 'tg' | 'ky';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'ru', name: 'Русский', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'uz', name: 'Узбекский', nativeName: "O'zbek", flag: '🇺🇿' },
  { code: 'tg', name: 'Таджикский', nativeName: 'Тоҷикӣ', flag: '🇹🇯' },
  { code: 'ky', name: 'Кыргызский', nativeName: 'Кыргызча', flag: '🇰🇬' },
];

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

      setLanguage: (language) => {
        console.log('[LanguageStore] Setting language to:', language);
        set({ language });
      },

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
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
};
