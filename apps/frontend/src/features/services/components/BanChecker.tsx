'use client';

import { useState } from 'react';
import { Shield, Search, CheckCircle, AlertTriangle, X, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { useLanguageStore, Language } from '@/lib/stores/languageStore';

interface BanCheckerProps {
  onClose: () => void;
}

interface FormData {
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  citizenship: string;
}

type BanCheckSource = 'mvd' | 'fms' | 'cache' | 'fallback';
type BanStatus = 'no_ban' | 'has_ban' | 'unknown' | 'check_failed';

interface BanCheckResponse {
  status: BanStatus;
  source?: BanCheckSource;
  banType?: 'administrative' | 'criminal' | 'sanitary';
  reason?: string;
  expiresAt?: string;
  checkedAt: string;
  error?: string;
}

const initialFormData: FormData = {
  lastName: '',
  firstName: '',
  middleName: '',
  birthDate: '',
  citizenship: '',
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const labels: Record<string, Record<Language, string>> = {
  title: {
    ru: 'Проверка запретов',
    en: 'Ban Check',
    uz: 'Taqiqlarni tekshirish',
    tg: 'Санҷиши манъият',
    ky: 'Тыюу текшеруусу',
  },
  subtitle: {
    ru: 'МВД / ФМС России',
    en: 'Russian MVD / FMS',
    uz: 'Rossiya IIV / FMS',
    tg: 'ВКД / ФМХ Русия',
    ky: 'ИИМ / ФМК Россия',
  },
  lastName: {
    ru: 'Фамилия',
    en: 'Last Name',
    uz: 'Familiya',
    tg: 'Насаб',
    ky: 'Фамилиясы',
  },
  firstName: {
    ru: 'Имя',
    en: 'First Name',
    uz: 'Ism',
    tg: 'Ном',
    ky: 'Аты',
  },
  middleName: {
    ru: 'Отчество',
    en: 'Middle Name',
    uz: 'Otasining ismi',
    tg: 'Номи падар',
    ky: 'Атасынын аты',
  },
  middleNameHint: {
    ru: 'если есть',
    en: 'if any',
    uz: 'agar mavjud bo\'lsa',
    tg: 'агар бошад',
    ky: 'болсо',
  },
  birthDate: {
    ru: 'Дата рождения',
    en: 'Date of Birth',
    uz: 'Tug\'ilgan sana',
    tg: 'Санаи таваллуд',
    ky: 'Туулган куну',
  },
  citizenship: {
    ru: 'Гражданство',
    en: 'Citizenship',
    uz: 'Fuqarolik',
    tg: 'Шаҳрвандӣ',
    ky: 'Жарандыгы',
  },
  citizenshipHint: {
    ru: 'необязательно',
    en: 'optional',
    uz: 'ixtiyoriy',
    tg: 'ихтиёрӣ',
    ky: 'милдеттуу эмес',
  },
  checkButton: {
    ru: 'Проверить запрет въезда',
    en: 'Check Entry Ban',
    uz: 'Kirish taqiqini tekshirish',
    tg: 'Санҷиши манъи воридот',
    ky: 'Кирууго тыюу текшеруу',
  },
  checking: {
    ru: 'Проверяем...',
    en: 'Checking...',
    uz: 'Tekshirilmoqda...',
    tg: 'Санҷиш...',
    ky: 'Текшерилууде...',
  },
  noBan: {
    ru: 'Запретов не обнаружено',
    en: 'No Bans Found',
    uz: 'Taqiq topilmadi',
    tg: 'Манъият ёфт нашуд',
    ky: 'Тыюу табылган жок',
  },
  noBanDescription: {
    ru: 'По вашим данным запрет на въезд в РФ не обнаружен',
    en: 'No entry ban to Russia found for your data',
    uz: 'Ma\'lumotlaringiz bo\'yicha Rossiyaga kirish taqiqi topilmadi',
    tg: 'Бо маълумоти шумо манъи воридот ба Русия ёфт нашуд',
    ky: 'Сиздин маалыматтар боюнча Россияга кирууго тыюу табылган жок',
  },
  hasBan: {
    ru: 'Обнаружен запрет на въезд',
    en: 'Entry Ban Found',
    uz: 'Kirish taqiqi topildi',
    tg: 'Манъи воридот ёфт шуд',
    ky: 'Кирууго тыюу табылды',
  },
  hasBanDescription: {
    ru: 'По вашим данным обнаружен запрет на въезд в РФ',
    en: 'Entry ban to Russia found for your data',
    uz: 'Ma\'lumotlaringiz bo\'yicha Rossiyaga kirish taqiqi topildi',
    tg: 'Бо маълумоти шумо манъи воридот ба Русия ёфт шуд',
    ky: 'Сиздин маалыматтар боюнча Россияга кирууго тыюу табылды',
  },
  unknown: {
    ru: 'Статус неизвестен',
    en: 'Status Unknown',
    uz: 'Holat noma\'lum',
    tg: 'Вазъият номаълум',
    ky: 'Статус белгисиз',
  },
  unknownDescription: {
    ru: 'Не удалось определить статус. Рекомендуем проверить на официальном сайте',
    en: 'Could not determine status. We recommend checking on the official website',
    uz: 'Holatni aniqlab bo\'lmadi. Rasmiy saytda tekshirishni tavsiya qilamiz',
    tg: 'Вазъиятро муайян кардан имконнопазир буд. Тавсия медиҳем дар сайти расмӣ санҷед',
    ky: 'Статусту аныктоого мумкун болгон жок. Расмий сайттан текшерууну сунуштайбыз',
  },
  checkFailed: {
    ru: 'Ошибка проверки',
    en: 'Check Failed',
    uz: 'Tekshiruv xatosi',
    tg: 'Хатогии санҷиш',
    ky: 'Текшеруу катасы',
  },
  checkFailedDescription: {
    ru: 'Произошла ошибка при проверке. Попробуйте позже',
    en: 'An error occurred during the check. Please try again later',
    uz: 'Tekshirish vaqtida xatolik yuz berdi. Keyinroq qayta urinib ko\'ring',
    tg: 'Ҳангоми санҷиш хатогӣ рух дод. Лутфан баъдтар бозкушиш кунед',
    ky: 'Текшеруу учурунда ката кетти. Сураныч, кийинчерээк кайра аракет кылыныз',
  },
  banType: {
    ru: 'Тип запрета',
    en: 'Ban Type',
    uz: 'Taqiq turi',
    tg: 'Навъи манъият',
    ky: 'Тыюу туру',
  },
  banTypeAdministrative: {
    ru: 'Административный',
    en: 'Administrative',
    uz: 'Ma\'muriy',
    tg: 'Маъмурӣ',
    ky: 'Административдик',
  },
  banTypeCriminal: {
    ru: 'Уголовный',
    en: 'Criminal',
    uz: 'Jinoiy',
    tg: 'Ҷиноятӣ',
    ky: 'Кылмыш',
  },
  banTypeSanitary: {
    ru: 'Санитарный',
    en: 'Sanitary',
    uz: 'Sanitariya',
    tg: 'Санитарӣ',
    ky: 'Санитардык',
  },
  reason: {
    ru: 'Причина',
    en: 'Reason',
    uz: 'Sabab',
    tg: 'Сабаб',
    ky: 'Себеп',
  },
  expiresAt: {
    ru: 'Действует до',
    en: 'Valid Until',
    uz: 'Amal qilish muddati',
    tg: 'Эътибор то',
    ky: 'Чейин жараянды',
  },
  source: {
    ru: 'Источник',
    en: 'Source',
    uz: 'Manba',
    tg: 'Сарчашма',
    ky: 'Булак',
  },
  checked: {
    ru: 'Проверено',
    en: 'Checked',
    uz: 'Tekshirilgan',
    tg: 'Санҷида шуд',
    ky: 'Текшерилди',
  },
  checkAnother: {
    ru: 'Проверить ещё',
    en: 'Check Another',
    uz: 'Boshqasini tekshirish',
    tg: 'Дигареро санҷидан',
    ky: 'Башкасын текшеруу',
  },
  done: {
    ru: 'Готово',
    en: 'Done',
    uz: 'Tayyor',
    tg: 'Тайёр',
    ky: 'Даяр',
  },
  testData: {
    ru: 'Тестовые данные',
    en: 'Test Data',
    uz: 'Test ma\'lumotlari',
    tg: 'Маълумоти озмоишӣ',
    ky: 'Тест маалыматтары',
  },
  testDataWarning: {
    ru: 'Сервис проверки работает в демо-режиме. Показаны тестовые данные, которые не отражают реальный статус. Для реальной проверки используйте официальный сайт МВД.',
    en: 'Verification service is in demo mode. Test data shown, which does not reflect the actual status. For real verification, use the official MVD website.',
    uz: 'Tekshirish xizmati demo rejimida ishlayapti. Test ma\'lumotlari ko\'rsatilmoqda. Haqiqiy tekshirish uchun IIV rasmiy saytidan foydalaning.',
    tg: 'Хидмати санҷиш дар режими демонстратсионӣ кор мекунад. Маълумоти санҷишӣ нишон дода мешавад. Барои санҷиши воқеӣ сайти расмии ВКДро истифода баред.',
    ky: 'Текшеруу кызматы демо режиминде иштеп жатат. Тест маалыматтары корсотулууде. Чыныгы текшеруу учун ИИМдин расмий сайтын колдонунуз.',
  },
  fallbackWarning: {
    ru: 'Сервис временно недоступен. Попробуйте позже или проверьте на официальном сайте МВД: services.fms.gov.ru',
    en: 'Service is temporarily unavailable. Try again later or check on the official MVD website: services.fms.gov.ru',
    uz: 'Xizmat vaqtincha mavjud emas. Keyinroq urinib ko\'ring yoki IIV rasmiy saytida tekshiring: services.fms.gov.ru',
    tg: 'Хидмат муваққатан дастрас нест. Баъдтар кушиш кунед ё дар сайти расмии ВКД: services.fms.gov.ru санҷед.',
    ky: 'Кызмат убактылуу жеткиликтуу эмес. Кийин кайра аракет кылынызам же ИИМдин расмий сайтынан текшеринизэ: services.fms.gov.ru',
  },
  infoText: {
    ru: 'Проверка выполняется через базу данных МВД и ФМС России. Результат носит информационный характер.',
    en: 'The check is performed through the database of the Russian MVD and FMS. The result is for informational purposes only.',
    uz: 'Tekshirish Rossiya IIV va FMS ma\'lumotlar bazasi orqali amalga oshiriladi. Natija faqat ma\'lumot uchun.',
    tg: 'Санҷиш тавассути базаи маълумоти ВКД ва ФМХ Русия иҷро мешавад. Натиҷа танҳо барои маълумот аст.',
    ky: 'Текшеруу Россиянын ИИМ жана ФМК маалымат базасы аркылуу жургузулот. Жыйынтык маалымат учун гана.',
  },
  error: {
    ru: 'Произошла ошибка при проверке. Попробуйте позже.',
    en: 'An error occurred during the check. Please try again later.',
    uz: 'Tekshirish vaqtida xatolik yuz berdi. Keyinroq qayta urinib ko\'ring.',
    tg: 'Ҳангоми санҷиш хатогӣ рух дод. Лутфан баъдтар бозкушиш кунед.',
    ky: 'Текшеруу учурунда ката кетти. Сураныч, кийинчерээк кайра аракет кылыныз.',
  },
  officialSite: {
    ru: 'Официальный сайт МВД',
    en: 'Official MVD Website',
    uz: 'IIV rasmiy sayti',
    tg: 'Сайти расмии ВКД',
    ky: 'ИИМдин расмий сайты',
  },
  officialFssp: {
    ru: 'База ФССП',
    en: 'FSSP Database',
    uz: 'FSSP bazasi',
    tg: 'Базаи ФССП',
    ky: 'ФССП базасы',
  },
  recommendation: {
    ru: 'Рекомендация',
    en: 'Recommendation',
    uz: 'Tavsiya',
    tg: 'Тавсия',
    ky: 'Сунуштама',
  },
  banRecommendation: {
    ru: 'При наличии запрета на въезд рекомендуем обратиться к миграционному юристу для уточнения статуса и возможности обжалования.',
    en: 'If you have an entry ban, we recommend contacting an immigration lawyer to clarify the status and appeal options.',
    uz: 'Kirish taqiqi mavjud bo\'lsa, holatni aniqlash va shikoyat qilish imkoniyatini bilish uchun migratsiya advokatiga murojaat qilishni tavsiya qilamiz.',
    tg: 'Агар манъи воридот дошта бошед, тавсия медиҳем барои равшан кардани вазъият ва имконияти шикоят ба адвокати муҳоҷират муроҷиат кунед.',
    ky: 'Кирууго тыюу болсо, статусту тактоо жана даттануу мумкунчулугун билуу учун миграция юристине кайрылууну сунуштайбыз.',
  },
};

const citizenshipOptions = [
  { code: '', label: { ru: 'Не указано', en: 'Not specified', uz: 'Ko\'rsatilmagan', tg: 'Нишон дода нашудааст', ky: 'Корсотулгон эмес' } },
  { code: 'UZ', label: { ru: 'Узбекистан', en: 'Uzbekistan', uz: 'O\'zbekiston', tg: 'Узбекистон', ky: 'Озбекстан' } },
  { code: 'TJ', label: { ru: 'Таджикистан', en: 'Tajikistan', uz: 'Tojikiston', tg: 'Тоҷикистон', ky: 'Тажикстан' } },
  { code: 'KG', label: { ru: 'Кыргызстан', en: 'Kyrgyzstan', uz: 'Qirg\'iziston', tg: 'Қирғизистон', ky: 'Кыргызстан' } },
  { code: 'AM', label: { ru: 'Армения', en: 'Armenia', uz: 'Armaniston', tg: 'Арманистон', ky: 'Армения' } },
  { code: 'AZ', label: { ru: 'Азербайджан', en: 'Azerbaijan', uz: 'Ozarbayjon', tg: 'Озарбойҷон', ky: 'Азербайжан' } },
  { code: 'MD', label: { ru: 'Молдова', en: 'Moldova', uz: 'Moldova', tg: 'Молдова', ky: 'Молдова' } },
  { code: 'UA', label: { ru: 'Украина', en: 'Ukraine', uz: 'Ukraina', tg: 'Украина', ky: 'Украина' } },
  { code: 'BY', label: { ru: 'Беларусь', en: 'Belarus', uz: 'Belarus', tg: 'Беларус', ky: 'Беларусь' } },
  { code: 'KZ', label: { ru: 'Казахстан', en: 'Kazakhstan', uz: 'Qozog\'iston', tg: 'Қазоқистон', ky: 'Казакстан' } },
];

export function BanChecker({ onClose }: BanCheckerProps) {
  const { language } = useLanguageStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BanCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = (key: string): string => {
    return labels[key]?.[language] || labels[key]?.en || key;
  };

  const getBanTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      administrative: t('banTypeAdministrative'),
      criminal: t('banTypeCriminal'),
      sanitary: t('banTypeSanitary'),
    };
    return labels[type] || type;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (result || error) {
      setResult(null);
      setError(null);
    }
  };

  const isFormValid = () => {
    return (
      formData.lastName.trim() !== '' &&
      formData.firstName.trim() !== '' &&
      formData.birthDate !== ''
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const queryParams: Record<string, string> = {
        lastName: formData.lastName.trim(),
        firstName: formData.firstName.trim(),
        birthDate: formData.birthDate,
      };
      if (formData.middleName.trim()) {
        queryParams.middleName = formData.middleName.trim();
      }
      if (formData.citizenship) {
        queryParams.citizenship = formData.citizenship;
      }

      const query = new URLSearchParams(queryParams);
      const response = await fetch(`${API_BASE_URL}/api/v1/utilities/ban-check?${query}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to check ban status');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Ban check error:', err);
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setResult(null);
    setError(null);
  };

  const isMockOrFallback = result?.source === 'fallback' || result?.source === 'cache';

  const renderForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('lastName')} *
          </label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value.toUpperCase())}
            placeholder="IVANOV"
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('firstName')} *
          </label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value.toUpperCase())}
            placeholder="IVAN"
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('middleName')} <span className="text-gray-400 font-normal">({t('middleNameHint')})</span>
        </label>
        <input
          type="text"
          value={formData.middleName}
          onChange={(e) => handleInputChange('middleName', e.target.value.toUpperCase())}
          placeholder="IVANOVICH"
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('birthDate')} *
        </label>
        <input
          type="date"
          value={formData.birthDate}
          onChange={(e) => handleInputChange('birthDate', e.target.value)}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('citizenship')} <span className="text-gray-400 font-normal">({t('citizenshipHint')})</span>
        </label>
        <select
          value={formData.citizenship}
          onChange={(e) => handleInputChange('citizenship', e.target.value)}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
        >
          {citizenshipOptions.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label[language]}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!isFormValid() || isLoading}
        className={`w-full font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
          isFormValid() && !isLoading
            ? 'bg-red-600 text-white hover:bg-red-700 active:scale-98'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            {t('checking')}
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            {t('checkButton')}
          </>
        )}
      </button>

      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
        <p className="text-sm text-red-800">{t('infoText')}</p>
      </div>

      {/* External links */}
      <div className="space-y-3">
        <a
          href="https://services.fms.gov.ru/info-service.htm?sid=2000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-red-600 hover:text-red-800 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          {t('officialSite')}
        </a>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!result) return null;

    const hasBan = result.status === 'has_ban';
    const isUnknown = result.status === 'unknown';
    const checkFailed = result.status === 'check_failed';

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              hasBan
                ? 'bg-red-100'
                : isUnknown || checkFailed
                  ? 'bg-yellow-100'
                  : 'bg-green-100'
            }`}
          >
            {hasBan ? (
              <AlertTriangle className="w-10 h-10 text-red-600" />
            ) : isUnknown || checkFailed ? (
              <AlertCircle className="w-10 h-10 text-yellow-600" />
            ) : (
              <CheckCircle className="w-10 h-10 text-green-600" />
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {hasBan
              ? t('hasBan')
              : isUnknown
                ? t('unknown')
                : checkFailed
                  ? t('checkFailed')
                  : t('noBan')}
          </h3>
          <p className="text-sm text-gray-600">
            {hasBan
              ? t('hasBanDescription')
              : isUnknown
                ? t('unknownDescription')
                : checkFailed
                  ? result.error || t('checkFailedDescription')
                  : t('noBanDescription')}
          </p>
        </div>

        {hasBan && result.banType && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-red-700">{t('banType')}</span>
              <span className="font-bold text-red-800">{getBanTypeLabel(result.banType)}</span>
            </div>
            {result.reason && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-red-700">{t('reason')}</span>
                <span className="font-medium text-red-800">{result.reason}</span>
              </div>
            )}
            {result.expiresAt && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-700">{t('expiresAt')}</span>
                <span className="font-medium text-red-800">
                  {new Date(result.expiresAt).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}
                </span>
              </div>
            )}
          </div>
        )}

        {hasBan && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">{t('recommendation')}</h4>
            <p className="text-sm text-yellow-800">{t('banRecommendation')}</p>
          </div>
        )}

        {/* Warning for cache/fallback sources */}
        {isMockOrFallback && (
          <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-900">{t('testData')}</p>
                <p className="text-sm text-orange-800">
                  {result.source === 'cache' ? t('testDataWarning') : t('fallbackWarning')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-500">
          {t('source')}: {result.source?.toUpperCase() || 'N/A'} | {t('checked')}:{' '}
          {new Date(result.checkedAt).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')}
        </div>

        <a
          href="https://services.fms.gov.ru/info-service.htm?sid=2000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-red-600 hover:text-red-800 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          {t('officialSite')}
        </a>

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-200 transition-colors"
          >
            {t('checkAnother')}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-red-600 text-white font-bold py-4 rounded-xl hover:bg-red-700 transition-colors"
          >
            {t('done')}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-600 to-red-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('title')}</h2>
              <p className="text-xs text-red-100">{t('subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {result ? renderResult() : renderForm()}
        </div>
      </div>
    </div>
  );
}
