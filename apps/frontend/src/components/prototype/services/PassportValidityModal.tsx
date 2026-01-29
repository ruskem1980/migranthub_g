'use client';

import { useState } from 'react';
import { X, FileText, Loader2, CheckCircle, AlertTriangle, AlertCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { useLanguageStore, Language } from '@/lib/stores/languageStore';

interface PassportValidityModalProps {
  onClose: () => void;
}

interface FormData {
  series: string;
  number: string;
}

type PassportValidityStatus = 'VALID' | 'INVALID' | 'NOT_FOUND' | 'UNKNOWN';
type PassportValiditySource = 'mvd' | 'cache' | 'fallback';

interface PassportValidityResponse {
  status: PassportValidityStatus;
  isValid: boolean;
  series: string;
  number: string;
  source: PassportValiditySource;
  checkedAt: string;
  message?: string;
  error?: string;
}

const initialFormData: FormData = {
  series: '',
  number: '',
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const labels: Record<string, Record<Language, string>> = {
  title: {
    ru: 'Проверка паспорта',
    en: 'Passport Check',
    uz: 'Pasport tekshiruvi',
    tg: 'Санҷиши шиноснома',
    ky: 'Паспорт текшеруусу',
  },
  subtitle: {
    ru: 'Проверка действительности паспорта РФ',
    en: 'Check Russian passport validity',
    uz: 'RF pasportining haqiqiyligini tekshirish',
    tg: 'Санҷиши эътибори шиносномаи ФР',
    ky: 'РФ паспортунун жарактуулугун текшеруу',
  },
  series: {
    ru: 'Серия паспорта',
    en: 'Passport Series',
    uz: 'Pasport seriyasi',
    tg: 'Силсилаи шиноснома',
    ky: 'Паспорт сериясы',
  },
  seriesPlaceholder: {
    ru: '4510',
    en: '4510',
    uz: '4510',
    tg: '4510',
    ky: '4510',
  },
  seriesHint: {
    ru: '4 цифры',
    en: '4 digits',
    uz: '4 ta raqam',
    tg: '4 рақам',
    ky: '4 сан',
  },
  number: {
    ru: 'Номер паспорта',
    en: 'Passport Number',
    uz: 'Pasport raqami',
    tg: 'Рақами шиноснома',
    ky: 'Паспорт номери',
  },
  numberPlaceholder: {
    ru: '123456',
    en: '123456',
    uz: '123456',
    tg: '123456',
    ky: '123456',
  },
  numberHint: {
    ru: '6 цифр',
    en: '6 digits',
    uz: '6 ta raqam',
    tg: '6 рақам',
    ky: '6 сан',
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
    ru: 'Паспорт действителен',
    en: 'Passport is Valid',
    uz: 'Pasport haqiqiy',
    tg: 'Шиноснома эътибор дорад',
    ky: 'Паспорт жарактуу',
  },
  validDescription: {
    ru: 'Паспорт не найден в базе недействительных паспортов МВД',
    en: 'Passport not found in the invalid passports database',
    uz: 'Pasport yaroqsiz pasportlar bazasida topilmadi',
    tg: 'Шиноснома дар базаи шиносномаҳои беэътибор ёфт нашуд',
    ky: 'Паспорт жарактуу эмес паспорттор базасынан табылган жок',
  },
  invalid: {
    ru: 'Паспорт недействителен',
    en: 'Passport is Invalid',
    uz: 'Pasport yaroqsiz',
    tg: 'Шиноснома беэътибор аст',
    ky: 'Паспорт жарактуу эмес',
  },
  invalidDescription: {
    ru: 'Паспорт числится в базе недействительных паспортов МВД',
    en: 'Passport is listed in the invalid passports database',
    uz: 'Pasport yaroqsiz pasportlar bazasida ro\'yxatga olingan',
    tg: 'Шиноснома дар базаи шиносномаҳои беэътибор сабт шудааст',
    ky: 'Паспорт жарактуу эмес паспорттор базасында катталган',
  },
  notFound: {
    ru: 'Паспорт не найден',
    en: 'Passport Not Found',
    uz: 'Pasport topilmadi',
    tg: 'Шиноснома ёфт нашуд',
    ky: 'Паспорт табылган жок',
  },
  notFoundDescription: {
    ru: 'Паспорт не найден в базе недействительных паспортов (скорее всего, действителен)',
    en: 'Passport not found in the invalid database (likely valid)',
    uz: 'Pasport yaroqsiz bazasida topilmadi (ehtimol haqiqiy)',
    tg: 'Шиноснома дар базаи беэътибор ёфт нашуд (эҳтимол эътибор дорад)',
    ky: 'Паспорт жарактуу эмес базадан табылган жок (балким жарактуу)',
  },
  unknown: {
    ru: 'Статус неизвестен',
    en: 'Status Unknown',
    uz: 'Holati noma\'lum',
    tg: 'Вазъият номаълум',
    ky: 'Статусу белгисиз',
  },
  unknownDescription: {
    ru: 'Не удалось определить статус паспорта. Попробуйте позже.',
    en: 'Could not determine passport status. Please try again later.',
    uz: 'Pasport holatini aniqlab bo\'lmadi. Keyinroq qayta urinib ko\'ring.',
    tg: 'Вазъияти шиносномаро муайян кардан имконнопазир буд. Лутфан баъдтар кушиш кунед.',
    ky: 'Паспорт статусун аныктоо мумкун болгон жок. Сураныч, кийинчерээк кайра аракет кылыныз.',
  },
  checkAnother: {
    ru: 'Проверить другой',
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
    ky: 'Текшеруу кызматы ошурулду. Тест маалыматтары корсотулуп жатат. Чыныгы текшеруу учун ИИМдин расмий сайтын колдонунуз.',
  },
  fallbackWarning: {
    ru: 'Сервис временно недоступен. Попробуйте позже или проверьте на официальном сайте МВД.',
    en: 'Service is temporarily unavailable. Try again later or check on the official MVD website.',
    uz: 'Xizmat vaqtincha mavjud emas. Keyinroq urinib ko\'ring yoki MVD rasmiy saytida tekshiring.',
    tg: 'Хидмат муваққатан дастрас нест. Баъдтар кушиш кунед ё дар сайти расмии ВКД санҷед.',
    ky: 'Кызмат убактылуу жеткиликтуу эмес. Кийин кайра аракет кылыныз же ИИМдин расмий сайтынан текшеринизэ.',
  },
  officialSite: {
    ru: 'Официальный сайт МВД',
    en: 'Official MVD Website',
    uz: 'MVD rasmiy sayti',
    tg: 'Сайти расмии ВКД',
    ky: 'ИИМдин расмий сайты',
  },
  infoText: {
    ru: 'Проверка выполняется через базу недействительных паспортов МВД России. Если паспорт не найден в базе - он считается действительным.',
    en: 'The check is performed through the database of invalid passports of the Russian MVD. If the passport is not found in the database, it is considered valid.',
    uz: 'Tekshirish Rossiya MVD ning yaroqsiz pasportlar bazasi orqali amalga oshiriladi. Agar pasport bazada topilmasa - u haqiqiy hisoblanadi.',
    tg: 'Санҷиш тавассути базаи шиносномаҳои беэътибори ВКД Русия иҷро мешавад. Агар шиноснома дар база ёфт нашавад - он эътибор ҳисоб мешавад.',
    ky: 'Текшеруу Россия ИИМинин жарактуу эмес паспорттор базасы аркылуу жургузулот. Эгер паспорт базадан табылбаса - ал жарактуу деп эсептелет.',
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
    ru: 'Если ваш паспорт числится как недействительный, обратитесь в паспортный стол для выяснения причин и получения нового паспорта.',
    en: 'If your passport is listed as invalid, contact the passport office to clarify the reasons and obtain a new passport.',
    uz: 'Agar pasportingiz yaroqsiz sifatida ro\'yxatga olingan bo\'lsa, sabablarni aniqlash va yangi pasport olish uchun pasport bo\'limiga murojaat qiling.',
    tg: 'Агар шиносномаи шумо ҳамчун беэътибор сабт шуда бошад, барои муайян кардани сабабҳо ва гирифтани шиносномаи нав ба идораи шиноснома муроҷиат кунед.',
    ky: 'Эгерде сиздин паспортунуз жарактуу эмес деп катталган болсо, себептерин билуу жана жаны паспорт алуу учун паспорт столуна кайрылыныз.',
  },
  passportData: {
    ru: 'Данные паспорта',
    en: 'Passport Data',
    uz: 'Pasport ma\'lumotlari',
    tg: 'Маълумоти шиноснома',
    ky: 'Паспорт маалыматтары',
  },
};

// Format series input (only 4 digits)
function formatSeries(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

// Format number input (only 6 digits)
function formatNumber(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6);
}

export function PassportValidityModal({ onClose }: PassportValidityModalProps) {
  const { language } = useLanguageStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PassportValidityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = (key: string): string => {
    return labels[key]?.[language] || labels[key]?.en || key;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    const formattedValue = field === 'series' ? formatSeries(value) : formatNumber(value);
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    if (result || error) {
      setResult(null);
      setError(null);
    }
  };

  const isFormValid = () => {
    return formData.series.length === 4 && formData.number.length === 6;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/utilities/passport-validity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          series: formData.series,
          number: formData.number,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check passport validity');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Passport validity check error:', err);
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

  const getStatusConfig = (status: PassportValidityStatus) => {
    switch (status) {
      case 'VALID':
      case 'NOT_FOUND':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          title: status === 'VALID' ? t('valid') : t('notFound'),
          description: status === 'VALID' ? t('validDescription') : t('notFoundDescription'),
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
      case 'UNKNOWN':
      default:
        return {
          icon: AlertCircle,
          bgColor: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          title: t('unknown'),
          description: t('unknownDescription'),
          resultBgColor: 'bg-yellow-50',
          resultBorderColor: 'border-yellow-200',
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
            inputMode="numeric"
            value={formData.series}
            onChange={(e) => handleInputChange('series', e.target.value)}
            placeholder={t('seriesPlaceholder')}
            maxLength={4}
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-xl font-mono tracking-widest"
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
            maxLength={6}
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-center text-xl font-mono tracking-widest"
          />
          <p className="text-xs text-gray-500 mt-1 text-center">{t('numberHint')}</p>
        </div>
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
        href="https://services.fms.gov.ru/info-service.htm?sid=2000"
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

        {/* Passport data card */}
        <div className={`${statusConfig.resultBgColor} border-2 ${statusConfig.resultBorderColor} rounded-2xl p-6`}>
          <p className="text-sm text-gray-700 mb-3 font-medium">{t('passportData')}</p>
          <div className="flex justify-center gap-4 text-3xl font-mono font-bold text-gray-900">
            <span>{result.series}</span>
            <span>{result.number}</span>
          </div>
        </div>

        {/* Recommendation for invalid passport */}
        {result.status === 'INVALID' && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">{t('recommendation')}</h4>
            <p className="text-sm text-yellow-800">{t('invalidRecommendation')}</p>
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
          href="https://services.fms.gov.ru/info-service.htm?sid=2000"
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('title')}</h2>
              <p className="text-xs text-blue-100">{t('subtitle')}</p>
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
