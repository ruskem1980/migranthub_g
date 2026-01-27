export interface PatentRegion {
  code: string;
  name: string;
  coefficient: number;
  baseRate: number;
  monthlyPrice: number;
}

/**
 * Базовая ставка НДФЛ для патента (фиксированный авансовый платёж)
 * согласно НК РФ ст. 227.1
 */
export const PATENT_BASE_RATE = 1200;

/**
 * Коэффициент-дефлятор на 2024 год
 * Устанавливается Минэкономразвития ежегодно
 */
export const DEFLATOR_COEFFICIENT = 2.4;

/**
 * Регионы России с коэффициентами для расчёта стоимости патента
 * monthlyPrice = baseRate * deflatorCoefficient * regionalCoefficient
 */
export const PATENT_REGIONS: PatentRegion[] = [
  {
    code: '77',
    name: 'Москва',
    coefficient: 2.5988,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 7500,
  },
  {
    code: '50',
    name: 'Московская область',
    coefficient: 2.3611,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 6800,
  },
  {
    code: '78',
    name: 'Санкт-Петербург',
    coefficient: 1.9861,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 4400,
  },
  {
    code: '47',
    name: 'Ленинградская область',
    coefficient: 1.9861,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 4400,
  },
  {
    code: '23',
    name: 'Краснодарский край',
    coefficient: 2.1667,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 4800,
  },
  {
    code: '61',
    name: 'Ростовская область',
    coefficient: 1.8958,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 4200,
  },
  {
    code: '16',
    name: 'Республика Татарстан',
    coefficient: 2.1667,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 4800,
  },
  {
    code: '63',
    name: 'Самарская область',
    coefficient: 2.0313,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 4500,
  },
  {
    code: '66',
    name: 'Свердловская область',
    coefficient: 2.4375,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 5400,
  },
  {
    code: '54',
    name: 'Новосибирская область',
    coefficient: 2.0764,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 4600,
  },
  {
    code: '52',
    name: 'Нижегородская область',
    coefficient: 2.1667,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 4800,
  },
  {
    code: '74',
    name: 'Челябинская область',
    coefficient: 2.1215,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 4700,
  },
  {
    code: '02',
    name: 'Республика Башкортостан',
    coefficient: 2.0313,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 4500,
  },
  {
    code: '59',
    name: 'Пермский край',
    coefficient: 2.1215,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 4700,
  },
  {
    code: '34',
    name: 'Волгоградская область',
    coefficient: 1.9861,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 4400,
  },
  {
    code: '36',
    name: 'Воронежская область',
    coefficient: 2.0313,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 4500,
  },
  {
    code: '38',
    name: 'Иркутская область',
    coefficient: 2.4826,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 5500,
  },
  {
    code: '24',
    name: 'Красноярский край',
    coefficient: 2.3472,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 5200,
  },
  {
    code: '55',
    name: 'Омская область',
    coefficient: 1.9861,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 4400,
  },
  {
    code: '72',
    name: 'Тюменская область',
    coefficient: 2.7986,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 6200,
  },
  {
    code: '86',
    name: 'Ханты-Мансийский АО',
    coefficient: 3.7014,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 8200,
  },
  {
    code: '89',
    name: 'Ямало-Ненецкий АО',
    coefficient: 4.2882,
    baseRate: PATENT_BASE_RATE,
    monthlyPrice: 9500,
  },
];

/**
 * Получить регион по коду
 */
export function getRegionByCode(code: string): PatentRegion | undefined {
  return PATENT_REGIONS.find((r) => r.code === code);
}

/**
 * Рассчитать стоимость патента
 */
export function calculatePatentPrice(regionCode: string, months: number): number | null {
  const region = getRegionByCode(regionCode);
  if (!region || months < 1 || months > 12) {
    return null;
  }
  return region.monthlyPrice * months;
}
