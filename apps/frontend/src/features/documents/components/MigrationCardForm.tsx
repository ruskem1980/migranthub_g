'use client';

import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X, AlertTriangle, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  migrationCardSchema,
  type MigrationCardData,
  visitPurposes,
  visitPurposeLabels,
} from '../schemas/migrationCard.schema';
import { useDocumentStorage } from '../hooks/useDocumentStorage';
import { DocumentFormWrapper } from './DocumentFormWrapper';

// Популярные пункты пропуска
const ENTRY_POINTS = [
  'Аэропорт Шереметьево',
  'Аэропорт Домодедово',
  'Аэропорт Внуково',
  'Аэропорт Пулково',
  'Аэропорт Толмачёво',
  'МАПП Троебортное',
  'МАПП Бугристое',
  'Ж/д станция Москва-Казанская',
];

/**
 * Вычисляет дату через N дней от указанной даты
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Форматирует дату в строку YYYY-MM-DD
 */
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Вычисляет количество дней до указанной даты
 */
function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

interface MigrationCardFormProps {
  initialData?: Partial<MigrationCardData>;
  documentId?: string;
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MigrationCardForm({
  initialData,
  documentId,
  userId,
  onSuccess,
  onCancel,
}: MigrationCardFormProps) {
  const router = useRouter();
  const { saveDocument, updateDocument, isLoading, error } = useDocumentStorage();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<MigrationCardData>({
    resolver: zodResolver(migrationCardSchema),
    defaultValues: {
      cardNumber: '',
      cardSeries: '',
      entryDate: '',
      entryPoint: '',
      purpose: undefined,
      stayUntil: '',
      hostName: '',
      hostAddress: '',
      ...initialData,
    },
  });

  // Наблюдаем за датой въезда для автозаполнения срока пребывания
  const entryDate = watch('entryDate');
  const stayUntil = watch('stayUntil');

  // Автоматический расчёт даты окончания пребывания (90 дней)
  useEffect(() => {
    if (entryDate && !initialData?.stayUntil) {
      const entryDateObj = new Date(entryDate);
      if (!isNaN(entryDateObj.getTime())) {
        const stayUntilDate = addDays(entryDateObj, 90);
        setValue('stayUntil', formatDate(stayUntilDate), { shouldValidate: true });
      }
    }
  }, [entryDate, setValue, initialData?.stayUntil]);

  // Вычисляем оставшиеся дни и показываем предупреждение
  const daysRemaining = useMemo(() => {
    if (!stayUntil) return null;
    return daysUntil(stayUntil);
  }, [stayUntil]);

  const showWarning = daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0;
  const isExpired = daysRemaining !== null && daysRemaining <= 0;

  const onSubmit = async (data: MigrationCardData) => {
    let result;

    if (documentId) {
      result = await updateDocument({
        id: documentId,
        data,
      });
    } else {
      result = await saveDocument({
        type: 'migration_card',
        userId,
        title: `Миграционная карта: ${data.cardNumber}`,
        data,
        expiryDate: data.stayUntil,
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

  // Быстрые кнопки для даты въезда
  const setEntryDateToday = () => {
    setValue('entryDate', formatDate(new Date()), { shouldValidate: true });
  };

  const setEntryDateYesterday = () => {
    setValue('entryDate', formatDate(addDays(new Date(), -1)), { shouldValidate: true });
  };

  return (
    <DocumentFormWrapper
      title={documentId ? 'Редактирование миграционной карты' : 'Новая миграционная карта'}
      subtitle="Заполните данные миграционной карты"
      isSaving={isLoading}
      error={error?.message}
      onBack={handleCancel}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Предупреждение об истечении срока */}
        {isExpired && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Срок пребывания истёк!</p>
                <p className="text-sm text-red-700 mt-1">
                  Вам необходимо срочно урегулировать миграционный статус.
                </p>
              </div>
            </div>
          </div>
        )}

        {showWarning && (
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800">
                  Осталось {daysRemaining} {daysRemaining === 1 ? 'день' : daysRemaining < 5 ? 'дня' : 'дней'}
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Срок пребывания скоро истекает. Позаботьтесь о продлении или выезде из РФ.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Номер миграционной карты */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Данные миграционной карты
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Серия
              </label>
              <input
                {...register('cardSeries')}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0001"
              />
              {errors.cardSeries && (
                <p className="mt-1 text-sm text-red-600">{errors.cardSeries.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Номер *
              </label>
              <input
                {...register('cardNumber')}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cardNumber ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="1234567890"
              />
              {errors.cardNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.cardNumber.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* Дата въезда */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Въезд в Россию
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата въезда *
            </label>
            <input
              type="date"
              {...register('entryDate')}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.entryDate ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.entryDate && (
              <p className="mt-1 text-sm text-red-600">{errors.entryDate.message}</p>
            )}
            {/* Быстрые кнопки */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={setEntryDateToday}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
              >
                Сегодня
              </button>
              <button
                type="button"
                onClick={setEntryDateYesterday}
                className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                Вчера
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пункт пропуска *
            </label>
            <input
              {...register('entryPoint')}
              list="entry-points"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.entryPoint ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Аэропорт Шереметьево"
            />
            <datalist id="entry-points">
              {ENTRY_POINTS.map((point) => (
                <option key={point} value={point} />
              ))}
            </datalist>
            {errors.entryPoint && (
              <p className="mt-1 text-sm text-red-600">{errors.entryPoint.message}</p>
            )}
          </div>
        </section>

        {/* Цель визита */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Цель визита
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Выберите цель *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {visitPurposes.map((purpose) => {
                const currentPurpose = watch('purpose');
                const isSelected = currentPurpose === purpose;
                return (
                  <button
                    key={purpose}
                    type="button"
                    onClick={() => setValue('purpose', purpose, { shouldValidate: true })}
                    className={`flex items-center justify-center px-4 py-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium text-sm">{visitPurposeLabels[purpose]}</span>
                  </button>
                );
              })}
            </div>
            {errors.purpose && (
              <p className="mt-2 text-sm text-red-600">{errors.purpose.message}</p>
            )}
          </div>
        </section>

        {/* Срок пребывания */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Срок пребывания
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пребывание до *
            </label>
            <input
              type="date"
              {...register('stayUntil')}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.stayUntil ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.stayUntil && (
              <p className="mt-1 text-sm text-red-600">{errors.stayUntil.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Автоматически рассчитывается: 90 дней от даты въезда
            </p>
          </div>
        </section>

        {/* Принимающая сторона */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Принимающая сторона (опционально)
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ФИО или название организации
            </label>
            <input
              {...register('hostName')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Иванов Иван Иванович"
            />
            {errors.hostName && (
              <p className="mt-1 text-sm text-red-600">{errors.hostName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Адрес принимающей стороны
            </label>
            <textarea
              {...register('hostAddress')}
              rows={2}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="г. Москва, ул. Пушкина, д. 1"
            />
            {errors.hostAddress && (
              <p className="mt-1 text-sm text-red-600">{errors.hostAddress.message}</p>
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
