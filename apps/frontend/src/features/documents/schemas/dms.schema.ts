import { z } from 'zod';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const dateString = z
  .string()
  .regex(DATE_REGEX, 'Дата должна быть в формате ГГГГ-ММ-ДД')
  .refine((date) => !isNaN(Date.parse(date)), 'Некорректная дата');

// Базовая схема ДМС (добровольное медицинское страхование)
const dmsBaseSchema = z.object({
  // Номер полиса
  policyNumber: z
    .string()
    .min(1, 'Номер полиса обязателен')
    .max(50, 'Номер полиса слишком длинный'),

  // ФИО застрахованного
  fullName: z
    .string()
    .min(1, 'ФИО обязательно')
    .max(200, 'ФИО слишком длинное'),

  // Страховая компания
  insuranceCompany: z
    .string()
    .min(1, 'Название страховой компании обязательно')
    .max(200, 'Название слишком длинное'),

  // Дата начала действия
  startDate: dateString,

  // Дата окончания действия
  expiryDate: dateString,

  // Программа страхования (опционально)
  programName: z
    .string()
    .max(200, 'Название программы слишком длинное')
    .optional(),

  // Территория покрытия
  coverageTerritory: z
    .string()
    .min(1, 'Укажите территорию покрытия')
    .max(200, 'Текст слишком длинный'),

  // Телефон страховой компании (опционально)
  insurancePhone: z
    .string()
    .max(20, 'Номер телефона слишком длинный')
    .optional(),
});

export const dmsSchema = dmsBaseSchema.refine(
  (data) => new Date(data.expiryDate) > new Date(data.startDate),
  {
    message: 'Дата окончания должна быть позже даты начала',
    path: ['expiryDate'],
  }
);

export type DmsData = z.infer<typeof dmsSchema>;

export const dmsUpdateSchema = dmsBaseSchema.partial();
export type DmsUpdateData = z.infer<typeof dmsUpdateSchema>;

// Проверка истечения срока ДМС
export function isDmsExpired(expiryDate: string): boolean {
  return new Date(expiryDate) < new Date();
}

export function isDmsExpiringSoon(expiryDate: string, daysThreshold = 30): boolean {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= daysThreshold;
}

export function getDaysUntilDmsExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate);
  const now = new Date();
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
