import { z } from 'zod';

// ИНН в России - 12 цифр для физических лиц иностранцев
const INN_REGEX = /^\d{12}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const dateString = z
  .string()
  .regex(DATE_REGEX, 'Дата должна быть в формате ГГГГ-ММ-ДД')
  .refine((date) => !isNaN(Date.parse(date)), 'Некорректная дата');

// Базовая схема ИНН
const innBaseSchema = z.object({
  // Номер ИНН
  innNumber: z
    .string()
    .min(1, 'Номер ИНН обязателен')
    .regex(INN_REGEX, 'ИНН должен содержать 12 цифр'),

  // ФИО владельца
  fullName: z
    .string()
    .min(1, 'ФИО обязательно')
    .max(200, 'ФИО слишком длинное'),

  // Дата выдачи
  issueDate: dateString,

  // Наименование налогового органа
  issuedBy: z
    .string()
    .min(1, 'Укажите наименование налогового органа')
    .max(500, 'Текст слишком длинный'),

  // Код налогового органа (опционально)
  taxAuthorityCode: z
    .string()
    .regex(/^\d{4}$/, 'Код должен содержать 4 цифры')
    .optional(),
});

export const innSchema = innBaseSchema;

export type InnData = z.infer<typeof innSchema>;

export const innUpdateSchema = innBaseSchema.partial();
export type InnUpdateData = z.infer<typeof innUpdateSchema>;