'use client';

import { useState, useMemo } from 'react';
import { X, HelpCircle, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useLanguageStore, Language } from '@/lib/stores/languageStore';

interface FAQModalProps {
  onClose: () => void;
}

export type LocalizedText = Record<Language, string>;

export interface FAQItem {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
  category: string;
}

// Export for reuse in /faq page
export const faqData: FAQItem[] = [
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
  {
    id: '5',
    category: 'patent',
    question: {
      ru: 'Можно ли работать в другом регионе с патентом?',
      en: 'Can I work in another region with a patent?',
      uz: 'Patent bilan boshqa mintaqada ishlash mumkinmi?',
      tg: 'Бо патент дар минтақаи дигар кор кардан мумкин аст?',
      ky: 'Патент менен башка аймакта иштесе болобу?',
    },
    answer: {
      ru: 'Нет, патент действует только в том регионе, где он выдан. Для работы в другом регионе необходимо оформить новый патент. Исключение: для Москвы и Московской области нужны разные патенты, но вы можете оформить оба.',
      en: 'No, the patent is only valid in the region where it was issued. To work in another region, you need to get a new patent. Exception: Moscow and Moscow Region require different patents, but you can apply for both.',
      uz: 'Yoʻq, patent faqat berilgan mintaqada amal qiladi. Boshqa mintaqada ishlash uchun yangi patent rasmiylashtirish kerak. Istisno: Moskva va Moskva viloyati uchun turli patentlar kerak, lekin ikkalasini ham rasmiylashtirish mumkin.',
      tg: 'Не, патент танҳо дар минтақае, ки дар он дода шудааст, амал мекунад. Барои кор дар минтақаи дигар патенти нав гирифтан лозим. Истисно: барои Маскав ва вилояти Маскав патентҳои гуногун лозиманд, аммо шумо метавонед ҳарду ро гиред.',
      ky: 'Жок, патент берилген аймакта гана иштейт. Башка аймакта иштөө үчүн жаңы патент алуу керек. Өзгөчөлүк: Москва жана Москва облусу үчүн ар башка патент керек, бирок экөөнү тең алса болот.',
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
  {
    id: '8',
    category: 'registration',
    question: {
      ru: 'Что делать, если хозяин квартиры отказывается ставить на учет?',
      en: 'What to do if the landlord refuses to register me?',
      uz: 'Kvartira egasi roʻyxatga olishdan bosh tortsa nima qilish kerak?',
      tg: 'Агар соҳиби квартира аз ба ҳисоб гузоштан даст кашад чӣ бояд кард?',
      ky: 'Батирдин ээси эсепке алуудан баш тартса эмне кылуу керек?',
    },
    answer: {
      ru: 'По закону принимающая сторона обязана поставить вас на миграционный учет. Если арендодатель отказывается: 1) Предложите обратиться в МФЦ вместе; 2) Обратитесь к работодателю — он тоже может быть принимающей стороной; 3) Если есть договор аренды, вы можете обратиться в МВД самостоятельно. Работа без регистрации — нарушение для обеих сторон.',
      en: 'By law, the host party is obligated to register you for migration registration. If the landlord refuses: 1) Offer to go to the MFC together; 2) Contact your employer — they can also be the host party; 3) If you have a rental agreement, you can contact the Ministry of Internal Affairs yourself. Working without registration is a violation for both parties.',
      uz: 'Qonunga koʻra qabul qiluvchi tomon sizni migratsiya hisobiga qoʻyishi shart. Agar ijaraga beruvchi rad etsa: 1) Birga MFMga murojaat qilishni taklif qiling; 2) Ish beruvchiga murojaat qiling — u ham qabul qiluvchi tomon boʻlishi mumkin; 3) Ijara shartnomasi boʻlsa, IIVga mustaqil murojaat qilishingiz mumkin. Roʻyxatga olishsiz ishlash — har ikki tomon uchun qonun buzilishi.',
      tg: 'Мувофиқи қонун тарафи қабулкунанда ӯҳдадор аст шуморо ба ҳисоби муҳоҷиратӣ гузорад. Агар иҷорадиҳанда даст кашад: 1) Пешниҳод кунед якҷоя ба МФМ муроҷиат кунед; 2) Ба корфармо муроҷиат кунед — ӯ низ метавонад тарафи қабулкунанда бошад; 3) Агар шартномаи иҷора бошад, шумо метавонед ба ВКД мустақилона муроҷиат кунед. Кор бе бақайдгирӣ — вайронкунӣ барои ҳарду тараф.',
      ky: 'Мыйзам боюнча кабыл алуучу тарап сизди миграциялык эсепке алууга милдеттүү. Эгерде ижарага берүүчү баш тартса: 1) Бирге КМБга кайрылууну сунуштаңыз; 2) Иш берүүчүгө кайрылыңыз — ал да кабыл алуучу тарап боло алат; 3) Ижара келишими болсо, ИИМге өз алдыңызча кайрыла аласыз. Каттоосуз иштөө — эки тарап үчүн тең мыйзам бузуу.',
    },
  },
  // РВП (Temporary Residence Permit)
  {
    id: '9',
    category: 'rvp',
    question: {
      ru: 'Что такое РВП и зачем оно нужно?',
      en: 'What is a temporary residence permit (TRP) and why is it needed?',
      uz: 'VYR nima va u nima uchun kerak?',
      tg: 'ИМВ чист ва барои чӣ лозим аст?',
      ky: 'УЖР деген эмне жана ал эмне үчүн керек?',
    },
    answer: {
      ru: 'РВП (Разрешение на временное проживание) — статус, позволяющий легально жить и работать в России без патента в течение 3 лет. С РВП можно: работать без патента, получать полис ОМС, оформлять кредиты, подать на ВНЖ через год. РВП выдается с привязкой к определенному региону.',
      en: 'TRP (Temporary Residence Permit) is a status that allows you to legally live and work in Russia without a patent for 3 years. With TRP you can: work without a patent, get mandatory health insurance, apply for loans, apply for a residence permit after one year. TRP is tied to a specific region.',
      uz: 'VYR (Vaqtinchalik yashash ruxsatnomasi) — Rossiyada 3 yil davomida patentsiz qonuniy yashash va ishlash imkonini beruvchi maqom. VYR bilan: patentsiz ishlash, MTS polisini olish, kredit rasmiylashtirish, bir yildan keyin YORga ariza berish mumkin. VYR maʼlum mintaqaga bogʻlangan holda beriladi.',
      tg: 'ИМВ (Иҷозатномаи муваққатии истиқомат) — мақоме, ки имконият медиҳад 3 сол бе патент дар Русия қонунӣ зиндагӣ ва кор кунед. Бо ИМВ: бе патент кор кардан, полиси СТҲ гирифтан, қарз расмӣ кардан, пас аз як сол ба ИДИ ариза додан мумкин аст. ИМВ ба минтақаи муайян вобаста дода мешавад.',
      ky: 'УЖР (Убактылуу жашоого уруксат) — Россияда 3 жыл патентсиз мыйзамдуу жашоого жана иштөөгө мүмкүндүк берген статус. УЖР менен: патентсиз иштөө, МКС полисин алуу, кредит алуу, бир жылдан кийин ТЖРга арыз берүү мүмкүн. УЖР белгилүү аймакка байланышкан берилет.',
    },
  },
  {
    id: '10',
    category: 'rvp',
    question: {
      ru: 'Какие документы нужны для получения РВП?',
      en: 'What documents are needed to get a TRP?',
      uz: 'VYR olish uchun qanday hujjatlar kerak?',
      tg: 'Барои гирифтани ИМВ кадом ҳуҷҷатҳо лозиманд?',
      ky: 'УЖР алуу үчүн кандай документтер керек?',
    },
    answer: {
      ru: 'Для РВП нужны: 1) Заявление (2 экземпляра); 2) Фото 35×45 мм (2 шт.); 3) Паспорт с переводом; 4) Миграционная карта; 5) Медицинские сертификаты (ВИЧ, туберкулез, наркология); 6) Сертификат о владении русским языком; 7) Документ об оплате госпошлины (1600 руб.). При наличии оснований — документы, подтверждающие право на РВП без квоты.',
      en: 'For TRP you need: 1) Application (2 copies); 2) Photo 35×45 mm (2 pcs); 3) Passport with translation; 4) Migration card; 5) Medical certificates (HIV, tuberculosis, narcology); 6) Russian language proficiency certificate; 7) State duty payment document (1600 rubles). If there are grounds — documents confirming the right to TRP without quota.',
      uz: 'VYR uchun kerak: 1) Ariza (2 nusxa); 2) Foto 35×45 mm (2 dona); 3) Pasport tarjimasi bilan; 4) Migratsiya kartasi; 5) Tibbiy sertifikatlar (OIV, sil, narkologiya); 6) Rus tilini bilish sertifikati; 7) Davlat boji toʻlovi hujjati (1600 rubl). Asoslar mavjud boʻlsa — kvotasiz VYR olish huquqini tasdiqlovchi hujjatlar.',
      tg: 'Барои ИМВ лозим: 1) Ариза (2 нусха); 2) Акс 35×45 мм (2 дона); 3) Паспорт бо тарҷума; 4) Кортаи муҳоҷиратӣ; 5) Сертификатҳои тиббӣ (ВИО, сил, наркология); 6) Сертификати донистани забони русӣ; 7) Ҳуҷҷати пардохти боҷи давлатӣ (1600 рубл). Ҳангоми мавҷуд будани асосҳо — ҳуҷҷатҳои тасдиқкунандаи ҳуқуқ ба ИМВ бе квота.',
      ky: 'УЖР үчүн керек: 1) Арыз (2 нуска); 2) Сүрөт 35×45 мм (2 даана); 3) Паспорт котормосу менен; 4) Миграциялык карта; 5) Медициналык сертификаттар (ВИЧ, кургак учук, наркология); 6) Орус тилин билүү сертификаты; 7) Мамлекеттик алым төлөгөн документ (1600 рубль). Негиздер болсо — квотасыз УЖР алуу укугун тастыктаган документтер.',
    },
  },
  {
    id: '11',
    category: 'rvp',
    question: {
      ru: 'Что такое квота на РВП?',
      en: 'What is a TRP quota?',
      uz: 'VYR kvotasi nima?',
      tg: 'Квотаи ИМВ чист?',
      ky: 'УЖР квотасы деген эмне?',
    },
    answer: {
      ru: 'Квота — это ограниченное количество РВП, которое государство выделяет на год для каждого региона. Квоты распределяются в начале года и быстро заканчиваются в популярных регионах. Некоторые категории граждан могут получить РВП без квоты: рожденные в РСФСР/РФ, имеющие нетрудоспособного родителя-гражданина РФ, состоящие в браке с гражданином РФ и другие.',
      en: 'A quota is a limited number of TRPs that the state allocates per year for each region. Quotas are distributed at the beginning of the year and quickly run out in popular regions. Some categories of citizens can get TRP without a quota: born in RSFSR/RF, having a disabled RF citizen parent, married to an RF citizen, and others.',
      uz: 'Kvota — davlat har yil har bir mintaqa uchun ajratadigan cheklangan VYR soni. Kvotalar yil boshida taqsimlanadi va mashhur mintaqalarda tez tugaydi. Baʼzi toifadagi fuqarolar kvotasiz VYR olishi mumkin: RSFSRda/RFda tugʻilganlar, mehnatga layoqatsiz RF fuqarosi ota-onasi borlar, RF fuqarosi bilan nikohda boʻlganlar va boshqalar.',
      tg: 'Квота — ин миқдори маҳдуди ИМВ, ки давлат ҳар сол барои ҳар як минтақа ҷудо мекунад. Квотаҳо дар аввали сол тақсим мешаванд ва дар минтақаҳои маъмул зуд тамом мешаванд. Баъзе категорияҳои шаҳрвандон метавонанд бе квота ИМВ гиранд: дар ҶШСС/ФР таваллудшудагон, волидайни маъюби шаҳрванди ФР дошта, бо шаҳрванди ФР оиладор ва дигарон.',
      ky: 'Квота — мамлекет жыл сайын ар бир аймак үчүн бөлүп берген чектелген УЖР саны. Квоталар жыл башында бөлүштүрүлөт жана популярдуу аймактарда тез түгөнөт. Кээ бир категориядагы жарандар квотасыз УЖР алышы мүмкүн: РСФСР/РФда төрөлгөндөр, эмгекке жарамсыз РФ жараны ата-энеси бар, РФ жараны менен нике кургандар жана башкалар.',
    },
  },
  {
    id: '12',
    category: 'rvp',
    question: {
      ru: 'Как долго рассматривается заявление на РВП?',
      en: 'How long does it take to process a TRP application?',
      uz: 'VYR uchun ariza qancha vaqt koʻrib chiqiladi?',
      tg: 'Ариза барои ИМВ чанд вақт баррасӣ мешавад?',
      ky: 'УЖР арызы канча убакытта каралат?',
    },
    answer: {
      ru: 'Срок рассмотрения заявления на РВП — до 4 месяцев для граждан визовых стран и до 60 дней для граждан стран СНГ (безвизовый режим). В течение этого времени проводятся проверки по базам данных. Результат можно отслеживать на сайте МВД или через Госуслуги.',
      en: 'The TRP application processing time is up to 4 months for citizens of visa countries and up to 60 days for CIS citizens (visa-free regime). During this time, database checks are conducted. The result can be tracked on the Ministry of Internal Affairs website or through Government Services.',
      uz: 'VYR uchun ariza koʻrib chiqish muddati — vizali mamlakatlar fuqarolari uchun 4 oygacha va MDH mamlakatlari fuqarolari uchun (vizasiz rejim) 60 kungacha. Bu vaqt ichida maʼlumotlar bazalari boʻyicha tekshiruvlar oʻtkaziladi. Natijani IIV saytida yoki Davlat xizmatlari orqali kuzatish mumkin.',
      tg: 'Мӯҳлати баррасии ариза барои ИМВ — то 4 моҳ барои шаҳрвандони кишварҳои визавӣ ва то 60 рӯз барои шаҳрвандони кишварҳои ИДМ (тартиби бевиза). Дар ин муддат санҷишҳо аз рӯи пойгоҳи маълумот гузаронида мешаванд. Натиҷаро дар сайти ВКД ё тавассути Хадамоти давлатӣ пайгирӣ кардан мумкин.',
      ky: 'УЖР арызын кароо мөөнөтү — виза талап кылган өлкөлөрдүн жарандары үчүн 4 айга чейин жана КМШ өлкөлөрүнүн жарандары үчүн (визасыз тартип) 60 күнгө чейин. Бул убакыт ичинде маалымат базалары боюнча текшерүүлөр жүргүзүлөт. Натыйжаны ИИМ сайтынан же Мамлекеттик кызматтар аркылуу көзөмөлдөсө болот.',
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
  {
    id: '15',
    category: 'documents',
    question: {
      ru: 'Нужен ли нотариальный перевод паспорта?',
      en: 'Do I need a notarized passport translation?',
      uz: 'Pasportning notarial tarjimasi kerakmi?',
      tg: 'Тарҷумаи нотариалии паспорт лозим аст?',
      ky: 'Паспорттун нотариалдык котормосу керекпи?',
    },
    answer: {
      ru: 'Да, нотариально заверенный перевод паспорта обязателен для большинства процедур: оформления патента, РВП, трудоустройства, открытия банковского счета. Перевод делается в бюро переводов, затем заверяется у нотариуса. Стоимость — от 1000 до 2000 рублей. Перевод действителен, пока действителен паспорт.',
      en: 'Yes, a notarized passport translation is required for most procedures: obtaining a patent, TRP, employment, opening a bank account. The translation is done at a translation agency, then certified by a notary. Cost — from 1000 to 2000 rubles. The translation is valid as long as the passport is valid.',
      uz: 'Ha, pasportning notarial tasdiqlangan tarjimasi koʻpchilik protseduralar uchun majburiy: patent, VYR rasmiylashtirish, ishga joylashish, bank hisobi ochish. Tarjima tarjima byurosida qilinadi, keyin notariusda tasdiqlanadi. Narxi — 1000 dan 2000 rublgacha. Tarjima pasport amal qilguncha amal qiladi.',
      tg: 'Бале, тарҷумаи нотариалии паспорт барои аксари расмиятҳо ҳатмист: гирифтани патент, ИМВ, ба кор ҷойгиршавӣ, кушодани ҳисоби бонкӣ. Тарҷума дар бюрои тарҷума карда мешавад, сипас аз ҷониби нотариус тасдиқ карда мешавад. Нарх — аз 1000 то 2000 рубл. Тарҷума то он вақте амал мекунад, ки паспорт эътибор дорад.',
      ky: 'Ооба, паспорттун нотариалдык тастыкталган котормосу көпчүлүк жол-жоболор үчүн милдеттүү: патент, УЖР алуу, жумушка орношуу, банк эсебин ачуу. Котормо которуу бюросунда жасалат, андан кийин нотариуста тастыкталат. Баасы — 1000дөн 2000 рублга чейин. Котормо паспорт иштегенге чейин жарактуу.',
    },
  },
  {
    id: '16',
    category: 'documents',
    question: {
      ru: 'Что такое миграционная карта и как её заполнить?',
      en: 'What is a migration card and how to fill it out?',
      uz: 'Migratsiya kartasi nima va uni qanday toʻldirish kerak?',
      tg: 'Кортаи муҳоҷиратӣ чист ва онро чӣ тавр пур кардан лозим?',
      ky: 'Миграциялык карта деген эмне жана аны кантип толтуруу керек?',
    },
    answer: {
      ru: 'Миграционная карта — документ, который заполняется при въезде в Россию. В ней указываются: ФИО, дата рождения, пол, гражданство, номер паспорта, цель визита (обязательно «работа» для оформления патента), срок пребывания. Карта состоит из двух частей — въездную забирают на границе, выездную храните до выезда из страны.',
      en: 'A migration card is a document filled out upon entry to Russia. It specifies: full name, date of birth, gender, citizenship, passport number, purpose of visit (must be "work" to apply for a patent), duration of stay. The card consists of two parts — the entry part is taken at the border, keep the exit part until you leave the country.',
      uz: 'Migratsiya kartasi — Rossiyaga kirishda toʻldiriladigan hujjat. Unda koʻrsatiladi: FISh, tugʻilgan sana, jinsi, fuqaroligi, pasport raqami, tashrif maqsadi (patent rasmiylashtirish uchun albatta «ish»), turish muddati. Karta ikki qismdan iborat — kirishni chegarada olib qoʻyishadi, chiqishni mamlakatdan chiqquningizgacha saqlang.',
      tg: 'Кортаи муҳоҷиратӣ — ҳуҷҷате, ки ҳангоми воридшавӣ ба Русия пур карда мешавад. Дар он нишон дода мешавад: НОП, санаи таваллуд, ҷинс, шаҳрвандӣ, рақами паспорт, мақсади сафар (барои гирифтани патент ҳатман «кор»), мӯҳлати истиқомат. Корт аз ду қисм иборат аст — воридотро дар сарҳад мегиранд, содиротро то вақти баромадан аз кишвар нигоҳ доред.',
      ky: 'Миграциялык карта — Россияга киргенде толтурулуучу документ. Анда көрсөтүлөт: АЖА, туулган күнү, жынысы, жарандыгы, паспорт номери, келүү максаты (патент алуу үчүн сөзсүз «иш»), туруу мөөнөтү. Карта эки бөлүктөн турат — кирүү бөлүгүн чек арада алышат, чыгуу бөлүгүн өлкөдөн чыкканга чейин сактаңыз.',
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
  {
    id: '21',
    category: 'rights',
    question: {
      ru: 'Что делать, если потерял документы?',
      en: 'What to do if I lost my documents?',
      uz: 'Hujjatlarni yoʻqotib qoʻysam nima qilish kerak?',
      tg: 'Агар ҳуҷҷатҳоямро гум карда бошам чӣ бояд кард?',
      ky: 'Документтеримди жоготуп алсам эмне кылуу керек?',
    },
    answer: {
      ru: 'При утере документов: 1) Паспорт — обратитесь в консульство своей страны; 2) Миграционная карта — обратитесь в МВД для получения дубликата; 3) Патент — подайте заявление в МВД о выдаче дубликата (госпошлина 1000 руб.); 4) Регистрация — принимающая сторона подает новое уведомление. Рекомендуем хранить копии всех документов в телефоне и облаке.',
      en: 'If documents are lost: 1) Passport — contact your country consulate; 2) Migration card — contact the Ministry of Internal Affairs for a duplicate; 3) Patent — submit an application to the Ministry of Internal Affairs for a duplicate (state duty 1000 rubles); 4) Registration — the host party submits a new notification. We recommend keeping copies of all documents on your phone and in the cloud.',
      uz: 'Hujjatlar yoʻqolsa: 1) Pasport — oʻz mamlakatingiz konsulligiga murojaat qiling; 2) Migratsiya kartasi — dublikat olish uchun IIVga murojaat qiling; 3) Patent — dublikat berish haqida IIVga ariza bering (davlat boji 1000 rubl); 4) Roʻyxatga olish — qabul qiluvchi tomon yangi xabarnoma topshiradi. Barcha hujjatlarning nusxalarini telefon va bulutda saqlashni tavsiya etamiz.',
      tg: 'Агар ҳуҷҷатҳо гум шаванд: 1) Паспорт — ба консулгарии кишвари худ муроҷиат кунед; 2) Кортаи муҳоҷиратӣ — барои гирифтани дубликат ба ВКД муроҷиат кунед; 3) Патент — ба ВКД ариза диҳед барои гирифтани дубликат (боҷи давлатӣ 1000 рубл); 4) Бақайдгирӣ — тарафи қабулкунанда огоҳномаи нав месупорад. Мо тавсия медиҳем нусхаи ҳамаи ҳуҷҷатҳоро дар телефон ва дар облак нигоҳ доред.',
      ky: 'Документтер жоголсо: 1) Паспорт — өз өлкөңүздүн консулдугуна кайрылыңыз; 2) Миграциялык карта — дубликат алуу үчүн ИИМге кайрылыңыз; 3) Патент — дубликат берүү жөнүндө ИИМге арыз бериңиз (мамлекеттик алым 1000 рубль); 4) Каттоо — кабыл алуучу тарап жаңы билдирме тапшырат. Бардык документтердин көчүрмөлөрүн телефонуңузда жана булутта сактоону сунуштайбыз.',
    },
  },
  {
    id: '22',
    category: 'rights',
    question: {
      ru: 'Могу ли я привезти семью в Россию?',
      en: 'Can I bring my family to Russia?',
      uz: 'Oilamni Rossiyaga olib kelishim mumkinmi?',
      tg: 'Ман метавонам оилаамро ба Русия орам?',
      ky: 'Үй-бүлөмдү Россияга алып келсем болобу?',
    },
    answer: {
      ru: 'Да, но условия зависят от вашего статуса: 1) По патенту — семья может въехать как туристы (до 90 дней), затем нужно оформить патент или РВП; 2) С РВП — супруг(а) и дети могут получить РВП без квоты как члены семьи; 3) С ВНЖ — семья может подать на ВНЖ. Дети до 18 лет получают статус вместе с родителями.',
      en: 'Yes, but conditions depend on your status: 1) With a patent — family can enter as tourists (up to 90 days), then need to get a patent or TRP; 2) With TRP — spouse and children can get TRP without quota as family members; 3) With residence permit — family can apply for residence permit. Children under 18 receive status together with parents.',
      uz: 'Ha, lekin shartlar sizning maqomingizga bogʻliq: 1) Patent bilan — oila turistlar sifatida kirishi mumkin (90 kungacha), keyin patent yoki VYR rasmiylashtirish kerak; 2) VYR bilan — turmush oʻrtogʻi va bolalar oila aʼzolari sifatida kvotasiz VYR olishi mumkin; 3) YOR bilan — oila YORga ariza berishi mumkin. 18 yoshgacha bolalar ota-onalari bilan birga maqom oladi.',
      tg: 'Бале, аммо шартҳо аз мақоми шумо вобастаанд: 1) Бо патент — оила метавонад ҳамчун сайёҳон ворид шавад (то 90 рӯз), пас бояд патент ё ИМВ гиранд; 2) Бо ИМВ — зану шавҳар ва фарзандон метавонанд ҳамчун аъзои оила бе квота ИМВ гиранд; 3) Бо ИДИ — оила метавонад барои ИДИ ариза диҳад. Кӯдакони то 18-сола мақомро якҷоя бо волидон мегиранд.',
      ky: 'Ооба, бирок шарттар сиздин статусуңузга жараша: 1) Патент менен — үй-бүлө турист катары кире алат (90 күнгө чейин), андан кийин патент же УЖР алуу керек; 2) УЖР менен — жубайы жана балдары үй-бүлө мүчөлөрү катары квотасыз УЖР ала алышат; 3) ТЖР менен — үй-бүлө ТЖРга арыз бере алат. 18 жашка чейинки балдар ата-энелери менен бирге статус алышат.',
    },
  },
];

export const faqCategories = [
  { id: 'all', label: { ru: 'Все', en: 'All', uz: 'Barchasi', tg: 'Ҳама', ky: 'Баары' } },
  { id: 'patent', label: { ru: 'Патент', en: 'Patent', uz: 'Patent', tg: 'Патент', ky: 'Патент' } },
  { id: 'rvp', label: { ru: 'РВП', en: 'TRP', uz: 'VYR', tg: 'ИМВ', ky: 'УЖР' } },
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
  subtitle: {
    ru: 'Ответы на популярные вопросы',
    en: 'Answers to common questions',
    uz: 'Ommabop savollarga javoblar',
    tg: 'Ҷавобҳо ба саволҳои маъмул',
    ky: 'Популярдуу суроолорго жооптор',
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
  close: {
    ru: 'Закрыть',
    en: 'Close',
    uz: 'Yopish',
    tg: 'Пӯшидан',
    ky: 'Жабуу',
  },
  questionsCount: {
    ru: 'вопросов',
    en: 'questions',
    uz: 'savol',
    tg: 'савол',
    ky: 'суроо',
  },
};

export function FAQModal({ onClose }: FAQModalProps) {
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-sky-500 to-sky-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{uiText.title[language]}</h2>
              <p className="text-xs text-sky-100">
                {faqData.length} {uiText.questionsCount[language]}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
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
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 py-3 flex gap-2 overflow-x-auto">
          {faqCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-sky-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label[language]}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
          {filteredFAQ.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{uiText.noResults[language]}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFAQ.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 border-2 border-gray-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
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
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
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

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-sky-600 text-white font-bold py-4 rounded-xl hover:bg-sky-700 transition-colors"
          >
            {uiText.close[language]}
          </button>
        </div>
      </div>
    </div>
  );
}