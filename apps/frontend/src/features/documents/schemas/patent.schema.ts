import { z } from 'zod';

// Регулярные выражения
const PATENT_NUMBER_REGEX = /^[0-9]{10,15}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Валидация даты
const dateString = z
  .string()
  .regex(DATE_REGEX, 'Дата должна быть в формате ГГГГ-ММ-ДД')
  .refine((date) => !isNaN(Date.parse(date)), 'Некорректная дата');

// Список регионов РФ (основные)
export const russianRegions = [
  'Москва',
  'Московская область',
  'Санкт-Петербург',
  'Ленинградская область',
  'Краснодарский край',
  'Свердловская область',
  'Ростовская область',
  'Республика Татарстан',
  'Новосибирская область',
  'Челябинская область',
  'Самарская область',
  'Нижегородская область',
  'Красноярский край',
  'Пермский край',
  'Воронежская область',
  'Волгоградская область',
  'Саратовская область',
  'Тюменская область',
  'Башкортостан',
  'Иркутская область',
] as const;

export type RussianRegion = (typeof russianRegions)[number] | string;

// Базовая схема патента (без refinements для возможности partial)
const patentBaseSchema = z.object({
  // Номер патента
  patentNumber: z
    .string()
    .min(1, 'Номер патента обязателен')
    .regex(PATENT_NUMBER_REGEX, 'Номер должен содержать 10-15 цифр'),

  // Серия патента
  patentSeries: z
    .string()
    .max(10, 'Серия слишком длинная')
    .optional(),

  // Регион действия патента
  region: z
    .string()
    .min(1, 'Регион обязателен')
    .max(100, 'Название региона слишком длинное'),

  // Профессия/специальность (если указана в патенте)
  profession: z
    .string()
    .max(200, 'Название профессии слишком длинное')
    .optional(),

  // Дата выдачи
  issueDate: dateString,

  // Срок действия (дата окончания)
  expiryDate: dateString,

  // Орган, выдавший патент
  issuedBy: z
    .string()
    .min(1, 'Укажите, кем выдан патент')
    .max(300, 'Текст слишком длинный'),

  // ИНН (присваивается при получении патента)
  inn: z
    .string()
    .length(12, 'ИНН должен содержать 12 цифр')
    .regex(/^[0-9]+$/, 'ИНН должен содержать только цифры')
    .optional(),

  // Дата последней оплаты НДФЛ
  lastPaymentDate: dateString.optional(),

  // Оплачено до (следующая дата оплаты)
  paidUntil: dateString.optional(),

  // Сумма ежемесячного платежа
  monthlyPayment: z
    .number()
    .positive('Сумма должна быть положительной')
    .optional(),
});

// Схема патента на работу (с валидацией)
export const patentSchema = patentBaseSchema.refine(
  (data) => new Date(data.expiryDate) > new Date(data.issueDate),
  {
    message: 'Срок действия должен быть позже даты выдачи',
    path: ['expiryDate'],
  }
).refine(
  (data) => {
    if (!data.paidUntil || !data.lastPaymentDate) return true;
    return new Date(data.paidUntil) >= new Date(data.lastPaymentDate);
  },
  {
    message: 'Дата "оплачено до" должна быть не раньше последней оплаты',
    path: ['paidUntil'],
  }
);

// Типы
export type PatentData = z.infer<typeof patentSchema>;

// Схема для частичного обновления (использует базовую схему без refinements)
export const patentUpdateSchema = patentBaseSchema.partial();
export type PatentUpdateData = z.infer<typeof patentUpdateSchema>;

// Хелпер: расчёт дней до следующей оплаты
export function getDaysUntilPayment(paidUntil: string | undefined): number | null {
  if (!paidUntil) return null;
  const paidDate = new Date(paidUntil);
  const today = new Date();
  const diffTime = paidDate.getTime() - today.getTime();
  // Используем floor для полных дней
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Хелпер: проверка просрочки оплаты
export function isPaymentOverdue(paidUntil: string | undefined): boolean {
  if (!paidUntil) return false;
  const paidDate = new Date(paidUntil);
  const today = new Date();
  // Проверяем напрямую время, чтобы избежать проблемы с -0
  return paidDate.getTime() < today.getTime();
}
