'use client';

import { Camera, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

type DocumentStatus = 'active' | 'expiring' | 'missing';

interface Document {
  id: string;
  title: string;
  status: DocumentStatus;
  statusLabel: string;
  validUntil?: string;
  icon: string;
}

const documents: Document[] = [
  {
    id: '1',
    title: 'Паспорт',
    status: 'active',
    statusLabel: 'Активен',
    validUntil: 'до 2028',
    icon: '🛂',
  },
  {
    id: '2',
    title: 'Патент',
    status: 'expiring',
    statusLabel: 'Истекает',
    validUntil: '25 января',
    icon: '📄',
  },
  {
    id: '3',
    title: 'Регистрация',
    status: 'missing',
    statusLabel: 'Нет данных',
    icon: '📋',
  },
  {
    id: '4',
    title: 'Медполис',
    status: 'active',
    statusLabel: 'Активен',
    validUntil: 'до июня 2024',
    icon: '🏥',
  },
  {
    id: '5',
    title: 'Миграционная карта',
    status: 'active',
    statusLabel: 'Активна',
    validUntil: 'до марта 2024',
    icon: '🎫',
  },
];

const statusConfig: Record<DocumentStatus, { icon: any; color: string; bgColor: string }> = {
  active: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50 border-green-200',
  },
  expiring: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
  },
  missing: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
  },
};

export function DocumentsTab() {
  return (
    <div className="flex flex-col h-full overflow-hidden pb-20">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-gray-900">Документы</h1>
          <LanguageSwitcher variant="compact" />
        </div>
        <p className="text-sm text-gray-500">Активный реестр</p>
      </div>

      {/* Horizontal Scrollable Cards */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 px-4 py-6 h-full">
          {documents.map((doc) => {
            const config = statusConfig[doc.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={doc.id}
                className={cn(
                  'flex-shrink-0 w-72 rounded-2xl border-2 p-6 shadow-lg transition-transform hover:scale-105 active:scale-100',
                  config.bgColor
                )}
              >
                {/* Document Icon */}
                <div className="text-6xl mb-4 text-center">{doc.icon}</div>

                {/* Document Title */}
                <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                  {doc.title}
                </h3>

                {/* Status Badge */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <StatusIcon className={cn('w-5 h-5', config.color)} />
                  <span className={cn('font-semibold', config.color)}>
                    {doc.statusLabel}
                  </span>
                </div>

                {/* Valid Until */}
                {doc.validUntil && (
                  <div className="text-center text-sm text-gray-600 mb-4">
                    {doc.validUntil}
                  </div>
                )}

                {/* Action Button */}
                <button
                  className={cn(
                    'w-full py-3 px-4 rounded-xl font-semibold transition-colors',
                    doc.status === 'expiring'
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : doc.status === 'missing'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  )}
                >
                  {doc.status === 'expiring'
                    ? 'Продлить'
                    : doc.status === 'missing'
                    ? 'Добавить'
                    : 'Подробнее'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Scan Button */}
      <button
        className="fixed bottom-24 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center z-40"
        aria-label="Сканировать документ"
      >
        <Camera className="w-7 h-7" />
      </button>
    </div>
  );
}
