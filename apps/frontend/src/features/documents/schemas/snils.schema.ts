import { z } from 'zod';

// СНИЛС формат: XXX-XXX-XXX YY (11 цифр)
const SNILS_REGEX = /^\d{3}-\d{3}-\d{3}\s?\d{2}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const dateString = z
  .string()
  .regex(DATE_REGEX, 'Дата должна быть в формате ГГГГ-ММ-ДД')
  .refine((date) => !isNaN(Date.parse(date)), 'Некорректная дата');

// Базовая схема СНИЛС
const snilsBaseSchema = z.object({
  // Номер СНИЛС
  snilsNumber: z
    .string()
    .min(1, 'Номер СНИЛС обязателен')
    .regex(SNILS_REGEX, 'СНИЛС должен быть в формате XXX-XXX-XXX XX'),

  // ФИО владельца
  fullName: z
    .string()
    .min(1, 'ФИО обязательно')
    .max(200, 'ФИО слишком длинное'),

  // Дата рождения
  birthDate: dateString,

  // Место рождения
  birthPlace: z
    .string()
    .min(1, 'Место рождения обязательно')
    .max(200, 'Текст слишком длинный'),

  // Пол
  gender: z.enum(['male', 'female'], {
    message: 'Выберите пол',
  }),

  // Дата регистрации в системе ПФР
  registrationDate: dateString,
});

export const snilsSchema = snilsBaseSchema;

export type SnilsData = z.infer<typeof snilsSchema>;

export const snilsUpdateSchema = snilsBaseSchema.partial();
export type SnilsUpdateData = z.infer<typeof snilsUpdateSchema>;
