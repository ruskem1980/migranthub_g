'use client';

import { useState } from 'react';
import { CreditCard, X, QrCode, Smartphone, Check, AlertCircle, ChevronRight, Minus, Plus } from 'lucide-react';
import {
  PATENT_REGIONS,
  calculateMonthlyPayment,
  calculateTotalPayment,
  generateSBPLink,
  type RegionPaymentInfo,
} from '../patentPayment';

interface PatentPaymentProps {
  onClose: () => void;
  defaultRegion?: string;
}

type PaymentStep = 'select-region' | 'select-months' | 'payment-method' | 'processing' | 'success';

export function PatentPayment({ onClose, defaultRegion }: PatentPaymentProps) {
  const [step, setStep] = useState<PaymentStep>('select-region');
  const [selectedRegion, setSelectedRegion] = useState<RegionPaymentInfo | null>(
    defaultRegion ? PATENT_REGIONS.find(r => r.code === defaultRegion) || null : null
  );
  const [months, setMonths] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'sbp' | 'card'>('sbp');
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAmount = selectedRegion ? calculateTotalPayment(selectedRegion.code, months) : 0;

  const handleRegionSelect = (region: RegionPaymentInfo) => {
    setSelectedRegion(region);
    setStep('select-months');
  };

  const handleMonthsConfirm = () => {
    setStep('payment-method');
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setStep('processing');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (paymentMethod === 'sbp') {
        // In production, generate real SBP QR code
        const sbpLink = generateSBPLink(
          totalAmount,
          `Оплата патента за ${months} мес.`
        );
        // window.open(sbpLink, '_blank');
      }

      setStep('success');
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Оплата патента</h2>
              <p className="text-sm text-gray-500">
                {step === 'select-region' && 'Выберите регион'}
                {step === 'select-months' && 'Выберите период'}
                {step === 'payment-method' && 'Способ оплаты'}
                {step === 'processing' && 'Обработка...'}
                {step === 'success' && 'Успешно!'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {/* Step 1: Select Region */}
          {step === 'select-region' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Размер платежа зависит от региона, в котором выдан патент.
              </p>
              {PATENT_REGIONS.map((region) => (
                <button
                  key={region.code}
                  onClick={() => handleRegionSelect(region)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{region.region}</div>
                    <div className="text-sm text-gray-500">Код региона: {region.code}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      {region.monthlyAmount.toLocaleString('ru-RU')} ₽
                    </div>
                    <div className="text-xs text-gray-500">в месяц</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Select Months */}
          {step === 'select-months' && selectedRegion && (
            <div>
              <div className="p-4 bg-green-50 rounded-xl mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-800">Регион:</span>
                  <span className="font-semibold text-green-900">{selectedRegion.region}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-800">Ставка:</span>
                  <span className="font-semibold text-green-900">
                    {selectedRegion.monthlyAmount.toLocaleString('ru-RU')} ₽/мес
                  </span>
                </div>
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-gray-600 mb-4">Количество месяцев:</p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setMonths(Math.max(1, months - 1))}
                    disabled={months <= 1}
                    className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
                  >
                    <Minus className="w-6 h-6 text-gray-600" />
                  </button>
                  <span className="text-4xl font-bold text-gray-900 w-16 text-center">
                    {months}
                  </span>
                  <button
                    onClick={() => setMonths(Math.min(12, months + 1))}
                    disabled={months >= 12}
                    className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
                  >
                    <Plus className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Quick select */}
              <div className="flex gap-2 mb-6">
                {[1, 3, 6, 12].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMonths(m)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      months === m
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {m} мес
                  </button>
                ))}
              </div>

              {/* Total */}
              <div className="p-4 bg-gray-900 rounded-xl text-white mb-6">
                <div className="flex items-center justify-between">
                  <span>Итого к оплате:</span>
                  <span className="text-2xl font-bold">
                    {totalAmount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
              </div>

              <button
                onClick={handleMonthsConfirm}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-4 rounded-xl hover:bg-green-700 transition-colors"
              >
                Продолжить
                <ChevronRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setStep('select-region')}
                className="w-full mt-3 py-3 text-gray-600 font-medium hover:text-gray-800"
              >
                Изменить регион
              </button>
            </div>
          )}

          {/* Step 3: Payment Method */}
          {step === 'payment-method' && (
            <div>
              <div className="p-4 bg-gray-50 rounded-xl mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">{selectedRegion?.region}</span>
                  <span className="font-semibold text-gray-900">{months} мес.</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {totalAmount.toLocaleString('ru-RU')} ₽
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">Выберите способ оплаты:</p>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setPaymentMethod('sbp')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
                    paymentMethod === 'sbp'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <QrCode className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900">СБП (QR-код)</div>
                    <div className="text-sm text-gray-500">Без комиссии</div>
                  </div>
                  {paymentMethod === 'sbp' && (
                    <Check className="w-6 h-6 text-green-600" />
                  )}
                </button>

                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900">Банковская карта</div>
                    <div className="text-sm text-gray-500">Visa, Mastercard, МИР</div>
                  </div>
                  {paymentMethod === 'card' && (
                    <Check className="w-6 h-6 text-green-600" />
                  )}
                </button>
              </div>

              <button
                onClick={handlePayment}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-4 rounded-xl hover:bg-green-700 transition-colors"
              >
                Оплатить {totalAmount.toLocaleString('ru-RU')} ₽
              </button>

              <button
                onClick={() => setStep('select-months')}
                className="w-full mt-3 py-3 text-gray-600 font-medium hover:text-gray-800"
              >
                Назад
              </button>
            </div>
          )}

          {/* Step 4: Processing */}
          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-6" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Обработка платежа...
              </h3>
              <p className="text-gray-500">
                Пожалуйста, не закрывайте это окно
              </p>
            </div>
          )}

          {/* Step 5: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Платёж успешен!
              </h3>
              <p className="text-gray-500 mb-6">
                Оплачено {totalAmount.toLocaleString('ru-RU')} ₽ за {months} мес.
              </p>

              <div className="p-4 bg-green-50 rounded-xl mb-6 text-left">
                <div className="text-sm text-green-800 space-y-1">
                  <p><strong>Регион:</strong> {selectedRegion?.region}</p>
                  <p><strong>Период:</strong> {months} месяц(ев)</p>
                  <p><strong>Сумма:</strong> {totalAmount.toLocaleString('ru-RU')} ₽</p>
                  <p><strong>Дата:</strong> {new Date().toLocaleDateString('ru-RU')}</p>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-xl mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">
                    <strong>Демо:</strong> Это демонстрационный платёж. В реальном приложении
                    будет интеграция с СБП и ЮKassa.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-green-600 text-white font-semibold py-4 rounded-xl hover:bg-green-700 transition-colors"
              >
                Готово
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
