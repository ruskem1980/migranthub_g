export interface Form {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  fileUrl: string;
  format: 'pdf' | 'doc' | 'docx';
  size?: string;
}

export const forms: Form[] = [
  {
    id: 'form-registration',
    categoryId: 'registration',
    title: 'Уведомление о прибытии иностранного гражданина',
    description: 'Форма для постановки на миграционный учёт',
    fileUrl: '/forms/uvedomlenie-o-pribytii.pdf',
    format: 'pdf',
    size: '156 KB',
  },
  {
    id: 'form-patent-application',
    categoryId: 'patent',
    title: 'Заявление о выдаче патента',
    description: 'Форма заявления на получение патента на работу',
    fileUrl: '/forms/zayavlenie-patent.pdf',
    format: 'pdf',
    size: '203 KB',
  },
  {
    id: 'form-migration-card',
    categoryId: 'documents',
    title: 'Миграционная карта (образец)',
    description: 'Образец заполнения миграционной карты',
    fileUrl: '/forms/migration-card-sample.pdf',
    format: 'pdf',
    size: '89 KB',
  },
  {
    id: 'form-ban-appeal',
    categoryId: 'ban',
    title: 'Жалоба на запрет въезда',
    description: 'Шаблон жалобы для обжалования запрета на въезд',
    fileUrl: '/forms/ban-appeal-template.docx',
    format: 'docx',
    size: '45 KB',
  },
];
