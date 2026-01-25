'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { passportSchema, type PassportData } from '../schemas/passport.schema';
import { useDocumentStorage } from '../hooks/useDocumentStorage';
import { DocumentFormWrapper } from './DocumentFormWrapper';
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

/**
 * Транслитерация кириллицы в латиницу
 */
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

interface PassportFormProps {
  initialData?: Partial<PassportData>;
  documentId?: string;
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PassportForm({
  initialData,
  documentId,
  userId,
  onSuccess,
  onCancel,
}: PassportFormProps) {
  const router = useRouter();
  const { saveDocument, updateDocument, isLoading, error } = useDocumentStorage();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
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

  // Наблюдаем за кириллическими полями для автотранслитерации
  const lastName = watch('lastName');
  const firstName = watch('firstName');

  // Автотранслитерация фамилии
  useEffect(() => {
    if (lastName) {
      const transliterated = transliterate(lastName);
      setValue('lastNameLatin', transliterated, { shouldValidate: false });
    }
  }, [lastName, setValue]);

  // Автотранслитерация имени
  useEffect(() => {
    if (firstName) {
      const transliterated = transliterate(firstName);
      setValue('firstNameLatin', transliterated, { shouldValidate: false });
    }
  }, [firstName, setValue]);

  const onSubmit = async (data: PassportData) => {
    let result;

    if (documentId) {
      // Обновление существующего документа
      result = await updateDocument({
        id: documentId,
        data,
      });
    } else {
      // Создание нового документа
      result = await saveDocument({
        type: 'passport',
        userId,
        title: `Паспорт: ${data.lastName} ${data.firstName}`,
        data,
        expiryDate: data.expiryDate,
      });
    }

    if (result.success) {
      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/documents');
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.back();
    }
  };

  // Обработчик заполнения образцом
  const handleFillSample = (data: Record<string, unknown>) => {
    reset(data as PassportData, { keepDefaultValues: false });
  };

  return (
    <DocumentFormWrapper
      title={documentId ? 'Редактирование паспорта' : 'Новый паспорт'}
      subtitle="Заполните данные паспорта"
      isSaving={isLoading}
      error={error?.message}
      onBack={handleCancel}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Кнопка заполнения образцом */}
        <div className="flex justify-end">
          <SampleDataButton
            documentType="passport"
            onFillSample={handleFillSample}
          />
        </div>

        {/* ФИО (кириллица) */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            ФИО (как в паспорте)
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Фамилия *
            </label>
            <input
              {...register('lastName')}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.lastName ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="ИВАНОВ"
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя *
            </label>
            <input
              {...register('firstName')}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.firstName ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="ИВАН"
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Отчество
            </label>
            <input
              {...register('middleName')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ИВАНОВИЧ"
            />
            {errors.middleName && (
              <p className="mt-1 text-sm text-red-600">{errors.middleName.message}</p>
            )}
          </div>
        </section>

        {/* ФИО (латиница) - автозаполнение */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            ФИО латиницей (автозаполнение)
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Фамилия латиницей *
            </label>
            <input
              {...register('lastNameLatin')}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 ${
                errors.lastNameLatin ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="IVANOV"
            />
            {errors.lastNameLatin && (
              <p className="mt-1 text-sm text-red-600">{errors.lastNameLatin.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя латиницей *
            </label>
            <input
              {...register('firstNameLatin')}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 ${
                errors.firstNameLatin ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="IVAN"
            />
            {errors.firstNameLatin && (
              <p className="mt-1 text-sm text-red-600">{errors.firstNameLatin.message}</p>
            )}
          </div>
        </section>

        {/* Личные данные */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Личные данные
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата рождения *
            </label>
            <input
              type="date"
              {...register('birthDate')}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.birthDate ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.birthDate && (
              <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пол *
            </label>
            <select
              {...register('gender')}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.gender ? 'border-red-300' : 'border-gray-200'
              }`}
            >
              <option value="">Выберите</option>
              <option value="male">Мужской</option>
              <option value="female">Женский</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Место рождения *
            </label>
            <input
              {...register('birthPlace')}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.birthPlace ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="г. Ташкент, Узбекистан"
            />
            {errors.birthPlace && (
              <p className="mt-1 text-sm text-red-600">{errors.birthPlace.message}</p>
            )}
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
                <option key={c.code} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.citizenship && (
              <p className="mt-1 text-sm text-red-600">{errors.citizenship.message}</p>
            )}
          </div>
        </section>

        {/* Данные паспорта */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Данные паспорта
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Серия
              </label>
              <input
                {...register('passportSeries')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="AA"
              />
              {errors.passportSeries && (
                <p className="mt-1 text-sm text-red-600">{errors.passportSeries.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Номер *
              </label>
              <input
                {...register('passportNumber')}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.passportNumber ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="1234567"
              />
              {errors.passportNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.passportNumber.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата выдачи *
              </label>
              <input
                type="date"
                {...register('issueDate')}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.issueDate ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.issueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.issueDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Действителен до *
              </label>
              <input
                type="date"
                {...register('expiryDate')}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.expiryDate ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Кем выдан *
            </label>
            <textarea
              {...register('issuedBy')}
              rows={2}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.issuedBy ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="МВД Республики Узбекистан"
            />
            {errors.issuedBy && (
              <p className="mt-1 text-sm text-red-600">{errors.issuedBy.message}</p>
            )}
          </div>
        </section>

        {/* Кнопки */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-semibold py-4 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
            Отмена
          </button>
          <button
            type="submit"
            disabled={isLoading || !isDirty}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="animate-pulse">Сохранение...</span>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Сохранить
              </>
            )}
          </button>
        </div>
      </form>
    </DocumentFormWrapper>
  );
}
