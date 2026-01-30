'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface DatePickerSimpleProps {
  value?: string; // ISO format: YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  error?: string;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
}

export function DatePickerSimple({
  value,
  onChange,
  label,
  error,
  minYear = 1950,
  maxYear = new Date().getFullYear() + 10,
  disabled = false,
}: DatePickerSimpleProps) {
  const t = useTranslations('date');

  const [day, setDay] = useState<number | ''>('');
  const [month, setMonth] = useState<number | ''>('');
  const [year, setYear] = useState<number | ''>('');

  // Parse initial value
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setDay(date.getDate());
        setMonth(date.getMonth() + 1);
        setYear(date.getFullYear());
      }
    }
  }, [value]);

  // Memoize onChange to prevent infinite loops
  const handleChange = useCallback((newDay: number | '', newMonth: number | '', newYear: number | '') => {
    if (newDay && newMonth && newYear) {
      const dateStr = `${newYear}-${String(newMonth).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`;
      onChange(dateStr);
    }
  }, [onChange]);

  // Get number of days in selected month/year
  const getDaysInMonth = (m: number | '', y: number | ''): number => {
    if (!m || !y) return 31;
    return new Date(y, m, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(month, year);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  const handleDayChange = (newDay: number | '') => {
    setDay(newDay);
    handleChange(newDay, month, year);
  };

  const handleMonthChange = (newMonth: number | '') => {
    setMonth(newMonth);
    // Adjust day if it exceeds days in new month
    const maxDays = getDaysInMonth(newMonth, year);
    const adjustedDay = day && day > maxDays ? maxDays : day;
    if (adjustedDay !== day) {
      setDay(adjustedDay);
    }
    handleChange(adjustedDay, newMonth, year);
  };

  const handleYearChange = (newYear: number | '') => {
    setYear(newYear);
    // Adjust day for leap year changes (February)
    if (month === 2 && day) {
      const maxDays = getDaysInMonth(2, newYear);
      const adjustedDay = day > maxDays ? maxDays : day;
      if (adjustedDay !== day) {
        setDay(adjustedDay);
      }
      handleChange(adjustedDay, month, newYear);
    } else {
      handleChange(day, month, newYear);
    }
  };

  const selectClasses = cn(
    'w-full px-3 py-3 bg-background border-2 rounded-xl',
    'text-foreground appearance-none cursor-pointer',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-0',
    error
      ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
      : 'border-input focus:border-primary focus:ring-primary/30',
    disabled && 'opacity-50 cursor-not-allowed bg-muted'
  );

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-foreground">
          {label}
        </label>
      )}

      <div className="grid grid-cols-3 gap-2">
        {/* Day */}
        <div className="relative">
          <select
            value={day}
            onChange={(e) => handleDayChange(e.target.value ? Number(e.target.value) : '')}
            disabled={disabled}
            className={cn(selectClasses, 'text-center')}
            aria-label={t('day')}
          >
            <option value="">{t('day')}</option>
            {days.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Month */}
        <div className="relative">
          <select
            value={month}
            onChange={(e) => handleMonthChange(e.target.value ? Number(e.target.value) : '')}
            disabled={disabled}
            className={selectClasses}
            aria-label={t('month')}
          >
            <option value="">{t('month')}</option>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{t(`months.${m}`)}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Year */}
        <div className="relative">
          <select
            value={year}
            onChange={(e) => handleYearChange(e.target.value ? Number(e.target.value) : '')}
            disabled={disabled}
            className={cn(selectClasses, 'text-center')}
            aria-label={t('year')}
          >
            <option value="">{t('year')}</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
            <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Simple chevron icon to indicate dropdown
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default DatePickerSimple;
