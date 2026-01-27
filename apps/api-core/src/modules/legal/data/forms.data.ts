import { FormDto } from '../dto';

export const LEGAL_FORMS: FormDto[] = [
  {
    id: 'notice-arrival',
    title: 'Уведомление о прибытии иностранного гражданина',
    description:
      'Бланк уведомления о прибытии иностранного гражданина в место пребывания для постановки на миграционный учёт.',
    downloadUrl: 'https://мвд.рф/upload/site1/document_file/Uvedomlenie_o_pribytii.pdf',
    categoryId: 'registration',
  },
  {
    id: 'notice-departure',
    title: 'Уведомление об убытии иностранного гражданина',
    description: 'Бланк уведомления об убытии иностранного гражданина из места пребывания.',
    downloadUrl: 'https://мвд.рф/upload/site1/document_file/Uvedomlenie_ob_ubytii.pdf',
    categoryId: 'registration',
  },
  {
    id: 'patent-application',
    title: 'Заявление о выдаче патента на работу',
    description:
      'Заявление иностранного гражданина о выдаче патента, дающего право на осуществление трудовой деятельности.',
    downloadUrl: 'https://мвд.рф/upload/site1/document_file/Zayavlenie_patent.pdf',
    categoryId: 'patent',
  },
  {
    id: 'form-2p',
    title: 'Форма 2П - Заявление о выдаче (замене) паспорта',
    description:
      'Заявление о выдаче (замене) паспорта гражданина Российской Федерации по форме № 2П.',
    downloadUrl: 'https://мвд.рф/upload/site1/document_file/Forma_2P.pdf',
    categoryId: 'documents',
  },
  {
    id: 'rvp-application',
    title: 'Заявление о выдаче разрешения на временное проживание',
    description:
      'Заявление иностранного гражданина о выдаче разрешения на временное проживание (РВП) в Российской Федерации.',
    downloadUrl: 'https://мвд.рф/upload/site1/document_file/Zayavlenie_RVP.pdf',
    categoryId: 'visa',
  },
  {
    id: 'vnzh-application',
    title: 'Заявление о выдаче вида на жительство',
    description:
      'Заявление иностранного гражданина о выдаче вида на жительство (ВНЖ) в Российской Федерации.',
    downloadUrl: 'https://мвд.рф/upload/site1/document_file/Zayavlenie_VNZh.pdf',
    categoryId: 'visa',
  },
  {
    id: 'citizenship-application',
    title: 'Заявление о приёме в гражданство РФ',
    description:
      'Заявление о приёме в гражданство Российской Федерации в общем или упрощённом порядке.',
    downloadUrl: 'https://мвд.рф/upload/site1/document_file/Zayavlenie_grazhdanstvo.pdf',
    categoryId: 'citizenship',
  },
  {
    id: 'work-permit-application',
    title: 'Заявление о выдаче разрешения на работу',
    description:
      'Заявление о выдаче разрешения на работу для иностранных граждан, прибывших в визовом порядке.',
    downloadUrl: 'https://мвд.рф/upload/site1/document_file/Zayavlenie_razreshenie_rabota.pdf',
    categoryId: 'work',
  },
  {
    id: 'employer-notification',
    title: 'Уведомление о заключении трудового договора с иностранцем',
    description:
      'Форма уведомления работодателя о заключении трудового договора с иностранным гражданином.',
    downloadUrl: 'https://мвд.рф/upload/site1/document_file/Uvedomlenie_trudovoy_dogovor.pdf',
    categoryId: 'work',
  },
  {
    id: 'migration-card',
    title: 'Миграционная карта (образец)',
    description:
      'Образец заполнения миграционной карты при въезде на территорию Российской Федерации.',
    downloadUrl: 'https://мвд.рф/upload/site1/document_file/Migracionnaya_karta.pdf',
    categoryId: 'visa',
  },
];
