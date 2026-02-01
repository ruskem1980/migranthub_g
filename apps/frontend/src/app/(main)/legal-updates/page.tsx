'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import {
  Scale,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  ChevronRight,
  Calendar,
  Filter,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useLegalReports, type DailyReport, type LegalChange, type ChangeUrgency } from '@/features/legal/hooks/useLegalReports';

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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
    >
      {/* Header with urgency badge */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start gap-3 text-left"
      >
        <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
        <div className="flex-1 min-w-0">
          {/* Title and urgency badge */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-gray-900 leading-tight">
              {change.title}
            </h4>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.badgeBg} ${config.badgeText} flex-shrink-0`}
            >
              {t(`legalUpdates.urgency.${change.urgency}`)}
            </span>
          </div>

          {/* Summary (always visible) */}
          <p className={`text-sm ${config.textColor} mt-2`}>
            {change.summary}
          </p>
        </div>
        <ChevronRight
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 ml-8 space-y-3">
          {/* Change percentage indicator */}
          {change.changePercentage > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{t('legalUpdates.changePercent')}:</span>
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden max-w-[200px]">
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
              <span className="text-xs text-gray-600 font-medium">
                {change.changePercentage}%
              </span>
            </div>
          )}

          {/* Recommendations */}
          {change.recommendations.length > 0 && (
            <div className="pt-3 border-t border-gray-200/50">
              <p className="text-xs font-medium text-gray-600 mb-2">
                {t('legalUpdates.recommendations')}:
              </p>
              <ul className="space-y-1.5">
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
      )}
    </div>
  );
}

/**
 * Report card component
 */
function ReportCard({ report }: { report: DailyReport }) {
  const { t, language } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Sort changes by urgency (critical first)
  const sortedChanges = useMemo(() => {
    return [...report.changes].sort((a, b) => {
      const urgencyOrder: Record<ChangeUrgency, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
      };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  }, [report.changes]);

  // Count by urgency
  const urgencyCounts = useMemo(() => {
    return report.changes.reduce(
      (acc, change) => {
        acc[change.urgency] = (acc[change.urgency] || 0) + 1;
        return acc;
      },
      {} as Record<ChangeUrgency, number>
    );
  }, [report.changes]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <CardTitle className="text-base">{formatDate(report.date)}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('legalUpdates.newChanges', { count: report.changesCount })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Urgency badges */}
            {urgencyCounts.critical && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                {urgencyCounts.critical}
              </span>
            )}
            {urgencyCounts.high && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                {urgencyCounts.high}
              </span>
            )}
            <ChevronRight
              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            />
          </div>
        </button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-2">
          {sortedChanges.length > 0 ? (
            <div className="space-y-3">
              {sortedChanges.map((change, index) => (
                <ChangeItem key={`${change.lawId}-${index}`} change={change} />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <p className="text-sm">{t('legalUpdates.noChanges')}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

type UrgencyFilter = 'all' | ChangeUrgency;

export default function LegalUpdatesPage() {
  const { t } = useTranslation();
  const { reports, isLoading, error, fetchReports, markAsRead } = useLegalReports();
  const [filter, setFilter] = useState<UrgencyFilter>('all');

  // Fetch reports on mount
  useEffect(() => {
    fetchReports(30); // Last 30 reports
    markAsRead(); // Mark as read when visiting the page
  }, [fetchReports, markAsRead]);

  // Filter reports by urgency
  const filteredReports = useMemo(() => {
    if (filter === 'all') return reports;
    return reports.filter((report) =>
      report.changes.some((change) => change.urgency === filter)
    );
  }, [reports, filter]);

  const filterOptions: { value: UrgencyFilter; labelKey: string }[] = [
    { value: 'all', labelKey: 'all' },
    { value: 'critical', labelKey: 'urgency.critical' },
    { value: 'high', labelKey: 'urgency.high' },
    { value: 'medium', labelKey: 'urgency.medium' },
    { value: 'low', labelKey: 'urgency.low' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 safe-area-top">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <Scale className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">{t('legalUpdates.title')}</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1 ml-11">
          {t('legalUpdates.subtitle')}
        </p>
      </div>

      {/* Filters */}
      <div className="px-4 py-3 bg-white border-b">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.value === 'all'
                ? t('common.all')
                : t(`legalUpdates.${option.labelKey}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Loading state */}
        {isLoading && reports.length === 0 && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-500">{t('common.loading')}</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700 font-medium">{t('common.error')}</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredReports.length === 0 && (
          <Card>
            <CardContent className="pt-6 pb-6">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400" />
                <p className="text-gray-600 font-medium">{t('legalUpdates.noChanges')}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {t('legalUpdates.noChangesDescription')}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reports list */}
        {filteredReports.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}

        {/* Legal disclaimer */}
        <Card variant="outlined">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">
              {t('legalUpdates.disclaimer')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
