'use client';

import { CheckCircle, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguageStore, type Language } from '@/lib/stores/languageStore';

export type CheckResultStatus = 'success' | 'warning' | 'error' | 'loading';

export interface CheckResultProps {
  status: CheckResultStatus;
  title: string;
  message: string;
  details?: Record<string, string>;
  onSave?: () => void;
  onClose?: () => void;
}

const labels: Record<string, Record<Language, string>> = {
  save: {
    ru: 'Сохранить результат',
    en: 'Save Result',
    uz: 'Natijani saqlash',
    tg: 'Натиҷаро захира кунед',
    ky: 'Жыйынтыкты сактоо',
  },
  close: {
    ru: 'Закрыть',
    en: 'Close',
    uz: 'Yopish',
    tg: 'Пушидан',
    ky: 'Жабуу',
  },
  loading: {
    ru: 'Проверяем...',
    en: 'Checking...',
    uz: 'Tekshirilmoqda...',
    tg: 'Санҷиш...',
    ky: 'Текшерилууде...',
  },
};

const statusConfig: Record<
  CheckResultStatus,
  {
    icon: typeof CheckCircle;
    bgColor: string;
    iconColor: string;
    borderColor: string;
  }
> = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    borderColor: 'border-green-200',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    borderColor: 'border-yellow-200',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
    borderColor: 'border-red-200',
  },
  loading: {
    icon: Loader2,
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-200',
  },
};

export function CheckResult({
  status,
  title,
  message,
  details,
  onSave,
  onClose,
}: CheckResultProps) {
  const { language } = useLanguageStore();
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="space-y-4">
      {/* Status Icon */}
      <div className="text-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${config.bgColor}`}
        >
          <Icon
            className={`w-8 h-8 ${config.iconColor} ${status === 'loading' ? 'animate-spin' : ''}`}
          />
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
      </div>

      {/* Details */}
      {details && Object.keys(details).length > 0 && (
        <div className={`p-4 rounded-xl border-2 ${config.borderColor} ${config.bgColor}`}>
          <div className="space-y-2">
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{key}</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {(onSave || onClose) && (
        <div className="flex gap-3">
          {onSave && (
            <button
              onClick={onSave}
              className="flex-1 bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary/90 transition-colors"
            >
              {labels.save[language]}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
            >
              {labels.close[language]}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default CheckResult;
