'use client';

import { CheckCircle, AlertTriangle, XCircle, type LucideIcon } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export type LegalStatus = 'legal' | 'warning' | 'illegal';

export interface LegalStatusCardProps {
  status: LegalStatus;
  daysRemaining?: number;
  nextDeadline?: string;
}

interface StatusConfig {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: LucideIcon;
  titleKey: string;
}

const statusConfig: Record<LegalStatus, StatusConfig> = {
  legal: {
    color: 'bg-green-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    borderColor: 'border-green-200 dark:border-green-900',
    icon: CheckCircle,
    titleKey: 'dashboard.statusValues.legal',
  },
  warning: {
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    borderColor: 'border-yellow-200 dark:border-yellow-900',
    icon: AlertTriangle,
    titleKey: 'dashboard.statusValues.risk',
  },
  illegal: {
    color: 'bg-red-500',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
    borderColor: 'border-red-200 dark:border-red-900',
    icon: XCircle,
    titleKey: 'dashboard.statusValues.illegal',
  },
};

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function LegalStatusCard({ status, daysRemaining, nextDeadline }: LegalStatusCardProps) {
  const { t, language } = useTranslation();
  const config = statusConfig[status];
  const Icon = config.icon;

  const statusTitle = language === 'ru'
    ? `${t('common.status')}: ${t(config.titleKey)}`
    : `Status: ${t(config.titleKey)}`;

  const daysText = daysRemaining !== undefined
    ? daysRemaining > 0
      ? language === 'ru'
        ? `${t('dashboard.daysRemaining')}: ${daysRemaining}`
        : `${daysRemaining} days remaining`
      : language === 'ru'
        ? `${t('common.expired')} ${Math.abs(daysRemaining)} ${t('common.daysAgo')}`
        : `Expired ${Math.abs(daysRemaining)} days ago`
    : null;

  // Calculate progress (90 days = 100%)
  const maxDays = 90;
  const progressPercent = daysRemaining !== undefined && daysRemaining > 0
    ? Math.min(100, (daysRemaining / maxDays) * 100)
    : 0;

  return (
    <div
      className={cn(
        'p-4 rounded-lg border',
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-full', config.color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{statusTitle}</h3>
          {daysText && (
            <p className="text-sm text-muted-foreground">
              {daysText}
            </p>
          )}
          {nextDeadline && (
            <p className="text-sm text-muted-foreground">
              {language === 'ru' ? 'Следующий дедлайн' : 'Next deadline'}: {nextDeadline}
            </p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {daysRemaining !== undefined && daysRemaining > 0 && (
        <div className="mt-3">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all duration-300', config.color)}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">0</span>
            <span className="text-xs text-muted-foreground">{maxDays} {t('common.days')}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default LegalStatusCard;
