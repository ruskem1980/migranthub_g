/**
 * Образцы данных для миграционной карты
 */

import type { MigrationCardData, VisitPurpose } from '../schemas/migrationCard.schema';
import { getLocalizedHostName } from './localizedNames';

/**
 * Форматирование даты в формат YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Получить дату относительно сегодня
 * @param years Количество лет (отрицательное - в прошлом, положительное - в будущем)
 * @param months Количество месяцев
 * @param days Количество дней
 */
function getRelativeDate(years: number = 0, months: number = 0, days: number = 0): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() + years);
  date.setMonth(date.getMonth() + months);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

/**
 * Генерация номера миграционной карты (10-14 цифр)
 */
function generateCardNumber(): string {
  return '12345678901234';
}

/**
 * Пункты пропуска для разных стран
 */
const entryPointsByCountry: Record<string, string> = {
  UZB: 'Аэропорт Домодедово',
  TJK: 'Аэропорт Домодедово',
  KGZ: 'Аэропорт Шереметьево',
  RUS: 'Аэропорт Внуково',
  USA: 'Аэропорт Шереметьево',
};

/**
 * Получить образец данных миграционной карты для указанного языка
 * @param language Код языка (ru, uz, tg, ky, en)
 * @param purpose Цель визита (по умолчанию 'work')
 * @returns Образец данных миграционной карты
 */
export function getMigrationCardSample(language: string, purpose: VisitPurpose = 'work'): MigrationCardData {
  const hostName = getLocalizedHostName(language);

  // Определяем пункт пропуска в зависимости от языка
  const languageToCountry: Record<string, string> = {
    ru: 'RUS',
    uz: 'UZB',
    tg: 'TJK',
    ky: 'KGZ',
    en: 'USA',
  };

  const countryCode = languageToCountry[language] || 'UZB';
  const entryPoint = entryPointsByCountry[countryCode] || 'Аэропорт Домодедово';

  return {
    cardNumber: generateCardNumber(),
    cardSeries: '12',
    entryDate: getRelativeDate(0, -2), // Въехал 2 месяца назад
    entryPoint,
    purpose,
    stayUntil: getRelativeDate(0, 1), // Срок пребывания истекает через 1 месяц
    hostName: hostName.fullName,
    hostAddress: 'г. Москва, ул. Тверская, д. 1, кв. 10',
  };
}

/**
 * Получить образец миграционной карты для конкретной цели визита
 * @param purpose Цель визита
 * @param language Код языка
 * @returns Образец данных миграционной карты
 */
export function getMigrationCardSampleForPurpose(purpose: VisitPurpose, language: string): MigrationCardData {
  const sample = getMigrationCardSample(language, purpose);

  // Разные сроки пребывания для разных целей
  const stayDurationByPurpose: Record<VisitPurpose, number> = {
    work: 90, // 90 дней для работы
    study: 180, // 180 дней для учёбы
    tourist: 30, // 30 дней для туризма
    private: 90, // 90 дней для частного визита
    business: 30, // 30 дней для бизнеса
    transit: 10, // 10 дней для транзита
    humanitarian: 90, // 90 дней для гуманитарных целей
    other: 90, // 90 дней для прочего
  };

  const stayDays = stayDurationByPurpose[purpose] || 90;
  const entryDate = new Date();
  entryDate.setMonth(entryDate.getMonth() - 2); // Въехал 2 месяца назад

  return {
    ...sample,
    stayUntil: formatDate(new Date(entryDate.getTime() + stayDays * 24 * 60 * 60 * 1000)),
  };
}

/**
 * Получить пустой образец миграционной карты (для новой формы)
 */
export function getEmptyMigrationCardSample(): Partial<MigrationCardData> {
  return {
    cardNumber: '',
    cardSeries: '',
    entryDate: '',
    entryPoint: '',
    purpose: undefined,
    stayUntil: '',
    hostName: '',
    hostAddress: '',
  };
}
