'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  FileText,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
} from 'lucide-react';
import type { TypedDocument, DocumentTypeValue, DocumentStatus } from '@/lib/db/types';
import {
  documentTypeLabels,
  documentTypePriority,
  getDocumentStatus,
} from '@/lib/db/types';
import { DocumentCard, DocumentCardSkeleton } from './DocumentCard';
import { useExpiryTracker } from '../hooks/useExpiryTracker';

/**
 * Группировка документов по типу
 */
interface DocumentGroup {
  type: DocumentTypeValue;
  label: string;
  documents: TypedDocument[];
}

/**
 * Режимы группировки
 */
type GroupBy = 'type' | 'status' | 'none';

/**
 * Фильтры для документов
 */
interface DocumentFilters {
  search: string;
  status: DocumentStatus | 'all';
  type: DocumentTypeValue | 'all';
}

interface DocumentsListProps {
  documents: TypedDocument[];
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
  onAddDocument?: () => void;
  onSelectDocument?: (document: TypedDocument) => void;
  onDeleteDocument?: (document: TypedDocument) => void;
  onPreviewDocument?: (document: TypedDocument) => void;
  onDownloadDocument?: (document: TypedDocument) => void;
  showFilters?: boolean;
  showWarnings?: boolean;
  emptyStateAction?: () => void;
}

