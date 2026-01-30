'use client';

import { useState, useCallback, useEffect } from 'react';
import { Lock, ChevronDown, AlertCircle, Loader2 } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { useAuthStore, useProfileStore } from '@/lib/stores';
import { citizenshipOptions, russianRegions } from '@/data/registration-options';
import type { QuickProfile } from '@/types/access';

/**
 * Registration trigger types - describes what action triggered the registration sheet
 */
export type RegistrationTrigger =
  | 'save_result'
  | 'add_document'
  | 'enable_reminders'
  | 'exam_progress'
  | 'general';

/**
 * Props for QuickRegistrationSheet component
 */
export interface QuickRegistrationSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: QuickProfile) => void;
  prefillData?: {
    entryDate?: string;
    region?: string;
    citizenship?: string;
  };
  trigger?: RegistrationTrigger;
}

/**
 * Get trigger-specific title for the registration sheet
 */
function getTriggerTitle(trigger: RegistrationTrigger): string {
  switch (trigger) {
    case 'save_result':
      return 'Сохраните результат';
    case 'add_document':
      return 'Добавление документа';
    case 'enable_reminders':
      return 'Включение напоминаний';
    case 'exam_progress':
      return 'Сохранение прогресса';
    default:
      return 'Создайте профиль';
  }
}

/**
 * Get trigger-specific description for the registration sheet
 */
function getTriggerDescription(trigger: RegistrationTrigger): string {
  switch (trigger) {
    case 'save_result':
      return 'Чтобы сохранить результаты расчётов и использовать их позже, создайте быстрый профиль.';
    case 'add_document':
      return 'Чтобы добавить документы и отслеживать их сроки, создайте быстрый профиль.';
    case 'enable_reminders':
      return 'Чтобы получать напоминания о сроках документов, создайте быстрый профиль.';
    case 'exam_progress':
      return 'Чтобы сохранить прогресс подготовки к экзамену, создайте быстрый профиль.';
    default:
      return 'Создайте быстрый профиль для доступа ко всем функциям приложения.';
  }
}

/**
 * Form state interface
 */
interface FormState {
  citizenship: string;
  entryDate: string;
  region: string;
}

/**
 * Form errors interface
 */
interface FormErrors {
  citizenship?: string;
  entryDate?: string;
  region?: string;
}

/**
 * QuickRegistrationSheet - Bottom sheet for fast 3-field registration
 * Appears when anonymous user tries to access registered-only features
 */
