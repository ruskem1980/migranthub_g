/**
 * Data module exports
 * Reference data for the application
 */

export {
  RUSSIAN_CITIES,
  CITIES_COUNT,
  getCityById,
  getCitiesByRegion,
  searchCities,
  getCitiesSortedByName,
  getCitiesByPopulation,
  getMillionaireCities,
  type RussianCity,
} from './cities-russia';

export {
  COUNTRIES,
  PRIORITY_COUNTRIES,
  EAEU_COUNTRIES,
  getCountryByIso,
  searchCountries,
  getPriorityCountries,
  getAllCountries,
  getCountryName,
  isEAEUCountry,
  isPriorityCountry,
  getCountriesGrouped,
  type Country,
  type SupportedLanguage,
} from './countries';

export {
  KNOWLEDGE_BASE,
  KNOWLEDGE_COUNT,
  searchKnowledge,
  getKnowledgeByCategory,
  getKnowledgeById,
  getKnowledgeCategories,
  getRandomKnowledge,
  type KnowledgeItem,
  type KnowledgeCategory,
} from './knowledgeBase';

export {
  patentPrices,
  getPatentPrice,
  calculatePatentTotal,
  formatPrice,
  type PatentRegionPrice,
} from './patentPrices';
