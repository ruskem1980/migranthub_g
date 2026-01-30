'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useLanguageStore, Language } from '@/lib/stores/languageStore';

type LocalizedText = Record<Language, string>;

interface FAQItem {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
  category: string;
}

const faqData: FAQItem[] = [
  // ПАТЕНТ (Patent)
  {
    id: '1',
    category: 'patent',
    question: {
      ru: 'Как получить патент на работу?',
      en: 'How to get a work patent?',
      uz: 'Ish patentini qanday olish mumkin?',
      tg: 'Чӣ тавр патенти корӣ гирифтан мумкин аст?',
      ky: 'Эмгек патентин кантип алса болот?',
    },
    answer: {
      ru: 'Для получения патента необходимо: 1) Встать на миграционный учет в течение 7 дней после въезда; 2) Оформить медицинские справки; 3) Сдать экзамен по русскому языку, истории и основам законодательства; 4) Подать документы в территориальное подразделение МВД; 5) Оплатить авансовый платеж НДФЛ. Срок оформления — до 10 рабочих дней.',
      en: 'To get a work patent: 1) Register for migration registration within 7 days after entry; 2) Get medical certificates; 3) Pass the exam in Russian language, history and basics of legislation; 4) Submit documents to the territorial division of the Ministry of Internal Affairs; 5) Pay the advance income tax payment. Processing time is up to 10 business days.',
      uz: 'Patent olish uchun: 1) Kirishdan keyin 7 kun ichida migratsiya hisobiga turish; 2) Tibbiy maʼlumotnomalarni rasmiylashtirish; 3) Rus tili, tarix va qonunchilik asoslari boʻyicha imtihon topshirish; 4) Hujjatlarni IIV hududiy boʻlimasiga topshirish; 5) JSHDS boʻyicha avans toʻlovini amalga oshirish. Rasmiylashtirish muddati — 10 ish kunigacha.',
      tg: 'Барои гирифтани патент лозим аст: 1) Дар давоми 7 рӯз пас аз воридшавӣ ба ҳисоби муҳоҷиратӣ истодан; 2) Маълумотномаҳои тиббӣ гирифтан; 3) Имтиҳон аз забони русӣ, таърих ва асосҳои қонунгузорӣ супоридан; 4) Ҳуҷҷатҳоро ба шӯъбаи ҳудудии ВКД супоридан; 5) Пардохти пешакии АДШ пардохтан. Мӯҳлати расмиятсозӣ — то 10 рӯзи корӣ.',
      ky: 'Патент алуу үчүн: 1) Кирген күндөн 7 күндүн ичинде миграциялык эсепке туруу; 2) Медициналык маалымкат алуу; 3) Орус тили, тарых жана мыйзамдардын негиздери боюнча экзамен тапшыруу; 4) Документтерди ИИМдин аймактык бөлүмүнө тапшыруу; 5) ЖСМС боюнча алдын ала төлөм төлөө. Каттоо мөөнөтү — 10 жумуш күнүнө чейин.',
    },
  },
  {
    id: '2',
    category: 'patent',
    question: {
      ru: 'Сколько стоит патент?',
      en: 'How much does a patent cost?',
      uz: 'Patent qancha turadi?',
      tg: 'Патент чанд пул меистад?',
      ky: 'Патент канча турат?',
    },
    answer: {
      ru: 'Стоимость патента зависит от региона работы. Ежемесячный авансовый платеж НДФЛ варьируется от 4000 до 8000 рублей в зависимости от субъекта РФ. Дополнительно оплачиваются: госпошлина (около 3500 руб.), медосмотр, экзамен и полис ДМС.',
      en: 'The cost of a patent depends on the region of work. The monthly advance income tax payment varies from 4,000 to 8,000 rubles depending on the region. Additionally paid: state duty (about 3,500 rubles), medical examination, exam and voluntary health insurance policy.',
      uz: 'Patent narxi ish mintaqasiga bogʻliq. Oylik JSHDS avans toʻlovi mintaqaga qarab 4000 dan 8000 rublgacha. Qoʻshimcha toʻlanadi: davlat boji (taxminan 3500 rubl), tibbiy koʻrik, imtihon va IMD polisi.',
      tg: 'Нархи патент аз минтақаи кор вобаста аст. Пардохти ҳармоҳаи пешакии АДШ аз 4000 то 8000 рубл вобаста аз субъекти ФР. Илова пардохт мешавад: боҷи давлатӣ (тахминан 3500 рубл), муоинаи тиббӣ, имтиҳон ва полиси ИТИ.',
      ky: 'Патенттин баасы иштеген аймакка жараша болот. Айлык алдын ала ЖСМС төлөмү 4000дөн 8000 рублга чейин. Кошумча төлөнөт: мамлекеттик алым (болжол менен 3500 рубль), медициналык кароо, экзамен жана ЫТК полиси.',
    },
  },
  {
    id: '3',
    category: 'patent',
    question: {
      ru: 'Как продлить патент?',
      en: 'How to extend a patent?',
      uz: 'Patentni qanday uzaytirish mumkin?',
      tg: 'Патентро чӣ тавр дароз кардан мумкин?',
      ky: 'Патентти кантип узартса болот?',
    },
    answer: {
      ru: 'Патент продлевается автоматически при своевременной оплате авансового платежа НДФЛ. Важно: оплата должна быть произведена до окончания оплаченного периода. Максимальный срок действия патента — 12 месяцев, после чего необходимо оформить новый патент.',
      en: 'The patent is automatically extended upon timely payment of the advance income tax. Important: payment must be made before the end of the paid period. The maximum validity of the patent is 12 months, after which a new patent must be issued.',
      uz: 'Patent JSHDS avans toʻlovini oʻz vaqtida toʻlashda avtomatik uzaytiriladi. Muhim: toʻlov toʻlangan davr tugashidan oldin amalga oshirilishi kerak. Patentning maksimal amal qilish muddati — 12 oy, keyin yangi patent rasmiylashtirish kerak.',
      tg: 'Патент ҳангоми пардохти саривақтии пешакии АДШ худкор дароз карда мешавад. Муҳим: пардохт бояд то анҷоми давраи пардохтшуда анҷом дода шавад. Мӯҳлати максималии амали патент — 12 моҳ, пас аз он патенти нав гирифтан лозим.',
      ky: 'Патент ЖСМС алдын ала төлөмүн өз убагында төлөгөндө автоматтык түрдө узартылат. Маанилүү: төлөм төлөнгөн мезгил аяктаганга чейин жүргүзүлүшү керек. Патенттин максималдуу мөөнөтү — 12 ай, андан кийин жаңы патент алуу керек.',
    },
  },
  {
    id: '4',
    category: 'patent',
    question: {
      ru: 'Что будет, если просрочить оплату патента?',
      en: 'What happens if I miss a patent payment?',
      uz: 'Patent toʻlovini kechiktirsam nima boʻladi?',
      tg: 'Агар пардохти патентро дер кунам чӣ мешавад?',
      ky: 'Патент төлөмүн кечиктирсем эмне болот?',
    },
    answer: {
      ru: 'При просрочке оплаты даже на 1 день патент аннулируется. Вам придется выехать из России и въехать заново для оформления нового патента. Рекомендуем оплачивать патент заранее — за 3-5 дней до окончания оплаченного периода.',
      en: 'If payment is delayed even by 1 day, the patent is canceled. You will have to leave Russia and re-enter to apply for a new patent. We recommend paying for the patent in advance — 3-5 days before the end of the paid period.',
      uz: 'Toʻlov hatto 1 kunga kechiktirilsa ham patent bekor qilinadi. Rossiyadan chiqib, yangi patent rasmiylashtirish uchun qayta kirishingiz kerak boʻladi. Patentni oldindan — toʻlangan davr tugashidan 3-5 kun oldin toʻlashni tavsiya etamiz.',
      tg: 'Ҳангоми дер кардани пардохт ҳатто 1 рӯз патент бекор карда мешавад. Шумо бояд аз Русия баромада, барои гирифтани патенти нав аз нав ворид шавед. Мо тавсия медиҳем патентро пешакӣ — 3-5 рӯз пеш аз анҷоми давраи пардохтшуда пардохт кунед.',
      ky: 'Төлөм 1 күнгө болсо да кечиктирилсе, патент жокко чыгарылат. Россиядан чыгып, жаңы патент алуу үчүн кайра киришиңиз керек болот. Патентти алдын ала — төлөнгөн мезгил аяктаганга 3-5 күн калганда төлөөнү сунуштайбыз.',
    },
  },
  // РЕГИСТРАЦИЯ (Registration)
  {
    id: '6',
    category: 'registration',
    question: {
      ru: 'Что такое миграционный учет?',
      en: 'What is migration registration?',
      uz: 'Migratsiya hisobi nima?',
      tg: 'Ҳисоби муҳоҷиратӣ чист?',
      ky: 'Миграциялык эсеп деген эмне?',
    },
    answer: {
      ru: 'Миграционный учет — это уведомление государства о месте пребывания иностранного гражданина. Принимающая сторона (собственник жилья или работодатель) должна подать уведомление в течение 7 рабочих дней с даты въезда. Без регистрации невозможно оформить патент или другие документы.',
      en: 'Migration registration is notification to the state about the place of stay of a foreign citizen. The host party (property owner or employer) must submit a notification within 7 business days from the date of entry. Without registration, it is impossible to apply for a patent or other documents.',
      uz: 'Migratsiya hisobi — chet el fuqarosining turar joyi haqida davlatga xabar berish. Qabul qiluvchi tomon (uy-joy egasi yoki ish beruvchi) kirishdan keyin 7 ish kuni ichida xabarnoma topshirishi kerak. Roʻyxatga olishsiz patent yoki boshqa hujjatlarni rasmiylashtirish mumkin emas.',
      tg: 'Ҳисоби муҳоҷиратӣ — ин огоҳсозии давлат дар бораи ҷойи истиқомати шаҳрванди хориҷӣ. Тарафи қабулкунанда (соҳиби манзил ё корфармо) бояд дар давоми 7 рӯзи корӣ аз рӯзи воридшавӣ огоҳнома супорад. Бе бақайдгирӣ патент ё дигар ҳуҷҷатҳоро гирифтан имконнопазир аст.',
      ky: 'Миграциялык эсеп — чет өлкөлүк жарандын турган жери жөнүндө мамлекетти кабарлоо. Кабыл алуучу тарап (турак жай ээси же иш берүүчү) киргенден кийин 7 жумуш күндүн ичинде билдирме тапшырышы керек. Каттоосуз патент же башка документтерди алуу мүмкүн эмес.',
    },
  },
  {
    id: '7',
    category: 'registration',
    question: {
      ru: 'Как продлить регистрацию?',
      en: 'How to extend registration?',
      uz: 'Roʻyxatga olishni qanday uzaytirish mumkin?',
      tg: 'Бақайдгириро чӣ тавр дароз кардан мумкин?',
      ky: 'Каттоону кантип узартса болот?',
    },
    answer: {
      ru: 'Регистрация продлевается при наличии оснований для пребывания (действующий патент, РВП, ВНЖ). Принимающая сторона подает новое уведомление с приложением документов, подтверждающих основание продления. Продление возможно без выезда из страны.',
      en: 'Registration is extended if there are grounds for stay (valid patent, temporary residence permit, residence permit). The host party submits a new notification with documents confirming the grounds for extension. Extension is possible without leaving the country.',
      uz: 'Roʻyxatga olish turish uchun asoslar mavjud boʻlganda (amal qiluvchi patent, VYR, YOR) uzaytiriladi. Qabul qiluvchi tomon uzaytirish asosini tasdiqlovchi hujjatlar bilan yangi xabarnoma topshiradi. Uzaytirish mamlakatdan chiqmasdan mumkin.',
      tg: 'Бақайдгирӣ ҳангоми мавҷуд будани асосҳо барои будубош (патенти амалкунанда, ИМВ, ИДИ) дароз карда мешавад. Тарафи қабулкунанда огоҳномаи нав бо ҳуҷҷатҳои тасдиқкунандаи асоси дарозкунӣ месупорад. Дарозкунӣ бе баромадан аз кишвар имконпазир аст.',
      ky: 'Каттоо турууга негиз болсо (иштеп жаткан патент, УЖР, ТЖР) узартылат. Кабыл алуучу тарап узартуунун негизин тастыктаган документтер менен жаңы билдирме тапшырат. Өлкөдөн чыкпай туруп узартуу мүмкүн.',
    },
  },
  // ДОКУМЕНТЫ (Documents)
  {
    id: '13',
    category: 'documents',
    question: {
      ru: 'Какие документы нужны для работы в России?',
      en: 'What documents are needed to work in Russia?',
      uz: 'Rossiyada ishlash uchun qanday hujjatlar kerak?',
      tg: 'Барои кор дар Русия кадом ҳуҷҷатҳо лозиманд?',
      ky: 'Россияда иштөө үчүн кандай документтер керек?',
    },
    answer: {
      ru: 'Для легальной работы в России необходимы: 1) Паспорт с нотариально заверенным переводом; 2) Миграционная карта; 3) Регистрация по месту пребывания; 4) Патент на работу или разрешение на работу; 5) Полис ДМС; 6) ИНН (рекомендуется). Работодатель обязан уведомить МВД о заключении трудового договора.',
      en: 'For legal work in Russia you need: 1) Passport with notarized translation; 2) Migration card; 3) Registration at the place of stay; 4) Work patent or work permit; 5) Voluntary health insurance policy; 6) TIN (recommended). The employer must notify the Ministry of Internal Affairs about the conclusion of the employment contract.',
      uz: 'Rossiyada qonuniy ishlash uchun kerak: 1) Notarial tasdiqlangan tarjimasi bilan pasport; 2) Migratsiya kartasi; 3) Turar joy boʻyicha roʻyxatga olish; 4) Ish patenti yoki ish ruxsatnomasi; 5) IMD polisi; 6) STIR (tavsiya etiladi). Ish beruvchi mehnat shartnomasini tuzganligi haqida IIVni xabardor qilishi shart.',
      tg: 'Барои кори қонунӣ дар Русия лозим аст: 1) Паспорт бо тарҷумаи нотариалӣ; 2) Кортаи муҳоҷиратӣ; 3) Бақайдгирӣ аз рӯи ҷойи истиқомат; 4) Патенти корӣ ё иҷозатномаи кор; 5) Полиси ИТИ; 6) РМА (тавсия дода мешавад). Корфармо ӯҳдадор аст ба ВКД дар бораи бастани шартномаи меҳнатӣ хабар диҳад.',
      ky: 'Россияда мыйзамдуу иштөө үчүн керек: 1) Нотариалдык тастыкталган котормосу менен паспорт; 2) Миграциялык карта; 3) Турган жери боюнча каттоо; 4) Эмгек патенти же эмгек уруксаты; 5) ЫТК полиси; 6) СИН (сунушталат). Иш берүүчү эмгек келишимин түзгөнү жөнүндө ИИМге кабарлоого милдеттүү.',
    },
  },
  {
    id: '14',
    category: 'documents',
    question: {
      ru: 'Как получить ИНН?',
      en: 'How to get a TIN (INN)?',
      uz: 'STIRni qanday olish mumkin?',
      tg: 'РМА-ро чӣ тавр гирифтан мумкин?',
      ky: 'СИНди кантип алса болот?',
    },
    answer: {
      ru: 'Для получения ИНН обратитесь в налоговую инспекцию по месту регистрации с паспортом и его переводом. Также можно подать заявление через личный кабинет на сайте ФНС или через МФЦ. ИНН выдается бесплатно в течение 5 рабочих дней.',
      en: 'To get a TIN, contact the tax office at your place of registration with your passport and its translation. You can also submit an application through your personal account on the Federal Tax Service website or through the MFC. TIN is issued free of charge within 5 business days.',
      uz: 'STIR olish uchun roʻyxatga olingan joyingizdagi soliq inspeksiyasiga pasport va uning tarjimasi bilan murojaat qiling. Shuningdek, FSX saytidagi shaxsiy kabinet orqali yoki MFM orqali ariza topshirish mumkin. STIR 5 ish kuni ichida bepul beriladi.',
      tg: 'Барои гирифтани РМА ба инспексияи андоз аз рӯи ҷойи бақайдгирӣ бо паспорт ва тарҷумаи он муроҷиат кунед. Инчунин тавассути кабинети шахсӣ дар сайти ХАФ ё тавассути МФМ ариза супоридан мумкин аст. РМА дар давоми 5 рӯзи корӣ ройгон дода мешавад.',
      ky: 'СИН алуу үчүн каттоо жериңиздеги салык инспекциясына паспорт жана анын котормосу менен кайрылыңыз. Ошондой эле ФСКнын сайтындагы жеке кабинет аркылуу же КМБ аркылуу арыз берсе болот. СИН 5 жумуш күндүн ичинде акысыз берилет.',
    },
  },
  // ПРАВА (Rights)
  {
    id: '17',
    category: 'rights',
    question: {
      ru: 'Могу ли я сменить работодателя?',
      en: 'Can I change my employer?',
      uz: 'Ish beruvchini almashtirsam boʻladimi?',
      tg: 'Ман метавонам корфармоямро иваз кунам?',
      ky: 'Мен иш берүүчүмдү алмаштырсам болобу?',
    },
    answer: {
      ru: 'Да, патент дает право работать у любого работодателя в указанном регионе. При смене работы новый работодатель обязан уведомить МВД о заключении трудового договора в течение 3 рабочих дней. Вы также должны сообщить о расторжении договора с предыдущим работодателем.',
      en: 'Yes, the patent allows you to work for any employer in the specified region. When changing jobs, the new employer must notify the Ministry of Internal Affairs about the conclusion of the employment contract within 3 business days. You must also report the termination of the contract with the previous employer.',
      uz: 'Ha, patent koʻrsatilgan mintaqada istalgan ish beruvchida ishlash huquqini beradi. Ishni almashtirganda yangi ish beruvchi 3 ish kuni ichida mehnat shartnomasini tuzganligi haqida IIVni xabardor qilishi shart. Siz ham oldingi ish beruvchi bilan shartnomani bekor qilganingiz haqida xabar berishingiz kerak.',
      tg: 'Бале, патент ҳуқуқ медиҳад дар ҳар як корфармо дар минтақаи нишондодашуда кор кунед. Ҳангоми иваз кардани кор корфармои нав ӯҳдадор аст дар давоми 3 рӯзи корӣ ба ВКД дар бораи бастани шартномаи меҳнатӣ хабар диҳад. Шумо низ бояд дар бораи бекор кардани шартнома бо корфармои қаблӣ хабар диҳед.',
      ky: 'Ооба, патент көрсөтүлгөн аймакта каалаган иш берүүчүдө иштөөгө укук берет. Жумуш алмаштырганда жаңы иш берүүчү 3 жумуш күндүн ичинде эмгек келишимин түзгөнү жөнүндө ИИМге кабарлоого милдеттүү. Сиз да мурунку иш берүүчү менен келишимди бузганыңыз жөнүндө кабарлоого тийишсиз.',
    },
  },
  {
    id: '18',
    category: 'rights',
    question: {
      ru: 'Что делать, если работодатель не платит зарплату?',
      en: 'What to do if the employer does not pay wages?',
      uz: 'Ish beruvchi maosh toʻlamasa nima qilish kerak?',
      tg: 'Агар корфармо маош напардозад чӣ бояд кард?',
      ky: 'Иш берүүчү эмгек акы төлөбөсө эмне кылуу керек?',
    },
    answer: {
      ru: 'Если работодатель задерживает или не выплачивает зарплату: 1) Обратитесь в трудовую инспекцию с заявлением; 2) Подайте жалобу в прокуратуру; 3) Обратитесь в суд. Важно: сохраняйте все документы о работе (договор, расчетные листки, переписку). Ваш миграционный статус не влияет на право получить заработанные деньги.',
      en: 'If the employer delays or does not pay wages: 1) Contact the labor inspectorate with a statement; 2) File a complaint with the prosecutor office; 3) Go to court. Important: keep all work documents (contract, pay slips, correspondence). Your migration status does not affect your right to receive earned money.',
      uz: 'Agar ish beruvchi maoshni kechiktirsa yoki toʻlamasa: 1) Mehnat inspeksiyasiga ariza bilan murojaat qiling; 2) Prokuraturaga shikoyat yuboring; 3) Sudga murojaat qiling. Muhim: ish haqidagi barcha hujjatlarni saqlang (shartnoma, hisob-kitob varaqlari, yozishmalar). Sizning migratsiya maqomingiz topilgan pullarni olish huquqiga taʼsir qilmaydi.',
      tg: 'Агар корфармо маошро дер кунад ё напардозад: 1) Ба инспексияи меҳнат бо ариза муроҷиат кунед; 2) Ба прокуратура шикоят диҳед; 3) Ба суд муроҷиат кунед. Муҳим: ҳамаи ҳуҷҷатҳои корро нигоҳ доред (шартнома, варақаҳои ҳисобу китоб, мукотиба). Мақоми муҳоҷиратии шумо ба ҳуқуқи гирифтани пули кор кардаатон таъсир намерасонад.',
      ky: 'Эгерде иш берүүчү эмгек акыны кечиктирсе же төлөбөсө: 1) Эмгек инспекциясына арыз менен кайрылыңыз; 2) Прокуратурага даттаныңыз; 3) Сотко кайрылыңыз. Маанилүү: жумуш жөнүндө бардык документтерди сактаңыз (келишим, эсептөө баракчалары, кат алышуу). Сиздин миграциялык статусуңуз тапкан акчаңызды алуу укугуңузга таасир этпейт.',
    },
  },
  {
    id: '19',
    category: 'rights',
    question: {
      ru: 'Какие права есть у мигранта при проверке полицией?',
      en: 'What rights does a migrant have during police checks?',
      uz: 'Politsiya tekshiruvida migrantning qanday huquqlari bor?',
      tg: 'Муҳоҷир ҳангоми санҷиши полис чӣ ҳуқуқҳо дорад?',
      ky: 'Полиция текшерүүсүндө мигранттын кандай укуктары бар?',
    },
    answer: {
      ru: 'При проверке документов вы имеете право: 1) Попросить сотрудника представиться и показать удостоверение; 2) Узнать причину проверки; 3) Позвонить родственникам или адвокату; 4) Получить копию протокола; 5) Не подписывать документы, которые не понимаете. Носите с собой копии всех документов и контакт юриста.',
      en: 'During document checks you have the right to: 1) Ask the officer to introduce themselves and show ID; 2) Know the reason for the check; 3) Call relatives or a lawyer; 4) Receive a copy of the protocol; 5) Not sign documents you do not understand. Carry copies of all documents and a lawyer contact.',
      uz: 'Hujjatlarni tekshirishda sizning huquqlaringiz: 1) Xodimdan oʻzini tanishtirish va guvohnoma koʻrsatishni soʻrash; 2) Tekshiruv sababini bilish; 3) Qarindoshlarga yoki advokatga qoʻngʻiroq qilish; 4) Bayonnoma nusxasini olish; 5) Tushunmagan hujjatlarni imzolamaslik. Barcha hujjatlarning nusxalarini va advokat kontaktini oʻzingiz bilan olib yuring.',
      tg: 'Ҳангоми санҷиши ҳуҷҷатҳо шумо ҳуқуқ доред: 1) Аз кормандро хоҳиш кунед худро муаррифӣ кунад ва шаҳодатномаро нишон диҳад; 2) Сабаби санҷишро донед; 3) Ба хешовандон ё адвокат занг занед; 4) Нусхаи баённомаро гиред; 5) Ҳуҷҷатҳоеро, ки намефаҳмед, имзо накунед. Нусхаи ҳамаи ҳуҷҷатҳо ва контакти адвокатро бо худ доред.',
      ky: 'Документтерди текшерүүдө сиздин укугуңуз бар: 1) Кызматкерден өзүн тааныштырып, күбөлүгүн көрсөтүүнү суроо; 2) Текшерүүнүн себебин билүү; 3) Туугандарга же адвокатка чалуу; 4) Протоколдун көчүрмөсүн алуу; 5) Түшүнбөгөн документтерге кол коюуга макул болбоо. Бардык документтердин көчүрмөлөрүн жана адвокаттын байланышын алып жүрүңүз.',
    },
  },
  {
    id: '20',
    category: 'rights',
    question: {
      ru: 'Имею ли я право на медицинскую помощь?',
      en: 'Do I have the right to medical care?',
      uz: 'Men tibbiy yordamga huquqim bormi?',
      tg: 'Ман ҳуқуқ ба кӯмаки тиббӣ дорам?',
      ky: 'Мен медициналык жардам алууга укуктуумун?',
    },
    answer: {
      ru: 'Да! Экстренная медицинская помощь оказывается бесплатно всем, независимо от статуса. Для плановой помощи нужен полис ДМС (обязательный для патента) или платные услуги. С РВП/ВНЖ можно получить полис ОМС и обслуживаться в поликлиниках бесплатно. При беременности и родах — бесплатная помощь по ОМС.',
      en: 'Yes! Emergency medical care is provided free of charge to everyone, regardless of status. For scheduled care, you need a voluntary health insurance policy (mandatory for a patent) or paid services. With TRP/residence permit, you can get mandatory health insurance and receive free clinic services. Pregnancy and childbirth — free care under mandatory health insurance.',
      uz: 'Ha! Tez tibbiy yordam barcha uchun bepul koʻrsatiladi, maqomdan qatʼi nazar. Rejalashtirilgan yordam uchun IMD polisi (patent uchun majburiy) yoki pullik xizmatlar kerak. VYR/YOR bilan MTS polisini olish va poliklinikalarda bepul xizmat olish mumkin. Homiladorlik va tugʻrushda — MTS boʻyicha bepul yordam.',
      tg: 'Бале! Кӯмаки таъҷилии тиббӣ ба ҳама ройгон расонида мешавад, новобаста аз мақом. Барои кӯмаки нақшавӣ полиси ИТИ (барои патент ҳатмист) ё хизматҳои пулакӣ лозим. Бо ИМВ/ИДИ полиси СТҲ гирифтан ва дар поликлиникаҳо ройгон хизмат гирифтан мумкин. Ҳангоми ҳомиладорӣ ва таваллуд — кӯмаки ройгон аз рӯи СТҲ.',
      ky: 'Ооба! Шашылыш медициналык жардам бардыгына статусуна карабастан акысыз көрсөтүлөт. Пландаштырылган жардам үчүн ЫТК полиси (патент үчүн милдеттүү) же акылуу кызматтар керек. УЖР/ТЖР менен МКС полисун алып, поликлиникаларда акысыз кызмат алса болот. Кош болуу жана төрөт — МКС боюнча акысыз жардам.',
    },
  },
];

