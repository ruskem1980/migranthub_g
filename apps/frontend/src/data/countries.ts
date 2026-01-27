// ============================================
// MIGRANTHUB - WORLD COUNTRIES REFERENCE
// ISO 3166-1 alpha-2 codes with translations
// ============================================

export type SupportedLanguage = 'ru' | 'en' | 'uz' | 'tg' | 'ky';

export interface Country {
  iso: string;          // ISO 3166-1 alpha-2: "RU", "US", "UZ"
  name: {
    ru: string;
    en: string;
    uz: string;
    tg: string;
    ky: string;
  };
  phoneCode?: string;   // "+7", "+1", "+998"
  flag?: string;        // emoji: "🇷🇺", "🇺🇸"
}

// Priority countries (CIS + main migration sources) - shown first
export const PRIORITY_COUNTRIES = ['RU', 'UZ', 'TJ', 'KG', 'KZ', 'AZ', 'AM', 'GE', 'MD', 'UA', 'BY'];

// EAEU member countries
export const EAEU_COUNTRIES = ['RU', 'BY', 'KZ', 'KG', 'AM'];

export const COUNTRIES: Country[] = [
  // ============================================
  // PRIORITY COUNTRIES (CIS + Main Migration)
  // ============================================
  {
    iso: 'RU',
    name: { ru: 'Россия', en: 'Russia', uz: 'Rossiya', tg: 'Русия', ky: 'Россия' },
    phoneCode: '+7',
    flag: '🇷🇺'
  },
  {
    iso: 'UZ',
    name: { ru: 'Узбекистан', en: 'Uzbekistan', uz: 'O\'zbekiston', tg: 'Ӯзбекистон', ky: 'Өзбекстан' },
    phoneCode: '+998',
    flag: '🇺🇿'
  },
  {
    iso: 'TJ',
    name: { ru: 'Таджикистан', en: 'Tajikistan', uz: 'Tojikiston', tg: 'Тоҷикистон', ky: 'Тажикстан' },
    phoneCode: '+992',
    flag: '🇹🇯'
  },
  {
    iso: 'KG',
    name: { ru: 'Кыргызстан', en: 'Kyrgyzstan', uz: 'Qirg\'iziston', tg: 'Қирғизистон', ky: 'Кыргызстан' },
    phoneCode: '+996',
    flag: '🇰🇬'
  },
  {
    iso: 'KZ',
    name: { ru: 'Казахстан', en: 'Kazakhstan', uz: 'Qozog\'iston', tg: 'Қазоқистон', ky: 'Казакстан' },
    phoneCode: '+7',
    flag: '🇰🇿'
  },
  {
    iso: 'AZ',
    name: { ru: 'Азербайджан', en: 'Azerbaijan', uz: 'Ozarbayjon', tg: 'Озарбойҷон', ky: 'Азербайжан' },
    phoneCode: '+994',
    flag: '🇦🇿'
  },
  {
    iso: 'AM',
    name: { ru: 'Армения', en: 'Armenia', uz: 'Armaniston', tg: 'Арманистон', ky: 'Армения' },
    phoneCode: '+374',
    flag: '🇦🇲'
  },
  {
    iso: 'GE',
    name: { ru: 'Грузия', en: 'Georgia', uz: 'Gruziya', tg: 'Гурҷистон', ky: 'Грузия' },
    phoneCode: '+995',
    flag: '🇬🇪'
  },
  {
    iso: 'MD',
    name: { ru: 'Молдова', en: 'Moldova', uz: 'Moldova', tg: 'Молдова', ky: 'Молдова' },
    phoneCode: '+373',
    flag: '🇲🇩'
  },
  {
    iso: 'UA',
    name: { ru: 'Украина', en: 'Ukraine', uz: 'Ukraina', tg: 'Украина', ky: 'Украина' },
    phoneCode: '+380',
    flag: '🇺🇦'
  },
  {
    iso: 'BY',
    name: { ru: 'Беларусь', en: 'Belarus', uz: 'Belarus', tg: 'Беларус', ky: 'Беларусь' },
    phoneCode: '+375',
    flag: '🇧🇾'
  },

  // ============================================
  // OTHER CIS & NEIGHBORING COUNTRIES
  // ============================================
  {
    iso: 'TM',
    name: { ru: 'Туркменистан', en: 'Turkmenistan', uz: 'Turkmaniston', tg: 'Туркманистон', ky: 'Түркмөнстан' },
    phoneCode: '+993',
    flag: '🇹🇲'
  },

  // ============================================
  // ASIA
  // ============================================
  {
    iso: 'AF',
    name: { ru: 'Афганистан', en: 'Afghanistan', uz: 'Afgʻoniston', tg: 'Афғонистон', ky: 'Афганстан' },
    phoneCode: '+93',
    flag: '🇦🇫'
  },
  {
    iso: 'BD',
    name: { ru: 'Бангладеш', en: 'Bangladesh', uz: 'Bangladesh', tg: 'Бангладеш', ky: 'Бангладеш' },
    phoneCode: '+880',
    flag: '🇧🇩'
  },
  {
    iso: 'BH',
    name: { ru: 'Бахрейн', en: 'Bahrain', uz: 'Bahrayn', tg: 'Баҳрайн', ky: 'Бахрейн' },
    phoneCode: '+973',
    flag: '🇧🇭'
  },
  {
    iso: 'BN',
    name: { ru: 'Бруней', en: 'Brunei', uz: 'Bruney', tg: 'Бруней', ky: 'Бруней' },
    phoneCode: '+673',
    flag: '🇧🇳'
  },
  {
    iso: 'BT',
    name: { ru: 'Бутан', en: 'Bhutan', uz: 'Butan', tg: 'Бутон', ky: 'Бутан' },
    phoneCode: '+975',
    flag: '🇧🇹'
  },
  {
    iso: 'CN',
    name: { ru: 'Китай', en: 'China', uz: 'Xitoy', tg: 'Хитой', ky: 'Кытай' },
    phoneCode: '+86',
    flag: '🇨🇳'
  },
  {
    iso: 'CY',
    name: { ru: 'Кипр', en: 'Cyprus', uz: 'Kipr', tg: 'Кипр', ky: 'Кипр' },
    phoneCode: '+357',
    flag: '🇨🇾'
  },
  {
    iso: 'ID',
    name: { ru: 'Индонезия', en: 'Indonesia', uz: 'Indoneziya', tg: 'Индонезия', ky: 'Индонезия' },
    phoneCode: '+62',
    flag: '🇮🇩'
  },
  {
    iso: 'IL',
    name: { ru: 'Израиль', en: 'Israel', uz: 'Isroil', tg: 'Исроил', ky: 'Израиль' },
    phoneCode: '+972',
    flag: '🇮🇱'
  },
  {
    iso: 'IN',
    name: { ru: 'Индия', en: 'India', uz: 'Hindiston', tg: 'Ҳиндустон', ky: 'Индия' },
    phoneCode: '+91',
    flag: '🇮🇳'
  },
  {
    iso: 'IQ',
    name: { ru: 'Ирак', en: 'Iraq', uz: 'Iroq', tg: 'Ироқ', ky: 'Ирак' },
    phoneCode: '+964',
    flag: '🇮🇶'
  },
  {
    iso: 'IR',
    name: { ru: 'Иран', en: 'Iran', uz: 'Eron', tg: 'Эрон', ky: 'Иран' },
    phoneCode: '+98',
    flag: '🇮🇷'
  },
  {
    iso: 'JO',
    name: { ru: 'Иордания', en: 'Jordan', uz: 'Iordaniya', tg: 'Урдун', ky: 'Иордания' },
    phoneCode: '+962',
    flag: '🇯🇴'
  },
  {
    iso: 'JP',
    name: { ru: 'Япония', en: 'Japan', uz: 'Yaponiya', tg: 'Ҷопон', ky: 'Жапония' },
    phoneCode: '+81',
    flag: '🇯🇵'
  },
  {
    iso: 'KH',
    name: { ru: 'Камбоджа', en: 'Cambodia', uz: 'Kambodja', tg: 'Камбоҷа', ky: 'Камбоджа' },
    phoneCode: '+855',
    flag: '🇰🇭'
  },
  {
    iso: 'KP',
    name: { ru: 'КНДР', en: 'North Korea', uz: 'Shimoliy Koreya', tg: 'Кореяи Шимолӣ', ky: 'Түндүк Корея' },
    phoneCode: '+850',
    flag: '🇰🇵'
  },
  {
    iso: 'KR',
    name: { ru: 'Южная Корея', en: 'South Korea', uz: 'Janubiy Koreya', tg: 'Кореяи Ҷанубӣ', ky: 'Түштүк Корея' },
    phoneCode: '+82',
    flag: '🇰🇷'
  },
  {
    iso: 'KW',
    name: { ru: 'Кувейт', en: 'Kuwait', uz: 'Quvayt', tg: 'Кувайт', ky: 'Кувейт' },
    phoneCode: '+965',
    flag: '🇰🇼'
  },
  {
    iso: 'LA',
    name: { ru: 'Лаос', en: 'Laos', uz: 'Laos', tg: 'Лаос', ky: 'Лаос' },
    phoneCode: '+856',
    flag: '🇱🇦'
  },
  {
    iso: 'LB',
    name: { ru: 'Ливан', en: 'Lebanon', uz: 'Livan', tg: 'Лубнон', ky: 'Ливан' },
    phoneCode: '+961',
    flag: '🇱🇧'
  },
  {
    iso: 'LK',
    name: { ru: 'Шри-Ланка', en: 'Sri Lanka', uz: 'Shri-Lanka', tg: 'Шри-Ланка', ky: 'Шри-Ланка' },
    phoneCode: '+94',
    flag: '🇱🇰'
  },
  {
    iso: 'MM',
    name: { ru: 'Мьянма', en: 'Myanmar', uz: 'Myanma', tg: 'Мянма', ky: 'Мьянма' },
    phoneCode: '+95',
    flag: '🇲🇲'
  },
  {
    iso: 'MN',
    name: { ru: 'Монголия', en: 'Mongolia', uz: 'Mongoliya', tg: 'Муғулистон', ky: 'Монголия' },
    phoneCode: '+976',
    flag: '🇲🇳'
  },
  {
    iso: 'MV',
    name: { ru: 'Мальдивы', en: 'Maldives', uz: 'Maldiv orollari', tg: 'Малдив', ky: 'Мальдивдер' },
    phoneCode: '+960',
    flag: '🇲🇻'
  },
  {
    iso: 'MY',
    name: { ru: 'Малайзия', en: 'Malaysia', uz: 'Malayziya', tg: 'Малайзия', ky: 'Малайзия' },
    phoneCode: '+60',
    flag: '🇲🇾'
  },
  {
    iso: 'NP',
    name: { ru: 'Непал', en: 'Nepal', uz: 'Nepal', tg: 'Непал', ky: 'Непал' },
    phoneCode: '+977',
    flag: '🇳🇵'
  },
  {
    iso: 'OM',
    name: { ru: 'Оман', en: 'Oman', uz: 'Ummon', tg: 'Умон', ky: 'Оман' },
    phoneCode: '+968',
    flag: '🇴🇲'
  },
  {
    iso: 'PH',
    name: { ru: 'Филиппины', en: 'Philippines', uz: 'Filippin', tg: 'Филиппин', ky: 'Филиппин' },
    phoneCode: '+63',
    flag: '🇵🇭'
  },
  {
    iso: 'PK',
    name: { ru: 'Пакистан', en: 'Pakistan', uz: 'Pokiston', tg: 'Покистон', ky: 'Пакистан' },
    phoneCode: '+92',
    flag: '🇵🇰'
  },
  {
    iso: 'PS',
    name: { ru: 'Палестина', en: 'Palestine', uz: 'Falastin', tg: 'Фаластин', ky: 'Палестина' },
    phoneCode: '+970',
    flag: '🇵🇸'
  },
  {
    iso: 'QA',
    name: { ru: 'Катар', en: 'Qatar', uz: 'Qatar', tg: 'Қатар', ky: 'Катар' },
    phoneCode: '+974',
    flag: '🇶🇦'
  },
  {
    iso: 'SA',
    name: { ru: 'Саудовская Аравия', en: 'Saudi Arabia', uz: 'Saudiya Arabistoni', tg: 'Арабистони Саудӣ', ky: 'Сауд Арабиясы' },
    phoneCode: '+966',
    flag: '🇸🇦'
  },
  {
    iso: 'SG',
    name: { ru: 'Сингапур', en: 'Singapore', uz: 'Singapur', tg: 'Сингапур', ky: 'Сингапур' },
    phoneCode: '+65',
    flag: '🇸🇬'
  },
  {
    iso: 'SY',
    name: { ru: 'Сирия', en: 'Syria', uz: 'Suriya', tg: 'Сурия', ky: 'Сирия' },
    phoneCode: '+963',
    flag: '🇸🇾'
  },
  {
    iso: 'TH',
    name: { ru: 'Таиланд', en: 'Thailand', uz: 'Tailand', tg: 'Таиланд', ky: 'Таиланд' },
    phoneCode: '+66',
    flag: '🇹🇭'
  },
  {
    iso: 'TL',
    name: { ru: 'Восточный Тимор', en: 'Timor-Leste', uz: 'Sharqiy Timor', tg: 'Тимори Шарқӣ', ky: 'Чыгыш Тимор' },
    phoneCode: '+670',
    flag: '🇹🇱'
  },
  {
    iso: 'TR',
    name: { ru: 'Турция', en: 'Turkey', uz: 'Turkiya', tg: 'Туркия', ky: 'Түркия' },
    phoneCode: '+90',
    flag: '🇹🇷'
  },
  {
    iso: 'TW',
    name: { ru: 'Тайвань', en: 'Taiwan', uz: 'Tayvan', tg: 'Тайван', ky: 'Тайвань' },
    phoneCode: '+886',
    flag: '🇹🇼'
  },
  {
    iso: 'AE',
    name: { ru: 'ОАЭ', en: 'United Arab Emirates', uz: 'BAA', tg: 'Аморати Муттаҳидаи Араб', ky: 'БАЭ' },
    phoneCode: '+971',
    flag: '🇦🇪'
  },
  {
    iso: 'VN',
    name: { ru: 'Вьетнам', en: 'Vietnam', uz: 'Vyetnam', tg: 'Ветнам', ky: 'Вьетнам' },
    phoneCode: '+84',
    flag: '🇻🇳'
  },
  {
    iso: 'YE',
    name: { ru: 'Йемен', en: 'Yemen', uz: 'Yaman', tg: 'Яман', ky: 'Йемен' },
    phoneCode: '+967',
    flag: '🇾🇪'
  },

  // ============================================
  // EUROPE
  // ============================================
  {
    iso: 'AL',
    name: { ru: 'Албания', en: 'Albania', uz: 'Albaniya', tg: 'Албания', ky: 'Албания' },
    phoneCode: '+355',
    flag: '🇦🇱'
  },
  {
    iso: 'AD',
    name: { ru: 'Андорра', en: 'Andorra', uz: 'Andorra', tg: 'Андорра', ky: 'Андорра' },
    phoneCode: '+376',
    flag: '🇦🇩'
  },
  {
    iso: 'AT',
    name: { ru: 'Австрия', en: 'Austria', uz: 'Avstriya', tg: 'Австрия', ky: 'Австрия' },
    phoneCode: '+43',
    flag: '🇦🇹'
  },
  {
    iso: 'BE',
    name: { ru: 'Бельгия', en: 'Belgium', uz: 'Belgiya', tg: 'Белгия', ky: 'Бельгия' },
    phoneCode: '+32',
    flag: '🇧🇪'
  },
  {
    iso: 'BA',
    name: { ru: 'Босния и Герцеговина', en: 'Bosnia and Herzegovina', uz: 'Bosniya va Gertsegovina', tg: 'Босния ва Ҳерсеговина', ky: 'Босния жана Герцеговина' },
    phoneCode: '+387',
    flag: '🇧🇦'
  },
  {
    iso: 'BG',
    name: { ru: 'Болгария', en: 'Bulgaria', uz: 'Bolgariya', tg: 'Булғория', ky: 'Болгария' },
    phoneCode: '+359',
    flag: '🇧🇬'
  },
  {
    iso: 'HR',
    name: { ru: 'Хорватия', en: 'Croatia', uz: 'Xorvatiya', tg: 'Хорватия', ky: 'Хорватия' },
    phoneCode: '+385',
    flag: '🇭🇷'
  },
  {
    iso: 'CZ',
    name: { ru: 'Чехия', en: 'Czechia', uz: 'Chexiya', tg: 'Чехия', ky: 'Чехия' },
    phoneCode: '+420',
    flag: '🇨🇿'
  },
  {
    iso: 'DK',
    name: { ru: 'Дания', en: 'Denmark', uz: 'Daniya', tg: 'Дания', ky: 'Дания' },
    phoneCode: '+45',
    flag: '🇩🇰'
  },
  {
    iso: 'EE',
    name: { ru: 'Эстония', en: 'Estonia', uz: 'Estoniya', tg: 'Эстония', ky: 'Эстония' },
    phoneCode: '+372',
    flag: '🇪🇪'
  },
  {
    iso: 'FI',
    name: { ru: 'Финляндия', en: 'Finland', uz: 'Finlandiya', tg: 'Финландия', ky: 'Финляндия' },
    phoneCode: '+358',
    flag: '🇫🇮'
  },
  {
    iso: 'FR',
    name: { ru: 'Франция', en: 'France', uz: 'Fransiya', tg: 'Фаронса', ky: 'Франция' },
    phoneCode: '+33',
    flag: '🇫🇷'
  },
  {
    iso: 'DE',
    name: { ru: 'Германия', en: 'Germany', uz: 'Germaniya', tg: 'Олмон', ky: 'Германия' },
    phoneCode: '+49',
    flag: '🇩🇪'
  },
  {
    iso: 'GR',
    name: { ru: 'Греция', en: 'Greece', uz: 'Gretsiya', tg: 'Юнон', ky: 'Греция' },
    phoneCode: '+30',
    flag: '🇬🇷'
  },
  {
    iso: 'HU',
    name: { ru: 'Венгрия', en: 'Hungary', uz: 'Vengriya', tg: 'Маҷористон', ky: 'Венгрия' },
    phoneCode: '+36',
    flag: '🇭🇺'
  },
  {
    iso: 'IS',
    name: { ru: 'Исландия', en: 'Iceland', uz: 'Islandiya', tg: 'Исландия', ky: 'Исландия' },
    phoneCode: '+354',
    flag: '🇮🇸'
  },
  {
    iso: 'IE',
    name: { ru: 'Ирландия', en: 'Ireland', uz: 'Irlandiya', tg: 'Ирландия', ky: 'Ирландия' },
    phoneCode: '+353',
    flag: '🇮🇪'
  },
  {
    iso: 'IT',
    name: { ru: 'Италия', en: 'Italy', uz: 'Italiya', tg: 'Италия', ky: 'Италия' },
    phoneCode: '+39',
    flag: '🇮🇹'
  },
  {
    iso: 'XK',
    name: { ru: 'Косово', en: 'Kosovo', uz: 'Kosovo', tg: 'Косово', ky: 'Косово' },
    phoneCode: '+383',
    flag: '🇽🇰'
  },
  {
    iso: 'LV',
    name: { ru: 'Латвия', en: 'Latvia', uz: 'Latviya', tg: 'Латвия', ky: 'Латвия' },
    phoneCode: '+371',
    flag: '🇱🇻'
  },
  {
    iso: 'LI',
    name: { ru: 'Лихтенштейн', en: 'Liechtenstein', uz: 'Lixtenshteyn', tg: 'Лихтенштейн', ky: 'Лихтенштейн' },
    phoneCode: '+423',
    flag: '🇱🇮'
  },
  {
    iso: 'LT',
    name: { ru: 'Литва', en: 'Lithuania', uz: 'Litva', tg: 'Литва', ky: 'Литва' },
    phoneCode: '+370',
    flag: '🇱🇹'
  },
  {
    iso: 'LU',
    name: { ru: 'Люксембург', en: 'Luxembourg', uz: 'Lyuksemburg', tg: 'Люксембург', ky: 'Люксембург' },
    phoneCode: '+352',
    flag: '🇱🇺'
  },
  {
    iso: 'MT',
    name: { ru: 'Мальта', en: 'Malta', uz: 'Malta', tg: 'Малта', ky: 'Мальта' },
    phoneCode: '+356',
    flag: '🇲🇹'
  },
  {
    iso: 'MC',
    name: { ru: 'Монако', en: 'Monaco', uz: 'Monako', tg: 'Монако', ky: 'Монако' },
    phoneCode: '+377',
    flag: '🇲🇨'
  },
  {
    iso: 'ME',
    name: { ru: 'Черногория', en: 'Montenegro', uz: 'Chernogoriya', tg: 'Черногория', ky: 'Черногория' },
    phoneCode: '+382',
    flag: '🇲🇪'
  },
  {
    iso: 'NL',
    name: { ru: 'Нидерланды', en: 'Netherlands', uz: 'Niderlandiya', tg: 'Нидерландия', ky: 'Нидерланды' },
    phoneCode: '+31',
    flag: '🇳🇱'
  },
  {
    iso: 'MK',
    name: { ru: 'Северная Македония', en: 'North Macedonia', uz: 'Shimoliy Makedoniya', tg: 'Македонияи Шимолӣ', ky: 'Түндүк Македония' },
    phoneCode: '+389',
    flag: '🇲🇰'
  },
  {
    iso: 'NO',
    name: { ru: 'Норвегия', en: 'Norway', uz: 'Norvegiya', tg: 'Норвегия', ky: 'Норвегия' },
    phoneCode: '+47',
    flag: '🇳🇴'
  },
  {
    iso: 'PL',
    name: { ru: 'Польша', en: 'Poland', uz: 'Polsha', tg: 'Лаҳистон', ky: 'Польша' },
    phoneCode: '+48',
    flag: '🇵🇱'
  },
  {
    iso: 'PT',
    name: { ru: 'Португалия', en: 'Portugal', uz: 'Portugaliya', tg: 'Португалия', ky: 'Португалия' },
    phoneCode: '+351',
    flag: '🇵🇹'
  },
  {
    iso: 'RO',
    name: { ru: 'Румыния', en: 'Romania', uz: 'Ruminiya', tg: 'Руминия', ky: 'Румыния' },
    phoneCode: '+40',
    flag: '🇷🇴'
  },
  {
    iso: 'SM',
    name: { ru: 'Сан-Марино', en: 'San Marino', uz: 'San-Marino', tg: 'Сан-Марино', ky: 'Сан-Марино' },
    phoneCode: '+378',
    flag: '🇸🇲'
  },
  {
    iso: 'RS',
    name: { ru: 'Сербия', en: 'Serbia', uz: 'Serbiya', tg: 'Сербия', ky: 'Сербия' },
    phoneCode: '+381',
    flag: '🇷🇸'
  },
  {
    iso: 'SK',
    name: { ru: 'Словакия', en: 'Slovakia', uz: 'Slovakiya', tg: 'Словакия', ky: 'Словакия' },
    phoneCode: '+421',
    flag: '🇸🇰'
  },
  {
    iso: 'SI',
    name: { ru: 'Словения', en: 'Slovenia', uz: 'Sloveniya', tg: 'Словения', ky: 'Словения' },
    phoneCode: '+386',
    flag: '🇸🇮'
  },
  {
    iso: 'ES',
    name: { ru: 'Испания', en: 'Spain', uz: 'Ispaniya', tg: 'Испания', ky: 'Испания' },
    phoneCode: '+34',
    flag: '🇪🇸'
  },
  {
    iso: 'SE',
    name: { ru: 'Швеция', en: 'Sweden', uz: 'Shvetsiya', tg: 'Шветсия', ky: 'Швеция' },
    phoneCode: '+46',
    flag: '🇸🇪'
  },
  {
    iso: 'CH',
    name: { ru: 'Швейцария', en: 'Switzerland', uz: 'Shveytsariya', tg: 'Швейтсария', ky: 'Швейцария' },
    phoneCode: '+41',
    flag: '🇨🇭'
  },
  {
    iso: 'GB',
    name: { ru: 'Великобритания', en: 'United Kingdom', uz: 'Buyuk Britaniya', tg: 'Британияи Кабир', ky: 'Улуу Британия' },
    phoneCode: '+44',
    flag: '🇬🇧'
  },
  {
    iso: 'VA',
    name: { ru: 'Ватикан', en: 'Vatican City', uz: 'Vatikan', tg: 'Ватикан', ky: 'Ватикан' },
    phoneCode: '+379',
    flag: '🇻🇦'
  },

  // ============================================
  // AFRICA
  // ============================================
  {
    iso: 'DZ',
    name: { ru: 'Алжир', en: 'Algeria', uz: 'Jazoir', tg: 'Ҷазоир', ky: 'Алжир' },
    phoneCode: '+213',
    flag: '🇩🇿'
  },
  {
    iso: 'AO',
    name: { ru: 'Ангола', en: 'Angola', uz: 'Angola', tg: 'Ангола', ky: 'Ангола' },
    phoneCode: '+244',
    flag: '🇦🇴'
  },
  {
    iso: 'BJ',
    name: { ru: 'Бенин', en: 'Benin', uz: 'Benin', tg: 'Бенин', ky: 'Бенин' },
    phoneCode: '+229',
    flag: '🇧🇯'
  },
  {
    iso: 'BW',
    name: { ru: 'Ботсвана', en: 'Botswana', uz: 'Botsvana', tg: 'Ботсвана', ky: 'Ботсвана' },
    phoneCode: '+267',
    flag: '🇧🇼'
  },
  {
    iso: 'BF',
    name: { ru: 'Буркина-Фасо', en: 'Burkina Faso', uz: 'Burkina-Faso', tg: 'Буркина-Фасо', ky: 'Буркина-Фасо' },
    phoneCode: '+226',
    flag: '🇧🇫'
  },
  {
    iso: 'BI',
    name: { ru: 'Бурунди', en: 'Burundi', uz: 'Burundi', tg: 'Бурунди', ky: 'Бурунди' },
    phoneCode: '+257',
    flag: '🇧🇮'
  },
  {
    iso: 'CV',
    name: { ru: 'Кабо-Верде', en: 'Cabo Verde', uz: 'Kabo-Verde', tg: 'Кабо-Верде', ky: 'Кабо-Верде' },
    phoneCode: '+238',
    flag: '🇨🇻'
  },
  {
    iso: 'CM',
    name: { ru: 'Камерун', en: 'Cameroon', uz: 'Kamerun', tg: 'Камерун', ky: 'Камерун' },
    phoneCode: '+237',
    flag: '🇨🇲'
  },
  {
    iso: 'CF',
    name: { ru: 'ЦАР', en: 'Central African Republic', uz: 'Markaziy Afrika Respublikasi', tg: 'Ҷумҳурии Африкаи Марказӣ', ky: 'Борбордук Африка Республикасы' },
    phoneCode: '+236',
    flag: '🇨🇫'
  },
  {
    iso: 'TD',
    name: { ru: 'Чад', en: 'Chad', uz: 'Chad', tg: 'Чад', ky: 'Чад' },
    phoneCode: '+235',
    flag: '🇹🇩'
  },
  {
    iso: 'KM',
    name: { ru: 'Коморы', en: 'Comoros', uz: 'Komor orollari', tg: 'Комор', ky: 'Комор аралдары' },
    phoneCode: '+269',
    flag: '🇰🇲'
  },
  {
    iso: 'CG',
    name: { ru: 'Конго', en: 'Congo', uz: 'Kongo', tg: 'Конго', ky: 'Конго' },
    phoneCode: '+242',
    flag: '🇨🇬'
  },
  {
    iso: 'CD',
    name: { ru: 'ДР Конго', en: 'DR Congo', uz: 'Kongo DR', tg: 'Конго ДР', ky: 'Конго ДР' },
    phoneCode: '+243',
    flag: '🇨🇩'
  },
  {
    iso: 'CI',
    name: { ru: 'Кот-д\'Ивуар', en: 'Côte d\'Ivoire', uz: 'Kot-d\'Ivuar', tg: 'Кот-д\'Ивуар', ky: 'Кот-д\'Ивуар' },
    phoneCode: '+225',
    flag: '🇨🇮'
  },
  {
    iso: 'DJ',
    name: { ru: 'Джибути', en: 'Djibouti', uz: 'Jibuti', tg: 'Ҷибути', ky: 'Джибути' },
    phoneCode: '+253',
    flag: '🇩🇯'
  },
  {
    iso: 'EG',
    name: { ru: 'Египет', en: 'Egypt', uz: 'Misr', tg: 'Миср', ky: 'Египет' },
    phoneCode: '+20',
    flag: '🇪🇬'
  },
  {
    iso: 'GQ',
    name: { ru: 'Экваториальная Гвинея', en: 'Equatorial Guinea', uz: 'Ekvatorial Gvineya', tg: 'Гвинеяи Экваторӣ', ky: 'Экватордук Гвинея' },
    phoneCode: '+240',
    flag: '🇬🇶'
  },
  {
    iso: 'ER',
    name: { ru: 'Эритрея', en: 'Eritrea', uz: 'Eritreya', tg: 'Эритрея', ky: 'Эритрея' },
    phoneCode: '+291',
    flag: '🇪🇷'
  },
  {
    iso: 'SZ',
    name: { ru: 'Эсватини', en: 'Eswatini', uz: 'Esvatin', tg: 'Эсватини', ky: 'Эсватини' },
    phoneCode: '+268',
    flag: '🇸🇿'
  },
  {
    iso: 'ET',
    name: { ru: 'Эфиопия', en: 'Ethiopia', uz: 'Efiopiya', tg: 'Эфиопия', ky: 'Эфиопия' },
    phoneCode: '+251',
    flag: '🇪🇹'
  },
  {
    iso: 'GA',
    name: { ru: 'Габон', en: 'Gabon', uz: 'Gabon', tg: 'Габон', ky: 'Габон' },
    phoneCode: '+241',
    flag: '🇬🇦'
  },
  {
    iso: 'GM',
    name: { ru: 'Гамбия', en: 'Gambia', uz: 'Gambiya', tg: 'Гамбия', ky: 'Гамбия' },
    phoneCode: '+220',
    flag: '🇬🇲'
  },
  {
    iso: 'GH',
    name: { ru: 'Гана', en: 'Ghana', uz: 'Gana', tg: 'Гана', ky: 'Гана' },
    phoneCode: '+233',
    flag: '🇬🇭'
  },
  {
    iso: 'GN',
    name: { ru: 'Гвинея', en: 'Guinea', uz: 'Gvineya', tg: 'Гвинея', ky: 'Гвинея' },
    phoneCode: '+224',
    flag: '🇬🇳'
  },
  {
    iso: 'GW',
    name: { ru: 'Гвинея-Бисау', en: 'Guinea-Bissau', uz: 'Gvineya-Bisau', tg: 'Гвинея-Бисау', ky: 'Гвинея-Бисау' },
    phoneCode: '+245',
    flag: '🇬🇼'
  },
  {
    iso: 'KE',
    name: { ru: 'Кения', en: 'Kenya', uz: 'Keniya', tg: 'Кения', ky: 'Кения' },
    phoneCode: '+254',
    flag: '🇰🇪'
  },
  {
    iso: 'LS',
    name: { ru: 'Лесото', en: 'Lesotho', uz: 'Lesoto', tg: 'Лесото', ky: 'Лесото' },
    phoneCode: '+266',
    flag: '🇱🇸'
  },
  {
    iso: 'LR',
    name: { ru: 'Либерия', en: 'Liberia', uz: 'Liberiya', tg: 'Либерия', ky: 'Либерия' },
    phoneCode: '+231',
    flag: '🇱🇷'
  },
  {
    iso: 'LY',
    name: { ru: 'Ливия', en: 'Libya', uz: 'Liviya', tg: 'Либия', ky: 'Ливия' },
    phoneCode: '+218',
    flag: '🇱🇾'
  },
  {
    iso: 'MG',
    name: { ru: 'Мадагаскар', en: 'Madagascar', uz: 'Madagaskar', tg: 'Мадагаскар', ky: 'Мадагаскар' },
    phoneCode: '+261',
    flag: '🇲🇬'
  },
  {
    iso: 'MW',
    name: { ru: 'Малави', en: 'Malawi', uz: 'Malavi', tg: 'Малави', ky: 'Малави' },
    phoneCode: '+265',
    flag: '🇲🇼'
  },
  {
    iso: 'ML',
    name: { ru: 'Мали', en: 'Mali', uz: 'Mali', tg: 'Мали', ky: 'Мали' },
    phoneCode: '+223',
    flag: '🇲🇱'
  },
  {
    iso: 'MR',
    name: { ru: 'Мавритания', en: 'Mauritania', uz: 'Mavritaniya', tg: 'Мавритания', ky: 'Мавритания' },
    phoneCode: '+222',
    flag: '🇲🇷'
  },
  {
    iso: 'MU',
    name: { ru: 'Маврикий', en: 'Mauritius', uz: 'Mavrikiy', tg: 'Маврикий', ky: 'Маврикий' },
    phoneCode: '+230',
    flag: '🇲🇺'
  },
  {
    iso: 'MA',
    name: { ru: 'Марокко', en: 'Morocco', uz: 'Marokash', tg: 'Марокаш', ky: 'Марокко' },
    phoneCode: '+212',
    flag: '🇲🇦'
  },
  {
    iso: 'MZ',
    name: { ru: 'Мозамбик', en: 'Mozambique', uz: 'Mozambik', tg: 'Мозамбик', ky: 'Мозамбик' },
    phoneCode: '+258',
    flag: '🇲🇿'
  },
  {
    iso: 'NA',
    name: { ru: 'Намибия', en: 'Namibia', uz: 'Namibiya', tg: 'Намибия', ky: 'Намибия' },
    phoneCode: '+264',
    flag: '🇳🇦'
  },
  {
    iso: 'NE',
    name: { ru: 'Нигер', en: 'Niger', uz: 'Niger', tg: 'Нигер', ky: 'Нигер' },
    phoneCode: '+227',
    flag: '🇳🇪'
  },
  {
    iso: 'NG',
    name: { ru: 'Нигерия', en: 'Nigeria', uz: 'Nigeriya', tg: 'Нигерия', ky: 'Нигерия' },
    phoneCode: '+234',
    flag: '🇳🇬'
  },
  {
    iso: 'RW',
    name: { ru: 'Руанда', en: 'Rwanda', uz: 'Ruanda', tg: 'Руанда', ky: 'Руанда' },
    phoneCode: '+250',
    flag: '🇷🇼'
  },
  {
    iso: 'ST',
    name: { ru: 'Сан-Томе и Принсипи', en: 'São Tomé and Príncipe', uz: 'San-Tome va Prinsipi', tg: 'Сан-Томе ва Принсипи', ky: 'Сан-Томе жана Принсипи' },
    phoneCode: '+239',
    flag: '🇸🇹'
  },
  {
    iso: 'SN',
    name: { ru: 'Сенегал', en: 'Senegal', uz: 'Senegal', tg: 'Сенегал', ky: 'Сенегал' },
    phoneCode: '+221',
    flag: '🇸🇳'
  },
  {
    iso: 'SC',
    name: { ru: 'Сейшелы', en: 'Seychelles', uz: 'Seyshel orollari', tg: 'Сейшел', ky: 'Сейшел аралдары' },
    phoneCode: '+248',
    flag: '🇸🇨'
  },
  {
    iso: 'SL',
    name: { ru: 'Сьерра-Леоне', en: 'Sierra Leone', uz: 'Syerra-Leone', tg: 'Сиерра-Леоне', ky: 'Сьерра-Леоне' },
    phoneCode: '+232',
    flag: '🇸🇱'
  },
  {
    iso: 'SO',
    name: { ru: 'Сомали', en: 'Somalia', uz: 'Somali', tg: 'Сомалӣ', ky: 'Сомали' },
    phoneCode: '+252',
    flag: '🇸🇴'
  },
  {
    iso: 'ZA',
    name: { ru: 'ЮАР', en: 'South Africa', uz: 'JAR', tg: 'Африкаи Ҷанубӣ', ky: 'ТАР' },
    phoneCode: '+27',
    flag: '🇿🇦'
  },
  {
    iso: 'SS',
    name: { ru: 'Южный Судан', en: 'South Sudan', uz: 'Janubiy Sudan', tg: 'Судони Ҷанубӣ', ky: 'Түштүк Судан' },
    phoneCode: '+211',
    flag: '🇸🇸'
  },
  {
    iso: 'SD',
    name: { ru: 'Судан', en: 'Sudan', uz: 'Sudan', tg: 'Судон', ky: 'Судан' },
    phoneCode: '+249',
    flag: '🇸🇩'
  },
  {
    iso: 'TZ',
    name: { ru: 'Танзания', en: 'Tanzania', uz: 'Tanzaniya', tg: 'Танзания', ky: 'Танзания' },
    phoneCode: '+255',
    flag: '🇹🇿'
  },
  {
    iso: 'TG',
    name: { ru: 'Того', en: 'Togo', uz: 'Togo', tg: 'Того', ky: 'Того' },
    phoneCode: '+228',
    flag: '🇹🇬'
  },
  {
    iso: 'TN',
    name: { ru: 'Тунис', en: 'Tunisia', uz: 'Tunis', tg: 'Тунис', ky: 'Тунис' },
    phoneCode: '+216',
    flag: '🇹🇳'
  },
  {
    iso: 'UG',
    name: { ru: 'Уганда', en: 'Uganda', uz: 'Uganda', tg: 'Уганда', ky: 'Уганда' },
    phoneCode: '+256',
    flag: '🇺🇬'
  },
  {
    iso: 'ZM',
    name: { ru: 'Замбия', en: 'Zambia', uz: 'Zambiya', tg: 'Замбия', ky: 'Замбия' },
    phoneCode: '+260',
    flag: '🇿🇲'
  },
  {
    iso: 'ZW',
    name: { ru: 'Зимбабве', en: 'Zimbabwe', uz: 'Zimbabve', tg: 'Зимбабве', ky: 'Зимбабве' },
    phoneCode: '+263',
    flag: '🇿🇼'
  },

  // ============================================
  // NORTH AMERICA
  // ============================================
  {
    iso: 'AG',
    name: { ru: 'Антигуа и Барбуда', en: 'Antigua and Barbuda', uz: 'Antigua va Barbuda', tg: 'Антигуа ва Барбуда', ky: 'Антигуа жана Барбуда' },
    phoneCode: '+1268',
    flag: '🇦🇬'
  },
  {
    iso: 'BS',
    name: { ru: 'Багамы', en: 'Bahamas', uz: 'Bagama orollari', tg: 'Баҳама', ky: 'Багама аралдары' },
    phoneCode: '+1242',
    flag: '🇧🇸'
  },
  {
    iso: 'BB',
    name: { ru: 'Барбадос', en: 'Barbados', uz: 'Barbados', tg: 'Барбадос', ky: 'Барбадос' },
    phoneCode: '+1246',
    flag: '🇧🇧'
  },
  {
    iso: 'BZ',
    name: { ru: 'Белиз', en: 'Belize', uz: 'Beliz', tg: 'Белиз', ky: 'Белиз' },
    phoneCode: '+501',
    flag: '🇧🇿'
  },
  {
    iso: 'CA',
    name: { ru: 'Канада', en: 'Canada', uz: 'Kanada', tg: 'Канада', ky: 'Канада' },
    phoneCode: '+1',
    flag: '🇨🇦'
  },
  {
    iso: 'CR',
    name: { ru: 'Коста-Рика', en: 'Costa Rica', uz: 'Kosta-Rika', tg: 'Коста-Рика', ky: 'Коста-Рика' },
    phoneCode: '+506',
    flag: '🇨🇷'
  },
  {
    iso: 'CU',
    name: { ru: 'Куба', en: 'Cuba', uz: 'Kuba', tg: 'Куба', ky: 'Куба' },
    phoneCode: '+53',
    flag: '🇨🇺'
  },
  {
    iso: 'DM',
    name: { ru: 'Доминика', en: 'Dominica', uz: 'Dominika', tg: 'Доминика', ky: 'Доминика' },
    phoneCode: '+1767',
    flag: '🇩🇲'
  },
  {
    iso: 'DO',
    name: { ru: 'Доминиканская Республика', en: 'Dominican Republic', uz: 'Dominikan Respublikasi', tg: 'Ҷумҳурии Доминикан', ky: 'Доминикан Республикасы' },
    phoneCode: '+1809',
    flag: '🇩🇴'
  },
  {
    iso: 'SV',
    name: { ru: 'Сальвадор', en: 'El Salvador', uz: 'Salvador', tg: 'Салвадор', ky: 'Сальвадор' },
    phoneCode: '+503',
    flag: '🇸🇻'
  },
  {
    iso: 'GD',
    name: { ru: 'Гренада', en: 'Grenada', uz: 'Grenada', tg: 'Гренада', ky: 'Гренада' },
    phoneCode: '+1473',
    flag: '🇬🇩'
  },
  {
    iso: 'GT',
    name: { ru: 'Гватемала', en: 'Guatemala', uz: 'Gvatemala', tg: 'Гватемала', ky: 'Гватемала' },
    phoneCode: '+502',
    flag: '🇬🇹'
  },
  {
    iso: 'HT',
    name: { ru: 'Гаити', en: 'Haiti', uz: 'Gaiti', tg: 'Гаити', ky: 'Гаити' },
    phoneCode: '+509',
    flag: '🇭🇹'
  },
  {
    iso: 'HN',
    name: { ru: 'Гондурас', en: 'Honduras', uz: 'Gonduras', tg: 'Гондурас', ky: 'Гондурас' },
    phoneCode: '+504',
    flag: '🇭🇳'
  },
  {
    iso: 'JM',
    name: { ru: 'Ямайка', en: 'Jamaica', uz: 'Yamayka', tg: 'Ямайка', ky: 'Ямайка' },
    phoneCode: '+1876',
    flag: '🇯🇲'
  },
  {
    iso: 'MX',
    name: { ru: 'Мексика', en: 'Mexico', uz: 'Meksika', tg: 'Мексика', ky: 'Мексика' },
    phoneCode: '+52',
    flag: '🇲🇽'
  },
  {
    iso: 'NI',
    name: { ru: 'Никарагуа', en: 'Nicaragua', uz: 'Nikaragua', tg: 'Никарагуа', ky: 'Никарагуа' },
    phoneCode: '+505',
    flag: '🇳🇮'
  },
  {
    iso: 'PA',
    name: { ru: 'Панама', en: 'Panama', uz: 'Panama', tg: 'Панама', ky: 'Панама' },
    phoneCode: '+507',
    flag: '🇵🇦'
  },
  {
    iso: 'KN',
    name: { ru: 'Сент-Китс и Невис', en: 'Saint Kitts and Nevis', uz: 'Sent-Kits va Nevis', tg: 'Сент-Китс ва Невис', ky: 'Сент-Китс жана Невис' },
    phoneCode: '+1869',
    flag: '🇰🇳'
  },
  {
    iso: 'LC',
    name: { ru: 'Сент-Люсия', en: 'Saint Lucia', uz: 'Sent-Lyusiya', tg: 'Сент-Люсия', ky: 'Сент-Люсия' },
    phoneCode: '+1758',
    flag: '🇱🇨'
  },
  {
    iso: 'VC',
    name: { ru: 'Сент-Винсент и Гренадины', en: 'Saint Vincent and the Grenadines', uz: 'Sent-Vinsent va Grenadinlar', tg: 'Сент-Винсент ва Гренадинаҳо', ky: 'Сент-Винсент жана Гренадиндер' },
    phoneCode: '+1784',
    flag: '🇻🇨'
  },
  {
    iso: 'TT',
    name: { ru: 'Тринидад и Тобаго', en: 'Trinidad and Tobago', uz: 'Trinidad va Tobago', tg: 'Тринидад ва Тобаго', ky: 'Тринидад жана Тобаго' },
    phoneCode: '+1868',
    flag: '🇹🇹'
  },
  {
    iso: 'US',
    name: { ru: 'США', en: 'United States', uz: 'AQSH', tg: 'ИМА', ky: 'АКШ' },
    phoneCode: '+1',
    flag: '🇺🇸'
  },

  // ============================================
  // SOUTH AMERICA
  // ============================================
  {
    iso: 'AR',
    name: { ru: 'Аргентина', en: 'Argentina', uz: 'Argentina', tg: 'Аргентина', ky: 'Аргентина' },
    phoneCode: '+54',
    flag: '🇦🇷'
  },
  {
    iso: 'BO',
    name: { ru: 'Боливия', en: 'Bolivia', uz: 'Boliviya', tg: 'Боливия', ky: 'Боливия' },
    phoneCode: '+591',
    flag: '🇧🇴'
  },
  {
    iso: 'BR',
    name: { ru: 'Бразилия', en: 'Brazil', uz: 'Braziliya', tg: 'Бразилия', ky: 'Бразилия' },
    phoneCode: '+55',
    flag: '🇧🇷'
  },
  {
    iso: 'CL',
    name: { ru: 'Чили', en: 'Chile', uz: 'Chili', tg: 'Чили', ky: 'Чили' },
    phoneCode: '+56',
    flag: '🇨🇱'
  },
  {
    iso: 'CO',
    name: { ru: 'Колумбия', en: 'Colombia', uz: 'Kolumbiya', tg: 'Колумбия', ky: 'Колумбия' },
    phoneCode: '+57',
    flag: '🇨🇴'
  },
  {
    iso: 'EC',
    name: { ru: 'Эквадор', en: 'Ecuador', uz: 'Ekvador', tg: 'Эквадор', ky: 'Эквадор' },
    phoneCode: '+593',
    flag: '🇪🇨'
  },
  {
    iso: 'GY',
    name: { ru: 'Гайана', en: 'Guyana', uz: 'Gayana', tg: 'Гаяна', ky: 'Гайана' },
    phoneCode: '+592',
    flag: '🇬🇾'
  },
  {
    iso: 'PY',
    name: { ru: 'Парагвай', en: 'Paraguay', uz: 'Paragvay', tg: 'Парагвай', ky: 'Парагвай' },
    phoneCode: '+595',
    flag: '🇵🇾'
  },
  {
    iso: 'PE',
    name: { ru: 'Перу', en: 'Peru', uz: 'Peru', tg: 'Перу', ky: 'Перу' },
    phoneCode: '+51',
    flag: '🇵🇪'
  },
  {
    iso: 'SR',
    name: { ru: 'Суринам', en: 'Suriname', uz: 'Surinam', tg: 'Суринам', ky: 'Суринам' },
    phoneCode: '+597',
    flag: '🇸🇷'
  },
  {
    iso: 'UY',
    name: { ru: 'Уругвай', en: 'Uruguay', uz: 'Urugvay', tg: 'Уругвай', ky: 'Уругвай' },
    phoneCode: '+598',
    flag: '🇺🇾'
  },
  {
    iso: 'VE',
    name: { ru: 'Венесуэла', en: 'Venezuela', uz: 'Venesuela', tg: 'Венесуэла', ky: 'Венесуэла' },
    phoneCode: '+58',
    flag: '🇻🇪'
  },

  // ============================================
  // OCEANIA
  // ============================================
  {
    iso: 'AU',
    name: { ru: 'Австралия', en: 'Australia', uz: 'Avstraliya', tg: 'Австралия', ky: 'Австралия' },
    phoneCode: '+61',
    flag: '🇦🇺'
  },
  {
    iso: 'FJ',
    name: { ru: 'Фиджи', en: 'Fiji', uz: 'Fiji', tg: 'Фиҷи', ky: 'Фиджи' },
    phoneCode: '+679',
    flag: '🇫🇯'
  },
  {
    iso: 'KI',
    name: { ru: 'Кирибати', en: 'Kiribati', uz: 'Kiribati', tg: 'Кирибати', ky: 'Кирибати' },
    phoneCode: '+686',
    flag: '🇰🇮'
  },
  {
    iso: 'MH',
    name: { ru: 'Маршалловы Острова', en: 'Marshall Islands', uz: 'Marshall orollari', tg: 'Ҷазираҳои Маршалл', ky: 'Маршалл аралдары' },
    phoneCode: '+692',
    flag: '🇲🇭'
  },
  {
    iso: 'FM',
    name: { ru: 'Микронезия', en: 'Micronesia', uz: 'Mikroneziya', tg: 'Микронезия', ky: 'Микронезия' },
    phoneCode: '+691',
    flag: '🇫🇲'
  },
  {
    iso: 'NR',
    name: { ru: 'Науру', en: 'Nauru', uz: 'Nauru', tg: 'Науру', ky: 'Науру' },
    phoneCode: '+674',
    flag: '🇳🇷'
  },
  {
    iso: 'NZ',
    name: { ru: 'Новая Зеландия', en: 'New Zealand', uz: 'Yangi Zelandiya', tg: 'Зеландияи Нав', ky: 'Жаңы Зеландия' },
    phoneCode: '+64',
    flag: '🇳🇿'
  },
  {
    iso: 'PW',
    name: { ru: 'Палау', en: 'Palau', uz: 'Palau', tg: 'Палау', ky: 'Палау' },
    phoneCode: '+680',
    flag: '🇵🇼'
  },
  {
    iso: 'PG',
    name: { ru: 'Папуа — Новая Гвинея', en: 'Papua New Guinea', uz: 'Papua-Yangi Gvineya', tg: 'Папуа-Гвинеяи Нав', ky: 'Папуа — Жаңы Гвинея' },
    phoneCode: '+675',
    flag: '🇵🇬'
  },
  {
    iso: 'WS',
    name: { ru: 'Самоа', en: 'Samoa', uz: 'Samoa', tg: 'Самоа', ky: 'Самоа' },
    phoneCode: '+685',
    flag: '🇼🇸'
  },
  {
    iso: 'SB',
    name: { ru: 'Соломоновы Острова', en: 'Solomon Islands', uz: 'Solomon orollari', tg: 'Ҷазираҳои Соломон', ky: 'Соломон аралдары' },
    phoneCode: '+677',
    flag: '🇸🇧'
  },
  {
    iso: 'TO',
    name: { ru: 'Тонга', en: 'Tonga', uz: 'Tonga', tg: 'Тонга', ky: 'Тонга' },
    phoneCode: '+676',
    flag: '🇹🇴'
  },
  {
    iso: 'TV',
    name: { ru: 'Тувалу', en: 'Tuvalu', uz: 'Tuvalu', tg: 'Тувалу', ky: 'Тувалу' },
    phoneCode: '+688',
    flag: '🇹🇻'
  },
  {
    iso: 'VU',
    name: { ru: 'Вануату', en: 'Vanuatu', uz: 'Vanuatu', tg: 'Вануату', ky: 'Вануату' },
    phoneCode: '+678',
    flag: '🇻🇺'
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get country by ISO code
 */
export function getCountryByIso(iso: string): Country | undefined {
  return COUNTRIES.find(c => c.iso.toUpperCase() === iso.toUpperCase());
}

/**
 * Search countries by name in specified language
 */
export function searchCountries(query: string, lang: SupportedLanguage = 'ru'): Country[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  return COUNTRIES.filter(country => {
    const name = country.name[lang]?.toLowerCase() || '';
    return name.includes(normalizedQuery);
  });
}

/**
 * Get priority countries (CIS + main migration sources)
 */
export function getPriorityCountries(): Country[] {
  return PRIORITY_COUNTRIES
    .map(iso => getCountryByIso(iso))
    .filter((c): c is Country => c !== undefined);
}

/**
 * Get all countries sorted: priority first, then alphabetically
 */
export function getAllCountries(lang: SupportedLanguage = 'ru'): Country[] {
  const priority = getPriorityCountries();
  const priorityIsos = new Set(PRIORITY_COUNTRIES);

  const others = COUNTRIES
    .filter(c => !priorityIsos.has(c.iso))
    .sort((a, b) => {
      const nameA = a.name[lang] || a.name.en;
      const nameB = b.name[lang] || b.name.en;
      return nameA.localeCompare(nameB, lang);
    });

  return [...priority, ...others];
}

/**
 * Get country name in specified language
 */
export function getCountryName(iso: string, lang: SupportedLanguage = 'ru'): string {
  const country = getCountryByIso(iso);
  return country?.name[lang] || country?.name.en || iso;
}

/**
 * Check if country is EAEU member
 */
export function isEAEUCountry(iso: string): boolean {
  return EAEU_COUNTRIES.includes(iso.toUpperCase());
}

/**
 * Check if country is in priority list
 */
export function isPriorityCountry(iso: string): boolean {
  return PRIORITY_COUNTRIES.includes(iso.toUpperCase());
}

/**
 * Get countries grouped by first letter
 */
export function getCountriesGrouped(lang: SupportedLanguage = 'ru'): Map<string, Country[]> {
  const sorted = getAllCountries(lang);
  const grouped = new Map<string, Country[]>();

  for (const country of sorted) {
    const name = country.name[lang] || country.name.en;
    const firstLetter = name.charAt(0).toUpperCase();

    if (!grouped.has(firstLetter)) {
      grouped.set(firstLetter, []);
    }
    grouped.get(firstLetter)!.push(country);
  }

  return grouped;
}
