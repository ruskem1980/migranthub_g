'use client';

import { X, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { type CheckResult } from '@/lib/stores/documentCheckStore';

interface CheckResultModalProps {
  result: CheckResult;
  onClose: () => void;
}

export function CheckResultModal({ result, onClose }: CheckResultModalProps) {
  const getStatusStyles = () => {
    switch (result.status) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          titleColor: 'text-green-900',
          Icon: CheckCircle,
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-900',
          Icon: AlertTriangle,
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          titleColor: 'text-red-900',
          Icon: XCircle,
        };
    }
  };

  const styles = getStatusStyles();
  const { Icon } = styles;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title-check-result"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${styles.iconBg} rounded-full flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${styles.iconColor}`} />
            </div>
            <h2 id="modal-title-check-result" className="text-lg font-bold text-gray-900">
              Результат проверки
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Закрыть"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {/* Status Card */}
          <div className={`p-4 rounded-xl ${styles.bg} border-2 ${styles.border} mb-4`}>
            <div className="flex items-center gap-3 mb-2">
              <Icon className={`w-8 h-8 ${styles.iconColor}`} />
              <h3 className={`text-xl font-bold ${styles.titleColor}`}>
                {result.title}
              </h3>
            </div>
            <p className="text-gray-700">{result.message}</p>
          </div>

          {/* Details */}
          {result.details && result.details.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 mb-3">Детали:</h4>
              {result.details.map((detail, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-2 flex-shrink-0" />
                  <span className="text-gray-700">{detail}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}
