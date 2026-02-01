'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight, Save, X } from 'lucide-react';
import { passportSchema, type PassportData } from '../schemas/passport.schema';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslation } from '@/lib/i18n';
import { SampleDataButton } from './SampleDataButton';

// Таблица транслитерации кириллица → латиница (ГОСТ 7.79-2000)
const TRANSLIT_MAP: Record<string, string> = {
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  ' ': ' ', '-': '-',
};

function transliterate(text: string): string {
  return text
    .toLowerCase()
    .split('')
    .map((char) => TRANSLIT_MAP[char] ?? char)
    .join('')
    .toUpperCase();
}

// Список гражданств
const CITIZENSHIPS = [
  { code: 'UZB', name: 'Узбекистан' },
  { code: 'TJK', name: 'Таджикистан' },
  { code: 'KGZ', name: 'Кыргызстан' },
  { code: 'AZE', name: 'Азербайджан' },
  { code: 'ARM', name: 'Армения' },
  { code: 'MDA', name: 'Молдова' },
  { code: 'UKR', name: 'Украина' },
  { code: 'KAZ', name: 'Казахстан' },
  { code: 'BLR', name: 'Беларусь' },
  { code: 'GEO', name: 'Грузия' },
];

// Конфигурация шагов wizard
const STEPS = [
  {
    id: 'personal',
    titleKey: 'passport.steps.personal',
    fields: ['lastName', 'firstName', 'middleName', 'birthDate', 'gender'] as const
  },
  {
    id: 'passport',
    titleKey: 'passport.steps.passport',
    fields: ['passportNumber', 'passportSeries', 'citizenship'] as const
  },
  {
    id: 'dates',
    titleKey: 'passport.steps.dates',
    fields: ['issueDate', 'expiryDate', 'issuedBy'] as const
  },
  {
    id: 'additional',
    titleKey: 'passport.steps.additional',
    fields: ['birthPlace', 'lastNameLatin', 'firstNameLatin'] as const
  },
] as const;

