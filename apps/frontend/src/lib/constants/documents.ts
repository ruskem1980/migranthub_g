// ============================================
// MIGRANTHUB - DOCUMENT CONSTANTS
// Central source of truth for all documents
// ============================================

export type DocumentId = 
  | 'passport' 
  | 'mig_card' 
  | 'registration' 
  | 'patent' 
  | 'receipts' 
  | 'green_card' 
  | 'contract' 
  | 'insurance' 
  | 'inn'
  | 'education'
  | 'family';

export interface Document {
  id: DocumentId;
  title: string;
  icon: string;
  description: string;
  requiredFor: ('work' | 'study' | 'tourism' | 'private')[];
  isEAEUExempt?: boolean; // Not required for EAEU citizens
}

export const DOCUMENTS_LIST: Document[] = [
  {
    id: 'passport',
    title: 'Паспорт',
    icon: '🛂',
    description: 'Действующий загранпаспорт',
    requiredFor: ['work', 'study', 'tourism', 'private'],
  },
  {
    id: 'mig_card',
    title: 'Миграционная карта',
    icon: '🎫',
    description: 'Карта, выданная на границе',
    requiredFor: ['work', 'study', 'tourism', 'private'],
    isEAEUExempt: true,
  },
  {
    id: 'registration',
    title: 'Регистрация (Уведомление)',
    icon: '📋',
    description: 'Уведомление о прибытии',
    requiredFor: ['work', 'study', 'tourism', 'private'],
  },
  {
    id: 'green_card',
    title: 'Зеленая карта (Дактилоскопия)',
    icon: '💳',
    description: 'Медосмотр + дактилоскопия',
    requiredFor: ['work'],
    isEAEUExempt: true,
  },
  {
    id: 'patent',
    title: 'Патент',
    icon: '📄',
    description: 'Разрешение на работу',
    requiredFor: ['work'],
    isEAEUExempt: true,
  },
  {
    id: 'receipts',
    title: 'Чеки (НДФЛ)',
    icon: '🧾',
    description: 'Квитанции об оплате патента',
    requiredFor: ['work'],
    isEAEUExempt: true,
  },
  {
    id: 'contract',
    title: 'Трудовой договор',
    icon: '📝',
    description: 'Договор с работодателем',
    requiredFor: ['work'],
  },
  {
    id: 'insurance',
    title: 'Полис ДМС',
    icon: '🩺',
    description: 'Медицинское страхование',
    requiredFor: ['work'],
    isEAEUExempt: true,
  },
  {
    id: 'inn',
    title: 'ИНН / СНИЛС',
    icon: '🔢',
    description: 'Налоговый номер',
    requiredFor: ['work'],
  },
  {
    id: 'education',
    title: 'Сертификат / Диплом',
    icon: '🎓',
    description: 'Сертификат о владении русским языком или диплом об образовании',
    requiredFor: ['work'],
    isEAEUExempt: true,
  },
  {
    id: 'family',
    title: 'Св-во о браке / рождении',
    icon: '💍',
    description: 'Свидетельство о браке или рождении детей',
    requiredFor: ['work'],
  },
];

// Helper function to get required documents
export const getRequiredDocuments = (
  purpose: string,
  citizenship: string
): DocumentId[] => {
  const isEAEU = ['Армения', 'Беларусь', 'Казахстан', 'Киргизия'].includes(citizenship);
  
  return DOCUMENTS_LIST
    .filter(doc => doc.requiredFor.includes(purpose as any))
    .filter(doc => !isEAEU || !doc.isEAEUExempt)
    .map(doc => doc.id);
};
