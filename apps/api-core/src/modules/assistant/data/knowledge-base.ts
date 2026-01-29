/**
 * Knowledge Base for MigrantHub AI Assistant
 * 50 Q&A about migration legislation in Russia
 */

export type KnowledgeCategory =
  | 'patent'
  | 'rvp'
  | 'vnj'
  | 'citizenship'
  | 'registration'
  | 'work'
  | 'medical'
  | 'sos';

export interface KnowledgeItem {
  id: string;
  category: KnowledgeCategory;
  question: {
    ru: string;
    en: string;
  };
  answer: {
    ru: string;
    en: string;
  };
  tags: string[];
  relatedLinks?: string[];
  legalReference?: string;
}

export const KNOWLEDGE_BASE: KnowledgeItem[] = [
  // ============ PATENT (10 questions) ============
  {
    id: 'patent-001',
    category: 'patent',
    question: {
      ru: 'Как получить патент на работу?',
      en: 'How to get a work patent?',
    },
    answer: {
      ru: 'Для получения патента нужно в течение 30 дней после въезда подать заявление в МВД с пакетом документов: паспорт с нотариальным переводом, миграционная карта (цель - работа), полис ДМС, медицинские справки, сертификат о владении русским языком. Срок оформления - до 10 рабочих дней.',
      en: 'To get a patent, you need to apply to the Ministry of Internal Affairs within 30 days of entry with documents: passport with notarized translation, migration card (purpose - work), voluntary health insurance policy, medical certificates, Russian language certificate. Processing time - up to 10 business days.',
    },
    tags: ['патент', 'получение', 'документы', 'patent', 'application', 'documents'],
    legalReference: 'ФЗ-115, ст. 13.3',
  },
  {
    id: 'patent-002',
    category: 'patent',
    question: {
      ru: 'Сколько стоит патент по регионам?',
      en: 'How much does a patent cost by region?',
    },
    answer: {
      ru: 'Стоимость патента различается по регионам. Москва - 7500 руб/мес, Московская область - 6600 руб/мес, Санкт-Петербург - 4400 руб/мес, Краснодарский край - 5200 руб/мес. Актуальные тарифы устанавливаются ежегодно региональными законами.',
      en: 'Patent cost varies by region. Moscow - 7500 RUB/month, Moscow region - 6600 RUB/month, St. Petersburg - 4400 RUB/month, Krasnodar region - 5200 RUB/month. Current rates are set annually by regional laws.',
    },
    tags: ['патент', 'стоимость', 'цена', 'регион', 'patent', 'cost', 'price', 'region'],
    legalReference: 'НК РФ, ст. 227.1',
  },
  {
    id: 'patent-003',
    category: 'patent',
    question: {
      ru: 'Как продлить патент?',
      en: 'How to extend a patent?',
    },
    answer: {
      ru: 'Патент продлевается автоматически при своевременной оплате НДФЛ. Оплачивать нужно до истечения оплаченного периода. Максимальный срок действия патента - 12 месяцев с возможностью переоформления на новый срок.',
      en: 'The patent is extended automatically with timely payment of income tax. Payment must be made before the paid period expires. Maximum patent validity - 12 months with the possibility of reissue for a new term.',
    },
    tags: ['патент', 'продление', 'оплата', 'patent', 'extension', 'payment'],
    legalReference: 'ФЗ-115, ст. 13.3, п. 5',
  },
  {
    id: 'patent-004',
    category: 'patent',
    question: {
      ru: 'Что делать если просрочил оплату патента?',
      en: 'What to do if patent payment is overdue?',
    },
    answer: {
      ru: 'При просрочке оплаты даже на 1 день патент аннулируется автоматически. Необходимо выехать из РФ и въехать заново для оформления нового патента. Работа с аннулированным патентом грозит штрафом и возможной депортацией.',
      en: 'If payment is overdue even by 1 day, the patent is automatically cancelled. You must leave Russia and re-enter to apply for a new patent. Working with a cancelled patent results in fines and possible deportation.',
    },
    tags: ['патент', 'просрочка', 'аннулирование', 'patent', 'overdue', 'cancellation'],
    legalReference: 'ФЗ-115, ст. 13.3, п. 6',
  },
  {
    id: 'patent-005',
    category: 'patent',
    question: {
      ru: 'Можно ли работать в другом регионе с патентом?',
      en: 'Can I work in another region with a patent?',
    },
    answer: {
      ru: 'Нет, патент действует только в том регионе, где он выдан. Для работы в другом регионе нужно получить новый патент в том регионе. Работа в чужом регионе грозит штрафом до 7000 рублей и аннулированием патента.',
      en: 'No, a patent is valid only in the region where it was issued. To work in another region, you need to get a new patent there. Working in the wrong region may result in fines up to 7000 RUB and patent cancellation.',
    },
    tags: ['патент', 'регион', 'территория', 'patent', 'region', 'territory'],
    legalReference: 'ФЗ-115, ст. 13.3, п. 16',
  },
  {
    id: 'patent-006',
    category: 'patent',
    question: {
      ru: 'Какие документы нужны для патента?',
      en: 'What documents are needed for a patent?',
    },
    answer: {
      ru: 'Для патента нужны: заявление, паспорт с нотариальным переводом, миграционная карта (цель - работа), полис ДМС на год, медсправки (нарколог, инфекции, ВИЧ), сертификат о знании русского языка, фото 3x4, квитанция об оплате НДФЛ за 1 месяц.',
      en: 'For a patent you need: application, passport with notarized translation, migration card (purpose - work), 1-year health insurance, medical certificates (drugs, infections, HIV), Russian language certificate, 3x4 photo, 1-month income tax payment receipt.',
    },
    tags: ['патент', 'документы', 'список', 'patent', 'documents', 'list'],
    legalReference: 'ФЗ-115, ст. 13.3, п. 2',
  },
  {
    id: 'patent-007',
    category: 'patent',
    question: {
      ru: 'Сколько времени занимает оформление патента?',
      en: 'How long does it take to process a patent?',
    },
    answer: {
      ru: 'Срок оформления патента - до 10 рабочих дней с момента подачи полного пакета документов. Важно подать заявление в течение 30 дней после въезда в РФ, иначе потребуется заплатить штраф 10000-15000 рублей.',
      en: 'Patent processing time - up to 10 business days from submitting complete documents. Important: apply within 30 days after entering Russia, otherwise a fine of 10000-15000 RUB is required.',
    },
    tags: ['патент', 'срок', 'оформление', 'время', 'patent', 'time', 'processing'],
    legalReference: 'ФЗ-115, ст. 13.3, п. 4',
  },
  {
    id: 'patent-008',
    category: 'patent',
    question: {
      ru: 'Как узнать готовность патента?',
      en: 'How to check patent readiness?',
    },
    answer: {
      ru: 'Проверить готовность патента можно на сайте МВД региона, по телефону горячей линии миграционной службы или лично в отделении, где подавали документы. При получении нужен паспорт и расписка о приёме документов.',
      en: 'Check patent readiness on the regional Ministry of Internal Affairs website, by calling the migration service hotline, or in person at the office where you submitted documents. To collect, bring your passport and document receipt.',
    },
    tags: ['патент', 'готовность', 'проверка', 'статус', 'patent', 'status', 'check', 'ready'],
    legalReference: 'ФЗ-115, ст. 13.3',
  },
  {
    id: 'patent-009',
    category: 'patent',
    question: {
      ru: 'Что делать при утере патента?',
      en: 'What to do if patent is lost?',
    },
    answer: {
      ru: 'При утере патента нужно в течение 10 дней подать заявление на выдачу дубликата в МВД. Потребуется паспорт, фото, квитанция об оплате за текущий месяц. До получения дубликата работать нельзя.',
      en: 'If you lose your patent, apply for a duplicate at the Ministry of Internal Affairs within 10 days. You need passport, photo, current month payment receipt. You cannot work until you receive the duplicate.',
    },
    tags: ['патент', 'утеря', 'дубликат', 'потеря', 'patent', 'lost', 'duplicate'],
    legalReference: 'ФЗ-115, ст. 13.3, п. 7',
  },
  {
    id: 'patent-010',
    category: 'patent',
    question: {
      ru: 'Как сменить регион работы по патенту?',
      en: 'How to change work region with a patent?',
    },
    answer: {
      ru: 'Сменить регион нельзя - нужно получить новый патент в желаемом регионе. Для этого можно: 1) выехать и въехать заново, или 2) подать заявление о переоформлении патента в новом регионе (если есть регистрация там).',
      en: 'You cannot change regions - you need to get a new patent in the desired region. Options: 1) exit and re-enter Russia, or 2) apply for patent reissue in the new region (if you have registration there).',
    },
    tags: ['патент', 'смена', 'регион', 'переезд', 'patent', 'change', 'region', 'move'],
    legalReference: 'ФЗ-115, ст. 13.3',
  },

  // ============ REGISTRATION (8 questions) ============
  {
    id: 'registration-001',
    category: 'registration',
    question: {
      ru: 'В какой срок нужно встать на миграционный учёт?',
      en: 'What is the deadline for migration registration?',
    },
    answer: {
      ru: 'Иностранный гражданин должен встать на миграционный учёт в течение 7 рабочих дней после въезда в РФ. Для граждан некоторых стран (ЕАЭС, Украина, Таджикистан) срок увеличен до 15-30 дней.',
      en: 'Foreign citizens must register within 7 business days after entering Russia. For citizens of some countries (EAEU, Ukraine, Tajikistan) the period is extended to 15-30 days.',
    },
    tags: ['регистрация', 'учёт', 'срок', 'registration', 'deadline', 'period'],
    legalReference: 'ФЗ-109, ст. 20',
  },
  {
    id: 'registration-002',
    category: 'registration',
    question: {
      ru: 'Как продлить регистрацию?',
      en: 'How to extend registration?',
    },
    answer: {
      ru: 'Для продления регистрации принимающая сторона подаёт уведомление в МВД с документами: копия паспорта, миграционная карта, действующий патент/разрешение на работу или другое основание для пребывания.',
      en: 'To extend registration, the host party submits a notification to the Ministry of Internal Affairs with: passport copy, migration card, valid patent/work permit or other grounds for stay.',
    },
    tags: ['регистрация', 'продление', 'registration', 'extension', 'renewal'],
    legalReference: 'ФЗ-109, ст. 22',
  },
  {
    id: 'registration-003',
    category: 'registration',
    question: {
      ru: 'Что делать если истекла регистрация?',
      en: 'What to do if registration has expired?',
    },
    answer: {
      ru: 'При истечении регистрации нужно срочно оформить новую или выехать из РФ. За нарушение - штраф 2000-5000 рублей (в Москве и СПб до 7000). При повторном нарушении возможен запрет на въезд.',
      en: 'If registration expires, urgently get a new one or leave Russia. Violation fine: 2000-5000 RUB (up to 7000 in Moscow/St. Petersburg). Repeated violations may result in entry ban.',
    },
    tags: ['регистрация', 'истекла', 'просрочка', 'штраф', 'registration', 'expired', 'fine'],
    legalReference: 'КоАП РФ, ст. 18.8',
  },
  {
    id: 'registration-004',
    category: 'registration',
    question: {
      ru: 'Кто может поставить на миграционный учёт?',
      en: 'Who can provide migration registration?',
    },
    answer: {
      ru: 'Поставить на учёт может: собственник жилья, работодатель (по адресу организации), гостиница, хостел, больница. Принимающая сторона подаёт уведомление лично, по почте или через Госуслуги.',
      en: 'Registration can be provided by: property owner, employer (at company address), hotel, hostel, hospital. The host party submits notification in person, by mail, or via Gosuslugi.',
    },
    tags: ['регистрация', 'учёт', 'принимающая сторона', 'registration', 'host'],
    legalReference: 'ФЗ-109, ст. 22',
  },
  {
    id: 'registration-005',
    category: 'registration',
    question: {
      ru: 'Какой штраф за отсутствие регистрации?',
      en: 'What is the fine for lack of registration?',
    },
    answer: {
      ru: 'Штраф за отсутствие регистрации: 2000-5000 рублей по РФ, в Москве, СПб и их областях - 5000-7000 рублей. При повторном нарушении в течение года - штраф и возможное выдворение с запретом въезда на 5 лет.',
      en: 'Fine for no registration: 2000-5000 RUB across Russia, in Moscow/St. Petersburg regions - 5000-7000 RUB. Repeated violation within a year - fine and possible deportation with 5-year entry ban.',
    },
    tags: ['регистрация', 'штраф', 'нарушение', 'registration', 'fine', 'violation'],
    legalReference: 'КоАП РФ, ст. 18.8',
  },
  {
    id: 'registration-006',
    category: 'registration',
    question: {
      ru: 'Можно ли сделать регистрацию самому?',
      en: 'Can I register myself?',
    },
    answer: {
      ru: 'Нет, иностранец не может сам поставить себя на учёт. Это обязанность принимающей стороны. Исключение - если иностранец является собственником жилья в РФ, тогда он может встать на учёт по своему адресу.',
      en: 'No, foreigners cannot register themselves. This is the host party responsibility. Exception: if the foreigner owns property in Russia, they can register at their own address.',
    },
    tags: ['регистрация', 'самостоятельно', 'registration', 'self', 'own'],
    legalReference: 'ФЗ-109, ст. 22',
  },
  {
    id: 'registration-007',
    category: 'registration',
    question: {
      ru: 'Как сменить адрес регистрации?',
      en: 'How to change registration address?',
    },
    answer: {
      ru: 'При смене адреса нужно в течение 7 дней встать на учёт по новому месту. Прежняя регистрация автоматически аннулируется. Новая принимающая сторона подаёт уведомление с документами иностранца.',
      en: 'When changing address, register at the new place within 7 days. Previous registration is automatically cancelled. The new host party submits notification with foreigner documents.',
    },
    tags: ['регистрация', 'смена', 'адрес', 'переезд', 'registration', 'change', 'address'],
    legalReference: 'ФЗ-109, ст. 22',
  },
  {
    id: 'registration-008',
    category: 'registration',
    question: {
      ru: 'Какие документы нужны для регистрации?',
      en: 'What documents are needed for registration?',
    },
    answer: {
      ru: 'Для регистрации нужны: паспорт иностранца, миграционная карта, копия паспорта принимающей стороны, документы на жильё (выписка из ЕГРН или договор аренды). Принимающая сторона заполняет бланк уведомления.',
      en: 'For registration you need: foreigner passport, migration card, host passport copy, housing documents (EGRN extract or rental agreement). The host fills out the notification form.',
    },
    tags: ['регистрация', 'документы', 'список', 'registration', 'documents', 'list'],
    legalReference: 'ФЗ-109, ст. 22',
  },

  // ============ RVP (7 questions) ============
  {
    id: 'rvp-001',
    category: 'rvp',
    question: {
      ru: 'Что такое РВП и кому оно нужно?',
      en: 'What is RVP and who needs it?',
    },
    answer: {
      ru: 'РВП (разрешение на временное проживание) - статус, позволяющий жить и работать в РФ до 3 лет без патента. Нужен тем, кто планирует остаться надолго и получить ВНЖ. Выдаётся в пределах квоты или без квоты по основаниям.',
      en: 'RVP (temporary residence permit) is a status allowing you to live and work in Russia for up to 3 years without a patent. Needed by those planning to stay long-term and get permanent residence. Issued within quota or without quota for certain grounds.',
    },
    tags: ['рвп', 'что такое', 'статус', 'rvp', 'what is', 'status'],
    legalReference: 'ФЗ-115, ст. 6',
  },
  {
    id: 'rvp-002',
    category: 'rvp',
    question: {
      ru: 'Как получить РВП без квоты?',
      en: 'How to get RVP without quota?',
    },
    answer: {
      ru: 'РВП без квоты могут получить: родившиеся в РСФСР/РФ, супруги граждан РФ, родители детей-граждан РФ, участники программы переселения, граждане Украины, Казахстана, Молдовы, выпускники российских вузов и другие категории.',
      en: 'RVP without quota can be obtained by: those born in RSFSR/Russia, spouses of Russian citizens, parents of Russian citizen children, resettlement program participants, citizens of Ukraine, Kazakhstan, Moldova, Russian university graduates, and other categories.',
    },
    tags: ['рвп', 'без квоты', 'основания', 'rvp', 'without quota', 'grounds'],
    legalReference: 'ФЗ-115, ст. 6, п. 3',
  },
  {
    id: 'rvp-003',
    category: 'rvp',
    question: {
      ru: 'Какие документы нужны для РВП?',
      en: 'What documents are needed for RVP?',
    },
    answer: {
      ru: 'Для РВП нужны: заявление, паспорт с переводом, фото 35x45, медсправки (ВИЧ, наркология, инфекции), сертификат о знании русского языка, документ об основании (для внеквотного) или заявление на квоту.',
      en: 'For RVP you need: application, passport with translation, 35x45 photos, medical certificates (HIV, drugs, infections), Russian language certificate, grounds document (for quota-free) or quota application.',
    },
    tags: ['рвп', 'документы', 'список', 'rvp', 'documents', 'list'],
    legalReference: 'ФЗ-115, ст. 6.1',
  },
  {
    id: 'rvp-004',
    category: 'rvp',
    question: {
      ru: 'Сколько времени рассматривают заявление на РВП?',
      en: 'How long does RVP application review take?',
    },
    answer: {
      ru: 'Срок рассмотрения заявления на РВП - до 4 месяцев для безвизовых стран и до 6 месяцев для визовых. Для участников программы переселения и некоторых других категорий - 60 дней.',
      en: 'RVP application review time: up to 4 months for visa-free countries, up to 6 months for visa countries. For resettlement program participants and some other categories - 60 days.',
    },
    tags: ['рвп', 'срок', 'рассмотрение', 'rvp', 'time', 'review'],
    legalReference: 'ФЗ-115, ст. 6.1',
  },
  {
    id: 'rvp-005',
    category: 'rvp',
    question: {
      ru: 'Можно ли работать с РВП без патента?',
      en: 'Can I work with RVP without a patent?',
    },
    answer: {
      ru: 'Да, с РВП можно работать без патента и разрешения на работу, но только в том регионе, где выдано РВП. Для работы в другом регионе нужно получить разрешение или перевести РВП.',
      en: 'Yes, with RVP you can work without a patent or work permit, but only in the region where the RVP was issued. To work in another region, you need permission or RVP transfer.',
    },
    tags: ['рвп', 'работа', 'патент', 'rvp', 'work', 'patent'],
    legalReference: 'ФЗ-115, ст. 13',
  },
  {
    id: 'rvp-006',
    category: 'rvp',
    question: {
      ru: 'Что делать после получения РВП?',
      en: 'What to do after getting RVP?',
    },
    answer: {
      ru: 'После получения РВП нужно: в течение 7 дней зарегистрироваться по месту жительства, получить ИНН, ежегодно подавать уведомление о проживании с подтверждением дохода. Через 8 месяцев можно подавать на ВНЖ.',
      en: 'After getting RVP: register at residence within 7 days, get tax ID (INN), submit annual residence notification with income proof. After 8 months you can apply for permanent residence (VNJ).',
    },
    tags: ['рвп', 'после получения', 'действия', 'rvp', 'after', 'steps'],
    legalReference: 'ФЗ-115, ст. 6',
  },
  {
    id: 'rvp-007',
    category: 'rvp',
    question: {
      ru: 'Как продлить РВП?',
      en: 'How to extend RVP?',
    },
    answer: {
      ru: 'РВП не продлевается - оно выдаётся на 3 года. После истечения нужно либо получить ВНЖ, либо выехать. Подать на ВНЖ можно через 8 месяцев после получения РВП, но не позднее чем за 4 месяца до окончания РВП.',
      en: 'RVP cannot be extended - it is issued for 3 years. After expiration, you must either get permanent residence (VNJ) or leave. You can apply for VNJ 8 months after getting RVP, but no later than 4 months before RVP expires.',
    },
    tags: ['рвп', 'продление', 'срок', 'rvp', 'extension', 'validity'],
    legalReference: 'ФЗ-115, ст. 6, 8',
  },

  // ============ VNJ (6 questions) ============
  {
    id: 'vnj-001',
    category: 'vnj',
    question: {
      ru: 'Что такое ВНЖ и чем отличается от РВП?',
      en: 'What is VNJ and how does it differ from RVP?',
    },
    answer: {
      ru: 'ВНЖ (вид на жительство) - бессрочный статус, дающий право жить и работать в любом регионе РФ без ограничений. В отличие от РВП, не привязан к региону, не требует ежегодного подтверждения, позволяет получить гражданство.',
      en: 'VNJ (residence permit) is a permanent status allowing you to live and work in any Russian region without restrictions. Unlike RVP, it is not tied to a region, does not require annual confirmation, and allows citizenship application.',
    },
    tags: ['внж', 'что такое', 'отличия', 'vnj', 'what is', 'difference'],
    legalReference: 'ФЗ-115, ст. 8',
  },
  {
    id: 'vnj-002',
    category: 'vnj',
    question: {
      ru: 'Как получить ВНЖ?',
      en: 'How to get VNJ?',
    },
    answer: {
      ru: 'Для получения ВНЖ нужно прожить по РВП не менее 8 месяцев и подать заявление в МВД с документами: паспорт, РВП, фото, медсправки, подтверждение дохода, сертификат о знании русского языка. Срок рассмотрения - до 4 месяцев.',
      en: 'To get VNJ, you must live with RVP for at least 8 months and apply to Ministry of Internal Affairs with: passport, RVP, photos, medical certificates, income proof, Russian language certificate. Review time - up to 4 months.',
    },
    tags: ['внж', 'получение', 'заявление', 'vnj', 'application', 'how to'],
    legalReference: 'ФЗ-115, ст. 8',
  },
  {
    id: 'vnj-003',
    category: 'vnj',
    question: {
      ru: 'Какие документы нужны для ВНЖ?',
      en: 'What documents are needed for VNJ?',
    },
    answer: {
      ru: 'Для ВНЖ нужны: заявление, паспорт с переводом, действующее РВП, 4 фото 35x45, медсправки, подтверждение дохода (справка 2-НДФЛ, выписка со счёта), сертификат о знании русского языка, госпошлина 5000 рублей.',
      en: 'For VNJ you need: application, passport with translation, valid RVP, 4 photos 35x45, medical certificates, income proof (2-NDFL certificate, bank statement), Russian language certificate, state fee 5000 RUB.',
    },
    tags: ['внж', 'документы', 'список', 'vnj', 'documents', 'list'],
    legalReference: 'ФЗ-115, ст. 8',
  },
  {
    id: 'vnj-004',
    category: 'vnj',
    question: {
      ru: 'Можно ли получить ВНЖ без РВП?',
      en: 'Can I get VNJ without RVP?',
    },
    answer: {
      ru: 'Да, некоторые категории могут получить ВНЖ без РВП: высококвалифицированные специалисты, носители русского языка, участники программы переселения, граждане Беларуси, лица с отменённым гражданством РФ и другие.',
      en: 'Yes, some categories can get VNJ without RVP: highly qualified specialists, Russian language speakers, resettlement program participants, Belarus citizens, those with cancelled Russian citizenship, and others.',
    },
    tags: ['внж', 'без рвп', 'основания', 'vnj', 'without rvp', 'grounds'],
    legalReference: 'ФЗ-115, ст. 8, п. 2',
  },
  {
    id: 'vnj-005',
    category: 'vnj',
    question: {
      ru: 'Сколько действует ВНЖ?',
      en: 'How long is VNJ valid?',
    },
    answer: {
      ru: 'С 2019 года ВНЖ выдаётся бессрочно. Необходимо только менять сам документ каждые 10 лет (как паспорт) и ежегодно подавать уведомление о проживании. При выезде из РФ более чем на 6 месяцев ВНЖ может быть аннулирован.',
      en: 'Since 2019, VNJ is issued indefinitely. You only need to replace the document every 10 years (like a passport) and submit annual residence notification. If you leave Russia for more than 6 months, VNJ may be cancelled.',
    },
    tags: ['внж', 'срок', 'действие', 'бессрочный', 'vnj', 'validity', 'permanent'],
    legalReference: 'ФЗ-115, ст. 8',
  },
  {
    id: 'vnj-006',
    category: 'vnj',
    question: {
      ru: 'Какие права даёт ВНЖ?',
      en: 'What rights does VNJ provide?',
    },
    answer: {
      ru: 'ВНЖ даёт право: жить и работать в любом регионе РФ без разрешений, свободно въезжать и выезжать, получать пенсию, пользоваться ОМС, брать кредиты, регистрировать ИП. Нельзя: голосовать, работать на госслужбе.',
      en: 'VNJ grants rights to: live and work in any Russian region without permits, freely enter and exit, receive pension, use public health insurance, get loans, register as sole proprietor. Cannot: vote, work in government service.',
    },
    tags: ['внж', 'права', 'возможности', 'vnj', 'rights', 'benefits'],
    legalReference: 'ФЗ-115, ст. 8',
  },

  // ============ WORK (7 questions) ============
  {
    id: 'work-001',
    category: 'work',
    question: {
      ru: 'Можно ли работать без патента?',
      en: 'Can I work without a patent?',
    },
    answer: {
      ru: 'Без патента могут работать: граждане ЕАЭС (Армения, Беларусь, Казахстан, Кыргызстан), лица с РВП или ВНЖ, высококвалифицированные специалисты, студенты (в свободное время), беженцы. Остальным нужен патент или разрешение на работу.',
      en: 'Can work without patent: EAEU citizens (Armenia, Belarus, Kazakhstan, Kyrgyzstan), persons with RVP or VNJ, highly qualified specialists, students (in free time), refugees. Others need a patent or work permit.',
    },
    tags: ['работа', 'патент', 'без патента', 'work', 'patent', 'without'],
    legalReference: 'ФЗ-115, ст. 13',
  },
  {
    id: 'work-002',
    category: 'work',
    question: {
      ru: 'Что делать если работодатель не оформляет договор?',
      en: 'What to do if employer does not sign a contract?',
    },
    answer: {
      ru: 'Работа без договора незаконна и лишает вас защиты. Требуйте письменный договор, сохраняйте переписку и доказательства работы. При отказе можно пожаловаться в трудовую инспекцию или прокуратуру. Работодателю грозит штраф до 100 000 рублей.',
      en: 'Working without a contract is illegal and leaves you unprotected. Demand a written contract, save correspondence and work evidence. If refused, complain to labor inspection or prosecutor. Employer faces fines up to 100,000 RUB.',
    },
    tags: ['работа', 'договор', 'оформление', 'work', 'contract', 'illegal'],
    legalReference: 'ТК РФ, ст. 67',
  },
  {
    id: 'work-003',
    category: 'work',
    question: {
      ru: 'Какие права у мигранта при трудоустройстве?',
      en: 'What rights do migrants have when employed?',
    },
    answer: {
      ru: 'Мигранты имеют равные трудовые права с гражданами РФ: оплата не ниже МРОТ, 8-часовой рабочий день, оплачиваемый отпуск 28 дней, больничный, безопасные условия труда. Дискриминация по национальности запрещена.',
      en: 'Migrants have equal labor rights with Russian citizens: minimum wage, 8-hour workday, 28 days paid vacation, sick leave, safe working conditions. Discrimination by nationality is prohibited.',
    },
    tags: ['работа', 'права', 'мигрант', 'work', 'rights', 'migrant'],
    legalReference: 'ТК РФ, ст. 3, 11',
  },
  {
    id: 'work-004',
    category: 'work',
    question: {
      ru: 'Нужен ли патент гражданам ЕАЭС?',
      en: 'Do EAEU citizens need a patent?',
    },
    answer: {
      ru: 'Нет, граждане стран ЕАЭС (Армения, Беларусь, Казахстан, Кыргызстан) имеют право работать в России без патента и разрешения на работу. Нужно только встать на миграционный учёт и заключить трудовой договор.',
      en: 'No, citizens of EAEU countries (Armenia, Belarus, Kazakhstan, Kyrgyzstan) can work in Russia without a patent or work permit. You only need migration registration and an employment contract.',
    },
    tags: ['работа', 'еаэс', 'патент', 'work', 'eaeu', 'patent'],
    legalReference: 'Договор о ЕАЭС, ст. 97',
  },
  {
    id: 'work-005',
    category: 'work',
    question: {
      ru: 'Как проверить работодателя на благонадёжность?',
      en: 'How to check employer reliability?',
    },
    answer: {
      ru: 'Проверьте работодателя: на сайте ФНС (egrul.nalog.ru) - существование компании, на сайте судебных приставов - долги, на картотеке арбитражных дел - судебные споры. Почитайте отзывы работников, проверьте адрес офиса.',
      en: 'Check employer: on FNS website (egrul.nalog.ru) - company existence, bailiff service website - debts, arbitration court database - lawsuits. Read employee reviews, verify office address.',
    },
    tags: ['работа', 'работодатель', 'проверка', 'work', 'employer', 'check'],
  },
  {
    id: 'work-006',
    category: 'work',
    question: {
      ru: 'Что делать если не платят зарплату?',
      en: 'What to do if salary is not paid?',
    },
    answer: {
      ru: 'При невыплате зарплаты: напишите претензию работодателю, подайте жалобу в трудовую инспекцию (онлайн на онлайнинспекция.рф), обратитесь в прокуратуру или суд. Срок исковой давности - 1 год. Сохраняйте все документы о работе.',
      en: 'If salary is not paid: write a complaint to employer, file a claim with labor inspection (online at onlineinspection.rf), contact prosecutor or court. Limitation period - 1 year. Keep all work documents.',
    },
    tags: ['работа', 'зарплата', 'невыплата', 'work', 'salary', 'unpaid'],
    legalReference: 'ТК РФ, ст. 142, 392',
  },
  {
    id: 'work-007',
    category: 'work',
    question: {
      ru: 'Как оформить трудовой договор?',
      en: 'How to sign an employment contract?',
    },
    answer: {
      ru: 'Трудовой договор заключается в письменной форме в 2 экземплярах. Должен содержать: ФИО, должность, оклад, режим работы, дату начала. Для иностранцев указываются данные патента/РВП. Работодатель обязан уведомить МВД о найме в течение 3 дней.',
      en: 'Employment contract is signed in writing in 2 copies. Must contain: full name, position, salary, work schedule, start date. For foreigners, patent/RVP data is indicated. Employer must notify Ministry of Internal Affairs about hiring within 3 days.',
    },
    tags: ['работа', 'договор', 'оформление', 'work', 'contract', 'employment'],
    legalReference: 'ТК РФ, ст. 57; ФЗ-115, ст. 13',
  },

  // ============ MEDICAL (5 questions) ============
  {
    id: 'medical-001',
    category: 'medical',
    question: {
      ru: 'Где пройти медосмотр для патента?',
      en: 'Where to get a medical exam for patent?',
    },
    answer: {
      ru: 'Медосмотр для патента проходят в уполномоченных медучреждениях - список есть на сайте МВД региона. Проверяют на ВИЧ, туберкулёз, инфекции, наркотики. Справки действительны 3 месяца. Стоимость - 3000-5000 рублей.',
      en: 'Medical exam for patent is done at authorized medical facilities - list is on regional Ministry of Internal Affairs website. Tests for HIV, tuberculosis, infections, drugs. Certificates valid for 3 months. Cost - 3000-5000 RUB.',
    },
    tags: ['медосмотр', 'патент', 'справка', 'medical', 'exam', 'patent'],
    legalReference: 'ФЗ-115, ст. 13.3',
  },
  {
    id: 'medical-002',
    category: 'medical',
    question: {
      ru: 'Нужна ли медицинская страховка мигранту?',
      en: 'Does a migrant need health insurance?',
    },
    answer: {
      ru: 'Да, полис ДМС обязателен для получения патента и пребывания в РФ свыше 90 дней. Минимальная сумма покрытия - 100 000 рублей. Полис ОМС могут получить только лица с РВП, ВНЖ или официально трудоустроенные.',
      en: 'Yes, voluntary health insurance (DMS) is mandatory for getting a patent and staying in Russia over 90 days. Minimum coverage - 100,000 RUB. Mandatory health insurance (OMS) is only available for those with RVP, VNJ, or officially employed.',
    },
    tags: ['страховка', 'дмс', 'омс', 'полис', 'insurance', 'medical'],
    legalReference: 'ФЗ-115, ст. 13.3',
  },
  {
    id: 'medical-003',
    category: 'medical',
    question: {
      ru: 'Куда обращаться при болезни?',
      en: 'Where to go when sick?',
    },
    answer: {
      ru: 'С полисом ДМС - в клиники по списку страховой компании (позвоните на горячую линию). Экстренная помощь бесплатна для всех - вызывайте скорую 103. С РВП/ВНЖ можно получить полис ОМС и посещать поликлиники бесплатно.',
      en: 'With DMS policy - to clinics listed by your insurance company (call hotline). Emergency care is free for everyone - call ambulance 103. With RVP/VNJ you can get OMS policy and visit clinics for free.',
    },
    tags: ['болезнь', 'врач', 'поликлиника', 'скорая', 'sick', 'doctor', 'clinic'],
  },
  {
    id: 'medical-004',
    category: 'medical',
    question: {
      ru: 'Какие прививки нужны для въезда в РФ?',
      en: 'What vaccinations are needed to enter Russia?',
    },
    answer: {
      ru: 'Обязательных прививок для въезда в РФ нет. Однако для оформления патента нужно пройти медосмотр на туберкулёз, ВИЧ, инфекции. Рекомендуется иметь прививки от кори, дифтерии, гепатита B.',
      en: 'There are no mandatory vaccinations to enter Russia. However, for a patent you need medical exams for tuberculosis, HIV, infections. Recommended vaccinations: measles, diphtheria, hepatitis B.',
    },
    tags: ['прививки', 'вакцинация', 'въезд', 'vaccination', 'entry', 'immunization'],
  },
  {
    id: 'medical-005',
    category: 'medical',
    question: {
      ru: 'Сколько стоит медосмотр?',
      en: 'How much does a medical exam cost?',
    },
    answer: {
      ru: 'Медосмотр для патента стоит 3000-5000 рублей в зависимости от региона и клиники. Включает: осмотр, анализы на ВИЧ, сифилис, туберкулёз (флюорография), справку от нарколога. Справки готовы за 1-3 дня.',
      en: 'Medical exam for patent costs 3000-5000 RUB depending on region and clinic. Includes: examination, tests for HIV, syphilis, tuberculosis (X-ray), drug specialist certificate. Results ready in 1-3 days.',
    },
    tags: ['медосмотр', 'стоимость', 'цена', 'medical', 'exam', 'cost', 'price'],
    legalReference: 'ФЗ-115, ст. 13.3',
  },

  // ============ SOS (5 questions) ============
  {
    id: 'sos-001',
    category: 'sos',
    question: {
      ru: 'Что делать при задержании полицией?',
      en: 'What to do if detained by police?',
    },
    answer: {
      ru: 'При задержании: сохраняйте спокойствие, предъявите документы, не подписывайте бумаги без понимания содержания, требуйте переводчика, запомните ФИО сотрудника и номер отделения. Позвоните в консульство своей страны или на горячую линию для мигрантов.',
      en: 'If detained: stay calm, show documents, do not sign papers without understanding, request interpreter, remember officer name and station number. Call your country consulate or migrant hotline.',
    },
    tags: ['задержание', 'полиция', 'права', 'detention', 'police', 'rights'],
    legalReference: 'КоАП РФ, ст. 27.3',
  },
  {
    id: 'sos-002',
    category: 'sos',
    question: {
      ru: 'Какие права у мигранта при проверке документов?',
      en: 'What rights do migrants have during document check?',
    },
    answer: {
      ru: 'При проверке документов вы имеете право: знать причину проверки, не отвечать на вопросы без переводчика, не давать показаний против себя, позвонить адвокату или в консульство. Полицейский обязан представиться и показать удостоверение.',
      en: 'During document check you have the right to: know the reason, not answer without interpreter, not testify against yourself, call a lawyer or consulate. Police must introduce themselves and show ID.',
    },
    tags: ['проверка', 'документы', 'права', 'полиция', 'check', 'documents', 'rights'],
    legalReference: 'ФЗ-3 "О полиции", ст. 5, 13',
  },
  {
    id: 'sos-003',
    category: 'sos',
    question: {
      ru: 'Что делать при утере паспорта?',
      en: 'What to do if passport is lost?',
    },
    answer: {
      ru: 'При утере паспорта: подайте заявление в полицию (получите талон-уведомление), обратитесь в консульство/посольство своей страны для получения нового паспорта или свидетельства на возвращение. Без документов выезд из РФ невозможен.',
      en: 'If passport is lost: file a police report (get notification receipt), contact your country consulate/embassy for new passport or return certificate. You cannot leave Russia without documents.',
    },
    tags: ['паспорт', 'утеря', 'потеря', 'консульство', 'passport', 'lost', 'consulate'],
  },
  {
    id: 'sos-004',
    category: 'sos',
    question: {
      ru: 'Куда звонить в экстренных случаях?',
      en: 'Who to call in emergencies?',
    },
    answer: {
      ru: 'Экстренные номера: 112 - единый номер экстренных служб, 103 - скорая помощь, 102 - полиция, 101 - пожарная. Горячая линия МВД по миграции: 8-800-222-74-47. Номер вашего консульства сохраните в телефоне заранее.',
      en: 'Emergency numbers: 112 - unified emergency, 103 - ambulance, 102 - police, 101 - fire. Ministry of Internal Affairs migration hotline: 8-800-222-74-47. Save your consulate number in phone in advance.',
    },
    tags: ['экстренный', 'звонок', 'номер', 'помощь', 'emergency', 'call', 'number', 'help'],
  },
  {
    id: 'sos-005',
    category: 'sos',
    question: {
      ru: 'Как избежать депортации?',
      en: 'How to avoid deportation?',
    },
    answer: {
      ru: 'Чтобы избежать депортации: соблюдайте сроки пребывания, вовремя оплачивайте патент, поддерживайте актуальную регистрацию, не работайте нелегально, не совершайте правонарушений. При угрозе депортации обратитесь к миграционному юристу.',
      en: 'To avoid deportation: follow stay periods, pay patent on time, keep registration current, do not work illegally, do not commit offenses. If facing deportation, consult a migration lawyer.',
    },
    tags: ['депортация', 'выдворение', 'избежать', 'deportation', 'avoid', 'expulsion'],
    legalReference: 'ФЗ-115, ст. 31, 34',
  },

  // ============ CITIZENSHIP (2 questions) ============
  {
    id: 'citizenship-001',
    category: 'citizenship',
    question: {
      ru: 'Как получить гражданство РФ?',
      en: 'How to get Russian citizenship?',
    },
    answer: {
      ru: 'Общий порядок: прожить 5 лет по ВНЖ, знать русский язык, иметь законный доход, отказаться от прежнего гражданства (с исключениями). Упрощённый порядок доступен для многих категорий: носители языка, супруги граждан РФ, родители детей-граждан и др.',
      en: 'General procedure: live 5 years with VNJ, know Russian, have legal income, renounce previous citizenship (with exceptions). Simplified procedure available for many categories: native speakers, spouses of Russian citizens, parents of citizen children, etc.',
    },
    tags: ['гражданство', 'получение', 'паспорт', 'citizenship', 'passport', 'application'],
    legalReference: 'ФЗ-62 "О гражданстве РФ"',
  },
  {
    id: 'citizenship-002',
    category: 'citizenship',
    question: {
      ru: 'Кто имеет право на упрощённое гражданство?',
      en: 'Who is eligible for simplified citizenship?',
    },
    answer: {
      ru: 'Упрощённое гражданство доступно: носителям русского языка, супругам граждан РФ (3+ года брака), родителям совершеннолетних детей-граждан РФ, родившимся в СССР/РСФСР, выпускникам российских вузов, участникам программы переселения, гражданам ДНР/ЛНР и Украины.',
      en: 'Simplified citizenship available for: native Russian speakers, spouses of Russian citizens (3+ years marriage), parents of adult Russian citizen children, those born in USSR/RSFSR, Russian university graduates, resettlement program participants, citizens of DNR/LNR and Ukraine.',
    },
    tags: ['гражданство', 'упрощённое', 'основания', 'citizenship', 'simplified', 'grounds'],
    legalReference: 'ФЗ-62, ст. 14',
  },
];

/**
 * Total count of knowledge items
 */
export const KNOWLEDGE_COUNT = KNOWLEDGE_BASE.length;
