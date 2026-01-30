'use client';

import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface TimelineEvent {
  id: string;
  title: string;
  date: Date;
  type: 'deadline' | 'reminder' | 'completed';
  description?: string;
}

interface CalendarTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

type EventStatus = 'completed' | 'overdue' | 'urgent' | 'upcoming' | 'future';

function getEventStatus(event: TimelineEvent): EventStatus {
  const now = new Date();
  const daysUntil = Math.ceil((event.date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (event.type === 'completed') return 'completed';
  if (daysUntil < 0) return 'overdue';
  if (daysUntil <= 7) return 'urgent';
  if (daysUntil <= 30) return 'upcoming';
  return 'future';
}

function getStatusStyles(status: EventStatus) {
  switch (status) {
    case 'completed':
      return { bg: 'bg-green-50', border: 'border-green-500', text: 'text-green-600' };
    case 'overdue':
      return { bg: 'bg-red-50', border: 'border-red-500', text: 'text-red-600' };
    case 'urgent':
      return { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-600' };
    case 'upcoming':
      return { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-600' };
    default:
      return { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-600' };
  }
}

// Icons as inline SVG components for semantic colors
function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

function ExclamationTriangleIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
      />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );
}

function getStatusIcon(status: EventStatus) {
  switch (status) {
    case 'completed':
      return CheckCircleIcon;
    case 'overdue':
    case 'urgent':
      return ExclamationTriangleIcon;
    default:
      return ClockIcon;
  }
}

export function CalendarTimeline({ events, className = '' }: CalendarTimelineProps) {
  const t = useTranslations('timeline');

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysLabel = (date: Date) => {
    const now = new Date();
    const daysUntil = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) return t('daysAgo', { days: Math.abs(daysUntil) });
    if (daysUntil === 0) return t('today');
    if (daysUntil === 1) return t('tomorrow');
    return t('daysLeft', { days: daysUntil });
  };

  if (events.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        {t('noEvents')}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)} role="list" aria-label={t('title')}>
      {sortedEvents.map((event, index) => {
        const status = getEventStatus(event);
        const styles = getStatusStyles(status);
        const Icon = getStatusIcon(status);

        return (
          <div
            key={event.id}
            className={cn(
              'relative flex items-start gap-4 p-4 rounded-lg border-l-4',
              styles.bg,
              styles.border
            )}
            role="listitem"
          >
            {/* Timeline connector */}
            {index < sortedEvents.length - 1 && (
              <div
                className="absolute left-6 top-14 w-0.5 h-8 bg-gray-200"
                aria-hidden="true"
              />
            )}

            {/* Icon */}
            <div className={cn('flex-shrink-0 p-2 rounded-full', styles.bg)}>
              <Icon className={cn('w-5 h-5', styles.text)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-medium text-gray-900 truncate">
                  {event.title}
                </h4>
                <span className={cn('text-xs font-medium whitespace-nowrap', styles.text)}>
                  {getDaysLabel(event.date)}
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                {formatDate(event.date)}
              </p>

              {event.description && (
                <p className="text-sm text-gray-600 mt-2">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CalendarTimeline;
