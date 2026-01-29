'use client';

import { useState } from 'react';
import { X, Car, Loader2, CheckCircle, AlertTriangle, AlertCircle, ExternalLink, CreditCard } from 'lucide-react';
import { useLanguageStore, Language } from '@/lib/stores/languageStore';
import { utilitiesApi } from '@/lib/api/client';
import type { GibddCheckType, GibddFine, GibddFinesResponse } from '@/lib/api/types';

interface GibddCheckModalProps {
  onClose: () => void;
}

type TabType = 'sts' | 'license';

interface StsFormData {
  regNumber: string;
  stsNumber: string;
}

interface LicenseFormData {
  licenseNumber: string;
  issueDate: string;
}

const initialStsForm: StsFormData = {
  regNumber: '',
  stsNumber: '',
};

const initialLicenseForm: LicenseFormData = {
  licenseNumber: '',
  issueDate: '',
};

const labels: Record<string, Record<Language, string>> = {
  title: {
    ru: 'Штрафы ГИБДД',
    en: 'Traffic Fines',
    uz: 'Yo\'l harakati jarimasi',
    tg: 'Ҷаримаҳои ГИБДД',
    ky: 'Жол кыймылынын айыбы',
  },
  subtitle: {
    ru: 'Проверка неоплаченных штрафов',
    en: 'Check unpaid traffic fines',
    uz: 'To\'lanmagan jarimalarni tekshirish',
    tg: 'Санҷиши ҷаримаҳои пардохтнашуда',
    ky: 'Толонбогон айыптарды текшеруу',
  },
  tabSts: {
    ru: 'По СТС',
    en: 'By Vehicle Reg.',
    uz: 'Guvohnoma bo\'yicha',
    tg: 'Бо СТС',
    ky: 'СТС боюнча',
  },
  tabLicense: {
    ru: 'По ВУ',
    en: 'By License',
    uz: 'Guvohnoma bo\'yicha',
    tg: 'Бо ВУ',
    ky: 'Куболук боюнча',
  },
  regNumber: {
    ru: 'Госномер',
    en: 'Plate Number',
    uz: 'Davlat raqami',
    tg: 'Рақами давлатӣ',
    ky: 'Мамлекеттик номер',
  },
  regNumberHint: {
    ru: 'Формат: А000АА000',
    en: 'Format: A000AA000',
    uz: 'Format: A000AA000',
    tg: 'Формат: А000АА000',
    ky: 'Формат: А000АА000',
  },
  stsNumber: {
    ru: 'Номер СТС',
    en: 'Vehicle Registration',
    uz: 'STS raqami',
    tg: 'Рақами СТС',
    ky: 'СТС номери',
  },
  stsNumberHint: {
    ru: '10 цифр',
    en: '10 digits',
    uz: '10 raqam',
    tg: '10 рақам',
    ky: '10 сан',
  },
  licenseNumber: {
    ru: 'Серия и номер ВУ',
    en: 'License Number',
    uz: 'Guvohnoma seriya va raqami',
    tg: 'Серия ва рақами ВУ',
    ky: 'Куболуктун сериясы жана номери',
  },
  licenseNumberHint: {
    ru: '10 символов',
    en: '10 characters',
    uz: '10 belgi',
    tg: '10 рамз',
    ky: '10 белги',
  },
  issueDate: {
    ru: 'Дата выдачи ВУ',
    en: 'License Issue Date',
    uz: 'Berilgan sana',
    tg: 'Санаи додашудаи ВУ',
    ky: 'Берилген куну',
  },
  checkButton: {
    ru: 'Проверить штрафы',
    en: 'Check Fines',
    uz: 'Jarimalarni tekshirish',
    tg: 'Санҷидани ҷаримаҳо',
    ky: 'Айыптарды текшеруу',
  },
  checking: {
    ru: 'Проверяем...',
    en: 'Checking...',
    uz: 'Tekshirilmoqda...',
    tg: 'Санҷиш...',
    ky: 'Текшерилууде...',
  },
  noFines: {
    ru: 'Штрафов нет',
    en: 'No Fines',
    uz: 'Jarima yo\'q',
    tg: 'Ҷарима нест',
    ky: 'Айып жок',
  },
  noFinesDescription: {
    ru: 'По вашим данным неоплаченные штрафы не найдены',
    en: 'No unpaid fines found for your data',
    uz: 'Ma\'lumotlaringiz bo\'yicha to\'lanmagan jarimalar topilmadi',
    tg: 'Бо маълумоти шумо ҷаримаи пардохтнашуда ёфт нашуд',
    ky: 'Сиздин маалыматтар боюнча толонбогон айыптар табылган жок',
  },
  hasFines: {
    ru: 'Найдены штрафы',
    en: 'Fines Found',
    uz: 'Jarimalar topildi',
    tg: 'Ҷаримаҳо ёфт шуданд',
    ky: 'Айыптар табылды',
  },
  hasFinesDescription: {
    ru: 'Обнаружены неоплаченные штрафы',
    en: 'Unpaid fines detected',
    uz: 'To\'lanmagan jarimalar aniqlandi',
    tg: 'Ҷаримаҳои пардохтнашуда муайян шуданд',
    ky: 'Толонбогон айыптар аныкталды',
  },
  totalAmount: {
    ru: 'Общая сумма',
    en: 'Total Amount',
    uz: 'Umumiy summa',
    tg: 'Маблағи умумӣ',
    ky: 'Жалпы сумма',
  },
  finesList: {
    ru: 'Список штрафов',
    en: 'Fines List',
    uz: 'Jarimalar ro\'yxati',
    tg: 'Рӯйхати ҷаримаҳо',
    ky: 'Айыптардын тизмеси',
  },
  article: {
    ru: 'Статья',
    en: 'Article',
    uz: 'Modda',
    tg: 'Модда',
    ky: 'Статья',
  },
  discount: {
    ru: 'Скидка 50%',
    en: '50% Discount',
    uz: '50% chegirma',
    tg: 'Тахфифи 50%',
    ky: '50% арзандатуу',
  },
  discountUntil: {
    ru: 'до',
    en: 'until',
    uz: 'gacha',
    tg: 'то',
    ky: 'чейин',
  },
  payOnGosuslugi: {
    ru: 'Оплатить на Госуслугах',
    en: 'Pay on Gosuslugi',
    uz: 'Gosuslugi orqali to\'lash',
    tg: 'Пардохт дар Госуслуги',
    ky: 'Госуслугада толоо',
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
    ru: 'Сервис проверки отключен. Показаны тестовые данные. Для реальной проверки используйте официальный сайт ГИБДД.',
    en: 'Verification service is disabled. Test data shown. For real verification, use the official GIBDD website.',
    uz: 'Tekshirish xizmati o\'chirilgan. Test ma\'lumotlari ko\'rsatilmoqda. Haqiqiy tekshirish uchun GIBDD rasmiy saytidan foydalaning.',
    tg: 'Хидмати санҷиш хомуш аст. Маълумоти санҷишӣ нишон дода мешавад. Барои санҷиши воқеӣ сайти расмии ГИБДДро истифода баред.',
    ky: 'Текшеруу кызматы ошурулду. Тест маалыматтары корсотулуп жатат. Чыныгы текшеруу учун ГИБДДнын расмий сайтын колдонунуз.',
  },
  fallbackWarning: {
    ru: 'Сервис временно недоступен. Попробуйте позже или проверьте на официальном сайте ГИБДД: гибдд.рф/check/fines',
    en: 'Service is temporarily unavailable. Try again later or check on the official GIBDD website: gibdd.rf/check/fines',
    uz: 'Xizmat vaqtincha mavjud emas. Keyinroq urinib ko\'ring yoki GIBDD rasmiy saytida tekshiring.',
    tg: 'Хидмат муваққатан дастрас нест. Баъдтар кушиш кунед ё дар сайти расмии ГИБДД санҷед.',
    ky: 'Кызмат убактылуу жеткиликтуу эмес. Кийин кайра аракет кылынызам же ГИБДДнын расмий сайтынан текшеринизэ.',
  },
  officialSite: {
    ru: 'Официальный сайт ГИБДД',
    en: 'Official GIBDD Website',
    uz: 'GIBDD rasmiy sayti',
    tg: 'Сайти расмии ГИБДД',
    ky: 'ГИБДДнын расмий сайты',
  },
  infoText: {
    ru: 'Проверка выполняется через базу данных ГИБДД России. Данные кэшируются на 6 часов.',
    en: 'The check is performed through the GIBDD Russia database. Data is cached for 6 hours.',
    uz: 'Tekshirish Rossiya GIBDD ma\'lumotlar bazasi orqali amalga oshiriladi. Ma\'lumotlar 6 soat saqlanadi.',
    tg: 'Санҷиш тавассути базаи маълумоти ГИБДД Русия иҷро мешавад. Маълумот 6 соат захира мешавад.',
    ky: 'Текшеруу Россиянын ГИБДД маалымат базасы аркылуу жургузулот. Маалыматтар 6 саатка сакталат.',
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
  payFinesRecommendation: {
    ru: 'Рекомендуем оплатить штрафы в течение 20 дней со скидкой 50%. Неоплаченные штрафы могут привести к ограничению выезда из РФ.',
    en: 'We recommend paying fines within 20 days with a 50% discount. Unpaid fines may lead to travel restrictions from Russia.',
    uz: '20 kun ichida 50% chegirma bilan jarimalarni to\'lashni tavsiya qilamiz. To\'lanmagan jarimalar Rossiyadan chiqishni cheklashga olib kelishi mumkin.',
    tg: 'Мо тавсия медиҳем, ки ҷаримаҳоро дар муддати 20 рӯз бо тахфифи 50% пардохт кунед. Ҷаримаҳои пардохтнашуда метавонанд ба маҳдудияти баромадан аз Русия оваранд.',
    ky: 'Айыптарды 20 кундун ичинде 50% арзандатуу менен толоону сунуштайбыз. Толонбогон айыптар Россиядан чыгууну чектеши мумкун.',
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

function formatDate(dateStr: string, language: Language): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Validation helpers
function isValidRegNumber(value: string): boolean {
  // Russian plate format: А000АА000 or А000АА00
  const regex = /^[АВЕКМНОРСТУХавекмнорстух][0-9]{3}[АВЕКМНОРСТУХавекмнорстух]{2}[0-9]{2,3}$/;
  return regex.test(value);
}

function isValidStsNumber(value: string): boolean {
  return /^[0-9]{10}$/.test(value);
}

function isValidLicenseNumber(value: string): boolean {
  return /^[0-9А-Яа-яA-Za-z]{10}$/.test(value);
}

export function GibddCheckModal({ onClose }: GibddCheckModalProps) {
  const { language } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<TabType>('sts');
  const [stsForm, setStsForm] = useState<StsFormData>(initialStsForm);
  const [licenseForm, setLicenseForm] = useState<LicenseFormData>(initialLicenseForm);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GibddFinesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const t = (key: string): string => {
    return labels[key]?.[language] || labels[key]?.en || key;
  };

  const handleStsChange = (field: keyof StsFormData, value: string) => {
    setStsForm(prev => ({ ...prev, [field]: value.toUpperCase() }));
    if (result || error) {
      setResult(null);
      setError(null);
    }
  };

  const handleLicenseChange = (field: keyof LicenseFormData, value: string) => {
    setLicenseForm(prev => ({ ...prev, [field]: field === 'licenseNumber' ? value.toUpperCase() : value }));
    if (result || error) {
      setResult(null);
      setError(null);
    }
  };

  const isStsFormValid = (): boolean => {
    return isValidRegNumber(stsForm.regNumber) && isValidStsNumber(stsForm.stsNumber);
  };

  const isLicenseFormValid = (): boolean => {
    return isValidLicenseNumber(licenseForm.licenseNumber) && licenseForm.issueDate !== '';
  };

  const isFormValid = (): boolean => {
    return activeTab === 'sts' ? isStsFormValid() : isLicenseFormValid();
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const checkType: GibddCheckType = activeTab;

      const requestData = activeTab === 'sts'
        ? {
            checkType,
            regNumber: stsForm.regNumber.trim(),
            stsNumber: stsForm.stsNumber.trim(),
          }
        : {
            checkType,
            licenseNumber: licenseForm.licenseNumber.trim(),
            issueDate: licenseForm.issueDate,
          };

      const data = await utilitiesApi.checkGibddFines(requestData);
      setResult(data);
    } catch (err) {
      console.error('GIBDD check error:', err);
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStsForm(initialStsForm);
    setLicenseForm(initialLicenseForm);
    setResult(null);
    setError(null);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setResult(null);
    setError(null);
  };

  const renderForm = () => (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => handleTabChange('sts')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
            activeTab === 'sts'
              ? 'bg-white text-orange-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('tabSts')}
        </button>
        <button
          onClick={() => handleTabChange('license')}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
            activeTab === 'license'
              ? 'bg-white text-orange-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t('tabLicense')}
        </button>
      </div>

      {/* STS Form */}
      {activeTab === 'sts' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('regNumber')} *
            </label>
            <input
              type="text"
              value={stsForm.regNumber}
              onChange={(e) => handleStsChange('regNumber', e.target.value)}
              placeholder="А123БВ777"
              maxLength={9}
              className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                stsForm.regNumber && !isValidRegNumber(stsForm.regNumber)
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'
              }`}
            />
            <p className="text-xs text-gray-500 mt-1">{t('regNumberHint')}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('stsNumber')} *
            </label>
            <input
              type="text"
              value={stsForm.stsNumber}
              onChange={(e) => handleStsChange('stsNumber', e.target.value.replace(/\D/g, ''))}
              placeholder="7700123456"
              maxLength={10}
              className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                stsForm.stsNumber && !isValidStsNumber(stsForm.stsNumber)
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'
              }`}
            />
            <p className="text-xs text-gray-500 mt-1">{t('stsNumberHint')}</p>
          </div>
        </div>
      )}

      {/* License Form */}
      {activeTab === 'license' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('licenseNumber')} *
            </label>
            <input
              type="text"
              value={licenseForm.licenseNumber}
              onChange={(e) => handleLicenseChange('licenseNumber', e.target.value)}
              placeholder="7700123456"
              maxLength={10}
              className={`w-full px-4 py-3 bg-white border-2 rounded-xl focus:outline-none focus:ring-2 transition-colors ${
                licenseForm.licenseNumber && !isValidLicenseNumber(licenseForm.licenseNumber)
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-200 focus:ring-orange-500 focus:border-orange-500'
              }`}
            />
            <p className="text-xs text-gray-500 mt-1">{t('licenseNumberHint')}</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t('issueDate')} *
            </label>
            <input
              type="date"
              value={licenseForm.issueDate}
              onChange={(e) => handleLicenseChange('issueDate', e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
            />
          </div>
        </div>
      )}

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
            ? 'bg-orange-600 text-white hover:bg-orange-700 active:scale-98'
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
            <Car className="w-5 h-5" />
            {t('checkButton')}
          </>
        )}
      </button>

      <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
        <p className="text-sm text-orange-800">{t('infoText')}</p>
      </div>

      <a
        href="https://xn--90adear.xn--p1ai/check/fines"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 text-sm text-orange-600 hover:text-orange-800 transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        {t('officialSite')}
      </a>
    </div>
  );

  const renderFine = (fine: GibddFine, index: number) => (
    <div
      key={index}
      className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          {fine.article && (
            <span className="text-sm font-medium text-gray-700">
              {t('article')} {fine.article}
            </span>
          )}
          {fine.date && (
            <span className="text-xs text-gray-500 ml-2">
              {formatDate(fine.date, language)}
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="font-bold text-red-600">
            {fine.amount ? formatAmount(fine.amount) : '-'}
          </span>
          {fine.discountAmount && (
            <div className="text-xs text-green-600">
              {t('discount')}: {formatAmount(fine.discountAmount)}
              {fine.discountDeadline && (
                <span className="text-gray-500 ml-1">
                  ({t('discountUntil')} {formatDate(fine.discountDeadline, language)})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {fine.description && (
        <p className="text-sm text-gray-700 mb-2">{fine.description}</p>
      )}

      <div className="text-xs text-gray-500 space-y-1">
        {fine.location && <p>{fine.location}</p>}
        {fine.department && <p>{fine.department}</p>}
        {fine.uin && <p>УИН: {fine.uin}</p>}
      </div>

      {fine.paymentUrl && (
        <a
          href={fine.paymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <CreditCard className="w-4 h-4" />
          {t('payOnGosuslugi')}
        </a>
      )}
    </div>
  );

  const renderResult = () => {
    if (!result) return null;

    const hasFines = result.hasFines;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              hasFines ? 'bg-red-100' : 'bg-green-100'
            }`}
          >
            {hasFines ? (
              <AlertTriangle className="w-10 h-10 text-red-600" />
            ) : (
              <CheckCircle className="w-10 h-10 text-green-600" />
            )}
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {hasFines ? t('hasFines') : t('noFines')}
          </h3>
          <p className="text-sm text-gray-600">
            {hasFines ? t('hasFinesDescription') : t('noFinesDescription')}
          </p>
        </div>

        {hasFines && result.totalAmount !== undefined && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <p className="text-sm text-red-700 mb-2">{t('totalAmount')}</p>
            <p className="text-4xl font-bold text-red-800">
              {formatAmount(result.totalAmount)}
            </p>
            {result.finesCount && (
              <p className="text-sm text-red-600 mt-1">
                {result.finesCount} {language === 'ru' ? 'штраф(ов)' : 'fine(s)'}
              </p>
            )}
          </div>
        )}

        {hasFines && result.fines && result.fines.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">{t('finesList')}</h4>
            {result.fines.map((fine, index) => renderFine(fine, index))}
          </div>
        )}

        {hasFines && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">{t('recommendation')}</h4>
            <p className="text-sm text-yellow-800">{t('payFinesRecommendation')}</p>
          </div>
        )}

        {/* Warning for fallback sources */}
        {result.source === 'fallback' && (
          <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-900">{t('testData')}</p>
                <p className="text-sm text-orange-800">
                  {result.error || t('fallbackWarning')}
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
          href="https://xn--90adear.xn--p1ai/check/fines"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-orange-600 hover:text-orange-800 transition-colors"
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
            className="flex-1 bg-orange-600 text-white font-bold py-4 rounded-xl hover:bg-orange-700 transition-colors"
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('title')}</h2>
              <p className="text-xs text-orange-100">{t('subtitle')}</p>
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
