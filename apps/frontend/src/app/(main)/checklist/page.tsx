'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { ClipboardList, CheckCircle2, Circle, Calendar, AlertCircle } from 'lucide-react';
import { useDeadlines } from '@/hooks/useDeadlines';
import { useProfileStore } from '@/lib/stores/profileStore';
import type { DeadlineType } from '@/components/personal/DeadlinesSection';

const STORAGE_KEY = 'migranthub_checklist';

// Map checklist item keys to deadline types
const DEADLINE_TYPE_MAP: Record<string, DeadlineType | null> = {
  migration_card: null, // No deadline - received at entry
  registration: 'registration', // 7 days
  patent: 'patent', // 30 days
  medical: 'medical', // Before patent
  fingerprints: null, // No deadline - at patent submission
};

// Map checklist item keys to deadline IDs
const DEADLINE_ID_MAP: Record<string, string> = {
  registration: 'registration_deadline',
  patent: 'patent_application',
};

const defaultItems = [
  { id: '1', key: 'migration_card', title: 'checklist.items.migration_card', completed: false },
  { id: '2', key: 'registration', title: 'checklist.items.registration', completed: false },
  { id: '3', key: 'patent', title: 'checklist.items.patent', completed: false },
  { id: '4', key: 'medical', title: 'checklist.items.medical', completed: false },
  { id: '5', key: 'fingerprints', title: 'checklist.items.fingerprints', completed: false },
];

function getDaysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getDeadlineColor(daysLeft: number, urgent: boolean): string {
  if (daysLeft < 0) return 'text-red-600';
  if (urgent || daysLeft < 3) return 'text-red-500';
  if (daysLeft <= 7) return 'text-yellow-600';
  return 'text-green-600';
}

function getDeadlineBgColor(daysLeft: number, urgent: boolean): string {
  if (daysLeft < 0) return 'bg-red-50';
  if (urgent || daysLeft < 3) return 'bg-red-50';
  if (daysLeft <= 7) return 'bg-yellow-50';
  return 'bg-green-50';
}

export default function ChecklistPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState(defaultItems);
  const deadlines = useDeadlines();
  const { profile, updateProfile } = useProfileStore();
  const [entryDateInput, setEntryDateInput] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge saved state with default items to include new key field
        setItems(defaultItems.map(def => {
          const saved = parsed.find((p: { id: string }) => p.id === def.id);
          return saved ? { ...def, completed: saved.completed } : def;
        }));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Initialize entry date input from profile
  useEffect(() => {
    if (profile?.entryDate) {
      setEntryDateInput(profile.entryDate);
    }
  }, [profile?.entryDate]);

  const toggleItem = (id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const handleEntryDateSave = () => {
    if (entryDateInput) {
      updateProfile({ entryDate: entryDateInput });
    }
  };

  // Get deadline info for a checklist item
  const getDeadlineForItem = (itemKey: string) => {
    const deadlineId = DEADLINE_ID_MAP[itemKey];
    if (!deadlineId) return null;
    return deadlines.find(d => d.id === deadlineId);
  };

  const hasEntryDate = !!profile?.entryDate;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 safe-area-top">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-semibold">{t('checklist.title')}</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {t('checklist.subtitle')}
        </p>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Entry Date Card - show if no entry date */}
        {!hasEntryDate && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 mb-2">
                    {t('checklist.enter_entry_date')}
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={entryDateInput}
                      onChange={(e) => setEntryDateInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-yellow-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <button
                      onClick={handleEntryDateSave}
                      disabled={!entryDateInput}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-700 transition-colors"
                    >
                      {t('common.save')}
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t('checklist.required_documents')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => {
              const deadline = getDeadlineForItem(item.key);
              const daysLeft = deadline ? getDaysUntil(deadline.date) : null;
              const hasDeadlineType = DEADLINE_TYPE_MAP[item.key] !== null;

              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer active:scale-[0.98]"
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                      {t(item.title)}
                    </span>

                    {/* Deadline indicator */}
                    {!item.completed && hasDeadlineType && (
                      <div className="mt-1">
                        {!hasEntryDate ? (
                          <span className="text-xs text-muted-foreground italic">
                            {t('checklist.specify_entry_date')}
                          </span>
                        ) : deadline && daysLeft !== null ? (
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${getDeadlineBgColor(daysLeft, deadline.urgent)} ${getDeadlineColor(daysLeft, deadline.urgent)}`}>
                            <Calendar className="w-3 h-3" />
                            {daysLeft < 0
                              ? t('checklist.deadline_passed')
                              : t('checklist.days_left', { count: daysLeft })
                            }
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Info card */}
        <Card variant="outlined">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground">
              {t('checklist.info')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
