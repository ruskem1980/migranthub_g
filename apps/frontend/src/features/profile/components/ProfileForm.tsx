'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Save, User, FileText, Briefcase, MapPin } from 'lucide-react';
import { useState } from 'react';
import { PassportScanner } from './PassportScanner';
import {
  COUNTRIES,
  PRIORITY_COUNTRIES,
  isEAEUCountry,
  RUSSIAN_CITIES,
} from '@/data';

const profileSchema = z.object({
  // Personal Info
  fullName: z.string().min(2, 'Введите ФИО'),
  fullNameLatin: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.enum(['male', 'female']).optional(),

  // Passport
  passportNumber: z.string().min(5, 'Введите номер паспорта'),
  passportIssueDate: z.string().optional(),
  passportExpiryDate: z.string().optional(),
  citizenship: z.string().min(1, 'Выберите гражданство'),

  // Migration
  entryDate: z.string().optional(),
  migrationCardNumber: z.string().optional(),
  migrationCardExpiry: z.string().optional(),
  purpose: z.enum(['work', 'study', 'tourist', 'private']).optional(),

  // Registration
  registrationAddress: z.string().optional(),
  registrationExpiry: z.string().optional(),
  hostFullName: z.string().optional(),
  hostAddress: z.string().optional(),

  // Work
  hasPatent: z.boolean().optional(),
  patentRegion: z.string().optional(),
  patentExpiry: z.string().optional(),
  employerName: z.string().optional(),
  employerINN: z.string().optional(),

  // Contact
  phone: z.string().optional(),
  email: z.string().email('Некорректный email').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  isLoading?: boolean;
}

// Get priority countries for citizenship dropdown
const CITIZENSHIPS = COUNTRIES
  .filter(c => PRIORITY_COUNTRIES.includes(c.iso))
  .map(c => ({
    code: c.iso,
    name: c.name.ru,
    flag: c.flag,
    isEAEU: isEAEUCountry(c.iso),
  }));

// Get major cities for patent regions
const PATENT_REGIONS = RUSSIAN_CITIES
  .filter(city => (city.population ?? 0) >= 500000)
  .map(city => city.name.ru);

export function ProfileForm({ initialData, onSubmit, isLoading }: ProfileFormProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('personal');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      citizenship: '',
      passportNumber: '',
      hasPatent: false,
      ...initialData,
    },
  });

  const hasPatent = watch('hasPatent');

  const handleScanComplete = (data: any, imageUri: string) => {
    // Auto-fill form with scanned data
    if (data.fullName) setValue('fullName', data.fullName);
    if (data.fullNameLatin) setValue('fullNameLatin', data.fullNameLatin);
    if (data.passportNumber) setValue('passportNumber', data.passportNumber);
    if (data.birthDate) setValue('birthDate', data.birthDate);
    if (data.gender) setValue('gender', data.gender);
    if (data.citizenship) setValue('citizenship', data.citizenship);
    if (data.passportIssueDate) setValue('passportIssueDate', data.passportIssueDate);
    if (data.passportExpiryDate) setValue('passportExpiryDate', data.passportExpiryDate);

    setShowScanner(false);
  };

  const sections = [
    { id: 'personal', label: 'Личные данные', icon: User },
    { id: 'documents', label: 'Документы', icon: FileText },
    { id: 'work', label: 'Работа', icon: Briefcase },
    { id: 'registration', label: 'Регистрация', icon: MapPin },
  ];

  return (
    <>
      {showScanner && (
        <PassportScanner
          onScanComplete={handleScanComplete}
          onCancel={() => setShowScanner(false)}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Scan passport button */}
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white font-semibold py-4 rounded-xl mb-6 hover:bg-blue-700 transition-colors"
        >
          <Camera className="w-5 h-5" />
          Сканировать паспорт
        </button>

        {/* Section tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-4 px-4">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Personal Info Section */}
        {activeSection === 'personal' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ФИО (как в паспорте) *
              </label>
              <input
                {...register('fullName')}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fullName ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="ИВАНОВ ИВАН ИВАНОВИЧ"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ФИО (латиницей)
              </label>
              <input
                {...register('fullNameLatin')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="IVANOV IVAN IVANOVICH"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата рождения
                </label>
                <input
                  type="date"
                  {...register('birthDate')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Пол
                </label>
                <select
                  {...register('gender')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Выберите</option>
                  <option value="male">Мужской</option>
                  <option value="female">Женский</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Гражданство *
              </label>
              <select
                {...register('citizenship')}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.citizenship ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">Выберите страну</option>
                {CITIZENSHIPS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}{c.isEAEU ? ' (ЕАЭС)' : ''}
                  </option>
                ))}
              </select>
              {errors.citizenship && (
                <p className="mt-1 text-sm text-red-600">{errors.citizenship.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+7 (___) ___-__-__"
              />
            </div>
          </div>
        )}

        {/* Documents Section */}
        {activeSection === 'documents' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Номер паспорта *
              </label>
              <input
                {...register('passportNumber')}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.passportNumber ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="AA 1234567"
              />
              {errors.passportNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.passportNumber.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дата выдачи
                </label>
                <input
                  type="date"
                  {...register('passportIssueDate')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Действителен до
                </label>
                <input
                  type="date"
                  {...register('passportExpiryDate')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата въезда в РФ
              </label>
              <input
                type="date"
                {...register('entryDate')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Номер миграционной карты
              </label>
              <input
                {...register('migrationCardNumber')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1234 567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Цель визита
              </label>
              <select
                {...register('purpose')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Выберите</option>
                <option value="work">Работа</option>
                <option value="study">Учёба</option>
                <option value="tourist">Туризм</option>
                <option value="private">Частный визит</option>
              </select>
            </div>
          </div>
        )}

        {/* Work Section */}
        {activeSection === 'work' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                {...register('hasPatent')}
                id="hasPatent"
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="hasPatent" className="font-medium text-gray-900">
                У меня есть патент на работу
              </label>
            </div>

            {hasPatent && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Регион патента
                  </label>
                  <select
                    {...register('patentRegion')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Выберите регион</option>
                    {PATENT_REGIONS.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Патент действителен до
                  </label>
                  <input
                    type="date"
                    {...register('patentExpiry')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название работодателя
              </label>
              <input
                {...register('employerName')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ООО Компания"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ИНН работодателя
              </label>
              <input
                {...register('employerINN')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1234567890"
              />
            </div>
          </div>
        )}

        {/* Registration Section */}
        {activeSection === 'registration' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Адрес регистрации
              </label>
              <textarea
                {...register('registrationAddress')}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="г. Москва, ул. Пушкина, д. 1, кв. 1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Регистрация до
              </label>
              <input
                type="date"
                {...register('registrationExpiry')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ФИО принимающей стороны
              </label>
              <input
                {...register('hostFullName')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Иванов Иван Иванович"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Адрес принимающей стороны
              </label>
              <textarea
                {...register('hostAddress')}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Если отличается от адреса регистрации"
              />
            </div>
          </div>
        )}

        {/* Submit button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading || !isDirty}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="animate-pulse">Сохранение...</span>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Сохранить профиль
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}
