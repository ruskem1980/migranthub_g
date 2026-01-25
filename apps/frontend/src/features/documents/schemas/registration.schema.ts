import { z } from 'zod';

// Регулярные выражения
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Валидация даты
const dateString = z
  .string()
  .regex(DATE_REGEX, 'Дата должна быть в формате ГГГГ-ММ-ДД')
  .refine((date) => !isNaN(Date.parse(date)), 'Некорректная дата');

// Типы регистрации
export const registrationTypes = [
  'temporary', // Временная регистрация (миграционный учёт)
  'permanent', // Постоянная регистрация (ВНЖ)
] as const;

export type RegistrationType = (typeof registrationTypes)[number];

export const registrationTypeLabels: Record<RegistrationType, string> = {
  temporary: 'Временная (миграционный учёт)',
  permanent: 'Постоянная (ВНЖ)',
};

// Базовая схема регистрации (без refinements для возможности partial)
const registrationBaseSchema = z.object({
  // Тип регистрации
  type: z.enum(registrationTypes, {
    message: 'Выберите тип регистрации',
  }),

  // Адрес регистрации
  address: z
    .string()
    .min(10, 'Укажите полный адрес (минимум 10 символов)')
    .max(500, 'Адрес слишком длинный'),

  // Регион
  region: z
    .string()
    .min(1, 'Регион обязателен')
    .max(100, 'Название региона слишком длинное'),

  // Город
  city: z
    .string()
    .min(1, 'Город обязателен')
    .max(100, 'Название города слишком длинное'),

  // Улица
  street: z
    .string()
    .min(1, 'Улица обязательна')
    .max(200, 'Название улицы слишком длинное'),

  // Дом
  building: z
    .string()
    .min(1, 'Номер дома обязателен')
    .max(20, 'Номер дома слишком длинный'),

  // Квартира (опционально)
  apartment: z
    .string()
    .max(10, 'Номер квартиры слишком длинный')
    .optional(),

  // Дата постановки на учёт
  registrationDate: dateString,

  // Срок действия регистрации
  expiryDate: dateString,

  // Принимающая сторона - ФИО
  hostFullName: z
    .string()
    .min(1, 'ФИО принимающей стороны обязательно')
    .max(200, 'Текст слишком длинный'),

  // Принимающая сторона - контактный телефон
  hostPhone: z
    .string()
    .max(20, 'Номер телефона слишком длинный')
    .optional(),

  // Номер уведомления о постановке на учёт
  notificationNumber: z
    .string()
    .max(50, 'Номер уведомления слишком длинный')
    .optional(),

  // Орган, осуществивший постановку на учёт
  registeredBy: z
    .string()
    .max(300, 'Текст слишком длинный')
    .optional(),
});

// Схема регистрации (миграционного учёта) с валидацией
export const registrationSchema = registrationBaseSchema.refine(
  (data) => new Date(data.expiryDate) > new Date(data.registrationDate),
  {
    message: 'Срок действия должен быть позже даты регистрации',
    path: ['expiryDate'],
  }
).refine(
  (data) => {
    // Для временной регистрации максимальный срок - 90 дней (для безвизовых) или по визе
    // Здесь мы просто проверяем, что срок не превышает 1 год (может быть продлён)
    if (data.type === 'temporary') {
      const regDate = new Date(data.registrationDate);
      const expDate = new Date(data.expiryDate);
      const diffDays = (expDate.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 365; // Максимум 1 год для временной регистрации
    }
    return true;
  },
  {
    message: 'Срок временной регистрации не может превышать 1 год',
    path: ['expiryDate'],
  }
);

// Типы
export type RegistrationData = z.infer<typeof registrationSchema>;

// Схема для частичного обновления (использует базовую схему без refinements)
export const registrationUpdateSchema = registrationBaseSchema.partial();
export type RegistrationUpdateData = z.infer<typeof registrationUpdateSchema>;

// Хелпер: расчёт дней до окончания регистрации
export function getDaysUntilExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Хелпер: проверка истечения регистрации
export function isRegistrationExpired(expiryDate: string): boolean {
  return getDaysUntilExpiry(expiryDate) < 0;
}

// Хелпер: проверка скорого истечения (менее 7 дней)
export function isRegistrationExpiringSoon(expiryDate: string, daysThreshold = 7): boolean {
  const days = getDaysUntilExpiry(expiryDate);
  return days >= 0 && days <= daysThreshold;
}

// Хелпер: формирование полного адреса
export function formatFullAddress(data: Pick<RegistrationData, 'region' | 'city' | 'street' | 'building' | 'apartment'>): string {
  const parts = [data.region, data.city, data.street, `д. ${data.building}`];
  if (data.apartment) {
    parts.push(`кв. ${data.apartment}`);
  }
  return parts.join(', ');
}