const categories = [
  { id: 'all', label: { ru: 'Все', en: 'All', uz: 'Barchasi', tg: 'Ҳама', ky: 'Баары' } },
  { id: 'patent', label: { ru: 'Патент', en: 'Patent', uz: 'Patent', tg: 'Патент', ky: 'Патент' } },
  { id: 'registration', label: { ru: 'Регистрация', en: 'Registration', uz: 'Roʻyxat', tg: 'Бақайдгирӣ', ky: 'Каттоо' } },
  { id: 'documents', label: { ru: 'Документы', en: 'Documents', uz: 'Hujjatlar', tg: 'Ҳуҷҷатҳо', ky: 'Документтер' } },
  { id: 'rights', label: { ru: 'Права', en: 'Rights', uz: 'Huquqlar', tg: 'Ҳуқуқҳо', ky: 'Укуктар' } },
];

const uiText: Record<string, LocalizedText> = {
  title: {
    ru: 'Частые вопросы',
    en: 'FAQ',
    uz: 'Tez-tez soʻraladigan savollar',
    tg: 'Саволҳои зуд-зуд пурсидашаванда',
    ky: 'Көп берилүүчү суроолор',
  },
  searchPlaceholder: {
    ru: 'Поиск по вопросам...',
    en: 'Search questions...',
    uz: 'Savollarni qidirish...',
    tg: 'Ҷустуҷӯи саволҳо...',
    ky: 'Суроолорду издөө...',
  },
  noResults: {
    ru: 'Вопросы не найдены',
    en: 'No questions found',
    uz: 'Savollar topilmadi',
    tg: 'Саволҳо ёфт нашуданд',
    ky: 'Суроолор табылган жок',
  },
  questionsCount: {
    ru: 'вопросов',
    en: 'questions',
    uz: 'savol',
    tg: 'савол',
    ky: 'суроо',
  },
};

export default function FAQPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQ = useMemo(() => {
    return faqData.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === '' ||
        item.question[language].toLowerCase().includes(searchLower) ||
        item.answer[language].toLowerCase().includes(searchLower);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, language]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{uiText.title[language]}</h1>
              <p className="text-xs text-sky-100">
                {faqData.length} {uiText.questionsCount[language]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={uiText.searchPlaceholder[language]}
            className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-sky-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat.label[language]}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="px-4 pb-4">
        {filteredFAQ.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">{uiText.noResults[language]}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFAQ.map((item) => (
              <div
                key={item.id}
                className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">
                    {item.question[language]}
                  </span>
                  {expandedId === item.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {expandedId === item.id && (
                  <div className="px-4 pb-4 pt-0">
                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                        {item.answer[language]}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
