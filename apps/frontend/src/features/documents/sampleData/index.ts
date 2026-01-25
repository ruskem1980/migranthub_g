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
import type { InnData } from '../schemas/inn.schema';
import type { SnilsData } from '../schemas/snils.schema';
import type { DmsData } from '../schemas/dms.schema';
import type { DocumentTypeValue } from '@/lib/db/types';

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

// Импорт локализованных имён для внутреннего использования
import { getLocalizedName } from './localizedNames';

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

/**
 * Получить образец данных для документа по типу (для PDF генерации)
 * @param documentType Тип документа из lib/db/types
 * @param language Код языка (по умолчанию 'ru')
 */
export function getSampleDataForDocument(
  documentType: DocumentTypeValue,
  language: string = 'ru'
): Record<string, unknown> {
  switch (documentType) {
    case 'passport':
      return getSampleData('passport', { language }) as Record<string, unknown>;
    case 'migration_card':
      return getSampleData('migrationCard', { language }) as Record<string, unknown>;
    case 'patent':
      return getSampleData('patent', { language }) as Record<string, unknown>;
    case 'registration':
      return getSampleData('registration', { language }) as Record<string, unknown>;
    case 'inn':
      return getInnSample(language);
    case 'snils':
      return getSnilsSample(language);
    case 'dms':
      return getDmsSample(language);
    default:
      return {};
  }
}

/**
 * Образец данных ИНН
 */
function getInnSample(language: string): Record<string, unknown> {
  const name = getLocalizedName(language);
  const today = new Date();
  const issueDate = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());

  return {
    innNumber: '123456789012',
    fullName: `${name.lastName} ${name.firstName} ${name.middleName || ''}`.trim(),
    issueDate: issueDate.toISOString().split('T')[0],
    issuedBy: 'ИФНС России No 46 по г. Москве',
    taxAuthorityCode: '7746',
  } satisfies InnData;
}

/**
 * Образец данных СНИЛС
 */
function getSnilsSample(language: string): Record<string, unknown> {
  const name = getLocalizedName(language);
  const today = new Date();
  const birthDate = new Date(today.getFullYear() - 30, 5, 15);
  const registrationDate = new Date(today.getFullYear() - 3, today.getMonth(), today.getDate());

  return {
    snilsNumber: '123-456-789 00',
    fullName: `${name.lastName} ${name.firstName} ${name.middleName || ''}`.trim(),
    birthDate: birthDate.toISOString().split('T')[0],
    birthPlace: name.birthPlace,
    gender: 'male' as const,
    registrationDate: registrationDate.toISOString().split('T')[0],
  } satisfies SnilsData;
}

/**
 * Образец данных ДМС
 */
function getDmsSample(language: string): Record<string, unknown> {
  const name = getLocalizedName(language);
  const today = new Date();
  const startDate = new Date(today.getFullYear(), 0, 1);
  const expiryDate = new Date(today.getFullYear() + 1, 0, 1);

  return {
    policyNumber: 'DMS-2024-123456',
    fullName: `${name.lastName} ${name.firstName} ${name.middleName || ''}`.trim(),
    insuranceCompany: 'АО "СОГАЗ"',
    startDate: startDate.toISOString().split('T')[0],
    expiryDate: expiryDate.toISOString().split('T')[0],
    programName: 'Стандартная программа для иностранных граждан',
    coverageTerritory: 'Российская Федерация',
    insurancePhone: '+7 (495) 123-45-67',
  } satisfies DmsData;
}

/**
 * Локализованные названия полей документов для PDF
 */
export const documentFieldLabels: Record<DocumentTypeValue, Record<string, string>> = {
  passport: {
    lastName: 'Фамилия',
    firstName: 'Имя',
    middleName: 'Отчество',
    lastNameLatin: 'Фамилия (латиница)',
    firstNameLatin: 'Имя (латиница)',
    birthDate: 'Дата рождения',
    birthPlace: 'Место рождения',
    gender: 'Пол',
    citizenship: 'Гражданство',
    passportSeries: 'Серия паспорта',
    passportNumber: 'Номер паспорта',
    issueDate: 'Дата выдачи',
    expiryDate: 'Срок действия',
    issuedBy: 'Кем выдан',
  },
  migration_card: {
    lastName: 'Фамилия',
    firstName: 'Имя',
    middleName: 'Отчество',
    cardSeries: 'Серия карты',
    cardNumber: 'Номер карты',
    entryDate: 'Дата въезда',
    stayUntil: 'Срок пребывания до',
    entryPurpose: 'Цель въезда',
    entryPoint: 'Пункт пропуска',
  },
  patent: {
    lastName: 'Фамилия',
    firstName: 'Имя',
    middleName: 'Отчество',
    patentSeries: 'Серия патента',
    patentNumber: 'Номер патента',
    issueDate: 'Дата выдачи',
    expiryDate: 'Срок действия',
    region: 'Регион',
    profession: 'Профессия',
    issuedBy: 'Кем выдан',
  },
  registration: {
    lastName: 'Фамилия',
    firstName: 'Имя',
    middleName: 'Отчество',
    registrationType: 'Тип регистрации',
    registrationDate: 'Дата регистрации',
    expiryDate: 'Срок действия',
    region: 'Регион',
    city: 'Город',
    street: 'Улица',
    building: 'Дом',
    apartment: 'Квартира',
    hostFullName: 'ФИО принимающей стороны',
    hostDocumentInfo: 'Документ принимающей стороны',
  },
  inn: {
    fullName: 'ФИО',
    innNumber: 'Номер ИНН',
    issueDate: 'Дата выдачи',
    issuedBy: 'Выдан',
    taxAuthorityCode: 'Код налогового органа',
  },
  snils: {
    fullName: 'ФИО',
    snilsNumber: 'Номер СНИЛС',
    birthDate: 'Дата рождения',
    birthPlace: 'Место рождения',
    gender: 'Пол',
    registrationDate: 'Дата регистрации',
  },
  dms: {
    fullName: 'ФИО застрахованного',
    policyNumber: 'Номер полиса',
    insuranceCompany: 'Страховая компания',
    programName: 'Программа страхования',
    startDate: 'Дата начала',
    expiryDate: 'Дата окончания',
    coverageTerritory: 'Территория покрытия',
    insurancePhone: 'Телефон страховой',
  },
};
