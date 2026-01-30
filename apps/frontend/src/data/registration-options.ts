/**
 * Registration options for quick registration form
 * Citizenship and region dropdown data
 */

export interface CitizenshipOption {
  value: string;
  label: string;
  flag: string;
}

export interface RegionOption {
  value: string;
  label: string;
}

/**
 * Priority citizenship options for quick registration
 * Top migration source countries for Russia
 */
export const citizenshipOptions: CitizenshipOption[] = [
  { value: 'UZ', label: 'Узбекистан', flag: '🇺🇿' },
  { value: 'TJ', label: 'Таджикистан', flag: '🇹🇯' },
  { value: 'KG', label: 'Кыргызстан', flag: '🇰🇬' },
  { value: 'KZ', label: 'Казахстан', flag: '🇰🇿' },
  { value: 'AM', label: 'Армения', flag: '🇦🇲' },
  { value: 'AZ', label: 'Азербайджан', flag: '🇦🇿' },
  { value: 'MD', label: 'Молдова', flag: '🇲🇩' },
  { value: 'BY', label: 'Беларусь', flag: '🇧🇾' },
  { value: 'UA', label: 'Украина', flag: '🇺🇦' },
  { value: 'GE', label: 'Грузия', flag: '🇬🇪' },
  { value: 'TM', label: 'Туркменистан', flag: '🇹🇲' },
];

/**
 * Top Russian regions for quick registration
 * Includes major cities and regions with high migrant population
 */
export const russianRegions: RegionOption[] = [
  { value: 'moscow', label: 'Москва' },
  { value: 'saint-petersburg', label: 'Санкт-Петербург' },
  { value: 'moscow_oblast', label: 'Московская область' },
  { value: 'krasnodar', label: 'Краснодарский край' },
  { value: 'sverdlovsk', label: 'Свердловская область' },
  { value: 'tatarstan', label: 'Республика Татарстан' },
  { value: 'novosibirsk', label: 'Новосибирская область' },
  { value: 'samara', label: 'Самарская область' },
  { value: 'rostov', label: 'Ростовская область' },
  { value: 'chelyabinsk', label: 'Челябинская область' },
  { value: 'nizhny_novgorod', label: 'Нижегородская область' },
  { value: 'bashkortostan', label: 'Республика Башкортостан' },
  { value: 'perm', label: 'Пермский край' },
  { value: 'volgograd', label: 'Волгоградская область' },
  { value: 'tyumen', label: 'Тюменская область' },
];

/**
 * Get citizenship option by value
 */
export function getCitizenshipByValue(value: string): CitizenshipOption | undefined {
  return citizenshipOptions.find(opt => opt.value === value);
}

/**
 * Get region option by value
 */
export function getRegionByValue(value: string): RegionOption | undefined {
  return russianRegions.find(opt => opt.value === value);
}
