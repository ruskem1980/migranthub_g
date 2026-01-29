'use client';

import { useState, useMemo } from 'react';
import { X, CreditCard, Loader2, ChevronDown, Plus, Minus, Search, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useLanguageStore, Language } from '@/lib/stores/languageStore';
import { patentPrices, formatPrice, calculatePatentTotal, PatentRegionPrice } from '@/data/patentPrices';
import { paymentsApi } from '@/lib/api/client';

interface PatentPaymentModalProps {
  onClose: () => void;
}

type LocalizedText = Record<Language, string>;

const uiText: Record<string, LocalizedText> = {
  title: {
    ru: 'Оплата патента',
    en: 'Patent Payment',
    uz: 'Patent toʻlovi',
    tg: 'Пардохти патент',
    ky: 'Патент төлөмү',
  },
  subtitle: {
    ru: 'Оплата через YooKassa',
    en: 'Payment via YooKassa',
    uz: 'YooKassa orqali toʻlov',
    tg: 'Пардохт тавассути YooKassa',
    ky: 'YooKassa аркылуу төлөм',
  },
  selectRegion: {
    ru: 'Выберите регион',
    en: 'Select Region',
    uz: 'Mintaqani tanlang',
    tg: 'Минтақаро интихоб кунед',
    ky: 'Аймакты тандаңыз',
  },
  selectRegionPlaceholder: {
    ru: 'Выберите регион работы',
    en: 'Choose work region',
    uz: 'Ish mintaqasini tanlang',
    tg: 'Минтақаи корро интихоб кунед',
    ky: 'Иш аймагын тандаңыз',
  },
  monthlyRate: {
    ru: 'Ежемесячная ставка',
    en: 'Monthly rate',
    uz: 'Oylik stavka',
    tg: 'Ставкаи ҳармоҳа',
    ky: 'Айлык ставка',
  },
  numberOfMonths: {
    ru: 'Количество месяцев',
    en: 'Number of Months',
    uz: 'Oylar soni',
    tg: 'Миқдори моҳҳо',
    ky: 'Ай саны',
  },
  month: {
    ru: 'месяц',
    en: 'month',
    uz: 'oy',
    tg: 'моҳ',
    ky: 'ай',
  },
  months: {
    ru: 'месяцев',
    en: 'months',
    uz: 'oy',
    tg: 'моҳ',
    ky: 'ай',
  },
  perMonth: {
    ru: 'мес',
    en: 'mo',
    uz: 'oy',
    tg: 'моҳ',
    ky: 'ай',
  },
  totalAmount: {
    ru: 'Итого к оплате',
    en: 'Total Amount',
    uz: 'Jami toʻlov',
    tg: 'Ҳамагӣ барои пардохт',
    ky: 'Жалпы төлөм',
  },
  pay: {
    ru: 'Оплатить',
    en: 'Pay',
    uz: 'Toʻlash',
    tg: 'Пардохтан',
    ky: 'Төлөө',
  },
  processing: {
    ru: 'Создание платежа...',
    en: 'Creating payment...',
    uz: 'Toʻlov yaratilmoqda...',
    tg: 'Эҷоди пардохт...',
    ky: 'Төлөм түзүлүүдө...',
  },
  close: {
    ru: 'Закрыть',
    en: 'Close',
    uz: 'Yopish',
    tg: 'Пӯшидан',
    ky: 'Жабуу',
  },
  search: {
    ru: 'Поиск...',
    en: 'Search...',
    uz: 'Qidirish...',
    tg: 'Ҷустуҷӯ...',
    ky: 'Издөө...',
  },
  noResults: {
    ru: 'Ничего не найдено',
    en: 'No results',
    uz: 'Hech narsa topilmadi',
    tg: 'Ҳеҷ чиз ёфт нашуд',
    ky: 'Эч нерсе табылган жок',
  },
  region: {
    ru: 'Регион',
    en: 'Region',
    uz: 'Mintaqa',
    tg: 'Минтақа',
    ky: 'Аймак',
  },
  period: {
    ru: 'Период',
    en: 'Period',
    uz: 'Davr',
    tg: 'Давра',
    ky: 'Мезгил',
  },
  paymentNote: {
    ru: 'После нажатия кнопки "Оплатить" вы будете перенаправлены на страницу оплаты YooKassa.',
    en: 'After clicking "Pay" you will be redirected to the YooKassa payment page.',
    uz: '"Toʻlash" tugmasini bosgandan soʻng YooKassa toʻlov sahifasiga yoʻnaltirilasiz.',
    tg: 'Пас аз пахши тугмаи "Пардохтан" шумо ба саҳифаи пардохти YooKassa равона мешавед.',
    ky: '"Төлөө" баскычын баскандан кийин YooKassa төлөм барагына багытталасыз.',
  },
  paymentSuccess: {
    ru: 'Платеж создан',
    en: 'Payment created',
    uz: 'Toʻlov yaratildi',
    tg: 'Пардохт эҷод шуд',
    ky: 'Төлөм түзүлдү',
  },
  redirecting: {
    ru: 'Перенаправление на страницу оплаты...',
    en: 'Redirecting to payment page...',
    uz: 'Toʻlov sahifasiga yoʻnaltirish...',
    tg: 'Равонасозӣ ба саҳифаи пардохт...',
    ky: 'Төлөм барагына багыттоо...',
  },
  paymentError: {
    ru: 'Ошибка создания платежа',
    en: 'Payment creation error',
    uz: 'Toʻlov yaratishda xatolik',
    tg: 'Хатогии эҷоди пардохт',
    ky: 'Төлөм түзүүдө ката',
  },
  tryAgain: {
    ru: 'Попробовать снова',
    en: 'Try again',
    uz: 'Qayta urinish',
    tg: 'Аз нав кӯшиш кунед',
    ky: 'Кайра аракет кылуу',
  },
  openPaymentPage: {
    ru: 'Открыть страницу оплаты',
    en: 'Open payment page',
    uz: 'Toʻlov sahifasini ochish',
    tg: 'Кушодани саҳифаи пардохт',
    ky: 'Төлөм барагын ачуу',
  },
  paymentDescription: {
    ru: 'Оплата патента за',
    en: 'Patent payment for',
    uz: 'Patent toʻlovi',
    tg: 'Пардохти патент барои',
    ky: 'Патент төлөмү',
  },
};

