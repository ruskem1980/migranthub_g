'use client';

import { useState } from 'react';
import { X, FileText, Loader2, CheckCircle, AlertTriangle, AlertCircle, ExternalLink, ShieldCheck, Clock, Building, MapPin } from 'lucide-react';
import { useLanguageStore, Language } from '@/lib/stores/languageStore';

interface WorkPermitCheckModalProps {
  onClose: () => void;
}

interface FormData {
  series: string;
  number: string;
  lastName: string;
  firstName: string;
}

type WorkPermitStatus = 'VALID' | 'INVALID' | 'EXPIRED' | 'NOT_FOUND' | 'UNKNOWN';
type WorkPermitSource = 'mvd' | 'cache' | 'fallback';

interface WorkPermitCheckResponse {
  status: WorkPermitStatus;
  isValid: boolean;
  series: string;
  number: string;
  source: WorkPermitSource;
  checkedAt: string;
  region?: string;
  employer?: string;
  issueDate?: string;
  expirationDate?: string;
  message?: string;
  error?: string;
}

const initialFormData: FormData = {
  series: '',
  number: '',
  lastName: '',
  firstName: '',
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const labels: Record<string, Record<Language, string>> = {
  title: {
    ru: 'Проверка РНР',
    en: 'Work Permit Check',
    uz: 'RNR tekshiruvi',
    tg: 'Санҷиши РНР',
    ky: 'РНР текшеруу',
  },
  subtitle: {
    ru: 'Проверка разрешения на работу',
    en: 'Check work permit validity',
    uz: 'Ish ruxsatnomasini tekshirish',
    tg: 'Санҷиши иҷозатномаи корӣ',
    ky: 'Иш уруксатын текшеруу',
  },
  series: {
    ru: 'Серия',
    en: 'Series',
    uz: 'Seriya',
    tg: 'Силсила',
    ky: 'Серия',
  },
  seriesPlaceholder: {
    ru: 'AB12',
    en: 'AB12',
    uz: 'AB12',
    tg: 'AB12',
    ky: 'AB12',
  },
  seriesHint: {
    ru: '2-4 символа',
    en: '2-4 characters',
    uz: '2-4 belgi',
    tg: '2-4 рамз',
    ky: '2-4 белги',
  },
  number: {
    ru: 'Номер',
    en: 'Number',
    uz: 'Raqam',
    tg: 'Рақам',
    ky: 'Номер',
  },
  numberPlaceholder: {
    ru: '1234567',
    en: '1234567',
    uz: '1234567',
    tg: '1234567',
    ky: '1234567',
  },
  numberHint: {
    ru: '6-7 цифр',
    en: '6-7 digits',
    uz: '6-7 raqam',
    tg: '6-7 рақам',
    ky: '6-7 сан',
  },
  lastName: {
    ru: 'Фамилия',
    en: 'Last name',
    uz: 'Familiya',
    tg: 'Насаб',
    ky: 'Фамилия',
  },
  lastNamePlaceholder: {
    ru: 'Иванов',
    en: 'Smith',
    uz: 'Karimov',
    tg: 'Раҳимов',
    ky: 'Мамытов',
  },
  lastNameHint: {
    ru: 'Как в документе',
    en: 'As in document',
    uz: 'Hujjatdagi kabi',
    tg: 'Мисли ҳуҷҷат',
    ky: 'Документтегидей',
  },
  firstName: {
    ru: 'Имя',
    en: 'First name',
    uz: 'Ism',
    tg: 'Ном',
    ky: 'Аты',
  },
  firstNamePlaceholder: {
    ru: 'Иван',
    en: 'John',
    uz: 'Karim',
    tg: 'Раҳим',
    ky: 'Мамыт',
  },
  firstNameHint: {
    ru: 'Необязательно',
    en: 'Optional',
    uz: 'Ixtiyoriy',
    tg: 'Ихтиёрӣ',
    ky: 'Милдеттуу эмес',
  },
  checkButton: {
    ru: 'Проверить',
    en: 'Check',
    uz: 'Tekshirish',
    tg: 'Санҷидан',
    ky: 'Текшеруу',
  },
  checking: {
    ru: 'Проверяем...',
    en: 'Checking...',
    uz: 'Tekshirilmoqda...',
    tg: 'Санҷиш...',
    ky: 'Текшерилууде...',
  },
  valid: {
    ru: 'Разрешение действительно',
    en: 'Work Permit is Valid',
    uz: 'Ruxsatnoma haqiqiy',
    tg: 'Иҷозатнома эътибор дорад',
    ky: 'Уруксат жарактуу',
  },
  validDescription: {
    ru: 'Разрешение на работу действительно и зарегистрировано в системе МВД',
    en: 'Work permit is valid and registered in the MVD system',
    uz: 'Ish ruxsatnomasi haqiqiy va IIV tizimida ro\'yxatga olingan',
    tg: 'Иҷозатномаи корӣ эътибор дорад ва дар системаи ВКД сабт шудааст',
    ky: 'Иш уруксаты жарактуу жана ИИМ тутумунда катталган',
  },
  invalid: {
    ru: 'Разрешение недействительно',
    en: 'Work Permit is Invalid',
    uz: 'Ruxsatnoma yaroqsiz',
    tg: 'Иҷозатнома беэътибор аст',
    ky: 'Уруксат жарактуу эмес',
  },
  invalidDescription: {
    ru: 'Разрешение на работу аннулировано или содержит ошибки в данных',
    en: 'Work permit has been revoked or contains data errors',
    uz: 'Ish ruxsatnomasi bekor qilingan yoki ma\'lumotlarda xatolar mavjud',
    tg: 'Иҷозатномаи корӣ бекор карда шудааст ё маълумот хатогӣ дорад',
    ky: 'Иш уруксаты жокко чыгарылган же маалыматтарда каталар бар',
  },
  expired: {
    ru: 'Срок действия истёк',
    en: 'Work Permit Expired',
    uz: 'Amal muddati tugagan',
    tg: 'Мӯҳлати эътибор гузашт',
    ky: 'Жарактуулук мооноту откон',
  },
  expiredDescription: {
    ru: 'Срок действия разрешения на работу истёк. Требуется продление.',
    en: 'Work permit has expired. Extension is required.',
    uz: 'Ish ruxsatnomasining amal qilish muddati tugagan. Uzaytirish talab qilinadi.',
    tg: 'Мӯҳлати иҷозатномаи корӣ гузашт. Тамдид лозим аст.',
    ky: 'Иш уруксатынын мооноту откон. Узартуу талап кылынат.',
  },
  notFound: {
    ru: 'Разрешение не найдено',
    en: 'Work Permit Not Found',
    uz: 'Ruxsatnoma topilmadi',
    tg: 'Иҷозатнома ёфт нашуд',
    ky: 'Уруксат табылган жок',
  },
  notFoundDescription: {
    ru: 'Разрешение с указанными данными не найдено в системе МВД',
    en: 'Work permit with specified data was not found in the MVD system',
    uz: 'Ko\'rsatilgan ma\'lumotlar bilan ruxsatnoma IIV tizimida topilmadi',
    tg: 'Иҷозатнома бо маълумоти зикршуда дар системаи ВКД ёфт нашуд',
    ky: 'Корсотулгон маалыматтар менен уруксат ИИМ тутумунан табылган жок',
  },
  unknown: {
    ru: 'Статус неизвестен',
    en: 'Status Unknown',
    uz: 'Holati noma\'lum',
    tg: 'Вазъият номаълум',
    ky: 'Статусу белгисиз',
  },
  unknownDescription: {
    ru: 'Не удалось определить статус разрешения. Попробуйте позже.',
    en: 'Could not determine work permit status. Please try again later.',
    uz: 'Ruxsatnoma holatini aniqlab bo\'lmadi. Keyinroq qayta urinib ko\'ring.',
    tg: 'Вазъияти иҷозатномаро муайян кардан имконнопазир буд. Лутфан баъдтар кушиш кунед.',
    ky: 'Уруксат статусун аныктоо мумкун болгон жок. Сураныч, кийинчерээк кайра аракет кылыныз.',
  },
  checkAnother: {
    ru: 'Проверить другое',
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
  testData: {
    ru: 'Тестовые данные',
    en: 'Test Data',
    uz: 'Test ma\'lumotlari',
    tg: 'Маълумоти озмоишӣ',
    ky: 'Тест маалыматтары',
  },
  testDataWarning: {
    ru: 'Сервис проверки отключен. Показаны тестовые данные. Для реальной проверки используйте официальный сайт МВД.',
    en: 'Verification service is disabled. Test data shown. For real verification, use the official MVD website.',
    uz: 'Tekshirish xizmati o\'chirilgan. Test ma\'lumotlari ko\'rsatilmoqda. Haqiqiy tekshirish uchun MVD rasmiy saytidan foydalaning.',
    tg: 'Хидмати санҷиш хомуш аст. Маълумоти санҷишӣ нишон дода мешавад. Барои санҷиши воқеӣ сайти расмии ВКДро истифода баред.',
    ky: 'Текшеруу кызматы очурулду. Тест маалыматтары корсотулуп жатат. Чыныгы текшеруу учун ИИМдин расмий сайтын колдонунуз.',
  },
  fallbackWarning: {
    ru: 'Сервис временно недоступен. Попробуйте позже или проверьте на официальном сайте МВД.',
    en: 'Service is temporarily unavailable. Try again later or check on the official MVD website.',
    uz: 'Xizmat vaqtincha mavjud emas. Keyinroq urinib ko\'ring yoki MVD rasmiy saytida tekshiring.',
    tg: 'Хидмат муваққатан дастрас нест. Баъдтар кушиш кунед ё дар сайти расмии ВКД санҷед.',
    ky: 'Кызмат убактылуу жеткиликтуу эмес. Кийин кайра аракет кылыныз же ИИМдин расмий сайтынан текшериниз.',
  },
  officialSite: {
    ru: 'Официальный сайт МВД',
    en: 'Official MVD Website',
    uz: 'MVD rasmiy sayti',
    tg: 'Сайти расмии ВКД',
    ky: 'ИИМдин расмий сайты',
  },
  infoText: {
    ru: 'Проверка выполняется через базу данных МВД России. Для точной проверки рекомендуется указать фамилию.',
    en: 'The check is performed through the Russian MVD database. For accurate verification, it is recommended to provide the last name.',
    uz: 'Tekshirish Rossiya MVD ma\'lumotlar bazasi orqali amalga oshiriladi. Aniq tekshirish uchun familiyani kiritish tavsiya etiladi.',
    tg: 'Санҷиш тавассути базаи маълумоти ВКД Русия иҷро мешавад. Барои санҷиши дақиқ насабро зикр кардан тавсия дода мешавад.',
    ky: 'Текшеруу Россия ИИМинин маалыматтар базасы аркылуу жургузулот. Так текшеруу учун фамилияны корсотуу сунушталат.',
  },
  error: {
    ru: 'Произошла ошибка при проверке. Попробуйте позже.',
    en: 'An error occurred during the check. Please try again later.',
    uz: 'Tekshirish vaqtida xatolik yuz berdi. Keyinroq qayta urinib ko\'ring.',
    tg: 'Ҳангоми санҷиш хатогӣ рух дод. Лутфан баъдтар бозкушиш кунед.',
    ky: 'Текшеруу учурунда ката кетти. Сураныч, кийинчерээк кайра аракет кылыныз.',
  },
  recommendation: {
    ru: 'Рекомендация',
    en: 'Recommendation',
    uz: 'Tavsiya',
    tg: 'Тавсия',
    ky: 'Сунуштама',
  },
  invalidRecommendation: {
    ru: 'Если ваше разрешение недействительно, обратитесь в территориальный орган МВД для выяснения причин.',
    en: 'If your work permit is invalid, contact the local MVD office to clarify the reasons.',
    uz: 'Agar ruxsatnomangiz yaroqsiz bo\'lsa, sabablarni aniqlash uchun hududiy IIV bo\'limiga murojaat qiling.',
    tg: 'Агар иҷозатномаи шумо беэътибор бошад, барои муайян кардани сабабҳо ба идораи ҳудудии ВКД муроҷиат кунед.',
    ky: 'Эгерде сиздин уруксатыныз жарактуу эмес болсо, себептерин билуу учун аймактык ИИМ болумуну кайрылыныз.',
  },
  expiredRecommendation: {
    ru: 'Разрешение истекло. Для продолжения работы необходимо оформить продление или новое разрешение.',
    en: 'Permit has expired. To continue working, you need to apply for an extension or a new permit.',
    uz: 'Ruxsatnoma muddati tugagan. Ishlashni davom ettirish uchun uzaytirish yoki yangi ruxsatnoma olish kerak.',
    tg: 'Мӯҳлати иҷозатнома гузашт. Барои идома додани кор тамдид ё иҷозатномаи нав лозим.',
    ky: 'Уруксаттын мооноту откон. Иштоону улантуу учун узартуу же жаны уруксат алуу керек.',
  },
  permitData: {
    ru: 'Данные разрешения',
    en: 'Permit Data',
    uz: 'Ruxsatnoma ma\'lumotlari',
    tg: 'Маълумоти иҷозатнома',
    ky: 'Уруксат маалыматтары',
  },
  region: {
    ru: 'Регион',
    en: 'Region',
    uz: 'Hudud',
    tg: 'Минтақа',
    ky: 'Аймак',
  },
  employer: {
    ru: 'Работодатель',
    en: 'Employer',
    uz: 'Ish beruvchi',
    tg: 'Корфармо',
    ky: 'Иш берууну',
  },
  validUntil: {
    ru: 'Действителен до',
    en: 'Valid until',
    uz: 'Amal qiladi',
    tg: 'Эътибор то',
    ky: 'Жарактуу',
  },
  issuedOn: {
    ru: 'Выдан',
    en: 'Issued on',
    uz: 'Berilgan',
    tg: 'Додашуд',
    ky: 'Берилген',
  },
};

// Format series input (2-4 alphanumeric characters)
function formatSeries(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
}

// Format number input (6-7 digits)
function formatNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 7);
}

