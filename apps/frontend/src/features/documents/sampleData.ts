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