export function DocumentsList({
  documents,
  isLoading = false,
  onRefresh,
  onAddDocument,
  onSelectDocument,
  onDeleteDocument,
  onPreviewDocument,
  onDownloadDocument,
  showFilters = true,
  showWarnings = true,
  emptyStateAction,
}: DocumentsListProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>('type');
  const [filters, setFilters] = useState<DocumentFilters>({
    search: '',
    status: 'all',
    type: 'all',
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  // Отслеживание истечения сроков
  const { warnings, hasCritical, hasWarnings } = useExpiryTracker(documents);

  // Фильтрация документов
  const filteredDocuments = useMemo(() => {
    let result = [...documents];

    // Поиск по названию/номеру
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter((doc) => {
        const typeLabel = documentTypeLabels[doc.type].toLowerCase();
        if (typeLabel.includes(searchLower)) return true;

        // Поиск по номеру документа
        if (doc.type === 'passport') {
          const num = `${doc.data.passportSeries || ''} ${doc.data.passportNumber || ''}`.toLowerCase();
          if (num.includes(searchLower)) return true;
        }
        if (doc.type === 'migration_card') {
          const num = `${doc.data.cardSeries || ''} ${doc.data.cardNumber || ''}`.toLowerCase();
          if (num.includes(searchLower)) return true;
        }
        if (doc.type === 'patent') {
          const num = `${doc.data.patentSeries || ''} ${doc.data.patentNumber || ''}`.toLowerCase();
          if (num.includes(searchLower)) return true;
        }

        return false;
      });
    }

    // Фильтр по статусу
    if (filters.status !== 'all') {
      result = result.filter(
        (doc) => getDocumentStatus(doc.expiryDate) === filters.status
      );
    }

    // Фильтр по типу
    if (filters.type !== 'all') {
      result = result.filter((doc) => doc.type === filters.type);
    }

    return result;
  }, [documents, filters]);

  // Группировка документов
  const groupedDocuments = useMemo((): DocumentGroup[] => {
    if (groupBy === 'none') {
      return [
        {
          type: 'passport' as DocumentTypeValue,
          label: 'Все документы',
          documents: filteredDocuments.sort(
            (a, b) => documentTypePriority[a.type] - documentTypePriority[b.type]
          ),
        },
      ];
    }

    if (groupBy === 'status') {
      const expired = filteredDocuments.filter(
        (doc) => getDocumentStatus(doc.expiryDate) === 'expired'
      );
      const expiringSoon = filteredDocuments.filter(
        (doc) => getDocumentStatus(doc.expiryDate) === 'expiring_soon'
      );
      const valid = filteredDocuments.filter(
        (doc) => getDocumentStatus(doc.expiryDate) === 'valid'
      );

      const groups: DocumentGroup[] = [];

      if (expired.length > 0) {
        groups.push({
          type: 'passport' as DocumentTypeValue,
          label: '⚠️ Истекшие',
          documents: expired,
        });
      }

      if (expiringSoon.length > 0) {
        groups.push({
          type: 'migration_card' as DocumentTypeValue,
          label: '⏰ Скоро истекают',
          documents: expiringSoon,
        });
      }

      if (valid.length > 0) {
        groups.push({
          type: 'registration' as DocumentTypeValue,
          label: '✓ Действующие',
          documents: valid,
        });
      }

      return groups;
    }

    // Группировка по типу (по умолчанию)
    const groups: DocumentGroup[] = [];
    const types: DocumentTypeValue[] = ['passport', 'migration_card', 'patent', 'registration'];

    for (const type of types) {
      const typeDocs = filteredDocuments.filter((doc) => doc.type === type);
      if (typeDocs.length > 0) {
        groups.push({
          type,
          label: documentTypeLabels[type],
          documents: typeDocs,
        });
      }
    }

    return groups;
  }, [filteredDocuments, groupBy]);

  // Pull-to-refresh
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (listRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback(
    async (e: React.TouchEvent) => {
      if (!onRefresh || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startY.current;

      if (diff > 80 && listRef.current?.scrollTop === 0) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
        }
      }
    },
    [onRefresh, isRefreshing]
  );

  // Обработка клика на документ
  const handleDocumentClick = useCallback(
    (document: TypedDocument) => {
      if (onSelectDocument) {
        onSelectDocument(document);
      } else {
        router.push(`/documents/${document.id}`);
      }
    },
    [onSelectDocument, router]
  );

  // Обработка добавления
  const handleAddClick = useCallback(() => {
    if (onAddDocument) {
      onAddDocument();
    } else if (emptyStateAction) {
      emptyStateAction();
    }
  }, [onAddDocument, emptyStateAction]);

  // Скелетон загрузки
  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <DocumentCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (documents.length === 0) {
    return (
      <EmptyState onAdd={handleAddClick} />
    );
  }

  // Нет результатов после фильтрации
  if (filteredDocuments.length === 0) {
    return (
      <div className="p-4 space-y-4">
        {showFilters && (
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            showPanel={showFilterPanel}
            onTogglePanel={() => setShowFilterPanel(!showFilterPanel)}
          />
        )}

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ничего не найдено
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Попробуйте изменить параметры поиска или фильтрации
          </p>
          <button
            onClick={() =>
              setFilters({ search: '', status: 'all', type: 'all' })
            }
            className="text-blue-600 text-sm font-medium hover:text-blue-700"
          >
            Сбросить фильтры
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className="flex-1 overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
      {/* Pull-to-refresh индикатор */}
      {isRefreshing && (
        <div className="flex items-center justify-center py-4 bg-gray-50">
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mr-2" />
          <span className="text-sm text-gray-600">Обновление...</span>
        </div>
      )}

      <div className="p-4 space-y-4">
        {/* Предупреждения */}
        {showWarnings && hasWarnings && (
          <WarningBanner warnings={warnings} hasCritical={hasCritical} />
        )}

        {/* Фильтры */}
        {showFilters && (
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            showPanel={showFilterPanel}
            onTogglePanel={() => setShowFilterPanel(!showFilterPanel)}
          />
        )}

        {/* Группы документов */}
        <div className="space-y-6">
          {groupedDocuments.map((group) => (
            <div key={group.label} className="space-y-3">
              {groupBy !== 'none' && (
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  {group.label}
                  <span className="ml-2 text-gray-400">
                    ({group.documents.length})
                  </span>
                </h2>
              )}

              <div className="space-y-3">
                {group.documents.map((document, index) => (
                  <div
                    key={document.id}
                    className="animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <DocumentCard
                      document={document}
                      onClick={() => handleDocumentClick(document)}
                      onPreview={onPreviewDocument ? () => onPreviewDocument(document) : undefined}
                      onDownload={onDownloadDocument ? () => onDownloadDocument(document) : undefined}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAB для добавления */}
      {onAddDocument && (
        <button
          onClick={handleAddClick}
          className="fixed bottom-20 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all z-10"
          aria-label="Добавить документ"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

/**
 * Баннер с предупреждениями
 */
function WarningBanner({
  warnings,
  hasCritical,
}: {
  warnings: { message: string; documentId: string }[];
  hasCritical: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayCount = isExpanded ? warnings.length : 2;
  const visibleWarnings = warnings.slice(0, displayCount);

  return (
    <div
      className={`p-4 rounded-xl border-l-4 ${
        hasCritical
          ? 'bg-red-50 border-red-500'
          : 'bg-yellow-50 border-yellow-500'
      }`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle
          className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
            hasCritical ? 'text-red-600' : 'text-yellow-600'
          }`}
        />
        <div className="flex-1 min-w-0">
          <h3
            className={`text-sm font-semibold ${
              hasCritical ? 'text-red-900' : 'text-yellow-900'
            }`}
          >
            {hasCritical ? 'Требуется внимание' : 'Обратите внимание'}
          </h3>
          <ul className="mt-1 space-y-1">
            {visibleWarnings.map((warning) => (
              <li
                key={warning.documentId}
                className={`text-sm ${
                  hasCritical ? 'text-red-700' : 'text-yellow-700'
                }`}
              >
                {warning.message}
              </li>
            ))}
          </ul>
          {warnings.length > 2 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`mt-2 text-sm font-medium ${
                hasCritical
                  ? 'text-red-700 hover:text-red-800'
                  : 'text-yellow-700 hover:text-yellow-800'
              }`}
            >
              {isExpanded
                ? 'Скрыть'
                : `Ещё ${warnings.length - 2} предупреждений`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Панель фильтров
 */
function FilterBar({
  filters,
  onFiltersChange,
  groupBy,
  onGroupByChange,
  showPanel,
  onTogglePanel,
}: {
  filters: DocumentFilters;
  onFiltersChange: (filters: DocumentFilters) => void;
  groupBy: GroupBy;
  onGroupByChange: (groupBy: GroupBy) => void;
  showPanel: boolean;
  onTogglePanel: () => void;
}) {
  return (
    <div className="space-y-3">
      {/* Поиск и кнопка фильтров */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск документов..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={onTogglePanel}
          className={`p-2.5 rounded-xl border transition-colors ${
            showPanel
              ? 'bg-blue-50 border-blue-200 text-blue-600'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Развёрнутая панель фильтров */}
      {showPanel && (
        <div className="p-4 bg-gray-50 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2">
          {/* Группировка */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Группировка
            </label>
            <div className="flex gap-2">
              {[
                { value: 'type', label: 'По типу' },
                { value: 'status', label: 'По статусу' },
                { value: 'none', label: 'Без группы' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => onGroupByChange(option.value as GroupBy)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    groupBy === option.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Фильтр по статусу */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Статус
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  status: e.target.value as DocumentStatus | 'all',
                })
              }
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все статусы</option>
              <option value="valid">Действующие</option>
              <option value="expiring_soon">Скоро истекают</option>
              <option value="expired">Истекшие</option>
            </select>
          </div>

          {/* Фильтр по типу */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              Тип документа
            </label>
            <select
              value={filters.type}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  type: e.target.value as DocumentTypeValue | 'all',
                })
              }
              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все типы</option>
              {Object.entries(documentTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Кнопка сброса */}
          <button
            onClick={() =>
              onFiltersChange({ search: '', status: 'all', type: 'all' })
            }
            className="w-full py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Empty state
 */
function EmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <FileText className="w-10 h-10 text-gray-400" />
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Нет документов
      </h2>

      <p className="text-gray-500 mb-6 max-w-sm">
        Добавьте свои документы, чтобы отслеживать сроки действия и всегда иметь
        их под рукой
      </p>

      {onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          Добавить документ
        </button>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-xl max-w-sm">
        <p className="text-sm text-blue-800">
          <strong>Важно:</strong> Все ваши документы хранятся только на вашем
          устройстве и зашифрованы. Мы не передаём данные на сервер.
        </p>
      </div>
    </div>
  );
}

/**
 * Экспорт компонентов
 */
export { EmptyState, WarningBanner, FilterBar };