// Format name input (letters and hyphens only)
function formatName(value: string): string {
  return value.replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, '').slice(0, 50);
}

export function WorkPermitCheckModal({ onClose }: WorkPermitCheckModalProps) {
  const { language } = useLanguageStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<WorkPermitCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = (key: string): string => {
    return labels[key]?.[language] || labels[key]?.en || key;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    let formattedValue: string;
    switch (field) {
      case 'series':
        formattedValue = formatSeries(value);
        break;
      case 'number':
        formattedValue = formatNumber(value);
        break;
      case 'lastName':
      case 'firstName':
        formattedValue = formatName(value);
        break;
      default:
        formattedValue = value;
    }
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    if (result || error) {
      setResult(null);
      setError(null);
    }
  };

  const isFormValid = () => {
    return formData.series.length >= 2 && formData.series.length <= 4 && formData.number.length >= 6 && formData.number.length <= 7;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/utilities/work-permit-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          series: formData.series,
          number: formData.number,
          lastName: formData.lastName || undefined,
          firstName: formData.firstName || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check work permit');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Work permit check error:', err);
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

  const getStatusConfig = (status: WorkPermitStatus) => {
    switch (status) {
      case 'VALID':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          title: t('valid'),
          description: t('validDescription'),
          resultBgColor: 'bg-green-50',
          resultBorderColor: 'border-green-200',
        };
      case 'INVALID':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-red-100',
          iconColor: 'text-red-600',
          title: t('invalid'),
          description: t('invalidDescription'),
          resultBgColor: 'bg-red-50',
          resultBorderColor: 'border-red-200',
        };
      case 'EXPIRED':
        return {
          icon: Clock,
          bgColor: 'bg-orange-100',
          iconColor: 'text-orange-600',
          title: t('expired'),
          description: t('expiredDescription'),
          resultBgColor: 'bg-orange-50',
          resultBorderColor: 'border-orange-200',
        };
      case 'NOT_FOUND':
        return {
          icon: AlertCircle,
          bgColor: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          title: t('notFound'),
          description: t('notFoundDescription'),
          resultBgColor: 'bg-yellow-50',
          resultBorderColor: 'border-yellow-200',
        };
      case 'UNKNOWN':
      default:
        return {
          icon: AlertCircle,
          bgColor: 'bg-gray-100',
          iconColor: 'text-gray-600',
          title: t('unknown'),
          description: t('unknownDescription'),
          resultBgColor: 'bg-gray-50',
          resultBorderColor: 'border-gray-200',
        };
    }
  };

  const renderForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('series')} *
          </label>
          <input
            type="text"
            value={formData.series}
            onChange={(e) => handleInputChange('series', e.target.value)}
            placeholder={t('seriesPlaceholder')}
            maxLength={4}
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-lg font-mono tracking-widest uppercase"
          />
          <p className="text-xs text-gray-500 mt-1 text-center">{t('seriesHint')}</p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('number')} *
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={formData.number}
            onChange={(e) => handleInputChange('number', e.target.value)}
            placeholder={t('numberPlaceholder')}
            maxLength={7}
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-lg font-mono tracking-widest"
          />
          <p className="text-xs text-gray-500 mt-1 text-center">{t('numberHint')}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('lastName')}
        </label>
        <input
          type="text"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          placeholder={t('lastNamePlaceholder')}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        <p className="text-xs text-gray-500 mt-1">{t('lastNameHint')}</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('firstName')}
        </label>
        <input
          type="text"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          placeholder={t('firstNamePlaceholder')}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        <p className="text-xs text-gray-500 mt-1">{t('firstNameHint')}</p>
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
            ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-98'
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
            <ShieldCheck className="w-5 h-5" />
            {t('checkButton')}
          </>
        )}
      </button>

      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
        <p className="text-sm text-blue-800">{t('infoText')}</p>
      </div>

      <a
        href="https://services.fms.gov.ru/info-service.htm"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        {t('officialSite')}
      </a>
    </div>
  );

  const renderResult = () => {
    if (!result) return null;

    const statusConfig = getStatusConfig(result.status);
    const StatusIcon = statusConfig.icon;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${statusConfig.bgColor}`}
          >
            <StatusIcon className={`w-10 h-10 ${statusConfig.iconColor}`} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {statusConfig.title}
          </h3>
          <p className="text-sm text-gray-600">
            {statusConfig.description}
          </p>
        </div>

        {/* Permit data card */}
        <div className={`${statusConfig.resultBgColor} border-2 ${statusConfig.resultBorderColor} rounded-2xl p-6`}>
          <p className="text-sm text-gray-700 mb-3 font-medium">{t('permitData')}</p>
          <div className="flex justify-center gap-4 text-2xl font-mono font-bold text-gray-900 mb-4">
            <span>{result.series}</span>
            <span>{result.number}</span>
          </div>

          {/* Additional details */}
          <div className="space-y-2 text-sm">
            {result.region && (
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{t('region')}:</span>
                <span>{result.region}</span>
              </div>
            )}
            {result.employer && (
              <div className="flex items-center gap-2 text-gray-700">
                <Building className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{t('employer')}:</span>
                <span>{result.employer}</span>
              </div>
            )}
            {result.issueDate && (
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{t('issuedOn')}:</span>
                <span>{new Date(result.issueDate).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}</span>
              </div>
            )}
            {result.expirationDate && (
              <div className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{t('validUntil')}:</span>
                <span>{new Date(result.expirationDate).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Recommendation for invalid permit */}
        {result.status === 'INVALID' && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">{t('recommendation')}</h4>
            <p className="text-sm text-yellow-800">{t('invalidRecommendation')}</p>
          </div>
        )}

        {/* Recommendation for expired permit */}
        {result.status === 'EXPIRED' && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
            <h4 className="font-semibold text-orange-900 mb-2">{t('recommendation')}</h4>
            <p className="text-sm text-orange-800">{t('expiredRecommendation')}</p>
          </div>
        )}

        {/* Warning for mock/fallback sources */}
        {result.source === 'fallback' && (
          <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-900">{t('testData')}</p>
                <p className="text-sm text-orange-800">
                  {t('testDataWarning')}
                </p>
              </div>
            </div>
          </div>
        )}

        {result.error && result.source !== 'fallback' && (
          <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-orange-800">{result.error}</p>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-500">
          {t('source')}: {result.source.toUpperCase()} | {t('checked')}:{' '}
          {new Date(result.checkedAt).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')}
        </div>

        <a
          href="https://services.fms.gov.ru/info-service.htm"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
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
            className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors"
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-teal-600 to-teal-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('title')}</h2>
              <p className="text-xs text-teal-100">{t('subtitle')}</p>
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
