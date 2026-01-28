export interface PatentRegion {
  code: string;
  name: string;
  coefficient: number;
  monthlyCost: number;
}

export const patentRegions: PatentRegion[] = [
  { code: '77', name: 'Москва', coefficient: 2.2591, monthlyCost: 6502 },
  { code: '50', name: 'Московская область', coefficient: 2.1831, monthlyCost: 6287 },
  { code: '78', name: 'Санкт-Петербург', coefficient: 1.8315, monthlyCost: 5275 },
  { code: '47', name: 'Ленинградская область', coefficient: 1.8315, monthlyCost: 5275 },
  { code: '23', name: 'Краснодарский край', coefficient: 1.8581, monthlyCost: 5351 },
  { code: '61', name: 'Ростовская область', coefficient: 1.678, monthlyCost: 4832 },
  { code: '16', name: 'Республика Татарстан', coefficient: 1.8321, monthlyCost: 5277 },
  { code: '54', name: 'Новосибирская область', coefficient: 1.815, monthlyCost: 5228 },
  { code: '66', name: 'Свердловская область', coefficient: 1.8791, monthlyCost: 5412 },
  { code: '63', name: 'Самарская область', coefficient: 1.7098, monthlyCost: 4924 },
  { code: '52', name: 'Нижегородская область', coefficient: 1.82, monthlyCost: 5242 },
  { code: '74', name: 'Челябинская область', coefficient: 1.7653, monthlyCost: 5084 },
  { code: '02', name: 'Республика Башкортостан', coefficient: 1.725, monthlyCost: 4968 },
  { code: '59', name: 'Пермский край', coefficient: 1.71, monthlyCost: 4925 },
  { code: '38', name: 'Иркутская область', coefficient: 1.9527, monthlyCost: 5624 },
];

export const BASE_NDFL = 1200;
export const DEFLATOR_2024 = 2.4;
