'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Calendar, MapPin, User, Home, Loader2 } from 'lucide-react';
import {
  registrationSchema,
  type RegistrationData,
  registrationTypes,
  registrationTypeLabels,
  getDaysUntilExpiry,
  isRegistrationExpired,
  isRegistrationExpiringSoon,
  formatFullAddress,
} from '../schemas';
import { russianRegions } from '../schemas/patent.schema';
import { useDocumentStorage } from '../hooks/useDocumentStorage';
import { SampleDataButton } from './SampleDataButton';

interface RegistrationFormProps {
  userId: string;
  initialData?: Partial<RegistrationData>;
  onSuccess?: (data: RegistrationData) => void;
  onCancel?: () => void;
  documentId?: string; // Если передан - режим редактирования
}

export function RegistrationForm({
  userId,
  initialData,
  onSuccess,
  onCancel,
  documentId,
}: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { saveDocument, updateDocument } = useDocumentStorage();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      type: 'temporary',
      address: '',
      region: '',
      city: '',
      street: '',
      building: '',
      apartment: '',
      registrationDate: '',
      expiryDate: '',
      hostFullName: '',
      hostPhone: '',
      notificationNumber: '',
      registeredBy: '',
      ...initialData,
    },
  });

  const registrationType = watch('type');
  const expiryDate = watch('expiryDate');
  const registrationDate = watch('registrationDate');
  const region = watch('region');
  const city = watch('city');
  const street = watch('street');
  const building = watch('building');
  const apartment = watch('apartment');

  // Расчёт дней до истечения регистрации
  const daysUntilExpiry = useMemo(() => {
    if (!expiryDate) return null;
    return getDaysUntilExpiry(expiryDate);
  }, [expiryDate]);

  const registrationExpired = useMemo(() => {
    if (!expiryDate) return false;
    return isRegistrationExpired(expiryDate);
  }, [expiryDate]);

  const expiringSoon = useMemo(() => {
    if (!expiryDate) return false;
    return isRegistrationExpiringSoon(expiryDate, 7);
  }, [expiryDate]);

  // Проверка срока (не более 90 дней для временной регистрации)
  const durationWarning = useMemo(() => {
    if (!registrationDate || !expiryDate) return null;
    if (registrationType !== 'temporary') return null;

    const start = new Date(registrationDate);
    const end = new Date(expiryDate);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 90) {
      return `Срок временной регистрации (${diffDays} дней) превышает стандартные 90 дней. Убедитесь, что это соответствует вашему статусу.`;
    }
    return null;
  }, [registrationDate, expiryDate, registrationType]);

  // Автоматическое формирование полного адреса
  const fullAddress = useMemo(() => {
    if (!region || !city || !street || !building) return '';
    return formatFullAddress({ region, city, street, building, apartment });
  }, [region, city, street, building, apartment]);

  // Обновляем поле address при изменении составных частей
  const updateAddress = () => {
    if (fullAddress) {
      setValue('address', fullAddress);
    }
  };

  const handleFillSample = (data: Record<string, unknown>) => {
    reset(data as RegistrationData);
  };

  const onSubmit = async (data: RegistrationData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const title = `Регистрация: ${data.city}`;

      if (documentId) {
        const result = await updateDocument({
          id: documentId,
          data,
          title,
          expiryDate: data.expiryDate,
        });

        if (!result.success) {
          setSubmitError(result.error.message);
          return;
        }
      } else {
        const result = await saveDocument({
          type: 'registration',
          userId,
          data,
          title,
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
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Home className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {documentId ? 'Редактировать регистрацию' : 'Добавить регистрацию'}
            </h2>
            <p className="text-sm text-gray-500">Миграционный учёт по месту пребывания</p>
          </div>
        </div>
        <SampleDataButton
          documentType="registration"
          onFillSample={handleFillSample}
        />
      </div>

      {/* Тип регистрации */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Тип регистрации *
        </label>
        <div className="grid grid-cols-2 gap-3">
          {registrationTypes.map((type) => (
            <label
              key={type}
              className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                registrationType === type
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                {...register('type')}
                value={type}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  registrationType === type
                    ? 'border-green-500'
                    : 'border-gray-300'
                }`}
              >
                {registrationType === type && (
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                )}
              </div>
              <span className="font-medium text-gray-900">
                {registrationTypeLabels[type]}
              </span>
            </label>
          ))}
        </div>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      {/* Адрес - секция */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-500" />
          Адрес регистрации
        </h3>

        {/* Регион */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Регион *
          </label>
          <select
            {...register('region')}
            onChange={(e) => {
              register('region').onChange(e);
              setTimeout(updateAddress, 0);
            }}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          >
            <option value="">Выберите регион</option>
            {russianRegions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {errors.region && (
            <p className="mt-1 text-sm text-red-600">{errors.region.message}</p>
          )}
        </div>

        {/* Город */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Город *
          </label>
          <input
            type="text"
            {...register('city')}
            onChange={(e) => {
              register('city').onChange(e);
              setTimeout(updateAddress, 0);
            }}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Москва"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>

        {/* Улица */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Улица *
          </label>
          <input
            type="text"
            {...register('street')}
            onChange={(e) => {
              register('street').onChange(e);
              setTimeout(updateAddress, 0);
            }}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="ул. Ленина"
          />
          {errors.street && (
            <p className="mt-1 text-sm text-red-600">{errors.street.message}</p>
          )}
        </div>

        {/* Дом и квартира */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дом *
            </label>
            <input
              type="text"
              {...register('building')}
              onChange={(e) => {
                register('building').onChange(e);
                setTimeout(updateAddress, 0);
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="10"
            />
            {errors.building && (
              <p className="mt-1 text-sm text-red-600">{errors.building.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Квартира
            </label>
            <input
              type="text"
              {...register('apartment')}
              onChange={(e) => {
                register('apartment').onChange(e);
                setTimeout(updateAddress, 0);
              }}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="25"
            />
            {errors.apartment && (
              <p className="mt-1 text-sm text-red-600">{errors.apartment.message}</p>
            )}
          </div>
        </div>

        {/* Полный адрес (textarea) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Полный адрес *
          </label>
          <textarea
            {...register('address')}
            rows={3}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            placeholder="Полный адрес регистрации"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Заполняется автоматически или введите вручную
          </p>
        </div>
      </div>

      {/* Сроки регистрации */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          Сроки регистрации
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата постановки на учёт *
            </label>
            <input
              type="date"
              {...register('registrationDate')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {errors.registrationDate && (
              <p className="mt-1 text-sm text-red-600">{errors.registrationDate.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Срок действия до *
            </label>
            <input
              type="date"
              {...register('expiryDate')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {errors.expiryDate && (
              <p className="mt-1 text-sm text-red-600">{errors.expiryDate.message}</p>
            )}
          </div>
        </div>

        {/* Предупреждение о сроке */}
        {durationWarning && (
          <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-orange-800">{durationWarning}</span>
            </div>
          </div>
        )}

        {/* Предупреждение об истечении */}
        {daysUntilExpiry !== null && (
          <div
            className={`mt-4 p-4 rounded-xl border ${
              registrationExpired
                ? 'bg-red-50 border-red-200'
                : expiringSoon
                ? 'bg-orange-50 border-orange-200'
                : 'bg-green-50 border-green-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle
                className={`w-5 h-5 ${
                  registrationExpired
                    ? 'text-red-600'
                    : expiringSoon
                    ? 'text-orange-600'
                    : 'text-green-600'
                }`}
              />
              <span
                className={`font-semibold ${
                  registrationExpired
                    ? 'text-red-900'
                    : expiringSoon
                    ? 'text-orange-900'
                    : 'text-green-900'
                }`}
              >
                {registrationExpired
                  ? 'Регистрация просрочена!'
                  : expiringSoon
                  ? `До окончания регистрации ${daysUntilExpiry} дней`
                  : `Регистрация действует ещё ${daysUntilExpiry} дней`}
              </span>
            </div>
            {registrationExpired && (
              <p className="mt-2 text-sm text-red-700">
                Нахождение на территории РФ без регистрации является административным правонарушением.
                Продлите регистрацию или покиньте территорию РФ.
              </p>
            )}
            {expiringSoon && !registrationExpired && (
              <p className="mt-2 text-sm text-orange-700">
                Рекомендуем заблаговременно продлить регистрацию или подготовить документы для выезда/въезда.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Принимающая сторона */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-gray-500" />
          Принимающая сторона
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ФИО принимающей стороны *
            </label>
            <input
              type="text"
              {...register('hostFullName')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Иванов Иван Иванович"
            />
            {errors.hostFullName && (
              <p className="mt-1 text-sm text-red-600">{errors.hostFullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Телефон принимающей стороны
            </label>
            <input
              type="tel"
              {...register('hostPhone')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="+7 (999) 123-45-67"
            />
            {errors.hostPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.hostPhone.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Дополнительная информация
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Номер уведомления
            </label>
            <input
              type="text"
              {...register('notificationNumber')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Номер уведомления о постановке на учёт"
            />
            {errors.notificationNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.notificationNumber.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Орган постановки на учёт
            </label>
            <input
              type="text"
              {...register('registeredBy')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="УВМ ГУ МВД России по г. Москве"
            />
            {errors.registeredBy && (
              <p className="mt-1 text-sm text-red-600">{errors.registeredBy.message}</p>
            )}
          </div>
        </div>
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
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 disabled:bg-gray-300 transition-colors"
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
