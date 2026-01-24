'use client';

import { QrCode, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

type LegalStatus = 'legal' | 'risk' | 'illegal';

interface StatusData {
  status: LegalStatus;
  label: string;
  sublabel: string;
  color: string;
  bgColor: string;
  emoji: string;
}

const statusConfig: Record<LegalStatus, StatusData> = {
  legal: {
    status: 'legal',
    label: 'Легально',
    sublabel: 'Все документы в порядке',
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
    emoji: '🟢',
  },
  risk: {
    status: 'risk',
    label: 'Риск',
    sublabel: 'Патент истекает через 3 дня',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    emoji: '🟡',
  },
  illegal: {
    status: 'illegal',
    label: 'Нелегал',
    sublabel: 'Требуется срочное действие',
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    emoji: '🔴',
  },
};

export function HomeTab() {
  const currentStatus: LegalStatus = 'risk';
  const status = statusConfig[currentStatus];

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-20">
      {/* Header */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Пульт управления</h1>
            <p className="text-sm text-gray-500">Статус миграционного учета</p>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher variant="compact" />
            <button
              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors active:scale-95"
              aria-label="Карта мигранта"
            >
              <QrCode className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="px-4 py-6">
        <div
          className={cn(
            'relative flex flex-col items-center justify-center p-8 rounded-3xl border-2',
            status.bgColor
          )}
        >
          <div className="text-6xl mb-4">{status.emoji}</div>
          <h2 className={cn('text-3xl font-bold mb-2', status.color)}>
            {status.label}
          </h2>
          <p className="text-center text-gray-700 font-medium">
            {status.sublabel}
          </p>
        </div>
      </div>

      {/* Smart Feed */}
      <div className="px-4 pb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Требуется внимание
        </h3>
        
        {/* Urgent Card */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-5 mb-3 shadow-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="inline-block px-2 py-1 bg-white/20 rounded-md text-xs font-semibold text-white mb-2">
                СРОЧНО
              </div>
              <h4 className="text-white font-bold text-lg mb-1">
                Патент истекает
              </h4>
              <p className="text-white/90 text-sm">
                Оплатите до 25 января, чтобы избежать штрафов
              </p>
            </div>
          </div>
          <button className="w-full bg-white text-red-600 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors active:scale-98 flex items-center justify-center">
            Оплатить патент
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>

        {/* Secondary Card */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="text-gray-900 font-bold text-lg mb-1">
                Подтвердите оплату
              </h4>
              <p className="text-gray-600 text-sm">
                Загрузите чеки за декабрь для подтверждения
              </p>
            </div>
          </div>
          <button className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors active:scale-98 flex items-center justify-center">
            Загрузить чеки
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="px-4 pb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">12</div>
            <div className="text-xs text-gray-600 mt-1">Дней до продления</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-600">5</div>
            <div className="text-xs text-gray-600 mt-1">Документов</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">3</div>
            <div className="text-xs text-gray-600 mt-1">Уведомлений</div>
          </div>
        </div>
      </div>
    </div>
  );
}
