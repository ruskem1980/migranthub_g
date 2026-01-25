'use client';

import { useMemo } from 'react';
import { BookOpen, CreditCard, FileText, Home, ChevronRight, Check } from 'lucide-react';
import { DocumentType, documentTypeLabels, type DocumentTypeValue } from '../schemas';

interface DocumentCount {
  type: DocumentTypeValue;
  count: number;
}

interface DocumentTypeSelectorProps {
  onSelect: (type: DocumentTypeValue) => void;
  documentCounts?: DocumentCount[];
  selectedType?: DocumentTypeValue | null;
  disabled?: boolean;
}

interface DocumentTypeInfo {
  type: DocumentTypeValue;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
}

const DOCUMENT_TYPES_INFO: DocumentTypeInfo[] = [
  {
    type: DocumentType.PASSPORT,
    label: documentTypeLabels.passport,
    description: 'Заграничный паспорт для въезда в РФ',
    icon: <BookOpen className="w-6 h-6" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  {
    type: DocumentType.MIGRATION_CARD,
    label: documentTypeLabels.migration_card,
    description: 'Выдаётся при пересечении границы',
    icon: <CreditCard className="w-6 h-6" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    type: DocumentType.PATENT,
    label: documentTypeLabels.patent,
    description: 'Разрешение на трудовую деятельность',
    icon: <FileText className="w-6 h-6" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
  {
    type: DocumentType.REGISTRATION,
    label: documentTypeLabels.registration,
    description: 'Миграционный учёт по месту пребывания',
    icon: <Home className="w-6 h-6" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
];

export function DocumentTypeSelector({
  onSelect,
  documentCounts = [],
  selectedType,
  disabled = false,
}: DocumentTypeSelectorProps) {
  // Создаём map для быстрого доступа к количеству документов
  const countsMap = useMemo(() => {
    const map = new Map<DocumentTypeValue, number>();
    documentCounts.forEach(({ type, count }) => {
      map.set(type, count);
    });
    return map;
  }, [documentCounts]);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Выберите тип документа
      </h3>

      <div className="grid gap-3">
        {DOCUMENT_TYPES_INFO.map((docType) => {
          const count = countsMap.get(docType.type) || 0;
          const isSelected = selectedType === docType.type;

          return (
            <button
              key={docType.type}
              onClick={() => onSelect(docType.type)}
              disabled={disabled}
              className={`
                w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                ${isSelected
                  ? `${docType.borderColor} ${docType.bgColor} ring-2 ring-offset-2 ring-${docType.color.replace('text-', '')}`
                  : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Иконка */}
              <div
                className={`
                  w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                  ${isSelected ? docType.bgColor : 'bg-gray-100'}
                  ${isSelected ? docType.color : 'text-gray-500'}
                `}
              >
                {docType.icon}
              </div>

              {/* Текст */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {docType.label}
                  </span>
                  {count > 0 && (
                    <span
                      className={`
                        px-2 py-0.5 text-xs font-medium rounded-full
                        ${docType.bgColor} ${docType.color}
                      `}
                    >
                      {count}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {docType.description}
                </p>
              </div>

              {/* Индикатор выбора / стрелка */}
              <div className="flex-shrink-0">
                {isSelected ? (
                  <div className={`w-6 h-6 rounded-full ${docType.bgColor} flex items-center justify-center`}>
                    <Check className={`w-4 h-4 ${docType.color}`} />
                  </div>
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Подсказка */}
      <p className="text-sm text-gray-500 mt-4 text-center">
        Документы хранятся только на вашем устройстве
      </p>
    </div>
  );
}

// Компактный вариант для мобильных устройств
interface DocumentTypeCardProps {
  type: DocumentTypeValue;
  count?: number;
  onClick: () => void;
  isActive?: boolean;
}

export function DocumentTypeCard({
  type,
  count = 0,
  onClick,
  isActive = false,
}: DocumentTypeCardProps) {
  const typeInfo = DOCUMENT_TYPES_INFO.find((t) => t.type === type);
  if (!typeInfo) return null;

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all
        ${isActive
          ? `${typeInfo.borderColor} ${typeInfo.bgColor}`
          : 'border-gray-200 bg-white hover:bg-gray-50'
        }
      `}
    >
      <div
        className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          ${typeInfo.bgColor} ${typeInfo.color}
        `}
      >
        {typeInfo.icon}
      </div>
      <span className="text-sm font-medium text-gray-900 text-center">
        {typeInfo.label}
      </span>
      {count > 0 && (
        <span
          className={`
            px-2 py-0.5 text-xs font-medium rounded-full
            ${typeInfo.bgColor} ${typeInfo.color}
          `}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// Горизонтальный список типов документов
interface DocumentTypeTabsProps {
  selectedType: DocumentTypeValue | null;
  onSelect: (type: DocumentTypeValue) => void;
  documentCounts?: DocumentCount[];
}

export function DocumentTypeTabs({
  selectedType,
  onSelect,
  documentCounts = [],
}: DocumentTypeTabsProps) {
  const countsMap = useMemo(() => {
    const map = new Map<DocumentTypeValue, number>();
    documentCounts.forEach(({ type, count }) => {
      map.set(type, count);
    });
    return map;
  }, [documentCounts]);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {DOCUMENT_TYPES_INFO.map((docType) => {
        const count = countsMap.get(docType.type) || 0;
        const isSelected = selectedType === docType.type;

        return (
          <button
            key={docType.type}
            onClick={() => onSelect(docType.type)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all flex-shrink-0
              ${isSelected
                ? `${docType.bgColor} ${docType.color} font-semibold`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            <span className="w-5 h-5">{docType.icon}</span>
            <span className="text-sm">{docType.label}</span>
            {count > 0 && (
              <span
                className={`
                  w-5 h-5 text-xs font-bold rounded-full flex items-center justify-center
                  ${isSelected ? 'bg-white/50' : 'bg-gray-200'}
                `}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Экспорт информации о типах для использования в других компонентах
export { DOCUMENT_TYPES_INFO };
export type { DocumentCount, DocumentTypeInfo };
