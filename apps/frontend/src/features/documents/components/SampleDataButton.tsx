'use client';

import { Lightbulb } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { getSampleData, type DocumentType } from '../sampleData';

/**
 * Props для компонента SampleDataButton
 */
export interface SampleDataButtonProps {
  /** Тип документа для получения образца */
  documentType: DocumentType;
  /** Callback, вызываемый при клике с данными образца */
  onFillSample: (data: Record<string, unknown>) => void;
  /** Дополнительные CSS-классы */
  className?: string;
  /** Отключить кнопку */
  disabled?: boolean;
}

/**
 * Кнопка "Заполнить образцом" для форм документов
 *
 * Использует текущий язык пользователя для получения локализованных
 * образцов данных (имена на родном языке).
 *
 * @example
 * ```tsx
 * <SampleDataButton
 *   documentType="passport"
 *   onFillSample={(data) => {
 *     // Заполнить форму данными
 *     Object.entries(data).forEach(([key, value]) => {
 *       setValue(key, value);
 *     });
 *   }}
 * />
 * ```
 */
export function SampleDataButton({
  documentType,
  onFillSample,
  className = '',
  disabled = false,
}: SampleDataButtonProps) {
  const { t, language } = useTranslation();

  const handleClick = () => {
    if (disabled) return;

    const sampleData = getSampleData(documentType, { language });
    onFillSample(sampleData as Record<string, unknown>);
  };

  const buttonLabel = t('documents.sampleData.fillWithSample');
  const tooltipText = t('documents.sampleData.tooltip');

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={tooltipText}
      aria-label={buttonLabel}
      className={`
        inline-flex items-center gap-2 px-4 py-2.5
        text-sm font-medium
        text-gray-700 bg-white
        border-2 border-gray-200
        rounded-xl
        hover:bg-gray-50 hover:border-gray-300
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200
        transition-all duration-200
        ${className}
      `.trim()}
    >
      <Lightbulb className="w-4 h-4 text-amber-500" />
      <span>{buttonLabel}</span>
    </button>
  );
}

export default SampleDataButton;
