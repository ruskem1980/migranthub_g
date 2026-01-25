/**
 * Образцы данных для патента на работу
 */

import type { PatentData } from '../schemas/patent.schema';

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
 * Генерация 12-значного ИНН
 */
function generateINN(): string {
  return '770123456789';
}

/**
 * Генерация номера патента (10-15 цифр)
 */
function generatePatentNumber(): string {
  return '7712345678901';
}

/**
 * Получить образец данных патента для указанного языка
 * Патент не зависит от языка, но функция сохраняет единый интерфейс
 * @param _language Код языка (не используется для патента)
 * @returns Образец данных патента
 */
export function getPatentSample(_language: string): PatentData {
  return {
    patentNumber: generatePatentNumber(),
    patentSeries: '77',
    region: 'Москва',
    profession: 'Подсобный рабочий',
    issueDate: getRelativeDate(0, -6), // Выдан 6 месяцев назад
    expiryDate: getRelativeDate(0, 6), // Действителен ещё 6 месяцев
    issuedBy: 'УВМ ГУ МВД России по г. Москве',
    inn: generateINN(),
    lastPaymentDate: getRelativeDate(0, -1), // Оплачено месяц назад
    paidUntil: getRelativeDate(0, 0, 15), // Оплачено на 15 дней вперёд
    monthlyPayment: 6600, // Примерная стоимость патента в Москве
  };
}

/**
 * Получить образец патента для конкретного региона
 * @param region Название региона
 * @returns Образец данных патента с указанным регионом
 */
export function getPatentSampleForRegion(region: string): PatentData {
  const sample = getPatentSample('ru');

  // Стоимость патента зависит от региона
  const regionalPrices: Record<string, number> = {
    'Москва': 6600,
    'Московская область': 6500,
    'Санкт-Петербург': 4400,
    'Ленинградская область': 4200,
    'Краснодарский край': 4500,
    'Свердловская область': 5600,
  };

  return {
    ...sample,
    region,
    monthlyPayment: regionalPrices[region] || 5000,
  };
}

/**
 * Получить пустой образец патента (для новой формы)
 */
export function getEmptyPatentSample(): Partial<PatentData> {
  return {
    patentNumber: '',
    patentSeries: '',
    region: '',
    profession: '',
    issueDate: '',
    expiryDate: '',
    issuedBy: '',
    inn: '',
    lastPaymentDate: '',
    paidUntil: '',
    monthlyPayment: undefined,
  };
}
