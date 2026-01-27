export interface Category {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  order: number;
}

export const categories: Category[] = [
  {
    id: 'registration',
    name: 'Миграционный учёт',
    nameEn: 'Migration Registration',
    description: 'Постановка на учёт, продление, снятие с учёта',
    icon: '📋',
    order: 1,
  },
  {
    id: 'patent',
    name: 'Патент на работу',
    nameEn: 'Work Patent',
    description: 'Оформление, оплата, продление патента',
    icon: '💼',
    order: 2,
  },
  {
    id: 'documents',
    name: 'Документы',
    nameEn: 'Documents',
    description: 'Миграционная карта, паспорт, перевод документов',
    icon: '📄',
    order: 3,
  },
  {
    id: 'stay',
    name: 'Сроки пребывания',
    nameEn: 'Stay Period',
    description: 'Правило 90/180, продление, выезд-въезд',
    icon: '📅',
    order: 4,
  },
  {
    id: 'ban',
    name: 'Запрет на въезд',
    nameEn: 'Entry Ban',
    description: 'Проверка запрета, обжалование, снятие',
    icon: '🚫',
    order: 5,
  },
  {
    id: 'deportation',
    name: 'Депортация',
    nameEn: 'Deportation',
    description: 'Административное выдворение, права',
    icon: '⚠️',
    order: 6,
  },
];
