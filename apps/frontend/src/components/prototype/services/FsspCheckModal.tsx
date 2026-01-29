'use client';

import { useState } from 'react';
import { X, Scale, Loader2, CheckCircle, AlertTriangle, AlertCircle, ExternalLink } from 'lucide-react';
import { useLanguageStore, Language } from '@/lib/stores/languageStore';
import { patentPrices } from '@/data/patentPrices';

interface FsspCheckModalProps {
  onClose: () => void;
}

interface FormData {
  lastName: string;
  firstName: string;
  middleName: string;
  birthDate: string;
  regionCode: string;
}

interface FsspDebt {
  id: string;
  type: string;
  amount: number;
  department: string;
  documentNumber?: string;
  documentDate?: string;
}

interface FsspCheckResponse {
  found: boolean;
  hasDebt: boolean;
  totalAmount?: number;
  debts?: FsspDebt[];
  source: 'fssp' | 'cache' | 'mock' | 'fallback';
  checkedAt: string;
  error?: string;
  message?: string;
}

const initialFormData: FormData = {
  lastName: '',
  firstName: '',
  middleName: '',
  birthDate: '',
  regionCode: '77',
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const labels: Record<string, Record<Language, string>> = {
  title: {
    ru: 'Проверка ФССП',
    en: 'FSSP Check',
    uz: 'FSSP tekshiruvi',
    tg: 'Санҷиши ФССП',
    ky: 'ФССП текшеруусу',
  },
  subtitle: {
    ru: 'Проверка задолженности судебных приставов',
    en: 'Check bailiff debts',
    uz: 'Sud ijrochilari qarzdorligini tekshirish',
    tg: 'Санҷиши қарздории иҷрочиён',
    ky: 'Сот приставдарынын карызын текшеруу',
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
  region: {
    ru: 'Регион',
    en: 'Region',
    uz: 'Viloyat',
    tg: 'Минтақа',
    ky: 'Аймак',
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
  noDebt: {
    ru: 'Задолженности нет',
    en: 'No Debt Found',
    uz: 'Qarz topilmadi',
    tg: 'Қарз нест',
    ky: 'Карыз жок',
  },
  noDebtDescription: {
    ru: 'По вашим данным исполнительные производства не найдены',
    en: 'No enforcement proceedings found for your data',
    uz: 'Ma\'lumotlaringiz bo\'yicha ijro ishlari topilmadi',
    tg: 'Бо маълумоти шумо ҳеҷ кор нест',
    ky: 'Сиздин маалыматтар боюнча аткаруу иштери табылган жок',
  },
  hasDebt: {
    ru: 'Найдена задолженность',
    en: 'Debt Found',
    uz: 'Qarz topildi',
    tg: 'Қарз ҳаст',
    ky: 'Карыз табылды',
  },
  hasDebtDescription: {
    ru: 'Обнаружены исполнительные производства',
    en: 'Enforcement proceedings found',
    uz: 'Ijro ishlari topildi',
    tg: 'Парвандаҳои иҷроӣ пайдо шуданд',
    ky: 'Аткаруу иштери табылды',
  },
  totalDebt: {
    ru: 'Общая сумма',
    en: 'Total Amount',
    uz: 'Umumiy summa',
    tg: 'Маблағи умумӣ',
    ky: 'Жалпы сумма',
  },
  proceedings: {
    ru: 'Исполнительные производства',
    en: 'Enforcement Proceedings',
    uz: 'Ijro ishlari',
    tg: 'Парвандаҳои иҷроӣ',
    ky: 'Аткаруу иштери',
  },
  department: {
    ru: 'Отдел',
    en: 'Department',
    uz: 'Bo\'lim',
    tg: 'Шуъба',
    ky: 'Болум',
  },
  docNumber: {
    ru: 'Документ',
    en: 'Document',
    uz: 'Hujjat',
    tg: 'Ҳуҷҷат',
    ky: 'Документ',
  },
  checkAnother: {
    ru: 'Проверить другого',
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
    ru: 'Сервис проверки отключен. Показаны тестовые данные. Для реальной проверки используйте официальный сайт ФССП.',
    en: 'Verification service is disabled. Test data shown. For real verification, use the official FSSP website.',
    uz: 'Tekshirish xizmati o\'chirilgan. Test ma\'lumotlari ko\'rsatilmoqda. Haqiqiy tekshirish uchun FSSP rasmiy saytidan foydalaning.',
    tg: 'Хидмати санҷиш хомуш аст. Маълумоти санҷишӣ нишон дода мешавад. Барои санҷиши воқеӣ сайти расмии ФССПро истифода баред.',
    ky: 'Текшеруу кызматы ошурулду. Тест маалыматтары корсотулуп жатат. Чыныгы текшеруу учун ФССПнын расмий сайтын колдонунуз.',
  },
  fallbackWarning: {
    ru: 'Сервис временно недоступен. Попробуйте позже или проверьте на официальном сайте ФССП: fssp.gov.ru',
    en: 'Service is temporarily unavailable. Try again later or check on the official FSSP website: fssp.gov.ru',
    uz: 'Xizmat vaqtincha mavjud emas. Keyinroq urinib ko\'ring yoki FSSP rasmiy saytida tekshiring: fssp.gov.ru',
    tg: 'Хидмат муваққатан дастрас нест. Баъдтар кушиш кунед ё дар сайти расмии ФССП: fssp.gov.ru санҷед.',
    ky: 'Кызмат убактылуу жеткиликтуу эмес. Кийин кайра аракет кылынызам же ФССПнын расмий сайтынан текшеринизэ: fssp.gov.ru',
  },
  officialSite: {
    ru: 'Официальный сайт ФССП',
    en: 'Official FSSP Website',
    uz: 'FSSP rasmiy sayti',
    tg: 'Сайти расмии ФССП',
    ky: 'ФССПнын расмий сайты',
  },
  infoText: {
    ru: 'Проверка выполняется через базу данных Федеральной службы судебных приставов России.',
    en: 'The check is performed through the database of the Federal Bailiff Service of Russia.',
    uz: 'Tekshirish Rossiya Federal Sud Ijrochilari Xizmati ma\'lumotlar bazasi orqali amalga oshiriladi.',
    tg: 'Санҷиш тавассути базаи маълумоти Хадамоти федералии иҷрочиёни судии Русия иҷро мешавад.',
    ky: 'Текшеруу Россиянын Федералдык сот приставдар кызматынын маалымат базасы аркылуу жургузулот.',
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
  payDebtRecommendation: {
    ru: 'Рекомендуем оплатить задолженность во избежание ограничений на выезд из РФ и других санкций.',
    en: 'We recommend paying off the debt to avoid travel restrictions from Russia and other sanctions.',
    uz: 'Rossiyadan chiqish cheklovlari va boshqa sanksiyalardan qochish uchun qarzni to\'lashni tavsiya qilamiz.',
    tg: 'Мо тавсия медиҳем, ки барои роҳ надодан аз Русия ва дигар ҷазоҳо қарзро пардохт кунед.',
    ky: 'Россиядан чыгуу чектоолорунан жана башка санкциялардан качуу учун карызды толоону сунуштайбыз.',
  },
};

const debtTypeLabels: Record<string, Record<Language, string>> = {
  administrative: {
    ru: 'Административный штраф',
    en: 'Administrative fine',
    uz: 'Ma\'muriy jarima',
    tg: 'Ҷаримаи маъмурӣ',
    ky: 'Административдик айып пул',
  },
  tax: {
    ru: 'Налоговая задолженность',
    en: 'Tax debt',
    uz: 'Soliq qarzdorligi',
    tg: 'Қарзи андоз',
    ky: 'Салык карызы',
  },
  loan: {
    ru: 'Кредитная задолженность',
    en: 'Loan debt',
    uz: 'Kredit qarzdorligi',
    tg: 'Қарзи кредит',
    ky: 'Кредит карызы',
  },
  alimony: {
    ru: 'Алименты',
    en: 'Alimony',
    uz: 'Alimentlar',
    tg: 'Алименти',
    ky: 'Алименттер',
  },
  other: {
    ru: 'Прочее',
    en: 'Other',
    uz: 'Boshqa',
    tg: 'Дигар',
    ky: 'Башкалар',
  },
};

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function FsspCheckModal({ onClose }: FsspCheckModalProps) {
  const { language } = useLanguageStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FsspCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = (key: string): string => {
    return labels[key]?.[language] || labels[key]?.en || key;
  };

  const getDebtTypeLabel = (type: string): string => {
    return debtTypeLabels[type]?.[language] || debtTypeLabels['other'][language];
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
      formData.birthDate !== '' &&
      formData.regionCode !== ''
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/utilities/fssp-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lastName: formData.lastName.trim(),
          firstName: formData.firstName.trim(),
          middleName: formData.middleName.trim() || undefined,
          birthDate: formData.birthDate,
          regionCode: formData.regionCode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check FSSP');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('FSSP check error:', err);
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
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {t('region')} *
        </label>
        <select
          value={formData.regionCode}
          onChange={(e) => handleInputChange('regionCode', e.target.value)}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
        >
          {patentPrices.map((region) => (
            <option key={region.code} value={region.code}>
              {region.name[language]}
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
            ? 'bg-purple-600 text-white hover:bg-purple-700 active:scale-98'
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
            <Scale className="w-5 h-5" />
            {t('checkButton')}
          </>
        )}
      </button>

      <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
        <p className="text-sm text-purple-800">{t('infoText')}</p>
      </div>

      <a
        href="https://fssp.gov.ru/iss/ip"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-sm text-purple-600 hover:text-purple-800 transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        {t('officialSite')}
      </a>
    </div>
  );

  const renderResult = () => {
    if (!result) return null;

    const hasDebt = result.hasDebt;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              hasDebt ? 'bg-red-100' : 'bg-green-100'
            }`}
          >
            {hasDebt ? (
              <AlertTriangle className="w-10 h-10 text-red-600" />
            ) : (
              <CheckCircle className="w-10 h-10 text-green-600" />
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {hasDebt ? t('hasDebt') : t('noDebt')}
          </h3>
          <p className="text-sm text-gray-600">
            {hasDebt ? t('hasDebtDescription') : t('noDebtDescription')}
          </p>
        </div>

        {hasDebt && result.totalAmount && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <p className="text-sm text-red-700 mb-2">{t('totalDebt')}</p>
            <p className="text-4xl font-bold text-red-800">
              {formatAmount(result.totalAmount)}
            </p>
          </div>
        )}

        {hasDebt && result.debts && result.debts.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">{t('proceedings')}</h4>
            {result.debts.map((debt, index) => (
              <div
                key={debt.id || index}
                className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {getDebtTypeLabel(debt.type)}
                  </span>
                  <span className="font-bold text-red-600">
                    {formatAmount(debt.amount)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>{t('department')}: {debt.department}</p>
                  {debt.documentNumber && (
                    <p>{t('docNumber')}: {debt.documentNumber} {debt.documentDate ? `(${new Date(debt.documentDate).toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')})` : ''}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {hasDebt && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">{t('recommendation')}</h4>
            <p className="text-sm text-yellow-800">{t('payDebtRecommendation')}</p>
          </div>
        )}

        {/* Warning for mock/fallback sources */}
        {(result.source === 'mock' || result.source === 'fallback') && (
          <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-900">{t('testData')}</p>
                <p className="text-sm text-orange-800">
                  {result.source === 'mock' ? t('testDataWarning') : t('fallbackWarning')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-gray-500">
          {t('source')}: {result.source.toUpperCase()} | {t('checked')}:{' '}
          {new Date(result.checkedAt).toLocaleString(language === 'ru' ? 'ru-RU' : 'en-US')}
        </div>

        <a
          href="https://fssp.gov.ru/iss/ip"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-purple-600 hover:text-purple-800 transition-colors"
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
            className="flex-1 bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition-colors"
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('title')}</h2>
              <p className="text-xs text-purple-100">{t('subtitle')}</p>
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
