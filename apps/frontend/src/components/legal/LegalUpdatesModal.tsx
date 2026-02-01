'use client';

import { Modal } from '@/components/ui/Modal';
import { useTranslation } from '@/lib/i18n';
import { AlertTriangle, AlertCircle, Info, CheckCircle, ChevronRight, ExternalLink } from 'lucide-react';
import type { DailyReport, LegalChange, ChangeUrgency } from '@/features/legal/hooks/useLegalReports';
import Link from 'next/link';

interface LegalUpdatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DailyReport | null;
  onMarkAsRead?: () => void;
}

/**
 * Get urgency styles and icon based on urgency level
 */
function getUrgencyConfig(urgency: ChangeUrgency) {
  switch (urgency) {
    case 'critical':
      return {
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-700',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-800',
        icon: AlertTriangle,
        iconColor: 'text-red-500',
      };
    case 'high':
      return {
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-700',
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-800',
        icon: AlertCircle,
        iconColor: 'text-orange-500',
      };
    case 'medium':
      return {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-700',
        badgeBg: 'bg-yellow-100',
        badgeText: 'text-yellow-800',
        icon: Info,
        iconColor: 'text-yellow-500',
      };
    case 'low':
    default:
      return {
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-700',
        badgeBg: 'bg-gray-100',
        badgeText: 'text-gray-800',
        icon: CheckCircle,
        iconColor: 'text-gray-400',
      };
  }
}

/**
 * Single change item component
 */
function ChangeItem({ change }: { change: LegalChange }) {
  const { t } = useTranslation();
  const config = getUrgencyConfig(change.urgency);
  const IconComponent = config.icon;

  return (
    <div
      className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
    >
      {/* Header with urgency badge */}
      <div className="flex items-start gap-3">
        <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1 min-w-0">
          {/* Title and urgency badge */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="font-medium text-gray-900 leading-tight">
              {change.title}
            </h4>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.badgeBg} ${config.badgeText} flex-shrink-0`}
            >
              {t(`legalUpdates.urgency.${change.urgency}`)}
            </span>
          </div>

          {/* Summary */}
          <p className={`text-sm ${config.textColor} mb-3`}>
            {change.summary}
          </p>

          {/* Change percentage indicator */}
          {change.changePercentage > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    change.changePercentage > 50
                      ? 'bg-red-500'
                      : change.changePercentage > 20
                        ? 'bg-orange-500'
                        : 'bg-yellow-500'
                  }`}
                  style={{ width: `${Math.min(change.changePercentage, 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {change.changePercentage}%
              </span>
            </div>
          )}

          {/* Recommendations */}
          {change.recommendations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200/50">
              <p className="text-xs font-medium text-gray-600 mb-2">
                {t('legalUpdates.recommendations')}:
              </p>
              <ul className="space-y-1">
                {change.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <ChevronRight className="w-3 h-3 mt-1 flex-shrink-0 text-gray-400" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Modal component for displaying legal updates/changes
 */
export function LegalUpdatesModal({
  isOpen,
  onClose,
  report,
  onMarkAsRead,
}: LegalUpdatesModalProps) {
  const { t, language } = useTranslation();

  const handleClose = () => {
    onMarkAsRead?.();
    onClose();
  };

  // Sort changes by urgency (critical first)
  const sortedChanges = report?.changes
    ? [...report.changes].sort((a, b) => {
        const urgencyOrder: Record<ChangeUrgency, number> = {
          critical: 0,
          high: 1,
          medium: 2,
          low: 3,
        };
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      })
    : [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('legalUpdates.title')}
      size="lg"
    >
      <div className="space-y-4">
        {/* Report date */}
        {report && (
          <div className="flex items-center justify-between text-sm text-gray-500 pb-2 border-b">
            <span>{formatDate(report.date)}</span>
            <span>
              {t('legalUpdates.newChanges', { count: report.changesCount })}
            </span>
          </div>
        )}

        {/* Changes list */}
        {sortedChanges.length > 0 ? (
          <div className="space-y-3">
            {sortedChanges.map((change, index) => (
              <ChangeItem key={`${change.lawId}-${index}`} change={change} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
            <p>{t('legalUpdates.noChanges')}</p>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex flex-col gap-3 pt-4 border-t">
          {/* View all link */}
          <Link
            href="/legal-updates"
            onClick={handleClose}
            className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <span>{t('legalUpdates.viewAll')}</span>
            <ExternalLink className="w-4 h-4" />
          </Link>

          {/* Understood button */}
          <button
            onClick={handleClose}
            className="w-full py-3 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t('legalUpdates.understood')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default LegalUpdatesModal;
