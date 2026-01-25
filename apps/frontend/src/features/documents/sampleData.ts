import type { PassportData } from './schemas/passport.schema';
import type { MigrationCardData } from './schemas/migrationCard.schema';
import type { PatentData } from './schemas/patent.schema';
import type { RegistrationData } from './schemas/registration.schema';

/**
 * Поддерживаемые типы документов для образцов
 */
export type DocumentType = 'passport' | 'migrationCard' | 'patent' | 'registration';

/**
 * Опции для получения образца данных
 */
export interface SampleDataOptions {
  /** Язык пользователя для локализации имён */
  language?: string;
}

/**
 * Образцы имён по языкам
 */
const SAMPLE_NAMES: Record<string, { firstName: string; lastName: string; middleName: string }> = {
  ru: { firstName: 'АЛИШЕР', lastName: 'РАХИМОВ', middleName: 'БАХТИЁРОВИЧ' },
  uz: { firstName: 'ALISHER', lastName: 'RAHIMOV', middleName: 'BAKHTIYOROVICH' },
  tg: { firstName: 'АЛИШЕР', lastName: 'РАХИМОВ', middleName: 'БАХТИЁРОВИЧ' },
  ky: { firstName: 'АЛИШЕР', lastName: 'РАХИМОВ', middleName: 'БАХТИЁРОВИЧ' },
  en: { firstName: 'ALISHER', lastName: 'RAKHIMOV', middleName: 'BAKHTIYOROVICH' },
};

/**
 * Получить имена по языку
 */
function getNames(language: string) {
  return SAMPLE_NAMES[language] || SAMPLE_NAMES['ru'];
}

/**
 * Форматирует дату в строку YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Получить дату N дней назад
 */
function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDate(date);
}

/**
 * Получить дату через N дней
 */
function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

/**
 * Получить образец данных паспорта
 */
function getPassportSample(options: SampleDataOptions): PassportData {
  const names = getNames(options.language || 'ru');

  return {
    lastName: names.lastName,
    firstName: names.firstName,
    middleName: names.middleName,
    lastNameLatin: 'RAKHIMOV',
    firstNameLatin: 'ALISHER',
    birthDate: '1990-05-15',
    gender: 'male',
    citizenship: 'Узбекистан',
    passportNumber: 'AA1234567',
    passportSeries: 'AA',
    issueDate: '2020-03-10',
    expiryDate: '2030-03-10',
    issuedBy: 'МВД Республики Узбекистан',
    birthPlace: 'г. Ташкент, Узбекистан',
  };
}

/**
 * Получить образец данных миграционной карты
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getMigrationCardSample(options: SampleDataOptions): MigrationCardData {
  // Дата въезда - 7 дней назад (реалистичный сценарий)
  const entryDate = daysAgo(7);
  // Срок пребывания - 90 дней от въезда
  const stayUntil = daysFromNow(83); // 90 - 7 = 83 дня осталось

  return {
    cardNumber: '1234567890',
    cardSeries: '0001',
    entryDate,
    entryPoint: 'Аэропорт Шереметьево',
    purpose: 'work',
    stayUntil,
    hostName: 'ООО "Рога и Копыта"',
    hostAddress: 'г. Москва, ул. Пушкина, д. 10, кв. 5',
  };
}

/**
 * Получить образец данных патента на работу
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getPatentSample(_options: SampleDataOptions): PatentData {
  // Дата выдачи - 30 дней назад
  const issueDate = daysAgo(30);
  // Срок действия - 1 год от выдачи
  const expiryDate = daysFromNow(335);
  // Последняя оплата - 5 дней назад
  const lastPaymentDate = daysAgo(5);
  // Оплачено на 1 месяц вперёд
  const paidUntil = daysFromNow(25);

  return {
    patentNumber: '7712345678',
    patentSeries: '77',
    region: 'Москва',
    profession: 'Подсобный рабочий',
    issueDate,
    expiryDate,
    issuedBy: 'УВМ ГУ МВД России по г. Москве',
    inn: '771234567890',
    lastPaymentDate,
    paidUntil,
    monthlyPayment: 7500,
  };
}

/**
 * Получить образец данных регистрации (миграционного учёта)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getRegistrationSample(_options: SampleDataOptions): RegistrationData {
  // Дата регистрации - 10 дней назад
  const registrationDate = daysAgo(10);
  // Срок действия - 80 дней от сегодня (90 дней общий срок)
  const expiryDate = daysFromNow(80);

  return {
    type: 'temporary',
    address: 'Москва, ул. Ленина, д. 10, кв. 25',
    region: 'Москва',
    city: 'Москва',
    street: 'ул. Ленина',
    building: '10',
    apartment: '25',
    registrationDate,
    expiryDate,
    hostFullName: 'Иванов Иван Иванович',
    hostPhone: '+7 (999) 123-45-67',
    notificationNumber: '123456789',
    registeredBy: 'УВМ ГУ МВД России по г. Москве',
  };
}

/**
 * Получить образец данных для указанного типа документа
 *
 * @param documentType - тип документа
 * @param options - опции (язык и т.д.)
 * @returns образец данных документа
 *
 * @example
 * ```ts
 * const passportSample = getSampleData('passport', { language: 'ru' });
 * const migrationCardSample = getSampleData('migrationCard', { language: 'uz' });
 * const patentSample = getSampleData('patent', { language: 'ru' });
 * const registrationSample = getSampleData('registration', { language: 'ru' });
 * ```
 */
