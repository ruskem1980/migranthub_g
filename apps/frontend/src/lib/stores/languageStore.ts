'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Language =
  | 'ru' | 'en' | 'uz' | 'tg' | 'ky'
  | 'kk' | 'uk' | 'az' | 'hy' | 'mo'
  | 'ka' | 'tk' | 'zh' | 'vi' | 'ko'
  | 'be' | 'tr' | 'hi' | 'bn' | 'pa'
  | 'ur' | 'ar' | 'fa' | 'ps' | 'ku'
  | 'mn' | 'my' | 'th' | 'tl' | 'id'
  | 'ms' | 'ne' | 'si' | 'ta' | 'te'
  | 'kn' | 'ml' | 'mr' | 'gu' | 'sw'
  | 'am' | 'so' | 'ti' | 'ha' | 'yo'
  | 'ig' | 'pt' | 'es' | 'fr' | 'de' | 'pl';

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
}

// Main languages shown in quick selection
export const LANGUAGES: LanguageInfo[] = [
  { code: 'ru', name: 'Русский', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'uz', name: 'Узбекский', nativeName: "O'zbek", flag: '🇺🇿' },
  { code: 'tg', name: 'Таджикский', nativeName: 'Тоҷикӣ', flag: '🇹🇯' },
  { code: 'ky', name: 'Кыргызский', nativeName: 'Кыргызча', flag: '🇰🇬' },
];

// Extended list of top 50 migrant languages in Russia
export const EXTENDED_LANGUAGES: LanguageInfo[] = [
  // CIS & Central Asia (main migration sources)
  { code: 'ru', name: 'Русский', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'uz', name: 'Узбекский', nativeName: "O'zbek", flag: '🇺🇿' },
  { code: 'tg', name: 'Таджикский', nativeName: 'Тоҷикӣ', flag: '🇹🇯' },
  { code: 'ky', name: 'Кыргызский', nativeName: 'Кыргызча', flag: '🇰🇬' },
  { code: 'kk', name: 'Казахский', nativeName: 'Қазақша', flag: '🇰🇿' },
  { code: 'tk', name: 'Туркменский', nativeName: 'Türkmen', flag: '🇹🇲' },
  { code: 'uk', name: 'Украинский', nativeName: 'Українська', flag: '🇺🇦' },
  { code: 'be', name: 'Белорусский', nativeName: 'Беларуская', flag: '🇧🇾' },
  { code: 'mo', name: 'Молдавский', nativeName: 'Română', flag: '🇲🇩' },
  { code: 'az', name: 'Азербайджанский', nativeName: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'hy', name: 'Армянский', nativeName: 'Հայերdelays', flag: '🇦🇲' },
  { code: 'ka', name: 'Грузинский', nativeName: 'ქართული', flag: '🇬🇪' },

  // International
  { code: 'en', name: 'Английский', nativeName: 'English', flag: '🇬🇧' },
  { code: 'zh', name: 'Китайский', nativeName: '中文', flag: '🇨🇳' },
  { code: 'vi', name: 'Вьетнамский', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ko', name: 'Корейский', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'tr', name: 'Турецкий', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'mn', name: 'Монгольский', nativeName: 'Монгол', flag: '🇲🇳' },

  // South Asia
  { code: 'hi', name: 'Хинди', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'Бенгальский', nativeName: 'বাংলা', flag: '🇧🇩' },
  { code: 'pa', name: 'Панджаби', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', name: 'Урду', nativeName: 'اردو', flag: '🇵🇰' },
  { code: 'ne', name: 'Непальский', nativeName: 'नेपाली', flag: '🇳🇵' },
  { code: 'si', name: 'Сингальский', nativeName: 'සිංහල', flag: '🇱🇰' },
  { code: 'ta', name: 'Тамильский', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Телугу', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Каннада', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Малаялам', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr', name: 'Маратхи', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Гуджарати', nativeName: 'ગુજરાતી', flag: '🇮🇳' },

  // Middle East & Central Asia
  { code: 'ar', name: 'Арабский', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'fa', name: 'Персидский', nativeName: 'فارسی', flag: '🇮🇷' },
  { code: 'ps', name: 'Пушту', nativeName: 'پښتو', flag: '🇦🇫' },
  { code: 'ku', name: 'Курдский', nativeName: 'Kurdî', flag: '🇮🇶' },

  // Southeast Asia
  { code: 'my', name: 'Бирманский', nativeName: 'မြန်မာ', flag: '🇲🇲' },
  { code: 'th', name: 'Тайский', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'tl', name: 'Филиппинский', nativeName: 'Filipino', flag: '🇵🇭' },
  { code: 'id', name: 'Индонезийский', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Малайский', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },

  // Africa
  { code: 'sw', name: 'Суахили', nativeName: 'Kiswahili', flag: '🇹🇿' },
  { code: 'am', name: 'Амхарский', nativeName: 'አማርኛ', flag: '🇪🇹' },
  { code: 'so', name: 'Сомалийский', nativeName: 'Soomaali', flag: '🇸🇴' },
  { code: 'ti', name: 'Тигринья', nativeName: 'ትግርኛ', flag: '🇪🇷' },
  { code: 'ha', name: 'Хауса', nativeName: 'Hausa', flag: '🇳🇬' },
  { code: 'yo', name: 'Йоруба', nativeName: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ig', name: 'Игбо', nativeName: 'Igbo', flag: '🇳🇬' },

  // European
  { code: 'de', name: 'Немецкий', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'Французский', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Испанский', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Португальский', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'pl', name: 'Польский', nativeName: 'Polski', flag: '🇵🇱' },
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
