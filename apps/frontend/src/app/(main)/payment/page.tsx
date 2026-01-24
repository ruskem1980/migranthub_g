'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Clock, CheckCircle } from 'lucide-react';
import { PatentPayment, PATENT_REGIONS } from '@/features/payments';

interface PaymentHistory {
  id: string;
  amount: number;
  region: string;
  months: number;
  date: string;
  status: 'completed' | 'pending';
}

export default function PaymentPage() {
  const router = useRouter();
  const [showPayment, setShowPayment] = useState(false);

  // Demo payment history
  const [history] = useState<PaymentHistory[]>([
    {
      id: '1',
      amount: 7500,
      region: 'Москва',
      months: 1,
      date: '2024-01-15',
      status: 'completed',
    },
  ]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">Оплата патента</h1>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-24">
        {/* Pay button */}
        <button
          onClick={() => setShowPayment(true)}
          className="w-full flex items-center justify-center gap-3 bg-green-600 text-white font-semibold py-4 rounded-xl hover:bg-green-700 transition-colors mb-6"
        >
          <CreditCard className="w-6 h-6" />
          Оплатить патент
        </button>

        {/* Current rates */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Текущие ставки
          </h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {PATENT_REGIONS.slice(0, 5).map((region) => (
              <div key={region.code} className="flex items-center justify-between p-4">
                <span className="text-gray-900">{region.region}</span>
                <span className="font-semibold text-green-600">
                  {region.monthlyAmount.toLocaleString('ru-RU')} ₽/мес
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment history */}
        {history.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              История платежей
            </h2>
            <div className="space-y-3">
              {history.map((payment) => (
                <div
                  key={payment.id}
                  className="bg-white rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      payment.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {payment.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <Clock className="w-6 h-6 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {payment.amount.toLocaleString('ru-RU')} ₽
                      </div>
                      <div className="text-sm text-gray-500">
                        {payment.region} • {payment.months} мес.
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        payment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {payment.status === 'completed' ? 'Оплачено' : 'В обработке'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(payment.date).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">
            Важная информация
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Оплата патента должна производиться ежемесячно</li>
            <li>• Просрочка более 1 дня приводит к аннулированию патента</li>
            <li>• Сохраняйте все чеки об оплате</li>
          </ul>
        </div>
      </div>

      {/* Payment modal */}
      {showPayment && (
        <PatentPayment onClose={() => setShowPayment(false)} />
      )}
    </div>
  );
}
