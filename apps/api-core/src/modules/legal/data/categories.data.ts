import { CategoryDto } from '../dto';

export const LEGAL_CATEGORIES: Omit<CategoryDto, 'itemCount'>[] = [
  {
    id: 'registration',
    name: 'Миграционный учёт',
    icon: 'home',
  },
  {
    id: 'patent',
    name: 'Патент на работу',
    icon: 'briefcase',
  },
  {
    id: 'visa',
    name: 'Визы и въезд',
    icon: 'plane',
  },
  {
    id: 'citizenship',
    name: 'Гражданство',
    icon: 'flag',
  },
  {
    id: 'documents',
    name: 'Документы',
    icon: 'file-text',
  },
  {
    id: 'work',
    name: 'Трудоустройство',
    icon: 'users',
  },
];
