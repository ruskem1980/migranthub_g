'use client';

import { useMemo } from 'react';
import {
  FileText,
  Briefcase,
  Home,
  CreditCard,
  ChevronRight,
  AlertCircle,
  Clock,
  CheckCircle,
  Hash,
  UserCheck,
  HeartPulse,
  Eye,
  Download,
} from 'lucide-react';
import type { TypedDocument, DocumentTypeValue } from '@/lib/db/types';
import { useTranslation } from '@/lib/i18n/useTranslation';
import {
  useDocumentExpiryStatus,
  formatExpiryDate,
  getStatusColor,
  getStatusText,
} from '../hooks/useExpiryTracker';

/**
 * Иконки для типов документов
 */
const documentIcons: Record<DocumentTypeValue, React.ComponentType<{ className?: string }>> = {
  passport: CreditCard,
  migration_card: FileText,
  patent: Briefcase,
  registration: Home,
  inn: Hash,
  snils: UserCheck,
  dms: HeartPulse,
};

/**
 * Цвета для типов документов
 */
const documentTypeColors: Record<DocumentTypeValue, string> = {
  passport: 'bg-blue-100 text-blue-600',
  migration_card: 'bg-purple-100 text-purple-600',
  patent: 'bg-orange-100 text-orange-600',
  registration: 'bg-green-100 text-green-600',
  inn: 'bg-indigo-100 text-indigo-600',
  snils: 'bg-teal-100 text-teal-600',
  dms: 'bg-red-100 text-red-600',
};

interface DocumentCardProps {
  document: TypedDocument;
  onClick?: () => void;
  onSwipeDelete?: () => void;
  onPreview?: () => void;
  onDownload?: () => void;
  compact?: boolean;
}

export function DocumentCard({
  document,
  onClick,
  onPreview,
  onDownload,
  compact = false,
}: DocumentCardProps) {
  const { t } = useTranslation();
  const Icon = documentIcons[document.type];
  const typeColor = documentTypeColors[document.type];

  const { status, daysRemaining, progressPercent } = useDocumentExpiryStatus(
    document.expiryDate
  );

  const statusColors = getStatusColor(status);

  const documentNumber = useMemo(() => {
    switch (document.type) {
      case 'passport':
        return document.data.passportNumber
          ? `${document.data.passportSeries || ''} ${document.data.passportNumber}`.trim()
          : null;
      case 'migration_card':
        return document.data.cardNumber
          ? `${document.data.cardSeries || ''} ${document.data.cardNumber}`.trim()
          : null;
      case 'patent':
        return document.data.patentNumber
          ? `${document.data.patentSeries || ''} ${document.data.patentNumber}`.trim()
          : null;
      case 'registration':
        return null;
      case 'inn':
        return document.data.innNumber || null;
      case 'snils':
        return document.data.snilsNumber || null;
      case 'dms':
        return document.data.policyNumber || null;
      default:
        return null;
    }
  }, [document]);

  const StatusIcon = useMemo(() => {
    switch (status) {
      case 'expired':
        return AlertCircle;
      case 'expiring_soon':
        return Clock;
      default:
        return CheckCircle;
    }
  }, [status]);

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full flex flex-col items-center p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all active:scale-[0.97]"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 ${typeColor}`}>
          <Icon className="w-5 h-5" />
        </div>

        <p className="text-xs font-medium text-gray-900 text-center line-clamp-2 leading-tight mb-1">
          {t(`documents.types.${document.type}`)}
        </p>

        {document.expiryDate && (
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusColors.bg} ${statusColors.text}`}
          >
            {status === 'valid'
              ? formatExpiryDate(document.expiryDate)
              : status === 'expired'
                ? 'Истёк'
                : `${daysRemaining} дн.`}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          {/* Иконка типа */}
          <button
            onClick={onClick}
            className="flex-shrink-0 active:scale-95 transition-transform"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${typeColor}`}>
              <Icon className="w-4.5 h-4.5" />
            </div>
          </button>

          {/* Основная информация */}
          <button
            onClick={onClick}
            className="flex-1 min-w-0 text-left active:scale-[0.99] transition-transform"
          >
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 truncate">
                {t(`documents.types.${document.type}`)}
              </h3>
              {documentNumber && (
                <span className="text-xs text-gray-500 truncate">{documentNumber}</span>
              )}
            </div>

            {/* Статус и дата истечения */}
            {document.expiryDate && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <StatusIcon className={`w-3.5 h-3.5 ${statusColors.text}`} />
                <span className={`text-xs ${statusColors.text}`}>
                  {status === 'valid'
                    ? `до ${formatExpiryDate(document.expiryDate)}`
                    : status === 'expired'
                      ? `истёк ${formatExpiryDate(document.expiryDate)}`
                      : `${daysRemaining} дн.`}
                </span>
              </div>
            )}
          </button>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {onPreview && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview();
                }}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                title="Просмотр PDF"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            {onDownload && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload();
                }}
                className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                title="Скачать PDF"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            <ChevronRight className="w-4 h-4 text-gray-300 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Прогресс-бар до истечения */}
      {document.expiryDate && (
        <div className="h-0.5 bg-gray-100">
          <div
            className={`h-full transition-all duration-300 ${statusColors.progressBar}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Скелетон для загрузки
 */
export function DocumentCardSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="w-full flex flex-col items-center p-3 bg-white border border-gray-200 rounded-xl animate-pulse">
        <div className="w-10 h-10 rounded-xl bg-gray-200 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-16 mb-1" />
        <div className="h-4 bg-gray-200 rounded w-12" />
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
      <div className="px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gray-200" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
        </div>
      </div>
      <div className="h-0.5 bg-gray-100" />
    </div>
  );
}

/**
 * Swipeable версия карточки для мобильных
 */
interface SwipeableDocumentCardProps extends DocumentCardProps {
  onDelete?: () => void;
}

export function SwipeableDocumentCard({
  document,
  onClick,
  onDelete,
  compact = false,
}: SwipeableDocumentCardProps) {
  // Простая реализация свайпа через CSS touch-action
  // Для production рекомендуется использовать библиотеку типа react-swipeable

  return (
    <div className="relative overflow-hidden rounded-xl group">
      {/* Фон для удаления */}
      {onDelete && (
        <div className="absolute inset-y-0 right-0 w-20 bg-red-500 flex items-center justify-center">
          <span className="text-white text-sm font-medium">Удалить</span>
        </div>
      )}

      {/* Карточка */}
      <div
        className="relative bg-white transition-transform duration-200 touch-pan-y"
        style={{ transform: 'translateX(0)' }}
      >
        <DocumentCard document={document} onClick={onClick} compact={compact} />
      </div>
    </div>
  );
}
