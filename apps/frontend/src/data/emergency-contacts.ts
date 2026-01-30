/**
 * Emergency contacts data for SOS screen
 * Includes emergency services, hotlines, embassies, and emergency guides
 */

export interface EmergencyService {
  id: string;
  name: string;
  number: string;
  icon: 'Phone' | 'Shield' | 'Heart' | 'Flame';
  description: string;
  color: string;
}

export interface Hotline {
  id: string;
  name: string;
  number: string;
  description: string;
  hours: string;
}

export interface Embassy {
  id: string;
  country: string;
  countryCode: string;
  flag: string;
  name: string;
  phone: string;
  address: string;
  website?: string;
}

export interface EmergencyGuide {
  id: string;
  title: string;
  icon: 'Shield' | 'Wallet' | 'FileX' | 'Building' | 'Scale' | 'AlertTriangle';
  steps: string[];
}

/**
 * Emergency services - quick dial numbers
 */
export const emergencyServices: EmergencyService[] = [
  {
    id: 'emergency',
    name: 'Единый номер',
    number: '112',
    icon: 'Phone',
    description: 'Все экстренные службы',
    color: 'red',
  },
  {
    id: 'police',
    name: 'Полиция',
    number: '102',
    icon: 'Shield',
    description: 'Охрана правопорядка',
    color: 'blue',
  },
  {
    id: 'ambulance',
    name: 'Скорая помощь',
    number: '103',
    icon: 'Heart',
    description: 'Медицинская помощь',
    color: 'pink',
  },
  {
    id: 'fire',
    name: 'Пожарная',
    number: '101',
    icon: 'Flame',
    description: 'Пожарная служба',
    color: 'orange',
  },
];

/**
 * Hotlines - useful phone numbers for migrants
 */
export const hotlines: Hotline[] = [
  {
    id: 'mvd',
    name: 'МВД горячая линия',
    number: '8-800-222-74-47',
    description: 'Бесплатно по России',
    hours: '24/7',
  },
  {
    id: 'migration',
    name: 'Миграционная служба',
    number: '8-495-636-98-98',
    description: 'Вопросы миграции',
    hours: 'Пн-Пт 9:00-18:00',
  },
  {
    id: 'labor',
    name: 'Трудовая инспекция',
    number: '8-800-707-88-41',
    description: 'Нарушения трудовых прав',
    hours: 'Пн-Пт 9:00-18:00',
  },
  {
    id: 'antidiscrimination',
    name: 'Антидискриминационный центр',
    number: '8-800-700-00-49',
    description: 'Бесплатная юридическая помощь',
    hours: 'Пн-Пт 10:00-18:00',
  },
  {
    id: 'prosecutor',
    name: 'Генеральная прокуратура',
    number: '8-800-250-79-01',
    description: 'Жалобы на нарушения прав',
    hours: 'Пн-Пт 9:00-18:00',
  },
];

/**
 * Embassies in Moscow for CIS countries
 */
export const embassies: Embassy[] = [
  {
    id: 'uz',
    country: 'Узбекистан',
    countryCode: 'UZ',
    flag: '\u{1F1FA}\u{1F1FF}',
    name: 'Посольство Узбекистана',
    phone: '+7 (495) 230-13-01',
    address: 'Москва, Погорельский пер., 12',
    website: 'https://uzbekistan.mid.ru',
  },
  {
    id: 'tj',
    country: 'Таджикистан',
    countryCode: 'TJ',
    flag: '\u{1F1F9}\u{1F1EF}',
    name: 'Посольство Таджикистана',
    phone: '+7 (495) 690-41-86',
    address: 'Москва, Гранатный пер., 13',
    website: 'https://tajikemb.ru',
  },
  {
    id: 'kg',
    country: 'Кыргызстан',
    countryCode: 'KG',
    flag: '\u{1F1F0}\u{1F1EC}',
    name: 'Посольство Кыргызстана',
    phone: '+7 (495) 237-48-82',
    address: 'Москва, ул. Б. Ордынка, 64',
    website: 'https://kyrgyz-embassy.ru',
  },
  {
    id: 'kz',
    country: 'Казахстан',
    countryCode: 'KZ',
    flag: '\u{1F1F0}\u{1F1FF}',
    name: 'Посольство Казахстана',
    phone: '+7 (495) 927-17-00',
    address: 'Москва, Чистопрудный бульвар, 3А',
    website: 'https://kazembassy.ru',
  },
  {
    id: 'am',
    country: 'Армения',
    countryCode: 'AM',
    flag: '\u{1F1E6}\u{1F1F2}',
    name: 'Посольство Армении',
    phone: '+7 (495) 624-35-20',
    address: 'Москва, Армянский пер., 2',
    website: 'https://russia.mfa.am',
  },
  {
    id: 'az',
    country: 'Азербайджан',
    countryCode: 'AZ',
    flag: '\u{1F1E6}\u{1F1FF}',
    name: 'Посольство Азербайджана',
    phone: '+7 (495) 629-16-49',
    address: 'Москва, Леонтьевский пер., 16',
    website: 'https://moscow.mfa.gov.az',
  },
  {
    id: 'md',
    country: 'Молдова',
    countryCode: 'MD',
    flag: '\u{1F1F2}\u{1F1E9}',
    name: 'Посольство Молдовы',
    phone: '+7 (495) 624-53-53',
    address: 'Москва, Кузнецкий Мост, 18',
    website: 'https://russia.mfa.gov.md',
  },
  {
    id: 'by',
    country: 'Беларусь',
    countryCode: 'BY',
    flag: '\u{1F1E7}\u{1F1FE}',
    name: 'Посольство Беларуси',
    phone: '+7 (495) 777-66-44',
    address: 'Москва, ул. Маросейка, 17/6',
    website: 'https://russia.mfa.gov.by',
  },
  {
    id: 'ua',
    country: 'Украина',
    countryCode: 'UA',
    flag: '\u{1F1FA}\u{1F1E6}',
    name: 'Посольство Украины',
    phone: '+7 (495) 629-35-42',
    address: 'Москва, Леонтьевский пер., 18',
    website: 'https://russia.mfa.gov.ua',
  },
  {
    id: 'ge',
    country: 'Грузия',
    countryCode: 'GE',
    flag: '\u{1F1EC}\u{1F1EA}',
    name: 'Секция интересов Грузии (при Посольстве Швейцарии)',
    phone: '+7 (495) 234-02-61',
    address: 'Москва, Малый Ржевский пер., 6',
    website: 'https://georgia.mid.ru',
  },
  {
    id: 'tm',
    country: 'Туркменистан',
    countryCode: 'TM',
    flag: '\u{1F1F9}\u{1F1F2}',
    name: 'Посольство Туркменистана',
    phone: '+7 (495) 691-65-16',
    address: 'Москва, Филипповский пер., 22',
    website: 'https://russia.tmembassy.gov.tm',
  },
];

