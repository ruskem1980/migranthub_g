/**
 * Patent prices by region for 2025
 * Prices are monthly advance NDFL payments
 * Source: https://www.nalog.gov.ru/
 */

import { Language } from '@/lib/stores/languageStore';

export interface PatentRegionPrice {
  code: string;
  name: Record<Language, string>;
  monthlyPrice: number; // in rubles
}

export const patentPrices: PatentRegionPrice[] = [
  {
    code: '77',
    name: {
      ru: 'Москва',
      en: 'Moscow',
      uz: 'Moskva',
      tg: 'Маскав',
      ky: 'Москва',
    },
    monthlyPrice: 6600,
  },
  {
    code: '50',
    name: {
      ru: 'Московская область',
      en: 'Moscow Region',
      uz: 'Moskva viloyati',
      tg: 'Вилояти Маскав',
      ky: 'Москва облусу',
    },
    monthlyPrice: 6300,
  },
  {
    code: '78',
    name: {
      ru: 'Санкт-Петербург',
      en: 'Saint Petersburg',
      uz: 'Sankt-Peterburg',
      tg: 'Санкт-Петербург',
      ky: 'Санкт-Петербург',
    },
    monthlyPrice: 4400,
  },
  {
    code: '47',
    name: {
      ru: 'Ленинградская область',
      en: 'Leningrad Region',
      uz: 'Leningrad viloyati',
      tg: 'Вилояти Ленинград',
      ky: 'Ленинград облусу',
    },
    monthlyPrice: 4400,
  },
  {
    code: '23',
    name: {
      ru: 'Краснодарский край',
      en: 'Krasnodar Krai',
      uz: 'Krasnodar oʻlkasi',
      tg: 'Кишвари Краснодар',
      ky: 'Краснодар крайы',
    },
    monthlyPrice: 5200,
  },
  {
    code: '66',
    name: {
      ru: 'Свердловская область',
      en: 'Sverdlovsk Region',
      uz: 'Sverdlovsk viloyati',
      tg: 'Вилояти Свердловск',
      ky: 'Свердловск облусу',
    },
    monthlyPrice: 5400,
  },
  {
    code: '16',
    name: {
      ru: 'Республика Татарстан',
      en: 'Republic of Tatarstan',
      uz: 'Tatariston Respublikasi',
      tg: 'Ҷумҳурии Тотористон',
      ky: 'Татарстан Республикасы',
    },
    monthlyPrice: 5100,
  },
  {
    code: '54',
    name: {
      ru: 'Новосибирская область',
      en: 'Novosibirsk Region',
      uz: 'Novosibirsk viloyati',
      tg: 'Вилояти Новосибирск',
      ky: 'Новосибирск облусу',
    },
    monthlyPrice: 4600,
  },
  {
    code: '52',
    name: {
      ru: 'Нижегородская область',
      en: 'Nizhny Novgorod Region',
      uz: 'Nijniy Novgorod viloyati',
      tg: 'Вилояти Нижегород',
      ky: 'Нижегород облусу',
    },
    monthlyPrice: 5000,
  },
  {
    code: '61',
    name: {
      ru: 'Ростовская область',
      en: 'Rostov Region',
      uz: 'Rostov viloyati',
      tg: 'Вилояти Ростов',
      ky: 'Ростов облусу',
    },
    monthlyPrice: 4500,
  },
  {
    code: '74',
    name: {
      ru: 'Челябинская область',
      en: 'Chelyabinsk Region',
      uz: 'Chelyabinsk viloyati',
      tg: 'Вилояти Челябинск',
      ky: 'Челябинск облусу',
    },
    monthlyPrice: 4800,
  },
  {
    code: '02',
    name: {
      ru: 'Республика Башкортостан',
      en: 'Republic of Bashkortostan',
      uz: 'Boshqirdiston Respublikasi',
      tg: 'Ҷумҳурии Бошқирдистон',
      ky: 'Башкортостан Республикасы',
    },
    monthlyPrice: 4700,
  },
  {
    code: '63',
    name: {
      ru: 'Самарская область',
      en: 'Samara Region',
      uz: 'Samara viloyati',
      tg: 'Вилояти Самара',
      ky: 'Самара облусу',
    },
    monthlyPrice: 4900,
  },
  {
    code: '72',
    name: {
      ru: 'Тюменская область',
      en: 'Tyumen Region',
      uz: 'Tyumen viloyati',
      tg: 'Вилояти Тюмен',
      ky: 'Тюмен облусу',
    },
    monthlyPrice: 5800,
  },
  {
    code: '24',
    name: {
      ru: 'Красноярский край',
      en: 'Krasnoyarsk Krai',
      uz: 'Krasnoyarsk oʻlkasi',
      tg: 'Кишвари Красноярск',
      ky: 'Красноярск крайы',
    },
    monthlyPrice: 5300,
  },
  {
    code: '55',
    name: {
      ru: 'Омская область',
      en: 'Omsk Region',
      uz: 'Omsk viloyati',
      tg: 'Вилояти Омск',
      ky: 'Омск облусу',
    },
    monthlyPrice: 4300,
  },
  {
    code: '59',
    name: {
      ru: 'Пермский край',
      en: 'Perm Krai',
      uz: 'Perm oʻlkasi',
      tg: 'Кишвари Перм',
      ky: 'Перм крайы',
    },
    monthlyPrice: 4700,
  },
  {
    code: '36',
    name: {
      ru: 'Воронежская область',
      en: 'Voronezh Region',
      uz: 'Voronej viloyati',
      tg: 'Вилояти Воронеж',
      ky: 'Воронеж облусу',
    },
    monthlyPrice: 4400,
  },
  {
    code: '34',
    name: {
      ru: 'Волгоградская область',
      en: 'Volgograd Region',
      uz: 'Volgograd viloyati',
      tg: 'Вилояти Волгоград',
      ky: 'Волгоград облусу',
    },
    monthlyPrice: 4200,
  },
  {
    code: '64',
    name: {
      ru: 'Саратовская область',
      en: 'Saratov Region',
      uz: 'Saratov viloyati',
      tg: 'Вилояти Саратов',
      ky: 'Саратов облусу',
    },
    monthlyPrice: 4100,
  },
];

/**
 * Get patent price for a specific region
 */
export function getPatentPrice(regionCode: string): number | undefined {
  return patentPrices.find((r) => r.code === regionCode)?.monthlyPrice;
}

/**
 * Calculate total patent payment
 */
export function calculatePatentTotal(regionCode: string, months: number): number {
  const price = getPatentPrice(regionCode);
  if (!price) return 0;
  return price * months;
}

/**
 * Format price in rubles
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
