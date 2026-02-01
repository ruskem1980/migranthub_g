'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ChevronDown, Search, MapPin } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { useProfileStore } from '@/lib/stores';
import { citizenshipOptions, purposeOptions } from '@/data/registration-options';
import { usePatentRegions } from '@/features/services/hooks/usePatentRegions';
import { isHighPenaltyRegion } from '@/features/services/calculator/penalty-calculator';
import type { QuickProfile, VisitPurpose } from '@/types/access';
import type { PatentRegionData } from '@/lib/db';

/**
 * Region selector component with search
 */
function RegionSelector({
  value,
  onChange,
  regions,
  isLoading,
  searchRegions,
  hasError,
}: {
  value: string;
  onChange: (regionCode: string) => void;
  regions: PatentRegionData[];
  isLoading: boolean;
  searchRegions: (query: string) => PatentRegionData[];
  hasError: boolean;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedRegion = useMemo(() => {
    if (!value) return null;
    return regions.find(r => r.code === value) || null;
  }, [value, regions]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return regions;
    return searchRegions(searchQuery);
  }, [searchQuery, regions, searchRegions]);

  const getMatchingCity = (region: PatentRegionData, query: string): string | null => {
    if (!query.trim()) return null;
    const searchLower = query.toLowerCase().trim();
    const matchingCity = region.cities.find(city =>
      city.toLowerCase().includes(searchLower)
    );
    return matchingCity || null;
  };

  const handleSelect = (region: PatentRegionData) => {
    onChange(region.code);
    setShowDropdown(false);
    setSearchQuery('');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className={[
          'w-full flex items-center justify-between px-4 py-3 bg-background border-2 rounded-xl transition-colors',
          hasError
            ? 'border-destructive'
            : value
              ? 'border-primary bg-primary/5'
              : 'border-input hover:border-primary/50',
        ].join(' ')}
      >
        <span className={selectedRegion ? 'text-foreground font-medium' : 'text-muted-foreground'}>
          {isLoading ? 'Загрузка...' : selectedRegion ? selectedRegion.name : 'Выберите регион'}
        </span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute z-50 w-full mt-2 bg-background border-2 border-input rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Выберите город"
                className="w-full pl-10 pr-4 py-2 bg-muted border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                Ничего не найдено
              </div>
            ) : (
              searchResults.map((region) => {
                const matchingCity = getMatchingCity(region, searchQuery);
                const isHighPenalty = isHighPenaltyRegion(region.code);
                return (
                  <button
                    key={region.code}
                    type="button"
                    onClick={() => handleSelect(region)}
                    className={`w-full flex flex-col items-start px-4 py-3 hover:bg-primary/10 transition-colors border-b border-border/50 last:border-b-0 ${
                      value === region.code ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className="w-full flex items-center justify-between">
                      <span className="text-foreground font-medium">{region.name}</span>
                      {isHighPenalty && (
                        <span className="text-xs px-2 py-0.5 bg-destructive/10 text-destructive rounded">
                          Повышенные штрафы
                        </span>
                      )}
                    </div>
                    {matchingCity && matchingCity.toLowerCase() !== region.name.toLowerCase() && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>г. {matchingCity}</span>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          <div className="px-4 py-2 bg-muted border-t border-border text-xs text-muted-foreground text-center">
            {searchQuery
              ? `Найдено: ${searchResults.length}`
              : `Всего регионов: ${regions.length}`}
          </div>
        </div>
      )}
    </div>
  );
}

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
  fullName: string;
  birthDate: string;
  citizenship: string;
  entryDate: string;
  region: string;
  purpose: string;
}

/**
 * Form errors interface
 */
interface FormErrors {
  fullName?: string;
  birthDate?: string;
  citizenship?: string;
  entryDate?: string;
  region?: string;
  purpose?: string;
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
  const router = useRouter();
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load regions from API
  const {
    regions,
    isLoading: regionsLoading,
    searchRegions,
  } = usePatentRegions();

  // Form state
  const [form, setForm] = useState<FormState>({
    fullName: '',
    birthDate: '',
    citizenship: prefillData?.citizenship || '',
    entryDate: prefillData?.entryDate || '',
    region: prefillData?.region || '',
    purpose: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Reset form when sheet opens with new prefill data
  useEffect(() => {
    if (isOpen) {
      setForm({
        fullName: '',
        birthDate: '',
        citizenship: prefillData?.citizenship || '',
        entryDate: prefillData?.entryDate || '',
        region: prefillData?.region || '',
        purpose: '',
      });
      setErrors({});
      setTouched({});
    }
  }, [isOpen, prefillData]);

  // Validate form
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName = 'Введите ФИО';
    } else if (form.fullName.trim().split(/\s+/).length < 2) {
      newErrors.fullName = 'Введите фамилию и имя';
    }

    if (!form.birthDate) {
      newErrors.birthDate = 'Укажите дату рождения';
    } else {
      const birthDate = new Date(form.birthDate);
      const today = new Date();
      const minAge = new Date();
      minAge.setFullYear(minAge.getFullYear() - 14);
      const maxAge = new Date();
      maxAge.setFullYear(maxAge.getFullYear() - 100);

      if (birthDate > today) {
        newErrors.birthDate = 'Дата рождения не может быть в будущем';
      } else if (birthDate > minAge) {
        newErrors.birthDate = 'Минимальный возраст - 14 лет';
      } else if (birthDate < maxAge) {
        newErrors.birthDate = 'Проверьте дату рождения';
      }
    }

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

    if (!form.purpose) {
      newErrors.purpose = 'Выберите цель визита';
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
  const handleSubmit = useCallback(() => {
    // Mark all fields as touched
    setTouched({
      fullName: true,
      birthDate: true,
      citizenship: true,
      entryDate: true,
      region: true,
      purpose: true,
    });

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const quickProfile: QuickProfile = {
      fullName: form.fullName.trim().toUpperCase(),
      birthDate: form.birthDate,
      citizenship: form.citizenship,
      entryDate: form.entryDate,
      region: form.region,
      purpose: form.purpose as VisitPurpose,
    };

    // Save profile data locally (without server auth)
    // Mark onboarding as completed so OTP page skips /onboarding
    updateProfile({
      fullName: quickProfile.fullName,
      birthDate: quickProfile.birthDate,
      citizenship: quickProfile.citizenship,
      entryDate: quickProfile.entryDate,
      patentRegion: quickProfile.region,
      purpose: quickProfile.purpose,
      onboardingCompleted: true,
    });

    // Call completion callback
    onComplete(quickProfile);
    onClose();

    // Redirect to auth method selection (phone/telegram binding)
    router.push('/auth/method');
  }, [form, validate, updateProfile, onComplete, onClose, router]);

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

  const isValid = form.fullName.trim() && form.birthDate && form.citizenship && form.entryDate && form.region && form.purpose;

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


        {/* Full name input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            ФИО (как в паспорте)
          </label>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => handleChange('fullName', e.target.value.toUpperCase())}
            placeholder="ИВАНОВ ИВАН ИВАНОВИЧ"
            className={[
              'w-full px-4 py-3 bg-background border-2 rounded-xl',
              'text-foreground',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              touched.fullName && errors.fullName
                ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                : 'border-input focus:border-primary focus:ring-primary/30',
            ].join(' ')}
          />
          {touched.fullName && errors.fullName && (
            <p className="text-sm text-destructive">{errors.fullName}</p>
          )}
        </div>

        {/* Birth date input */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            Дата рождения
          </label>
          <input
            type="date"
            value={form.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className={[
              'w-full px-4 py-3 bg-background border-2 rounded-xl',
              'text-foreground',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              touched.birthDate && errors.birthDate
                ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                : 'border-input focus:border-primary focus:ring-primary/30',
            ].join(' ')}
          />
          {touched.birthDate && errors.birthDate && (
            <p className="text-sm text-destructive">{errors.birthDate}</p>
          )}
        </div>

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
          <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <MapPin className="w-4 h-4" />
            Регион пребывания <span className="text-destructive">*</span>
          </label>
          {!form.region && (
            <p className="text-sm text-orange-600">Выберите ваш регион пребывания</p>
          )}
          <RegionSelector
            value={form.region}
            onChange={(regionCode) => handleChange('region', regionCode)}
            regions={regions}
            isLoading={regionsLoading}
            searchRegions={searchRegions}
            hasError={!!(touched.region && errors.region)}
          />
          {touched.region && errors.region && (
            <p className="text-sm text-destructive">{errors.region}</p>
          )}
        </div>

        {/* Purpose select */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-foreground">
            Цель визита
          </label>
          <div className="flex flex-wrap gap-2">
            {purposeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange('purpose', option.value)}
                className={[
                  'px-4 py-2 rounded-xl text-sm font-medium',
                  'transition-all duration-200',
                  'border-2',
                  form.purpose === option.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-input hover:border-primary/50',
                ].join(' ')}
              >
                {option.label}
              </button>
            ))}
          </div>
          {touched.purpose && errors.purpose && (
            <p className="text-sm text-destructive">{errors.purpose}</p>
          )}
        </div>

        {/* Submit button */}
        <Button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          loading={isSubmitting}
          fullWidth
          size="lg"
          className="mt-2"
        >
          {isSubmitting ? 'Сохранение...' : 'Создать профиль'}
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
