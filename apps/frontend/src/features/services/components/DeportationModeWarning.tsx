'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface DeportationModeWarningProps {
  status: 'safe' | 'warning' | 'danger' | 'overstay';
}

/**
 * Предупреждение о режиме высылки (действует с 05.02.2025)
 * Показывается только при статусе danger или overstay
 */
export function DeportationModeWarning({ status }: DeportationModeWarningProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Показываем только при danger или overstay
  if (status !== 'danger' && status !== 'overstay') {
    return null;
  }

  const consequences = [
    { key: 'work', icon: '🚫' },
    { key: 'bank', icon: '🏦' },
    { key: 'vehicle', icon: '🚗' },
    { key: 'marriage', icon: '💍' },
    { key: 'license', icon: '🪪' },
    { key: 'leave', icon: '✈️' },
  ];

  return (
    <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-red-900">
            {t('services.calculator.deportationMode.title')}
          </h3>
          <p className="text-sm text-red-700">
            {t('services.calculator.deportationMode.subtitle')}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 text-sm text-red-800">
        {t('services.calculator.deportationMode.description')}
      </p>

      {/* Collapsible consequences list */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-3 w-full flex items-center justify-between py-2 px-3 bg-red-100 rounded-lg text-red-800 text-sm font-medium hover:bg-red-200 transition-colors"
      >
        <span>
          {isExpanded ? t('common.hide') : t('common.show')} {t('services.calculator.deportationMode.title').toLowerCase()}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {consequences.map(({ key, icon }) => (
            <div
              key={key}
              className="flex items-center gap-2 p-2 bg-white rounded-lg border border-red-200"
            >
              <span className="text-lg">{icon}</span>
              <span className="text-sm text-red-800">
                {t(`services.calculator.deportationMode.consequences.${key}`)}
              </span>
            </div>
          ))}

          {/* Final warning */}
          <div className="mt-3 p-3 bg-red-200 rounded-lg">
            <p className="text-sm font-semibold text-red-900">
              {t('services.calculator.deportationMode.warning')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