/**
 * Emergency guides - step-by-step instructions
 */
export const emergencyGuides: EmergencyGuide[] = [
  {
    id: 'police_stop',
    title: 'Задержала полиция',
    icon: 'Shield',
    steps: [
      'Сохраняйте спокойствие, не спорьте',
      'Попросите показать удостоверение сотрудника',
      'Запишите или запомните ФИО и звание',
      'Узнайте причину задержания',
      'Вы имеете право на звонок - позвоните в посольство',
      'Не подписывайте документы без переводчика',
      'Требуйте протокол задержания',
    ],
  },
  {
    id: 'no_salary',
    title: 'Не платят зарплату',
    icon: 'Wallet',
    steps: [
      'Соберите доказательства работы (переписка, пропуск, фото)',
      'Напишите письменное заявление работодателю',
      'Сохраните копию заявления с отметкой о получении',
      'Обратитесь в трудовую инспекцию (8-800-707-88-41)',
      'Подайте заявление в прокуратуру при отказе',
      'Обратитесь в суд для взыскания задолженности',
    ],
  },
  {
    id: 'lost_docs',
    title: 'Потерял документы',
    icon: 'FileX',
    steps: [
      'Напишите заявление об утере в полицию',
      'Получите талон-уведомление из полиции',
      'Обратитесь в посольство для получения справки',
      'Восстановите документы в порядке приоритета',
      'Сообщите работодателю о ситуации',
    ],
  },
  {
    id: 'employer_problem',
    title: 'Проблемы с работодателем',
    icon: 'Building',
    steps: [
      'Зафиксируйте все нарушения (фото, видео, свидетели)',
      'Ведите дневник нарушений с датами',
      'Обратитесь в профсоюз или правозащитную организацию',
      'Позвоните на горячую линию трудовой инспекции',
      'Подайте письменную жалобу в инспекцию труда',
      'При угрозах - обращайтесь в полицию',
    ],
  },
  {
    id: 'legal_help',
    title: 'Нужна юридическая помощь',
    icon: 'Scale',
    steps: [
      'Позвоните на бесплатную горячую линию (8-800-700-00-49)',
      'Обратитесь в Антидискриминационный центр "Мемориал"',
      'Свяжитесь с посольством своей страны',
      'Найдите бесплатную юридическую клинику',
      'Сохраняйте все документы и доказательства',
    ],
  },
  {
    id: 'accident',
    title: 'Несчастный случай на работе',
    icon: 'AlertTriangle',
    steps: [
      'Вызовите скорую помощь (103)',
      'Сообщите работодателю о происшествии',
      'Зафиксируйте травмы (медицинские документы)',
      'Потребуйте составления акта о несчастном случае',
      'Обратитесь в ФСС для получения выплат',
      'Подайте жалобу в трудовую инспекцию',
    ],
  },
];

/**
 * Get embassy by country code
 */
export function getEmbassyByCountryCode(countryCode: string): Embassy | undefined {
  return embassies.find((e) => e.countryCode === countryCode);
}

/**
 * Get embassies sorted with user's citizenship first
 */
export function getEmbassiesSortedByCitizenship(citizenship?: string): Embassy[] {
  if (!citizenship) {
    return embassies;
  }

  const userEmbassy = embassies.find((e) => e.countryCode === citizenship);
  const otherEmbassies = embassies.filter((e) => e.countryCode !== citizenship);

  return userEmbassy ? [userEmbassy, ...otherEmbassies] : embassies;
}

/**
 * Get emergency guide by id
 */
export function getEmergencyGuideById(id: string): EmergencyGuide | undefined {
  return emergencyGuides.find((g) => g.id === id);
}
