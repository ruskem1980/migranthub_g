'use client';

import { Calendar, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useTranslation } from '@/lib/i18n';

export type DeadlineType = 'patent' | 'registration' | 'visa' | 'medical' | 'exam' | 'other';

export interface Deadline {
  id: string;
  title: string;
  date: Date;
  type: DeadlineType;
  urgent: boolean;
}

export interface DeadlinesSectionProps {
  deadlines: Deadline[];
}

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

function formatDate(date: Date, language: string): string {
  return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function DeadlineCard({ deadline, language }: { deadline: Deadline; language: string }) {
  const daysUntil = Math.ceil((deadline.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const getDaysColor = (days: number): string => {
    if (days <= 7) return 'text-red-500';
    if (days <= 30) return 'text-yellow-500';
    return 'text-green-500';
  };

  const daysLabel = language === 'ru' ? 'дн.' : 'days';

  return (
    <div
      className={cn(
        'p-3 rounded-lg border flex items-center justify-between',
        deadline.urgent && 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/20'
      )}
    >
      <div className="flex items-center gap-3">
        <Clock
          className={cn(
            'w-4 h-4',
            deadline.urgent ? 'text-red-500' : 'text-muted-foreground'
          )}
        />
        <div>
          <p className="font-medium text-sm text-foreground">{deadline.title}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(deadline.date, language)}
          </p>
        </div>
      </div>
      <span className={cn('text-sm font-medium', getDaysColor(daysUntil))}>
        {daysUntil} {daysLabel}
      </span>
    </div>
  );
}

export function DeadlinesSection({ deadlines }: DeadlinesSectionProps) {
  const router = useRouter();
  const { language } = useTranslation();

  // Sort by date and show 3 closest deadlines
  const upcomingDeadlines = [...deadlines]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);

  const title = language === 'ru' ? 'Ближайшие дедлайны' : 'Upcoming Deadlines';
  const viewAllLabel = language === 'ru' ? 'Все' : 'View all';
  const noDeadlinesText = language === 'ru'
    ? 'Нет предстоящих дедлайнов'
    : 'No upcoming deadlines';

  return (
    <section>
      <SectionHeader
        title={title}
        icon={Calendar}
        action={{
          label: viewAllLabel,
          onClick: () => router.push('/deadlines'),
        }}
      />

      <div className="space-y-2 mt-3">
        {upcomingDeadlines.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {noDeadlinesText}
          </p>
        ) : (
          upcomingDeadlines.map((deadline) => (
            <DeadlineCard key={deadline.id} deadline={deadline} language={language} />
          ))
        )}
      </div>
    </section>
  );
}

export default DeadlinesSection;
