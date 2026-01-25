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

// Field metadata types
export type FieldCategory = 'personal' | 'document' | 'thirdParty' | 'work';
export type FieldSource = 'passport' | 'migrationCard' | 'registration' | 'patent' | 'profile' | 'manual';

export interface FieldMetadata {
  label: string;
  category: FieldCategory;
  source: FieldSource;
  placeholder?: string;
  inputType?: 'text' | 'date' | 'textarea' | 'select';
}

// Field metadata with categories and sources
export const FIELD_METADATA: Record<string, FieldMetadata> = {
  fullName: {
    label: 'ФИО',
    category: 'personal',
    source: 'passport',
    placeholder: 'Иванов Иван Иванович',
    inputType: 'text',
  },
  fullNameLatin: {
    label: 'ФИО (латиницей)',
    category: 'personal',
    source: 'passport',
    placeholder: 'IVANOV IVAN',
    inputType: 'text',
  },
  passportNumber: {
    label: 'Номер паспорта',
    category: 'document',
    source: 'passport',
    placeholder: 'AA1234567',
    inputType: 'text',
  },
  citizenship: {
    label: 'Гражданство',
    category: 'personal',
    source: 'passport',
    placeholder: 'Узбекистан',
    inputType: 'text',
  },
  birthDate: {
    label: 'Дата рождения',
    category: 'personal',
    source: 'passport',
    inputType: 'date',
  },
  gender: {
    label: 'Пол',
    category: 'personal',
    source: 'passport',
    inputType: 'select',
  },
  entryDate: {
    label: 'Дата въезда',
    category: 'document',
    source: 'migrationCard',
    inputType: 'date',
  },
  migrationCardNumber: {
    label: 'Номер миграционной карты',
    category: 'document',
    source: 'migrationCard',
    placeholder: '1234 5678901',
    inputType: 'text',
  },
  registrationAddress: {
    label: 'Адрес регистрации',
    category: 'document',
    source: 'registration',
    placeholder: 'г. Москва, ул. Примерная, д. 1, кв. 1',
    inputType: 'textarea',
  },
  registrationExpiry: {
    label: 'Срок регистрации',
    category: 'document',
    source: 'registration',
    inputType: 'date',
  },
  hostFullName: {
    label: 'ФИО принимающей стороны',
    category: 'thirdParty',
    source: 'manual',
    placeholder: 'Петров Петр Петрович',
    inputType: 'text',
  },
  hostAddress: {
    label: 'Адрес принимающей стороны',
    category: 'thirdParty',
    source: 'manual',
    placeholder: 'г. Москва, ул. Примерная, д. 1, кв. 1',
    inputType: 'textarea',
  },
  patentRegion: {
    label: 'Регион патента',
    category: 'work',
    source: 'patent',
    placeholder: 'Москва',
    inputType: 'text',
  },
  patentExpiry: {
    label: 'Срок действия патента',
    category: 'work',
    source: 'patent',
    inputType: 'date',
  },
  employerName: {
    label: 'Наименование работодателя',
    category: 'work',
    source: 'manual',
    placeholder: 'ООО "Компания"',
    inputType: 'text',
  },
  employerINN: {
    label: 'ИНН работодателя',
    category: 'work',
    source: 'manual',
    placeholder: '7712345678',
    inputType: 'text',
  },
};

// Category labels for field groups
export const CATEGORY_FIELD_LABELS: Record<FieldCategory, { title: string; description: string }> = {
  personal: {
    title: 'Личные данные',
    description: 'Данные из вашего паспорта',
  },
  document: {
    title: 'Данные документов',
    description: 'Информация из миграционных документов',
  },
  thirdParty: {
    title: 'Данные третьих лиц',
    description: 'Введите данные принимающей стороны. Эти данные не сохраняются в вашем профиле.',
  },
  work: {
    title: 'Данные о работе',
    description: 'Информация о патенте и работодателе',
  },
};

// Group fields by category
export function groupFieldsByCategory(fields: string[]): Record<FieldCategory, string[]> {
  const grouped: Record<FieldCategory, string[]> = {
    personal: [],
    document: [],
    thirdParty: [],
    work: [],
  };

  for (const field of fields) {
    const meta = FIELD_METADATA[field];
    if (meta) {
      grouped[meta.category].push(field);
    }
  }

  return grouped;
}

// Field labels for display (backward compatibility)
export const FIELD_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(FIELD_METADATA).map(([key, meta]) => [key, meta.label])
);

// Document type labels for user display
export const DOCUMENT_LABELS: Record<string, string> = {
  passport: 'Паспорт',
  migration_card: 'Миграционная карта',
  registration: 'Регистрация',
  patent: 'Патент',
  manual: 'Ручной ввод',
  profile: 'Профиль',
};

// Mapping: which document each field comes from
export const FIELD_SOURCE_DOCUMENT: Record<string, { document: string; label: string }> = {
  // From passport
  fullName: { document: 'passport', label: 'Паспорт' },
  fullNameLatin: { document: 'passport', label: 'Паспорт' },
  lastName: { document: 'passport', label: 'Паспорт' },
  firstName: { document: 'passport', label: 'Паспорт' },
  middleName: { document: 'passport', label: 'Паспорт' },
  birthDate: { document: 'passport', label: 'Паспорт' },
  gender: { document: 'passport', label: 'Паспорт' },
  citizenship: { document: 'passport', label: 'Паспорт' },
  passportNumber: { document: 'passport', label: 'Паспорт' },
  passportSeries: { document: 'passport', label: 'Паспорт' },
  passportIssueDate: { document: 'passport', label: 'Паспорт' },
  passportExpiryDate: { document: 'passport', label: 'Паспорт' },
  passportIssuedBy: { document: 'passport', label: 'Паспорт' },
  birthPlace: { document: 'passport', label: 'Паспорт' },

  // From migration card
  entryDate: { document: 'migration_card', label: 'Миграционная карта' },
  migrationCardNumber: { document: 'migration_card', label: 'Миграционная карта' },
  migrationCardSeries: { document: 'migration_card', label: 'Миграционная карта' },
  entryPoint: { document: 'migration_card', label: 'Миграционная карта' },
  stayPurpose: { document: 'migration_card', label: 'Миграционная карта' },
  stayUntil: { document: 'migration_card', label: 'Миграционная карта' },

  // From registration
  registrationAddress: { document: 'registration', label: 'Регистрация' },
  registrationDate: { document: 'registration', label: 'Регистрация' },
  registrationExpiry: { document: 'registration', label: 'Регистрация' },
  hostFullName: { document: 'registration', label: 'Регистрация' },

  // From patent
  patentNumber: { document: 'patent', label: 'Патент' },
  patentRegion: { document: 'patent', label: 'Патент' },
  patentExpiry: { document: 'patent', label: 'Патент' },
  inn: { document: 'patent', label: 'Патент' },

  // Manual input (third party data, employer data)
  hostAddress: { document: 'manual', label: 'Ручной ввод' },
  employerName: { document: 'manual', label: 'Ручной ввод' },
  employerINN: { document: 'manual', label: 'Ручной ввод' },
};
