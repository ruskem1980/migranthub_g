/**
 * Локализованные имена для образцов данных документов
 * Поддерживаемые языки: ru, uz, tg, ky, en
 */

export type SupportedLanguage = 'ru' | 'uz' | 'tg' | 'ky' | 'en';

export interface LocalizedName {
  lastName: string;
  firstName: string;
  middleName?: string;
  lastNameLatin: string;
  firstNameLatin: string;
  citizenship: string;
  citizenshipCode: string;
  birthPlace: string;
}

export interface LocalizedHostName {
  fullName: string;
}

/**
 * Локализованные имена по языкам
 */
export const localizedNames: Record<SupportedLanguage, LocalizedName> = {
  ru: {
    lastName: 'Иванов',
    firstName: 'Иван',
    middleName: 'Иванович',
    lastNameLatin: 'IVANOV',
    firstNameLatin: 'IVAN',
    citizenship: 'Российская Федерация',
    citizenshipCode: 'RUS',
    birthPlace: 'г. Москва, Россия',
  },
  uz: {
    lastName: 'Каримов',
    firstName: 'Азиз',
    middleName: 'Рустамович',
    lastNameLatin: 'KARIMOV',
    firstNameLatin: 'AZIZ',
    citizenship: 'Узбекистан',
    citizenshipCode: 'UZB',
    birthPlace: 'г. Ташкент, Узбекистан',
  },
  tg: {
    lastName: 'Рахимов',
    firstName: 'Фируз',
    middleName: 'Ахмадович',
    lastNameLatin: 'RAKHIMOV',
    firstNameLatin: 'FIRUZ',
    citizenship: 'Таджикистан',
    citizenshipCode: 'TJK',
    birthPlace: 'г. Душанбе, Таджикистан',
  },
  ky: {
    lastName: 'Асанов',
    firstName: 'Нурбек',
    middleName: 'Талантович',
    lastNameLatin: 'ASANOV',
    firstNameLatin: 'NURBEK',
    citizenship: 'Кыргызстан',
    citizenshipCode: 'KGZ',
    birthPlace: 'г. Бишкек, Кыргызстан',
  },
  en: {
    lastName: 'Smith',
    firstName: 'John',
    middleName: 'Michael',
    lastNameLatin: 'SMITH',
    firstNameLatin: 'JOHN',
    citizenship: 'United States',
    citizenshipCode: 'USA',
    birthPlace: 'New York, USA',
  },
};

/**
 * Локализованные имена принимающей стороны (хозяина) по языкам
 */
export const localizedHostNames: Record<SupportedLanguage, LocalizedHostName> = {
  ru: { fullName: 'Петров Пётр Петрович' },
  uz: { fullName: 'Алимов Бахтиёр Шавкатович' },
  tg: { fullName: 'Назаров Бахром Исмоилович' },
  ky: { fullName: 'Жумабеков Эрлан Кыдырович' },
  en: { fullName: 'Johnson Robert William' },
};

/**
 * Получить локализованное имя по языку
 * @param language Код языка
 * @returns Локализованное имя или русское по умолчанию
 */
export function getLocalizedName(language: string): LocalizedName {
  const lang = language as SupportedLanguage;
  return localizedNames[lang] || localizedNames.ru;
}

/**
 * Получить локализованное имя принимающей стороны
 * @param language Код языка
 * @returns Локализованное имя хозяина или русское по умолчанию
 */
export function getLocalizedHostName(language: string): LocalizedHostName {
  const lang = language as SupportedLanguage;
  return localizedHostNames[lang] || localizedHostNames.ru;
}

/**
 * Проверить, является ли язык поддерживаемым
 * @param language Код языка
 */
export function isSupportedLanguage(language: string): language is SupportedLanguage {
  return ['ru', 'uz', 'tg', 'ky', 'en'].includes(language);
}
