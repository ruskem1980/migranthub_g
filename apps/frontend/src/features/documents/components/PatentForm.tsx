'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Banknote, Calendar, MapPin, FileText, Loader2 } from 'lucide-react';
import { patentSchema, type PatentData, russianRegions, getDaysUntilPayment, isPaymentOverdue } from '../schemas';
import { getRegionByCode } from '@/features/payments/patentPayment';
import { useDocumentStorage } from '../hooks/useDocumentStorage';
import { SampleDataButton } from './SampleDataButton';

interface PatentFormProps {
  userId: string;
  initialData?: Partial<PatentData>;
  onSuccess?: (data: PatentData) => void;
  onCancel?: () => void;
  documentId?: string; // Если передан - режим редактирования
}

// Маппинг регионов к кодам для расчёта стоимости
const REGION_CODE_MAP: Record<string, string> = {
  'Москва': '77',
  'Московская область': '50',
  'Санкт-Петербург': '78',
  'Ленинградская область': '47',
  'Краснодарский край': '23',
  'Свердловская область': '66',
  'Новосибирская область': '54',
  'Республика Татарстан': '16',
  'Нижегородская область': '52',
  'Самарская область': '63',
};

export function PatentForm({
  userId,
  initialData,
  onSuccess,
  onCancel,
  documentId,
}: PatentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { saveDocument, updateDocument } = useDocumentStorage();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PatentData>({
    resolver: zodResolver(patentSchema),
    defaultValues: {
      patentNumber: '',
      patentSeries: '',
      region: '',
      profession: '',
      issueDate: '',
      expiryDate: '',
      issuedBy: '',
      inn: '',
      lastPaymentDate: '',
      paidUntil: '',
      ...initialData,
    },
  });

  const selectedRegion = watch('region');
  const paidUntil = watch('paidUntil');

  // Расчёт стоимости патента для выбранного региона
  const paymentInfo = useMemo(() => {
    if (!selectedRegion) return null;

    const regionCode = REGION_CODE_MAP[selectedRegion];
    if (!regionCode) return null;

    const regionData = getRegionByCode(regionCode);
    return regionData || null;
  }, [selectedRegion]);

  // Расчёт дней до оплаты
  const daysUntilPayment = useMemo(() => {
    if (!paidUntil) return null;
    return getDaysUntilPayment(paidUntil);
  }, [paidUntil]);

  const paymentOverdue = useMemo(() => {
    if (!paidUntil) return false;
    return isPaymentOverdue(paidUntil);
  }, [paidUntil]);

  const handleFillSample = (data: Record<string, unknown>) => {
    reset(data as PatentData);
  };

  const onSubmit = async (data: PatentData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (documentId) {
        // Обновление существующего документа
        const result = await updateDocument({
          id: documentId,
          data,
          title: `Патент ${data.patentSeries || ''} ${data.patentNumber}`.trim(),
          expiryDate: data.expiryDate,
        });

        if (!result.success) {
          setSubmitError(result.error.message);
          return;
        }
      } else {
        // Создание нового документа
        const result = await saveDocument({
          type: 'patent',
          userId,
          data,
          title: `Патент ${data.patentSeries || ''} ${data.patentNumber}`.trim(),
          expiryDate: data.expiryDate,
        });

        if (!result.success) {
          setSubmitError(result.error.message);
          return;
        }
      }

      onSuccess?.(data);
    } catch {
      setSubmitError('Произошла ошибка при сохранении документа');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {documentId ? 'Редактировать патент' : 'Добавить патент'}
            </h2>
            <p className="text-sm text-gray-500">Патент на работу иностранному гражданину</p>
          </div>
        </div>
        <SampleDataButton
          documentType="patent"
          onFillSample={handleFillSample}
        />
      </div>

      {/* Серия и номер */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Серия
          </label>
          <input
            type="text"
            {...register('patentSeries')}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="77"
          />
          {errors.patentSeries && (
            <p className="mt-1 text-sm text-red-600">{errors.patentSeries.message}</p>
          )}
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Номер *
          </label>
          <input
            type="text"
            {...register('patentNumber')}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1234567890"
          />
          {errors.patentNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.patentNumber.message}</p>
          )}
        </div>
      </div>

      {/* Регион */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <MapPin className="w-4 h-4 inline-block mr-1" />
          Регион действия *
        </label>
        <select
          {...register('region')}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="">Выберите регион</option>
          {russianRegions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        {errors.region && (
          <p className="mt-1 text-sm text-red-600">{errors.region.message}</p>
        )}
      </div>

      {/* Информация о стоимости патента */}
      {paymentInfo && (
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Banknote className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">
              Стоимость патента в регионе
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {paymentInfo.monthlyAmount.toLocaleString('ru-RU')} руб/мес
          </div>
          <p className="text-sm text-blue-700 mt-1">
            Коэффициент: {paymentInfo.coefficient}
          </p>
        </div>
      )}

      {/* Профессия */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Профессия/специальность
        </label>
        <input
          type="text"
          {...register('profession')}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Указана в патенте (если есть)"
        />
        {errors.profession && (
          <p className="mt-1 text-sm text-red-600">{errors.profession.message}</p>
        )}
      </div>

      {/* Даты выдачи и окончания */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="w-4 h-4 inline-block mr-1" />
            Дата выдачи *
          </label>
          <input
            type="date"
            {...register('issueDate')}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.issueDate && (
            <p className="mt-1 text-sm text-red-600">{errors.issueDate.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Срок действия до *
          </label>
          <input
            type="date"
            {...register('expiryDate')}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.expiryDate && (
            <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
          )}
        </div>
      </div>

      {/* Кем выдан */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Кем выдан *
        </label>
        <input
          type="text"
          {...register('issuedBy')}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="УВМ ГУ МВД России по г. Москве"
        />
        {errors.issuedBy && (
          <p className="mt-1 text-sm text-red-600">{errors.issuedBy.message}</p>
        )}
      </div>

      {/* ИНН */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          ИНН
        </label>
        <input
          type="text"
          {...register('inn')}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="123456789012"
          maxLength={12}
        />
        {errors.inn && (
          <p className="mt-1 text-sm text-red-600">{errors.inn.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Присваивается при получении патента
        </p>
      </div>

      {/* Информация об оплате */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Информация об оплате НДФЛ
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата последней оплаты
            </label>
            <input
              type="date"
              {...register('lastPaymentDate')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.lastPaymentDate && (
              <p className="mt-1 text-sm text-red-600">{errors.lastPaymentDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Оплачено до
            </label>
            <input
              type="date"
              {...register('paidUntil')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.paidUntil && (
              <p className="mt-1 text-sm text-red-600">{errors.paidUntil.message}</p>
            )}
          </div>
        </div>

        {/* Напоминание о продлении */}
        {daysUntilPayment !== null && (
          <div
            className={`mt-4 p-4 rounded-xl border ${
              paymentOverdue
                ? 'bg-red-50 border-red-200'
                : daysUntilPayment <= 30
                ? 'bg-orange-50 border-orange-200'
                : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle
                className={`w-5 h-5 ${
                  paymentOverdue
                    ? 'text-red-600'
                    : daysUntilPayment <= 30
                    ? 'text-orange-600'
                    : 'text-green-600'
                }`}
              />
              <span
                className={`font-semibold ${
                  paymentOverdue
                    ? 'text-red-900'
                    : daysUntilPayment <= 30
                    ? 'text-orange-900'
                    : 'text-green-900'
                }`}
              >
                {paymentOverdue
                  ? 'Оплата просрочена!'
                  : daysUntilPayment <= 30
                  ? `До оплаты осталось ${daysUntilPayment} дней`
                  : `Оплачено на ${daysUntilPayment} дней вперёд`}
              </span>
            </div>
            {daysUntilPayment <= 30 && !paymentOverdue && (
              <p
                className={`mt-2 text-sm ${
                  daysUntilPayment <= 7 ? 'text-red-700' : 'text-orange-700'
                }`}
              >
                Рекомендуем оплатить патент заранее, чтобы избежать просрочки
              </p>
            )}
            {paymentOverdue && (
              <p className="mt-2 text-sm text-red-700">
                Просрочка оплаты патента может привести к его аннулированию. Оплатите как можно скорее!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Сумма ежемесячного платежа */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Сумма ежемесячного платежа (руб)
        </label>
        <input
          type="number"
          {...register('monthlyPayment', { valueAsNumber: true })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={paymentInfo ? paymentInfo.monthlyAmount.toString() : '5000'}
        />
        {errors.monthlyPayment && (
          <p className="mt-1 text-sm text-red-600">{errors.monthlyPayment.message}</p>
        )}
      </div>

      {/* Ошибка отправки */}
      {submitError && (
        <div className="p-4 bg-red-50 rounded-xl border border-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-semibold text-red-900">{submitError}</span>
          </div>
        </div>
      )}

      {/* Кнопки */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Сохранение...
            </>
          ) : (
            'Сохранить'
          )}
        </button>
      </div>
    </form>
  );
}
