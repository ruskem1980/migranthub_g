/**
 * Образцы данных для регистрации (миграционного учёта)
 */

import type { RegistrationData } from '../schemas/registration.schema';
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
 * Генерация номера уведомления о постановке на учёт
 */
function generateNotificationNumber(): string {
  return '77000123456789';
}

/**
 * Получить образец данных регистрации для указанного языка
 * @param language Код языка (ru, uz, tg, ky, en)
 * @returns Образец данных регистрации
 */
export function getRegistrationSample(language: string): RegistrationData {
  const hostName = getLocalizedHostName(language);

  return {
    type: 'temporary',
    address: 'г. Москва, ул. Тверская, д. 1, кв. 10',
    region: 'Москва',
    city: 'Москва',
    street: 'ул. Тверская',
    building: '1',
    apartment: '10',
    registrationDate: getRelativeDate(0, -2), // Зарегистрирован 2 месяца назад
    expiryDate: getRelativeDate(0, 1), // Истекает через 1 месяц (90 дней всего)
    hostFullName: hostName.fullName,
    hostPhone: '+7 (999) 123-45-67',
    notificationNumber: generateNotificationNumber(),
    registeredBy: 'Отдел по вопросам миграции ОМВД России по району Тверской',
  };
}

/**
 * Получить образец регистрации для конкретного региона
 * @param region Название региона
 * @param language Код языка
 * @returns Образец данных регистрации с указанным регионом
 */
export function getRegistrationSampleForRegion(region: string, language: string): RegistrationData {
  const sample = getRegistrationSample(language);

  // Адреса для разных регионов
  const regionalAddresses: Record<string, { city: string; street: string; registeredBy: string }> = {
    'Москва': {
      city: 'Москва',
      street: 'ул. Тверская',
      registeredBy: 'Отдел по вопросам миграции ОМВД России по району Тверской',
    },
    'Санкт-Петербург': {
      city: 'Санкт-Петербург',
      street: 'Невский проспект',
      registeredBy: 'Отдел по вопросам миграции УМВД России по Центральному району',
    },
    'Московская область': {
      city: 'Подольск',
      street: 'ул. Ленина',
      registeredBy: 'Отдел по вопросам миграции ОМВД России по городскому округу Подольск',
    },
  };

  const regionalData = regionalAddresses[region] || regionalAddresses['Москва'];

  return {
    ...sample,
    region,
    city: regionalData.city,
    street: regionalData.street,
    address: `${regionalData.city}, ${regionalData.street}, д. 1, кв. 10`,
    registeredBy: regionalData.registeredBy,
  };
}

/**
 * Получить пустой образец регистрации (для новой формы)
 */
export function getEmptyRegistrationSample(): Partial<RegistrationData> {
  return {
    type: undefined,
    address: '',
    region: '',
    city: '',
    street: '',
    building: '',
    apartment: '',
    registrationDate: '',
    expiryDate: '',
    hostFullName: '',
    hostPhone: '',
    notificationNumber: '',
    registeredBy: '',
  };
}
