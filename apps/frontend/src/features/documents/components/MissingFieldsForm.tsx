'use client';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Camera, Lightbulb, AlertCircle } from 'lucide-react';
import {
  FIELD_METADATA,
  CATEGORY_FIELD_LABELS,
  groupFieldsByCategory,
  type FieldCategory,
} from '../formsRegistry';
import { getLocalizedPlaceholder } from '../sampleData';

interface MissingFieldsFormProps {
  missingFields: string[];
  register: UseFormRegister<Record<string, string>>;
  errors: FieldErrors;
  onScanPassport: () => void;
  onFillSample: () => void;
  language?: string;
}

const CATEGORY_ORDER: FieldCategory[] = ['personal', 'document', 'thirdParty', 'work'];

const CATEGORY_ICONS: Record<FieldCategory, string> = {
  personal: '\u{1F464}',
  document: '\u{1F4C4}',
  thirdParty: '\u{1F465}',
  work: '\u{1F4BC}',
};

const CATEGORY_COLORS: Record<FieldCategory, { bg: string; border: string; text: string }> = {
  personal: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
  document: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
  thirdParty: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800' },
  work: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
};

export function MissingFieldsForm({
  missingFields,
  register,
  errors,
  onScanPassport,
  onFillSample,
  language = 'ru',
}: MissingFieldsFormProps) {
  const groupedFields = groupFieldsByCategory(missingFields);

  // Check if there are fields that can be filled by scanning passport
  const hasPassportFields = missingFields.some(
    (field) => FIELD_METADATA[field]?.source === 'passport'
  );

  const renderField = (field: string) => {
    const meta = FIELD_METADATA[field];
    if (!meta) return null;

    // Get localized placeholder or fall back to static metadata placeholder
    const localizedPlaceholder = getLocalizedPlaceholder(field, language);
    const placeholder = localizedPlaceholder || meta.placeholder || `Введите ${meta.label.toLowerCase()}`;

    const baseInputClass = `w-full px-4 py-3 border-2 border-gray-200 rounded-xl
      focus:outline-none focus:ring-2 focus:ring-blue-500
      placeholder:text-gray-400`;

    switch (meta.inputType) {
      case 'textarea':
        return (
          <textarea
            {...register(field, { required: true })}
            rows={3}
            className={`${baseInputClass} resize-none`}
            placeholder={placeholder}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            {...register(field, { required: true })}
            className={baseInputClass}
          />
        );

      case 'select':
        if (field === 'gender') {
          return (
            <select
              {...register(field, { required: true })}
              className={baseInputClass}
            >
              <option value="">Выберите</option>
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
          );
        }
        return (
          <input
            type="text"
            {...register(field, { required: true })}
            className={baseInputClass}
            placeholder={placeholder}
          />
        );

      default:
        return (
          <input
            type="text"
            {...register(field, { required: true })}
            className={baseInputClass}
            placeholder={placeholder}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick fill block */}
      <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
        <div className="flex items-start gap-3">
          <Camera className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">Быстрое заполнение</h3>
            <p className="text-sm text-blue-700 mt-1">
              Вы можете отсканировать паспорт, чтобы автоматически заполнить данные
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {hasPassportFields && (
                <button
                  type="button"
                  onClick={onScanPassport}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  Сканировать паспорт
                </button>
              )}
              <button
                type="button"
                onClick={onFillSample}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border-2 border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Заполнить образцом
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Field groups by category */}
      {CATEGORY_ORDER.map((category) => {
        const fields = groupedFields[category];
        if (!fields || fields.length === 0) return null;

        const categoryInfo = CATEGORY_FIELD_LABELS[category];
        const colors = CATEGORY_COLORS[category];
        const icon = CATEGORY_ICONS[category];

        return (
          <div key={category} className="space-y-4">
            {/* Category info banner */}
            <div className={`p-4 rounded-xl border ${colors.bg} ${colors.border}`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{icon}</span>
                <h3 className={`font-semibold ${colors.text}`}>
                  {categoryInfo.title}
                </h3>
              </div>
              <p className={`text-sm mt-1 ${colors.text} opacity-80`}>
                {categoryInfo.description}
              </p>
            </div>

            {/* Category fields */}
            {fields.map((field) => {
              const meta = FIELD_METADATA[field];
              if (!meta) return null;

              return (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {meta.label} *
                  </label>
                  {renderField(field)}
                  {errors[field] && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Обязательное поле
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