export function QuickRegistrationSheet({
  isOpen,
  onClose,
  onComplete,
  prefillData,
  trigger = 'general',
}: QuickRegistrationSheetProps) {
  const { convertToRegistered, isLoading, error: authError } = useAuthStore();
  const { updateProfile } = useProfileStore();

  // Form state
  const [form, setForm] = useState<FormState>({
    citizenship: prefillData?.citizenship || '',
    entryDate: prefillData?.entryDate || '',
    region: prefillData?.region || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Reset form when sheet opens with new prefill data
  useEffect(() => {
    if (isOpen) {
      setForm({
        citizenship: prefillData?.citizenship || '',
        entryDate: prefillData?.entryDate || '',
        region: prefillData?.region || '',
      });
      setErrors({});
      setTouched({});
    }
  }, [isOpen, prefillData]);

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!form.citizenship) {
      newErrors.citizenship = 'Выберите гражданство';
    }

    if (!form.entryDate) {
      newErrors.entryDate = 'Укажите дату въезда';
    } else {
      const entryDate = new Date(form.entryDate);
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      if (entryDate > today) {
        newErrors.entryDate = 'Дата въезда не может быть в будущем';
      }

      // Check if entry date is not too old (e.g., 3 years)
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
      if (entryDate < threeYearsAgo) {
        newErrors.entryDate = 'Проверьте дату въезда';
      }
    }

    if (!form.region) {
      newErrors.region = 'Выберите регион';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  // Handle field change
  const handleChange = useCallback((field: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    // Mark all fields as touched
    setTouched({ citizenship: true, entryDate: true, region: true });

    if (!validate()) {
      return;
    }

    const quickProfile: QuickProfile = {
      citizenship: form.citizenship,
      entryDate: form.entryDate,
      region: form.region,
    };

    try {
      // Convert to registered user (device auth)
      await convertToRegistered(quickProfile);

      // Save profile data locally
      updateProfile({
        citizenship: quickProfile.citizenship,
        entryDate: quickProfile.entryDate,
        patentRegion: quickProfile.region,
      });

      // Call completion callback
      onComplete(quickProfile);
      onClose();
    } catch {
      // Error is handled by authStore
    }
  }, [form, validate, convertToRegistered, updateProfile, onComplete, onClose]);

  // Quick action for today's date
  const setToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    handleChange('entryDate', today);
  }, [handleChange]);

  // Quick action for yesterday's date
  const setYesterday = useCallback(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    handleChange('entryDate', yesterday.toISOString().split('T')[0]);
  }, [handleChange]);

  const isValid = form.citizenship && form.entryDate && form.region;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={getTriggerTitle(trigger)}
      snapPoint="full"
    >
      <div className="flex flex-col gap-5">
        {/* Description */}
        <p className="text-sm text-muted-foreground">
          {getTriggerDescription(trigger)}
        </p>

        {/* Security badge */}
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-800">
          <Lock className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
          <span className="text-xs text-green-700 dark:text-green-300">
            Данные хранятся только на вашем устройстве
          </span>
        </div>

        {/* Auth error message */}
        {authError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            <span className="text-xs text-red-700 dark:text-red-300">
              {authError}
            </span>
          </div>
        )}

        {/* Citizenship select */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            Гражданство
          </label>
          <div className="relative">
            <select
              value={form.citizenship}
              onChange={(e) => handleChange('citizenship', e.target.value)}
              className={[
                'w-full appearance-none px-4 py-3 bg-background border-2 rounded-xl',
                'text-foreground pr-10',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-0',
                touched.citizenship && errors.citizenship
                  ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                  : 'border-input focus:border-primary focus:ring-primary/30',
              ].join(' ')}
            >
              <option value="">Выберите страну</option>
              {citizenshipOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.flag} {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
          {touched.citizenship && errors.citizenship && (
            <p className="text-sm text-destructive">{errors.citizenship}</p>
          )}
        </div>

        {/* Entry date input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            Дата въезда в Россию
          </label>
          <input
            type="date"
            value={form.entryDate}
            onChange={(e) => handleChange('entryDate', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className={[
              'w-full px-4 py-3 bg-background border-2 rounded-xl',
              'text-foreground',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              touched.entryDate && errors.entryDate
                ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                : 'border-input focus:border-primary focus:ring-primary/30',
            ].join(' ')}
          />
          {/* Quick date chips */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={setToday}
              className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition-colors active:scale-95 border border-primary/20"
            >
              Сегодня
            </button>
            <button
              type="button"
              onClick={setYesterday}
              className="px-3 py-1.5 bg-muted text-muted-foreground text-sm font-medium rounded-lg hover:bg-muted/80 transition-colors active:scale-95 border border-border"
            >
              Вчера
            </button>
          </div>
          {touched.entryDate && errors.entryDate && (
            <p className="text-sm text-destructive">{errors.entryDate}</p>
          )}
        </div>

        {/* Region select */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            Регион пребывания
          </label>
          <div className="relative">
            <select
              value={form.region}
              onChange={(e) => handleChange('region', e.target.value)}
              className={[
                'w-full appearance-none px-4 py-3 bg-background border-2 rounded-xl',
                'text-foreground pr-10',
                'transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-0',
                touched.region && errors.region
                  ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                  : 'border-input focus:border-primary focus:ring-primary/30',
              ].join(' ')}
            >
              <option value="">Выберите регион</option>
              {russianRegions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          </div>
          {touched.region && errors.region && (
            <p className="text-sm text-destructive">{errors.region}</p>
          )}
        </div>

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isLoading}
          loading={isLoading}
          fullWidth
          size="lg"
          className="mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Создание профиля...
            </>
          ) : (
            'Создать профиль'
          )}
        </Button>

        {/* Privacy note */}
        <p className="text-xs text-center text-muted-foreground">
          Продолжая, вы соглашаетесь с{' '}
          <span className="text-primary underline cursor-pointer">
            политикой конфиденциальности
          </span>
        </p>
      </div>
    </Sheet>
  );
}

export default QuickRegistrationSheet;