type PaymentState = 'form' | 'processing' | 'success' | 'error';

export function PatentPaymentModal({ onClose }: PatentPaymentModalProps) {
  const { language } = useLanguageStore();

  const [selectedRegion, setSelectedRegion] = useState<PatentRegionPrice | null>(null);
  const [months, setMonths] = useState(1);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentState, setPaymentState] = useState<PaymentState>('form');
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredRegions = useMemo(() => {
    if (!searchQuery.trim()) return patentPrices;

    const query = searchQuery.toLowerCase();
    return patentPrices.filter(region =>
      region.name[language].toLowerCase().includes(query) ||
      region.code.includes(query)
    );
  }, [searchQuery, language]);

  const totalAmount = useMemo(() => {
    if (!selectedRegion) return 0;
    return calculatePatentTotal(selectedRegion.code, months);
  }, [selectedRegion, months]);

  function decreaseMonths() {
    if (months > 1) {
      setMonths(months - 1);
    }
  }

  function increaseMonths() {
    if (months < 12) {
      setMonths(months + 1);
    }
  }

  function selectRegion(region: PatentRegionPrice) {
    setSelectedRegion(region);
    setShowRegionDropdown(false);
    setSearchQuery('');
  }

  async function handlePayment() {
    if (!selectedRegion) return;

    setPaymentState('processing');
    setErrorMessage(null);

    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;

      const description = `${uiText.paymentDescription[language]} ${selectedRegion.name[language]}, ${months} ${months === 1 ? uiText.month[language] : uiText.months[language]}`;

      const response = await paymentsApi.create({
        amount: totalAmount,
        description,
        metadata: {
          patentRegion: selectedRegion.code,
          patentMonth: currentMonth,
          patentYear: currentYear,
          months: months,
        },
      });

      setPaymentUrl(response.paymentUrl);
      setPaymentState('success');

      // Redirect to payment page after a short delay
      setTimeout(() => {
        if (response.paymentUrl) {
          window.open(response.paymentUrl, '_blank');
        }
      }, 1500);
    } catch (error) {
      console.error('Payment creation error:', error);
      setPaymentState('error');
      setErrorMessage(
        error instanceof Error ? error.message : uiText.paymentError[language]
      );
    }
  }

  function handleRetry() {
    setPaymentState('form');
    setErrorMessage(null);
    setPaymentUrl(null);
  }

  function openPaymentPage() {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{uiText.title[language]}</h2>
              <p className="text-xs text-blue-100">{uiText.subtitle[language]}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {/* Form State */}
          {paymentState === 'form' && (
            <div className="space-y-6">
              {/* Region Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {uiText.selectRegion[language]}
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    <span className={selectedRegion ? 'text-gray-900' : 'text-gray-500'}>
                      {selectedRegion ? selectedRegion.name[language] : uiText.selectRegionPlaceholder[language]}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showRegionDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showRegionDropdown && (
                    <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={uiText.search[language]}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="max-h-60 overflow-y-auto">
                        {filteredRegions.length === 0 ? (
                          <div className="px-4 py-6 text-center text-gray-500 text-sm">
                            {uiText.noResults[language]}
                          </div>
                        ) : (
                          filteredRegions.map((region) => (
                            <button
                              key={region.code}
                              type="button"
                              onClick={() => selectRegion(region)}
                              className={`w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 transition-colors ${
                                selectedRegion?.code === region.code ? 'bg-blue-50' : ''
                              }`}
                            >
                              <span className="text-gray-900">{region.name[language]}</span>
                              <span className="text-sm text-gray-500 font-mono">
                                {formatPrice(region.monthlyPrice)}/{uiText.perMonth[language]}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {selectedRegion && (
                  <div className="mt-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {uiText.monthlyRate[language]}: <strong>{formatPrice(selectedRegion.monthlyPrice)}</strong>
                    </p>
                  </div>
                )}
              </div>

              {/* Months Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {uiText.numberOfMonths[language]}
                </label>
                <div className="flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={decreaseMonths}
                    disabled={months <= 1}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      months <= 1
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200 active:scale-95'
                    }`}
                  >
                    <Minus className="w-6 h-6" />
                  </button>

                  <div className="w-24 text-center">
                    <span className="text-4xl font-bold text-gray-900">{months}</span>
                    <p className="text-sm text-gray-500 mt-1">
                      {months === 1 ? uiText.month[language] : uiText.months[language]}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={increaseMonths}
                    disabled={months >= 12}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                      months >= 12
                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200 active:scale-95'
                    }`}
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex justify-center gap-1 mt-3">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i < months ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Total */}
              {selectedRegion && (
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 mb-1">{uiText.totalAmount[language]}</p>
                    <p className="text-4xl font-bold text-blue-700">
                      {formatPrice(totalAmount)}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{uiText.region[language]}</span>
                      <span className="font-semibold text-gray-900">{selectedRegion.name[language]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{uiText.period[language]}</span>
                      <span className="font-semibold text-gray-900">
                        {months} {months === 1 ? uiText.month[language] : uiText.months[language]}
                      </span>
                    </div>
                    <div className="border-t border-blue-200 my-2" />
                    <div className="text-xs text-gray-500 text-center">
                      {formatPrice(selectedRegion.monthlyPrice)} x {months} = {formatPrice(totalAmount)}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Note */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-600 text-center leading-relaxed">
                  {uiText.paymentNote[language]}
                </p>
              </div>

              {/* Pay Button */}
              <button
                type="button"
                onClick={handlePayment}
                disabled={!selectedRegion}
                className={`w-full font-bold py-4 rounded-xl transition-all ${
                  !selectedRegion
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-98'
                }`}
              >
                {uiText.pay[language]} {selectedRegion && formatPrice(totalAmount)}
              </button>
            </div>
          )}

          {/* Processing State */}
          {paymentState === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">{uiText.processing[language]}</p>
            </div>
          )}

          {/* Success State */}
          {paymentState === 'success' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{uiText.paymentSuccess[language]}</h3>
              <p className="text-gray-600 text-center mb-6">{uiText.redirecting[language]}</p>

              {paymentUrl && (
                <button
                  onClick={openPaymentPage}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  {uiText.openPaymentPage[language]}
                </button>
              )}
            </div>
          )}

          {/* Error State */}
          {paymentState === 'error' && (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{uiText.paymentError[language]}</h3>
              {errorMessage && (
                <p className="text-red-600 text-center mb-6">{errorMessage}</p>
              )}
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
              >
                {uiText.tryAgain[language]}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {paymentState === 'form' && (
          <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-300 transition-colors"
            >
              {uiText.close[language]}
            </button>
          </div>
        )}

        {(paymentState === 'success' || paymentState === 'error') && (
          <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full bg-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-300 transition-colors"
            >
              {uiText.close[language]}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
