import { z } from 'zod';

export type FormCategory = 'registration' | 'patent' | 'work' | 'other';

export interface FormDefinition {
  id: string;
  title: string;
  titleShort: string;
  description: string;
  category: FormCategory;
  requiredFields: string[];
  estimatedTime: string;
  price?: number;
  icon: string;
}

export const FORMS_REGISTRY: FormDefinition[] = [
  // Registration
  {
    id: 'notification-arrival',
    title: 'Уведомление о прибытии иностранного гражданина',
    titleShort: 'Уведомление о прибытии',
    description: 'Первичная постановка на миграционный учёт в течение 7 рабочих дней после въезда',
    category: 'registration',
    requiredFields: ['fullName', 'passportNumber', 'citizenship', 'entryDate', 'hostFullName', 'hostAddress'],
    estimatedTime: '5-10 мин',
    icon: '📋',
  },
  {
    id: 'registration-extension',
    title: 'Заявление о продлении срока пребывания',
    titleShort: 'Продление регистрации',
    description: 'Продление миграционного учёта при наличии оснований',
    category: 'registration',
    requiredFields: ['fullName', 'passportNumber', 'registrationAddress', 'registrationExpiry'],
    estimatedTime: '10-15 мин',
    icon: '📝',
  },
  {
    id: 'departure-notification',
    title: 'Уведомление об убытии',
    titleShort: 'Уведомление об убытии',
    description: 'При смене места пребывания или выезде из РФ',
    category: 'registration',
    requiredFields: ['fullName', 'passportNumber', 'registrationAddress'],
    estimatedTime: '5 мин',
    icon: '🚪',
  },

  // Patent
  {
    id: 'patent-initial',
    title: 'Заявление о выдаче патента',
    titleShort: 'Заявление на патент',
    description: 'Первичное получение патента на работу',
    category: 'patent',
    requiredFields: ['fullName', 'passportNumber', 'citizenship', 'birthDate', 'migrationCardNumber'],
    estimatedTime: '15-20 мин',
    icon: '📄',
  },
  {
    id: 'patent-reissue',
    title: 'Заявление о переоформлении патента',
    titleShort: 'Переоформление патента',
    description: 'Продление патента на следующий год',
    category: 'patent',
    requiredFields: ['fullName', 'passportNumber', 'patentRegion', 'patentExpiry'],
    estimatedTime: '10-15 мин',
    icon: '🔄',
  },
  {
    id: 'patent-duplicate',
    title: 'Заявление о выдаче дубликата патента',
    titleShort: 'Дубликат патента',
    description: 'При утере или порче патента',
    category: 'patent',
    requiredFields: ['fullName', 'passportNumber', 'patentRegion'],
    estimatedTime: '10 мин',
    icon: '📋',
  },
  {
    id: 'patent-territory-change',
    title: 'Заявление об изменении территории действия патента',
    titleShort: 'Смена региона патента',
    description: 'При переезде в другой регион',
    category: 'patent',
    requiredFields: ['fullName', 'passportNumber', 'patentRegion'],
    estimatedTime: '10 мин',
    icon: '🗺️',
  },

  // Work
  {
    id: 'employer-notification',
    title: 'Уведомление о заключении трудового договора',
    titleShort: 'Уведомление о трудоустройстве',
    description: 'Работодатель обязан уведомить МВД в течение 3 дней',
    category: 'work',
    requiredFields: ['fullName', 'passportNumber', 'employerName', 'employerINN'],
    estimatedTime: '10-15 мин',
    icon: '💼',
  },
  {
    id: 'employer-termination',
    title: 'Уведомление о расторжении трудового договора',
    titleShort: 'Уведомление об увольнении',
    description: 'При увольнении работодатель уведомляет МВД',
    category: 'work',
    requiredFields: ['fullName', 'passportNumber', 'employerName', 'employerINN'],
    estimatedTime: '10 мин',
    icon: '📤',
  },

  // Other
  {
    id: 'rvp-application',
    title: 'Заявление о выдаче РВП',
    titleShort: 'Заявление на РВП',
    description: 'Разрешение на временное проживание',
    category: 'other',
    requiredFields: ['fullName', 'fullNameLatin', 'passportNumber', 'birthDate', 'citizenship'],
    estimatedTime: '30-40 мин',
    icon: '🏠',
  },
  {
    id: 'vnzh-application',
    title: 'Заявление о выдаче ВНЖ',
    titleShort: 'Заявление на ВНЖ',
    description: 'Вид на жительство',
    category: 'other',
    requiredFields: ['fullName', 'fullNameLatin', 'passportNumber', 'birthDate', 'citizenship'],
    estimatedTime: '40-50 мин',
    icon: '🏡',
  },
  {
    id: 'invitation-letter',
    title: 'Ходатайство о приглашении',
    titleShort: 'Приглашение',
    description: 'Приглашение иностранного гражданина в РФ',
    category: 'other',
    requiredFields: ['fullName', 'passportNumber'],
    estimatedTime: '15-20 мин',
    icon: '✉️',
  },
];

// Group forms by category
export const FORMS_BY_CATEGORY = FORMS_REGISTRY.reduce((acc, form) => {
  if (!acc[form.category]) {
    acc[form.category] = [];
  }
  acc[form.category].push(form);
  return acc;
}, {} as Record<FormCategory, FormDefinition[]>);

// Category labels
export const CATEGORY_LABELS: Record<FormCategory, string> = {
  registration: 'Регистрация',
  patent: 'Патент',
  work: 'Трудоустройство',
  other: 'Другие документы',
};

// Get form by ID
export function getFormById(id: string): FormDefinition | undefined {
  return FORMS_REGISTRY.find((form) => form.id === id);
}

// Check if user has all required fields
export function getMissingFields(formId: string, profileData: Record<string, any>): string[] {
  const form = getFormById(formId);
  if (!form) return [];

  return form.requiredFields.filter((field) => !profileData[field]);
}

// Field labels for display
export const FIELD_LABELS: Record<string, string> = {
  fullName: 'ФИО',
  fullNameLatin: 'ФИО (латиницей)',
  passportNumber: 'Номер паспорта',
  citizenship: 'Гражданство',
  birthDate: 'Дата рождения',
  gender: 'Пол',
  entryDate: 'Дата въезда',
  migrationCardNumber: 'Номер миграционной карты',
  registrationAddress: 'Адрес регистрации',
  registrationExpiry: 'Срок регистрации',
  hostFullName: 'ФИО принимающей стороны',
  hostAddress: 'Адрес принимающей стороны',
  patentRegion: 'Регион патента',
  patentExpiry: 'Срок действия патента',
  employerName: 'Наименование работодателя',
  employerINN: 'ИНН работодателя',
};
