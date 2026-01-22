// ============================================
// MIGRANTHUB - FORMS REGISTRY
// Complete list of legal forms (2024-2025)
// ============================================

export type FormCategory = 'work' | 'housing' | 'longterm' | 'requests';

export type FormId = 
  // Work
  | 'patent' | 'contract' | 'employment_notification' | 'termination_notification'
  // Housing
  | 'arrival' | 'employer_petition' | 'owner_consent'
  // Long-term
  | 'rvp' | 'vnzh' | 'annual_notification'
  // Requests
  | 'lost_docs' | 'inn_application';

export interface Form {
  id: FormId;
  title: string;
  subtitle: string;
  icon: string;
  formNumber: string;
  category: FormCategory;
  isCritical?: boolean;
  requiredFields: string[];
}

export const FORMS_REGISTRY: Form[] = [
  // ==========================================
  // CATEGORY 1: 👔 РАБОТА (WORK)
  // ==========================================
  {
    id: 'patent',
    title: 'Заявление на патент',
    subtitle: 'Первичное получение или переоформление',
    icon: '📄',
    formNumber: 'Форма 26.5-1',
    category: 'work',
    requiredFields: ['passportNumber', 'fullName', 'entryDate', 'citizenship', 'jobTitle', 'employerName'],
  },
  {
    id: 'contract',
    title: 'Трудовой договор',
    subtitle: 'Стандартный договор с физлицом или юрлицом',
    icon: '🤝',
    formNumber: 'Типовой шаблон',
    category: 'work',
    requiredFields: ['fullName', 'passportNumber', 'employerName', 'employerINN', 'jobTitle', 'salary', 'startDate'],
  },
  {
    id: 'employment_notification',
    title: 'Уведомление о заключении договора',
    subtitle: '⚠️ Обязательно отправить в МВД в течение 2 месяцев!',
    icon: '📢',
    formNumber: 'Приказ МВД №846',
    category: 'work',
    isCritical: true,
    requiredFields: ['fullName', 'passportNumber', 'employerName', 'employerINN', 'contractDate', 'jobTitle'],
  },
  {
    id: 'termination_notification',
    title: 'Уведомление о расторжении договора',
    subtitle: 'Подавать при увольнении в течение 3 дней',
    icon: '💔',
    formNumber: 'Приказ МВД №846',
    category: 'work',
    requiredFields: ['fullName', 'passportNumber', 'employerName', 'terminationDate', 'reason'],
  },

  // ==========================================
  // CATEGORY 2: 🏠 ЖИЛЬЕ (HOUSING)
  // ==========================================
  {
    id: 'arrival',
    title: 'Уведомление о прибытии',
    subtitle: 'Первичная регистрация или продление',
    icon: '🏠',
    formNumber: 'Форма 21',
    category: 'housing',
    requiredFields: ['passportNumber', 'fullName', 'entryDate', 'hostAddress', 'hostFullName'],
  },
  {
    id: 'employer_petition',
    title: 'Ходатайство от работодателя',
    subtitle: 'Основание для продления регистрации',
    icon: '🏢',
    formNumber: 'Свободная форма',
    category: 'housing',
    requiredFields: ['employerName', 'employerINN', 'employeeFullName', 'employeePassport', 'reason'],
  },
  {
    id: 'owner_consent',
    title: 'Согласие собственника на регистрацию',
    subtitle: 'Заявление от владельца квартиры',
    icon: '✍️',
    formNumber: 'Типовой бланк',
    category: 'housing',
    requiredFields: ['ownerFullName', 'ownerPassport', 'propertyAddress', 'guestFullName', 'guestPassport'],
  },

  // ==========================================
  // CATEGORY 3: 🪪 РВП / ВНЖ (LONG-TERM STATUS)
  // ==========================================
  {
    id: 'rvp',
    title: 'Заявление на РВП',
    subtitle: 'Разрешение на временное проживание',
    icon: '📘',
    formNumber: 'Форма РВП',
    category: 'longterm',
    requiredFields: ['passportNumber', 'fullName', 'citizenship', 'entryDate', 'birthDate', 'birthPlace'],
  },
  {
    id: 'vnzh',
    title: 'Заявление на ВНЖ',
    subtitle: 'Вид на жительство',
    icon: '📗',
    formNumber: 'Форма ВНЖ',
    category: 'longterm',
    requiredFields: ['passportNumber', 'fullName', 'citizenship', 'rvpNumber', 'rvpDate', 'address'],
  },
  {
    id: 'annual_notification',
    title: 'Ежегодное уведомление (РВП/ВНЖ)',
    subtitle: 'Подтверждение проживания',
    icon: '📅',
    formNumber: 'Форма уведомления',
    category: 'longterm',
    requiredFields: ['fullName', 'rvpNumber', 'address', 'income', 'employer'],
  },

  // ==========================================
  // CATEGORY 4: 🆘 РАЗНОЕ (REQUESTS & SOS)
  // ==========================================
  {
    id: 'lost_docs',
    title: 'Заявление об утере документов',
    subtitle: 'Для полиции и восстановления',
    icon: '🆘',
    formNumber: 'Свободная форма',
    category: 'requests',
    requiredFields: ['fullName', 'passportNumber', 'lostDocType', 'lostDate', 'circumstances'],
  },
  {
    id: 'inn_application',
    title: 'Заявление на ИНН',
    subtitle: 'Постановка на налоговый учет',
    icon: '🔢',
    formNumber: 'Форма №2-2-Учет',
    category: 'requests',
    requiredFields: ['fullName', 'passportNumber', 'birthDate', 'address'],
  },
];

export const FORM_CATEGORIES = [
  { id: 'work', title: '👔 Работа', icon: '💼' },
  { id: 'housing', title: '🏠 Жилье', icon: '🏠' },
  { id: 'longterm', title: '🪪 РВП / ВНЖ', icon: '📘' },
  { id: 'requests', title: '🆘 Разное', icon: '📋' },
] as const;

// Helper function to get forms by category
export const getFormsByCategory = (category: FormCategory): Form[] => {
  return FORMS_REGISTRY.filter(form => form.category === category);
};

// Helper function to get critical forms
export const getCriticalForms = (): Form[] => {
  return FORMS_REGISTRY.filter(form => form.isCritical);
};
