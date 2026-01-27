export interface Law {
  id: string;
  categoryId: string;
  title: string;
  number: string;
  date: string;
  url: string;
  summary: string;
}

export const laws: Law[] = [
  {
    id: 'fz-115',
    categoryId: 'registration',
    title: 'О правовом положении иностранных граждан в РФ',
    number: '115-ФЗ',
    date: '2002-07-25',
    url: 'http://www.consultant.ru/document/cons_doc_LAW_37868/',
    summary: 'Основной закон о статусе иностранцев, визах, РВП, ВНЖ, трудовой деятельности',
  },
  {
    id: 'fz-109',
    categoryId: 'registration',
    title: 'О миграционном учёте иностранных граждан и лиц без гражданства',
    number: '109-ФЗ',
    date: '2006-07-18',
    url: 'http://www.consultant.ru/document/cons_doc_LAW_61569/',
    summary: 'Порядок постановки на миграционный учёт, сроки, ответственность',
  },
  {
    id: 'fz-114',
    categoryId: 'ban',
    title: 'О порядке выезда из РФ и въезда в РФ',
    number: '114-ФЗ',
    date: '1996-08-15',
    url: 'http://www.consultant.ru/document/cons_doc_LAW_11376/',
    summary: 'Основания для запрета въезда, сроки, порядок обжалования',
  },
  {
    id: 'nk-227',
    categoryId: 'patent',
    title: 'Налоговый кодекс РФ, статья 227.1',
    number: 'НК РФ ст.227.1',
    date: '2000-08-05',
    url: 'http://www.consultant.ru/document/cons_doc_LAW_19671/a59e3676f6c5a065c28e7f82bff3d70b5b95c4f3/',
    summary: 'Порядок уплаты НДФЛ по патенту, авансовые платежи',
  },
  {
    id: 'koap-18',
    categoryId: 'deportation',
    title: 'КоАП РФ, глава 18',
    number: 'КоАП РФ гл.18',
    date: '2001-12-30',
    url: 'http://www.consultant.ru/document/cons_doc_LAW_34661/5c8f5d4c61e5a8c8f3d0c2a5c7e8b9d0/',
    summary: 'Административные правонарушения в области миграции, штрафы, выдворение',
  },
];
