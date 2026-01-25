/**
 * Система образцов данных для форм документов
 *
 * Обеспечивает генерацию реалистичных образцов данных для заполнения форм
 * с поддержкой локализации (имена на языке пользователя).
 *
 * Поддерживаемые типы документов:
 * - passport - Паспорт
 * - patent - Патент на работу
 * - registration - Регистрация (миграционный учёт)
 * - migrationCard - Миграционная карта
 *
 * Поддерживаемые языки: ru, uz, tg, ky, en
 */

import type { PassportData } from '../schemas/passport.schema';
import type { PatentData } from '../schemas/patent.schema';
import type { RegistrationData } from '../schemas/registration.schema';
import type { MigrationCardData } from '../schemas/migrationCard.schema';

import { getPassportSample, getEmptyPassportSample } from './passportSamples';
import { getPatentSample, getPatentSampleForRegion, getEmptyPatentSample } from './patentSamples';
import {
  getRegistrationSample,
  getRegistrationSampleForRegion,
  getEmptyRegistrationSample,
} from './registrationSamples';
import {
  getMigrationCardSample,
  getMigrationCardSampleForPurpose,
  getEmptyMigrationCardSample,
} from './migrationCardSamples';

// Реэкспорт локализованных имён
export {
  localizedNames,
  localizedHostNames,
  getLocalizedName,
  getLocalizedHostName,
  isSupportedLanguage,
  type SupportedLanguage,
  type LocalizedName,
  type LocalizedHostName,
} from './localizedNames';

// Реэкспорт функций образцов
export {
  getPassportSample,
  getEmptyPassportSample,
  getPatentSample,
  getPatentSampleForRegion,
  getEmptyPatentSample,
  getRegistrationSample,
  getRegistrationSampleForRegion,
  getEmptyRegistrationSample,
  getMigrationCardSample,
  getMigrationCardSampleForPurpose,
  getEmptyMigrationCardSample,
};

/**
 * Типы документов
 */
export type DocumentType = 'passport' | 'patent' | 'registration' | 'migrationCard';

/**
 * Объединённый тип данных всех документов
 */
export type DocumentData = PassportData | PatentData | RegistrationData | MigrationCardData;

/**
 * Опции для получения образца данных
 */
export interface SampleDataOptions {
  /** Код языка (ru, uz, tg, ky, en). По умолчанию 'ru' */
  language?: string;
  /** Регион для патента и регистрации */
  region?: string;
  /** Цель визита для миграционной карты */
  purpose?: 'work' | 'study' | 'tourist' | 'private' | 'business' | 'transit' | 'humanitarian' | 'other';
  /** Вернуть пустой образец вместо заполненного */
  empty?: boolean;
}

/**
 * Главная функция получения образца данных для документа
 *
 * @param documentType Тип документа
 * @param options Опции генерации
 * @returns Образец данных документа
 *
 * @example
 * // Получить образец паспорта на узбекском
 * const passportSample = getSampleData('passport', { language: 'uz' });
 *
 * @example
 * // Получить образец патента для Санкт-Петербурга
 * const patentSample = getSampleData('patent', { region: 'Санкт-Петербург' });
 *
 * @example
 * // Получить пустой образец регистрации
 * const emptyRegistration = getSampleData('registration', { empty: true });
 */
export function getSampleData(documentType: 'passport', options?: SampleDataOptions): PassportData | Partial<PassportData>;
export function getSampleData(documentType: 'patent', options?: SampleDataOptions): PatentData | Partial<PatentData>;
export function getSampleData(documentType: 'registration', options?: SampleDataOptions): RegistrationData | Partial<RegistrationData>;
export function getSampleData(documentType: 'migrationCard', options?: SampleDataOptions): MigrationCardData | Partial<MigrationCardData>;
export function getSampleData(documentType: DocumentType, options?: SampleDataOptions): DocumentData | Partial<DocumentData>;
export function getSampleData(documentType: DocumentType, options: SampleDataOptions = {}): DocumentData | Partial<DocumentData> {
  const { language = 'ru', region, purpose, empty = false } = options;

  switch (documentType) {
    case 'passport':
      return empty ? getEmptyPassportSample() : getPassportSample(language);

    case 'patent':
      if (empty) return getEmptyPatentSample();
      return region ? getPatentSampleForRegion(region) : getPatentSample(language);

    case 'registration':
      if (empty) return getEmptyRegistrationSample();
      return region ? getRegistrationSampleForRegion(region, language) : getRegistrationSample(language);

    case 'migrationCard':
      if (empty) return getEmptyMigrationCardSample();
      return purpose ? getMigrationCardSampleForPurpose(purpose, language) : getMigrationCardSample(language);

    default:
      throw new Error(`Unknown document type: ${documentType}`);
  }
}

/**
 * Получить все образцы данных для указанного языка
 * @param language Код языка
 * @returns Объект со всеми образцами
 */
export function getAllSamples(language: string = 'ru'): {
  passport: PassportData;
  patent: PatentData;
  registration: RegistrationData;
  migrationCard: MigrationCardData;
} {
  return {
    passport: getSampleData('passport', { language }) as PassportData,
    patent: getSampleData('patent', { language }) as PatentData,
    registration: getSampleData('registration', { language }) as RegistrationData,
    migrationCard: getSampleData('migrationCard', { language }) as MigrationCardData,
  };
}

/**
 * Получить все пустые образцы данных
 * @returns Объект со всеми пустыми образцами
 */
export function getAllEmptySamples(): {
  passport: Partial<PassportData>;
  patent: Partial<PatentData>;
  registration: Partial<RegistrationData>;
  migrationCard: Partial<MigrationCardData>;
} {
  return {
    passport: getEmptyPassportSample(),
    patent: getEmptyPatentSample(),
    registration: getEmptyRegistrationSample(),
    migrationCard: getEmptyMigrationCardSample(),
  };
}
