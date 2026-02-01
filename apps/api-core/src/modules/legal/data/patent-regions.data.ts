export interface PatentRegion {
  code: string;
  name: string;
  coefficient: number;
  monthlyCost: number;
}

// Base NDFL rate (fixed by law)
export const BASE_NDFL = 1200;

// Deflator coefficient for 2026 (Приказ Минэкономразвития России от 06.11.2025 № 734)
export const DEFLATOR_2026 = 2.842;

// Last updated date for tracking
export const PATENT_DATA_UPDATED_AT = '2026-01-01';

/**
 * Patent regions with 2026 rates
 * Source: https://consultant.ru, regional laws
 * Formula: monthlyCost = BASE_NDFL × DEFLATOR × regional_coefficient
 */
export const patentRegions: PatentRegion[] = [
  // Москва и область (единый патент с 2025)
  { code: '77', name: 'Москва', coefficient: 2.932, monthlyCost: 10000 },
  { code: '50', name: 'Московская область', coefficient: 2.932, monthlyCost: 10000 },

  // Санкт-Петербург и область (единый патент с 2025)
  { code: '78', name: 'Санкт-Петербург', coefficient: 2.346, monthlyCost: 8000 },
  { code: '47', name: 'Ленинградская область', coefficient: 2.346, monthlyCost: 8000 },

  // Остальные регионы (по алфавиту)
  { code: '01', name: 'Республика Адыгея', coefficient: 2.400, monthlyCost: 8185 },
  { code: '04', name: 'Республика Алтай', coefficient: 2.249, monthlyCost: 7670 },
  { code: '22', name: 'Алтайский край', coefficient: 2.417, monthlyCost: 8241 },
  { code: '28', name: 'Амурская область', coefficient: 3.775, monthlyCost: 12874 },
  { code: '29', name: 'Архангельская область', coefficient: 3.000, monthlyCost: 10230 },
  { code: '30', name: 'Астраханская область', coefficient: 2.056, monthlyCost: 7010 },
  { code: '02', name: 'Республика Башкортостан', coefficient: 2.493, monthlyCost: 8500 },
  { code: '31', name: 'Белгородская область', coefficient: 2.432, monthlyCost: 8294 },
  { code: '32', name: 'Брянская область', coefficient: 2.700, monthlyCost: 9207 },
  { code: '03', name: 'Республика Бурятия', coefficient: 2.850, monthlyCost: 9718 },
  { code: '33', name: 'Владимирская область', coefficient: 3.210, monthlyCost: 10950 },
  { code: '34', name: 'Волгоградская область', coefficient: 2.600, monthlyCost: 8867 },
  { code: '35', name: 'Вологодская область', coefficient: 5.859, monthlyCost: 19985 },
  { code: '36', name: 'Воронежская область', coefficient: 3.350, monthlyCost: 11425 },
  { code: '05', name: 'Республика Дагестан', coefficient: 2.300, monthlyCost: 7845 },
  { code: '79', name: 'Еврейская автономная область', coefficient: 2.931, monthlyCost: 9995 },
  { code: '75', name: 'Забайкальский край', coefficient: 3.924, monthlyCost: 13385 },
  { code: '06', name: 'Республика Ингушетия', coefficient: 1.960, monthlyCost: 6685 },
  { code: '37', name: 'Ивановская область', coefficient: 5.865, monthlyCost: 20000 },
  { code: '38', name: 'Иркутская область', coefficient: 3.519, monthlyCost: 12000 },
  { code: '08', name: 'Республика Калмыкия', coefficient: 1.100, monthlyCost: 3750 },
  { code: '39', name: 'Калининградская область', coefficient: 3.200, monthlyCost: 10913 },
  { code: '40', name: 'Калужская область', coefficient: 3.226, monthlyCost: 11000 },
  { code: '41', name: 'Камчатский край', coefficient: 4.039, monthlyCost: 13776 },
  { code: '09', name: 'Карачаево-Черкесская Республика', coefficient: 2.300, monthlyCost: 7845 },
  { code: '10', name: 'Республика Карелия', coefficient: 3.400, monthlyCost: 11595 },
  { code: '42', name: 'Кемеровская область', coefficient: 2.471, monthlyCost: 8428 },
  { code: '43', name: 'Кировская область', coefficient: 2.320, monthlyCost: 7910 },
  { code: '11', name: 'Республика Коми', coefficient: 2.651, monthlyCost: 9040 },
  { code: '44', name: 'Костромская область', coefficient: 2.531, monthlyCost: 8632 },
  { code: '23', name: 'Краснодарский край', coefficient: 7.919, monthlyCost: 27000 },
  { code: '24', name: 'Красноярский край', coefficient: 3.233, monthlyCost: 11025 },
  { code: '91', name: 'Республика Крым', coefficient: 3.501, monthlyCost: 11940 },
  { code: '45', name: 'Курганская область', coefficient: 2.600, monthlyCost: 8867 },
  { code: '46', name: 'Курская область', coefficient: 2.800, monthlyCost: 9547 },
  { code: '48', name: 'Липецкая область', coefficient: 6.427, monthlyCost: 21915 },
  { code: '49', name: 'Магаданская область', coefficient: 3.637, monthlyCost: 12400 },
  { code: '12', name: 'Республика Марий Эл', coefficient: 2.540, monthlyCost: 8660 },
  { code: '13', name: 'Республика Мордовия', coefficient: 2.100, monthlyCost: 7160 },
  { code: '51', name: 'Мурманская область', coefficient: 4.502, monthlyCost: 15350 },
  { code: '52', name: 'Нижегородская область', coefficient: 3.461, monthlyCost: 11800 },
  { code: '53', name: 'Новгородская область', coefficient: 2.738, monthlyCost: 9338 },
  { code: '54', name: 'Новосибирская область', coefficient: 3.185, monthlyCost: 10860 },
  { code: '55', name: 'Омская область', coefficient: 2.685, monthlyCost: 9157 },
  { code: '56', name: 'Оренбургская область', coefficient: 2.700, monthlyCost: 9207 },
  { code: '57', name: 'Орловская область', coefficient: 2.650, monthlyCost: 9036 },
  { code: '58', name: 'Пензенская область', coefficient: 2.698, monthlyCost: 9200 },
  { code: '59', name: 'Пермский край', coefficient: 2.386, monthlyCost: 8137 },
  { code: '25', name: 'Приморский край', coefficient: 3.695, monthlyCost: 12600 },
  { code: '60', name: 'Псковская область', coefficient: 2.918, monthlyCost: 9950 },
  { code: '61', name: 'Ростовская область', coefficient: 3.000, monthlyCost: 10230 },
  { code: '62', name: 'Рязанская область', coefficient: 2.878, monthlyCost: 9815 },
  { code: '63', name: 'Самарская область', coefficient: 3.271, monthlyCost: 11157 },
  { code: '64', name: 'Саратовская область', coefficient: 2.763, monthlyCost: 9423 },
  { code: '65', name: 'Сахалинская область', coefficient: 3.461, monthlyCost: 11800 },
  { code: '92', name: 'Севастополь', coefficient: 3.619, monthlyCost: 12340 },
  { code: '15', name: 'Республика Северная Осетия — Алания', coefficient: 2.400, monthlyCost: 8185 },
  { code: '67', name: 'Смоленская область', coefficient: 2.702, monthlyCost: 9215 },
  { code: '26', name: 'Ставропольский край', coefficient: 2.501, monthlyCost: 8530 },
  { code: '66', name: 'Свердловская область', coefficient: 2.786, monthlyCost: 9500 },
  { code: '68', name: 'Тамбовская область', coefficient: 2.404, monthlyCost: 8200 },
  { code: '16', name: 'Республика Татарстан', coefficient: 2.328, monthlyCost: 7937 },
  { code: '69', name: 'Тверская область', coefficient: 5.914, monthlyCost: 20169 },
  { code: '70', name: 'Томская область', coefficient: 3.079, monthlyCost: 10500 },
  { code: '71', name: 'Тульская область', coefficient: 7.332, monthlyCost: 25000 },
  { code: '17', name: 'Республика Тыва', coefficient: 1.913, monthlyCost: 6525 },
  { code: '72', name: 'Тюменская область', coefficient: 3.364, monthlyCost: 11471 },
  { code: '18', name: 'Удмуртская Республика', coefficient: 2.404, monthlyCost: 8200 },
  { code: '73', name: 'Ульяновская область', coefficient: 2.100, monthlyCost: 7161 },
  { code: '27', name: 'Хабаровский край', coefficient: 3.100, monthlyCost: 10570 },
  { code: '19', name: 'Республика Хакасия', coefficient: 3.000, monthlyCost: 10230 },
  { code: '86', name: 'Ханты-Мансийский АО', coefficient: 3.200, monthlyCost: 10912 },
  { code: '74', name: 'Челябинская область', coefficient: 4.938, monthlyCost: 16840 },
  { code: '20', name: 'Чеченская Республика', coefficient: 1.000, monthlyCost: 3410 },
  { code: '21', name: 'Чувашская Республика', coefficient: 2.826, monthlyCost: 9635 },
  { code: '87', name: 'Чукотский АО', coefficient: 3.100, monthlyCost: 10570 },
  { code: '89', name: 'Ямало-Ненецкий АО', coefficient: 5.428, monthlyCost: 18506 },
  { code: '76', name: 'Ярославская область', coefficient: 3.220, monthlyCost: 10980 },

  // Кабардино-Балкария
  { code: '07', name: 'Кабардино-Балкарская Республика', coefficient: 3.300, monthlyCost: 11255 },

  // Республика Саха (Якутия)
  { code: '14', name: 'Республика Саха (Якутия)', coefficient: 4.500, monthlyCost: 15345 },
];

/**
 * Get region by code
 */
export function getPatentRegionByCode(code: string): PatentRegion | undefined {
  return patentRegions.find((r) => r.code === code);
}

/**
 * Calculate patent cost for a region
 */
export function calculatePatentCost(regionCode: string, months: number): number | null {
  const region = getPatentRegionByCode(regionCode);
  if (!region) return null;
  return region.monthlyCost * months;
}
