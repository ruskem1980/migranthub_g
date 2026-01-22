// ============================================
// MIGRANTHUB - LOCATION CONSTANTS
// Countries and cities with "3+1" pattern
// ============================================

export interface Country {
  code: string;
  flag: string;
  name: string;
  nameNative: string;
  isEAEU?: boolean;
  isTop3?: boolean;
}

export interface City {
  code: string;
  icon: string;
  name: string;
  isTop3?: boolean;
}

// COUNTRIES - "3+1" Pattern
export const TOP_3_COUNTRIES: Country[] = [
  { code: 'uz', flag: '🇺🇿', name: 'Узбекистан', nameNative: 'O\'zbekiston', isTop3: true },
  { code: 'tj', flag: '🇹🇯', name: 'Таджикистан', nameNative: 'Тоҷикистон', isTop3: true },
  { code: 'kg', flag: '🇰🇬', name: 'Кыргызстан', nameNative: 'Кыргызстан', isTop3: true },
];

export const OTHER_COUNTRIES: Country[] = [
  { code: 'am', flag: '🇦🇲', name: 'Армения', nameNative: 'Հայաստան', isEAEU: true },
  { code: 'by', flag: '🇧🇾', name: 'Беларусь', nameNative: 'Беларусь', isEAEU: true },
  { code: 'kz', flag: '🇰🇿', name: 'Казахстан', nameNative: 'Қазақстан', isEAEU: true },
  { code: 'az', flag: '🇦🇿', name: 'Азербайджан', nameNative: 'Azərbaycan' },
  { code: 'ge', flag: '🇬🇪', name: 'Грузия', nameNative: 'საქართველო' },
  { code: 'md', flag: '🇲🇩', name: 'Молдова', nameNative: 'Moldova' },
  { code: 'ua', flag: '🇺🇦', name: 'Украина', nameNative: 'Україна' },
  { code: 'cn', flag: '🇨🇳', name: 'Китай', nameNative: '中国' },
  { code: 'in', flag: '🇮🇳', name: 'Индия', nameNative: 'भारत' },
  { code: 'vn', flag: '🇻🇳', name: 'Вьетнам', nameNative: 'Việt Nam' },
];

export const ALL_COUNTRIES = [...TOP_3_COUNTRIES, ...OTHER_COUNTRIES];

// CITIES - "3+1" Pattern
export const TOP_3_CITIES: City[] = [
  { code: 'moscow', icon: '🏙️', name: 'Москва', isTop3: true },
  { code: 'spb', icon: '🏛️', name: 'Санкт-Петербург', isTop3: true },
  { code: 'nsk', icon: '❄️', name: 'Новосибирск', isTop3: true },
];

export const OTHER_CITIES: City[] = [
  { code: 'ekb', icon: '🏔️', name: 'Екатеринбург' },
  { code: 'kzn', icon: '🕌', name: 'Казань' },
  { code: 'nn', icon: '🏰', name: 'Нижний Новгород' },
  { code: 'smr', icon: '🏭', name: 'Самара' },
  { code: 'omsk', icon: '🌾', name: 'Омск' },
  { code: 'chel', icon: '⚙️', name: 'Челябинск' },
  { code: 'rnd', icon: '🌻', name: 'Ростов-на-Дону' },
  { code: 'ufa', icon: '🏞️', name: 'Уфа' },
  { code: 'krsk', icon: '🏔️', name: 'Красноярск' },
  { code: 'vrn', icon: '🌳', name: 'Воронеж' },
  { code: 'prm', icon: '🏭', name: 'Пермь' },
  { code: 'vlg', icon: '⚓', name: 'Волгоград' },
];

export const ALL_CITIES = [...TOP_3_CITIES, ...OTHER_CITIES];

// Helper functions
export const isEAEUCountry = (countryCode: string): boolean => {
  return ['am', 'by', 'kz', 'kg'].includes(countryCode);
};

export const getCountryByCode = (code: string): Country | undefined => {
  return ALL_COUNTRIES.find(c => c.code === code);
};

export const getCityByCode = (code: string): City | undefined => {
  return ALL_CITIES.find(c => c.code === code);
};