interface PassportWizardProps {
  initialData?: Partial<PassportData>;
  onSubmit: (data: PassportData) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PassportWizard({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}: PassportWizardProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm<PassportData>({
    resolver: zodResolver(passportSchema),
    defaultValues: {
      lastName: '',
      firstName: '',
      middleName: '',
      lastNameLatin: '',
      firstNameLatin: '',
      birthDate: '',
      gender: undefined,
      citizenship: '',
      passportNumber: '',
      passportSeries: '',
      issueDate: '',
      expiryDate: '',
      issuedBy: '',
      birthPlace: '',
      ...initialData,
    },
  });

  const currentStepConfig = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  // Автотранслитерация
  const lastName = watch('lastName');
  const firstName = watch('firstName');

  useEffect(() => {
    if (lastName) {
      const transliterated = transliterate(lastName);
      setValue('lastNameLatin', transliterated, { shouldValidate: false });
    }
  }, [lastName, setValue]);

  useEffect(() => {
    if (firstName) {
      const transliterated = transliterate(firstName);
      setValue('firstNameLatin', transliterated, { shouldValidate: false });
    }
  }, [firstName, setValue]);

  const handleNext = async () => {
    const isValid = await trigger(currentStepConfig.fields as unknown as (keyof PassportData)[]);
    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleFillSample = (data: Record<string, unknown>) => {
    reset(data as PassportData, { keepDefaultValues: false });
  };

  const getStepTitle = (stepId: string): string => {
    const titles: Record<string, string> = {
      personal: 'Личные данные',
      passport: 'Данные паспорта',
      dates: 'Даты документа',
      additional: 'Дополнительно',
    };
    return titles[stepId] || stepId;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Progress indicator */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            Шаг {currentStep + 1} из {STEPS.length}
          </span>
          <span className="text-sm font-medium text-foreground">
            {getStepTitle(currentStepConfig.id)}
          </span>
        </div>
        <div className="flex gap-1">
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                index <= currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Form content */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 overflow-y-auto p-4 pb-24"
      >
        {/* Sample data button on first step */}
        {isFirstStep && (
          <div className="flex justify-end mb-4">
            <SampleDataButton
              documentType="passport"
              onFillSample={handleFillSample}
            />
          </div>
        )}

        {/* Step 1: Personal Data */}
        {currentStep === 0 && (
          <div className="space-y-4">
            <Input
              label="Фамилия *"
              placeholder="ИВАНОВ"
              {...register('lastName')}
              error={errors.lastName?.message}
            />
            <Input
              label="Имя *"
              placeholder="ИВАН"
              {...register('firstName')}
              error={errors.firstName?.message}
            />
            <Input
              label="Отчество"
              placeholder="ИВАНОВИЧ"
              {...register('middleName')}
              error={errors.middleName?.message}
            />
            <Input
              type="date"
              label="Дата рождения *"
              {...register('birthDate')}
              error={errors.birthDate?.message}
            />
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Пол *
              </label>
              <select
                {...register('gender')}
                className={`w-full px-4 py-3 bg-background border-2 rounded-xl text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  errors.gender
                    ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                    : 'border-input focus:border-primary focus:ring-primary/30'
                }`}
              >
                <option value="">Выберите</option>
                <option value="male">Мужской</option>
                <option value="female">Женский</option>
              </select>
              {errors.gender && (
                <p className="mt-1.5 text-sm text-destructive" role="alert">
                  {errors.gender.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Passport Data */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Серия"
                placeholder="AA"
                {...register('passportSeries')}
                error={errors.passportSeries?.message}
              />
              <Input
                label="Номер *"
                placeholder="1234567"
                {...register('passportNumber')}
                error={errors.passportNumber?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Гражданство *
              </label>
              <select
                {...register('citizenship')}
                className={`w-full px-4 py-3 bg-background border-2 rounded-xl text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
                  errors.citizenship
                    ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                    : 'border-input focus:border-primary focus:ring-primary/30'
                }`}
              >
                <option value="">Выберите страну</option>
                {CITIZENSHIPS.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.citizenship && (
                <p className="mt-1.5 text-sm text-destructive" role="alert">
                  {errors.citizenship.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Dates */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="date"
                label="Дата выдачи *"
                {...register('issueDate')}
                error={errors.issueDate?.message}
              />
              <Input
                type="date"
                label="Действителен до *"
                {...register('expiryDate')}
                error={errors.expiryDate?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Кем выдан *
              </label>
              <textarea
                {...register('issuedBy')}
                rows={3}
                placeholder="МВД Республики Узбекистан"
                className={`w-full px-4 py-3 bg-background border-2 rounded-xl text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 resize-none ${
                  errors.issuedBy
                    ? 'border-destructive focus:border-destructive focus:ring-destructive/30'
                    : 'border-input focus:border-primary focus:ring-primary/30'
                }`}
              />
              {errors.issuedBy && (
                <p className="mt-1.5 text-sm text-destructive" role="alert">
                  {errors.issuedBy.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Additional */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <Input
              label="Место рождения *"
              placeholder="г. Ташкент, Узбекистан"
              {...register('birthPlace')}
              error={errors.birthPlace?.message}
            />
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-3">
                ФИО латиницей (заполняется автоматически)
              </p>
              <div className="space-y-3">
                <Input
                  label="Фамилия латиницей *"
                  placeholder="IVANOV"
                  {...register('lastNameLatin')}
                  error={errors.lastNameLatin?.message}
                  className="bg-muted/30"
                />
                <Input
                  label="Имя латиницей *"
                  placeholder="IVAN"
                  {...register('firstNameLatin')}
                  error={errors.firstNameLatin?.message}
                  className="bg-muted/30"
                />
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Navigation buttons - above BottomNavigation and SyncStatusBar */}
      <div className="fixed bottom-16 left-0 right-0 p-4 border-t border-border bg-background z-[45]">
        <div className="flex gap-3 max-w-lg mx-auto">
          {!isFirstStep ? (
            <Button
              type="button"
              variant="secondary"
              onClick={handleBack}
              size="lg"
              fullWidth
              leftIcon={<ChevronLeft className="w-5 h-5" />}
            >
              Назад
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              size="lg"
              fullWidth
              leftIcon={<X className="w-5 h-5" />}
            >
              Отмена
            </Button>
          )}

          {isLastStep ? (
            <Button
              type="submit"
              form="passport-wizard-form"
              onClick={handleSubmit(onSubmit)}
              size="lg"
              fullWidth
              loading={isLoading}
              leftIcon={<Save className="w-5 h-5" />}
            >
              Сохранить
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleNext}
              size="lg"
              fullWidth
              rightIcon={<ChevronRight className="w-5 h-5" />}
            >
              Далее
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
