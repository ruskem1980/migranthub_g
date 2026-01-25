import { z } from 'zod';

// Регулярные выражения
const MIGRATION_CARD_NUMBER_REGEX = /^[0-9]{10,14}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Валидация даты
const dateString = z
  .string()
  .regex(DATE_REGEX, 'Дата должна быть в формате ГГГГ-ММ-ДД')
  .refine((date) => !isNaN(Date.parse(date)), 'Некорректная дата');

// Цели визита
export const visitPurposes = [
  'work',
  'study',
  'tourist',
  'private',
  'business',
  'transit',
  'humanitarian',
  'other',
] as const;

export type VisitPurpose = (typeof visitPurposes)[number];

// Названия целей визита на русском
export const visitPurposeLabels: Record<VisitPurpose, string> = {
  work: 'Работа',
  study: 'Учёба',
  tourist: 'Туризм',
  private: 'Частная',
  business: 'Деловая',
  transit: 'Транзит',
  humanitarian: 'Гуманитарная',
  other: 'Иная',
};

// Базовая схема миграционной карты (без refinements для возможности partial)
const migrationCardBaseSchema = z.object({
  // Номер миграционной карты (серия + номер)
  cardNumber: z
    .string()
    .min(1, 'Номер миграционной карты обязателен')
    .regex(MIGRATION_CARD_NUMBER_REGEX, 'Номер должен содержать 10-14 цифр'),

  // Серия карты (опционально, если входит в номер)
  cardSeries: z
    .string()
    .max(10, 'Серия слишком длинная')
    .optional(),

  // Дата въезда в РФ
  entryDate: dateString,

  // Пункт пропуска (место въезда)
  entryPoint: z
    .string()
    .min(1, 'Укажите пункт пропуска')
    .max(200, 'Название слишком длинное'),

  // Цель визита
  purpose: z.enum(visitPurposes, {
    message: 'Выберите цель визита',
  }),

  // Срок пребывания (дата окончания)
  stayUntil: dateString,

  // Принимающая сторона (ФИО или название организации)
  hostName: z
    .string()
    .max(300, 'Текст слишком длинный')
    .optional(),

  // Адрес принимающей стороны
  hostAddress: z
    .string()
    .max(500, 'Адрес слишком длинный')
    .optional(),
});

// Схема миграционной карты (с валидацией)
export const migrationCardSchema = migrationCardBaseSchema.refine(
  (data) => new Date(data.stayUntil) > new Date(data.entryDate),
  {
    message: 'Срок пребывания должен быть позже даты въезда',
    path: ['stayUntil'],
  }
).refine(
  (data) => {
    const entryDate = new Date(data.entryDate);
    const today = new Date();
    // Дата въезда не может быть в будущем
    return entryDate <= today;
  },
  {
    message: 'Дата въезда не может быть в будущем',
    path: ['entryDate'],
  }
);

// Типы
export type MigrationCardData = z.infer<typeof migrationCardSchema>;

// Схема для частичного обновления (использует базовую схему без refinements)
export const migrationCardUpdateSchema = migrationCardBaseSchema.partial();
export type MigrationCardUpdateData = z.infer<typeof migrationCardUpdateSchema>;
