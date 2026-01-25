'use client';

import { useMemo } from 'react';
import type { TypedDocument, DocumentTypeValue } from '@/lib/db/types';
import {
  getDocumentStatus,
  documentTypeLabels,
  type DocumentStatus,
} from '@/lib/db/types';

/**
 * Уровень срочности предупреждения
 */
export type ExpiryUrgency = 'critical' | 'warning' | 'info';

/**
 * Предупреждение об истечении срока документа
 */
export interface ExpiryWarning {
  documentId: string;
  documentType: DocumentTypeValue;
  documentTitle: string;
  expiryDate: string;
  daysRemaining: number;
  status: DocumentStatus;
  urgency: ExpiryUrgency;
  message: string;
}

/**
 * Результат отслеживания сроков
 */
export interface ExpiryTrackerResult {
  /** Все предупреждения */
  warnings: ExpiryWarning[];
  /** Истёкшие документы */
  expired: ExpiryWarning[];
  /** Истекающие скоро (< 30 дней) */
  expiringSoon: ExpiryWarning[];
  /** Количество по категориям */
  counts: {
    total: number;
    expired: number;
    expiringSoon: number;
  };
  /** Есть ли критические предупреждения */
  hasCritical: boolean;
  /** Есть ли какие-либо предупреждения */
  hasWarnings: boolean;
}

/**
 * Конфигурация для отслеживания сроков
 */
export interface ExpiryTrackerConfig {
  /** Количество дней для "скоро истекает" (по умолчанию 30) */
  warningDays?: number;
  /** Количество дней для критического предупреждения (по умолчанию 7) */
  criticalDays?: number;
}

/**
 * Вычисляет количество дней до истечения
 */
function getDaysRemaining(expiryDate: string): number {
  const expiry = new Date(expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Определяет уровень срочности
 */
function getUrgency(daysRemaining: number, criticalDays: number): ExpiryUrgency {
  if (daysRemaining < 0) {
    return 'critical';
  }
  if (daysRemaining <= criticalDays) {
    return 'critical';
  }
  return 'warning';
}

/**
 * Формирует сообщение предупреждения
 */
function formatWarningMessage(
  documentType: DocumentTypeValue,
  daysRemaining: number
): string {
  const docName = documentTypeLabels[documentType];

  if (daysRemaining < 0) {
    const daysExpired = Math.abs(daysRemaining);
    if (daysExpired === 1) {
      return `${docName} истёк вчера`;
    }
    return `${docName} истёк ${daysExpired} ${pluralizeDays(daysExpired)} назад`;
  }

  if (daysRemaining === 0) {
    return `${docName} истекает сегодня`;
  }

  if (daysRemaining === 1) {
    return `${docName} истекает завтра`;
  }

  return `${docName} истекает через ${daysRemaining} ${pluralizeDays(daysRemaining)}`;
}

/**
 * Склонение слова "день"
 */
function pluralizeDays(count: number): string {
  const abs = Math.abs(count);
  const lastDigit = abs % 10;
  const lastTwoDigits = abs % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'дней';
  }

  if (lastDigit === 1) {
    return 'день';
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'дня';
  }

  return 'дней';
}

/**
 * Хук для отслеживания истечения сроков документов
 */
export function useExpiryTracker(
  documents: TypedDocument[],
  config: ExpiryTrackerConfig = {}
): ExpiryTrackerResult {
  const { warningDays = 30, criticalDays = 7 } = config;

  return useMemo(() => {
    const warnings: ExpiryWarning[] = [];

    for (const doc of documents) {
      if (!doc.expiryDate) {
        continue;
      }

      const status = getDocumentStatus(doc.expiryDate, warningDays);

      // Пропускаем действующие документы
      if (status === 'valid') {
        continue;
      }

      const daysRemaining = getDaysRemaining(doc.expiryDate);
      const urgency = getUrgency(daysRemaining, criticalDays);

      warnings.push({
        documentId: doc.id,
        documentType: doc.type,
        documentTitle: doc.title,
        expiryDate: doc.expiryDate,
        daysRemaining,
        status,
        urgency,
        message: formatWarningMessage(doc.type, daysRemaining),
      });
    }

    // Сортируем по срочности (сначала самые критичные)
    warnings.sort((a, b) => a.daysRemaining - b.daysRemaining);

    const expired = warnings.filter((w) => w.status === 'expired');
    const expiringSoon = warnings.filter((w) => w.status === 'expiring_soon');

    return {
      warnings,
      expired,
      expiringSoon,
      counts: {
        total: warnings.length,
        expired: expired.length,
        expiringSoon: expiringSoon.length,
      },
      hasCritical: warnings.some((w) => w.urgency === 'critical'),
      hasWarnings: warnings.length > 0,
    };
  }, [documents, warningDays, criticalDays]);
}

/**
 * Хук для получения статуса конкретного документа
 */
export function useDocumentExpiryStatus(
  expiryDate: string | undefined,
  warningDays = 30
): {
  status: DocumentStatus;
  daysRemaining: number | null;
  isExpired: boolean;
  isExpiringSoon: boolean;
  progressPercent: number;
} {
  return useMemo(() => {
    if (!expiryDate) {
      return {
        status: 'valid' as DocumentStatus,
        daysRemaining: null,
        isExpired: false,
        isExpiringSoon: false,
        progressPercent: 100,
      };
    }

    const status = getDocumentStatus(expiryDate, warningDays);
    const daysRemaining = getDaysRemaining(expiryDate);

    // Прогресс-бар: 100% = полный срок, 0% = истёк
    // Используем warningDays * 2 как "полный срок" для визуализации
    const maxDays = warningDays * 2;
    const progressPercent = Math.max(0, Math.min(100, (daysRemaining / maxDays) * 100));

    return {
      status,
      daysRemaining,
      isExpired: status === 'expired',
      isExpiringSoon: status === 'expiring_soon',
      progressPercent,
    };
  }, [expiryDate, warningDays]);
}

/**
 * Форматирование даты для отображения
 */
export function formatExpiryDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Получение цвета статуса
 */
export function getStatusColor(status: DocumentStatus): {
  bg: string;
  text: string;
  border: string;
  progressBar: string;
} {
  switch (status) {
    case 'expired':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        progressBar: 'bg-red-500',
      };
    case 'expiring_soon':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        progressBar: 'bg-yellow-500',
      };
    default:
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        progressBar: 'bg-green-500',
      };
  }
}

/**
 * Получение текста статуса
 */
export function getStatusText(status: DocumentStatus): string {
  switch (status) {
    case 'expired':
      return 'Истёк';
    case 'expiring_soon':
      return 'Истекает';
    default:
      return 'Действует';
  }
}