export function getSampleData(
  documentType: DocumentType,
  options: SampleDataOptions = {}
): PassportData | MigrationCardData | PatentData | RegistrationData {
  switch (documentType) {
    case 'passport':
      return getPassportSample(options);
    case 'migrationCard':
      return getMigrationCardSample(options);
    case 'patent':
      return getPatentSample(options);
    case 'registration':
      return getRegistrationSample(options);
    default:
      throw new Error(`Unknown document type: ${documentType}`);
  }
}

/**
 * Маппинг полей формы на ключи образцов данных
 */
const FIELD_TO_SAMPLE_KEY: Record<string, { docType: DocumentType; key: string }> = {
  // Personal data from passport
  fullName: { docType: 'passport', key: '_computed_fullName' },
  fullNameLatin: { docType: 'passport', key: '_computed_fullNameLatin' },
  passportNumber: { docType: 'passport', key: 'passportNumber' },
  citizenship: { docType: 'passport', key: 'citizenship' },
  birthDate: { docType: 'passport', key: 'birthDate' },

  // Migration card data
  entryDate: { docType: 'migrationCard', key: 'entryDate' },
  migrationCardNumber: { docType: 'migrationCard', key: 'cardNumber' },

  // Registration data
  registrationAddress: { docType: 'registration', key: 'address' },
  hostFullName: { docType: 'registration', key: 'hostFullName' },
  hostAddress: { docType: 'migrationCard', key: 'hostAddress' },

  // Patent data
  patentRegion: { docType: 'patent', key: 'region' },
  employerName: { docType: 'patent', key: '_static_employer' },
};

/**
 * Получить локализованный placeholder для поля формы
 *
 * @param fieldName Имя поля формы
 * @param language Код языка (ru, uz, tg, ky, en)
 * @returns Локализованный placeholder или undefined
 *
 * @example
 * const placeholder = getLocalizedPlaceholder('fullName', 'uz');
 * // Returns: "RAHIMOV ALISHER BAKHTIYOROVICH"
 */
export function getLocalizedPlaceholder(fieldName: string, language: string = 'ru'): string | undefined {
  const mapping = FIELD_TO_SAMPLE_KEY[fieldName];
  if (!mapping) return undefined;

  try {
    // Handle computed fields that need special processing
    if (mapping.key.startsWith('_computed_')) {
      return getComputedPlaceholder(mapping.key, language);
    }

    // Handle static placeholders that don't depend on sample data
    if (mapping.key.startsWith('_static_')) {
      return getStaticPlaceholder(mapping.key);
    }

    const sampleData = getSampleData(mapping.docType, { language });
    const value = (sampleData as Record<string, unknown>)[mapping.key];

    if (value === undefined || value === null) return undefined;

    // Format dates for display
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value; // Keep dates as-is for input[type=date]
    }

    return String(value);
  } catch {
    return undefined;
  }
}

/**
 * Compute placeholder for fields that need to be assembled from multiple sample values
 */
function getComputedPlaceholder(computedKey: string, language: string): string | undefined {
  const passportSample = getSampleData('passport', { language }) as PassportData;

  switch (computedKey) {
    case '_computed_fullName': {
      const parts = [passportSample.lastName, passportSample.firstName, passportSample.middleName].filter(Boolean);
      return parts.join(' ');
    }
    case '_computed_fullNameLatin': {
      const parts = [passportSample.lastNameLatin, passportSample.firstNameLatin].filter(Boolean);
      return parts.join(' ');
    }
    default:
      return undefined;
  }
}

/**
 * Get static placeholder that doesn't depend on language
 */
function getStaticPlaceholder(staticKey: string): string | undefined {
  switch (staticKey) {
    case '_static_employer':
      return 'ООО "Компания"';
    default:
      return undefined;
  }
}

/**
 * Получить все локализованные placeholder'ы для набора полей
 *
 * @param fields Массив имён полей
 * @param language Код языка
 * @returns Объект с placeholder'ами
 */
export function getLocalizedPlaceholders(
  fields: string[],
  language: string = 'ru'
): Record<string, string> {
  const placeholders: Record<string, string> = {};

  for (const field of fields) {
    const placeholder = getLocalizedPlaceholder(field, language);
    if (placeholder) {
      placeholders[field] = placeholder;
    }
  }

  return placeholders;
}
