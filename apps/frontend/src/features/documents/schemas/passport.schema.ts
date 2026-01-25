import { z } from 'zod';

// Регулярные выражения для валидации
const PASSPORT_NUMBER_REGEX = /^[A-Z0-9]{6,12}$/i;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Валидация даты
const dateString = z
  .string()
  .regex(DATE_REGEX, 'Дата должна быть в формате ГГГГ-ММ-ДД')
  .refine((date) => !isNaN(Date.parse(date)), 'Некорректная дата');

// Базовая схема паспорта (без refinements для возможности partial)
const passportBaseSchema = z.object({
  // Фамилия
  lastName: z
    .string()
    .min(1, 'Фамилия обязательна')
    .max(100, 'Фамилия слишком длинная'),

  // Имя
  firstName: z
    .string()
    .min(1, 'Имя обязательно')
    .max(100, 'Имя слишком длинное'),

  // Отчество (опционально)
  middleName: z
    .string()
    .max(100, 'Отчество слишком длинное')
    .optional(),

  // Фамилия латиницей
  lastNameLatin: z
    .string()
    .min(1, 'Фамилия латиницей обязательна')
    .max(100, 'Фамилия латиницей слишком длинная')
    .regex(/^[A-Z\s-]+$/i, 'Используйте только латинские буквы'),

  // Имя латиницей
  firstNameLatin: z
    .string()
    .min(1, 'Имя латиницей обязательно')
    .max(100, 'Имя латиницей слишком длинное')
    .regex(/^[A-Z\s-]+$/i, 'Используйте только латинские буквы'),

  // Дата рождения
  birthDate: dateString,

  // Пол
  gender: z.enum(['male', 'female'], {
    message: 'Выберите пол',
  }),

  // Гражданство
  citizenship: z
    .string()
    .min(2, 'Гражданство обязательно')
    .max(100, 'Название страны слишком длинное'),

  // Номер паспорта
  passportNumber: z
    .string()
    .min(1, 'Номер паспорта обязателен')
    .regex(PASSPORT_NUMBER_REGEX, 'Некорректный формат номера паспорта'),

  // Серия паспорта (опционально, зависит от страны)
  passportSeries: z
    .string()
    .max(10, 'Серия паспорта слишком длинная')
    .optional(),

  // Дата выдачи
  issueDate: dateString,

  // Срок действия
  expiryDate: dateString,

  // Кем выдан
  issuedBy: z
    .string()
    .min(1, 'Укажите, кем выдан паспорт')
    .max(500, 'Текст слишком длинный'),

  // Место рождения
  birthPlace: z
    .string()
    .min(1, 'Место рождения обязательно')
    .max(200, 'Текст слишком длинный'),
});

// Схема паспорта (с валидацией)
export const passportSchema = passportBaseSchema.refine(
  (data) => new Date(data.expiryDate) > new Date(data.issueDate),
  {
    message: 'Срок действия должен быть позже даты выдачи',
    path: ['expiryDate'],
  }
).refine(
  (data) => new Date(data.issueDate) > new Date(data.birthDate),
  {
    message: 'Дата выдачи должна быть позже даты рождения',
    path: ['issueDate'],
  }
);

// Тип паспорта, выведенный из схемы
export type PassportData = z.infer<typeof passportSchema>;

// Схема для частичного обновления (использует базовую схему без refinements)
export const passportUpdateSchema = passportBaseSchema.partial();
export type PassportUpdateData = z.infer<typeof passportUpdateSchema>;
