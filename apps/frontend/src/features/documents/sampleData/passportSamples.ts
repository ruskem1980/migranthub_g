/**
 * Образцы данных для паспорта
 */

import type { PassportData } from '../schemas/passport.schema';
import { getLocalizedName } from './localizedNames';

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
 * Генерация образца паспортного номера по стране
 */
function generatePassportNumber(citizenshipCode: string): string {
  const numbers: Record<string, string> = {
    UZB: 'AB1234567',
    TJK: 'CD7654321',
    KGZ: 'AC9876543',
    RUS: '1234567890',
    USA: '123456789',
  };
  return numbers[citizenshipCode] || 'AA1234567';
}

/**
 * Генерация названия органа, выдавшего паспорт
 */
function generateIssuedBy(citizenshipCode: string): string {
  const issuers: Record<string, string> = {
    UZB: 'IIV AXAT',
    TJK: 'Вазорати корҳои дохилии Ҷумҳурии Тоҷикистон',
    KGZ: 'Мамлекеттик каттоо кызматы',
    RUS: 'ГУ МВД России по г. Москве',
    USA: 'U.S. Department of State',
  };
  return issuers[citizenshipCode] || 'Министерство внутренних дел';
}

/**
 * Получить образец данных паспорта для указанного языка
 * @param language Код языка (ru, uz, tg, ky, en)
 * @returns Образец данных паспорта
 */
export function getPassportSample(language: string): PassportData {
  const name = getLocalizedName(language);

  return {
    lastName: name.lastName,
    firstName: name.firstName,
    middleName: name.middleName,
    lastNameLatin: name.lastNameLatin,
    firstNameLatin: name.firstNameLatin,
    birthDate: getRelativeDate(-30), // 30 лет назад
    gender: 'male',
    citizenship: name.citizenship,
    passportNumber: generatePassportNumber(name.citizenshipCode),
    passportSeries: 'AA',
    issueDate: getRelativeDate(-5), // Выдан 5 лет назад
    expiryDate: getRelativeDate(5), // Действителен ещё 5 лет
    issuedBy: generateIssuedBy(name.citizenshipCode),
    birthPlace: name.birthPlace,
  };
}

/**
 * Получить пустой образец паспорта (для новой формы)
 */
export function getEmptyPassportSample(): Partial<PassportData> {
  return {
    lastName: '',
    firstName: '',
    middleName: '',
    lastNameLatin: '',
    firstNameLatin: '',
    birthDate: '',
    gender: undefined,
    citizenship: '',
    passportNumber: '',
    passportSeries: '',
    issueDate: '',
    expiryDate: '',
    issuedBy: '',
    birthPlace: '',
  };
}
