'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  FileText,
  CreditCard,
  Briefcase,
  Home,
  AlertCircle,
  Clock,
  CheckCircle,
  Calendar,
  User,
  MapPin,
  Hash,
  Building,
  UserCheck,
  HeartPulse,
} from 'lucide-react';
import { useDocumentStorage } from '@/features/documents/hooks/useDocumentStorage';
import {
  useDocumentExpiryStatus,
  formatExpiryDate,
  getStatusColor,
  getStatusText,
} from '@/features/documents/hooks/useExpiryTracker';
import { documentTypeLabels } from '@/features/documents/schemas';
import type {
  TypedDocument,
  DocumentTypeValue,
  PassportDocument,
  MigrationCardDocument,
  PatentDocument,
  RegistrationDocument,
  InnDocument,
  SnilsDocument,
  DmsDocument,
} from '@/lib/db/types';

const documentIcons: Record<
  DocumentTypeValue,
  React.ComponentType<{ className?: string }>
> = {
  passport: CreditCard,
  migration_card: FileText,
  patent: Briefcase,
  registration: Home,
  inn: Hash,
  snils: UserCheck,
  dms: HeartPulse,
};

const documentTypeColors: Record<DocumentTypeValue, string> = {
  passport: 'bg-blue-100 text-blue-600',
  migration_card: 'bg-purple-100 text-purple-600',
  patent: 'bg-orange-100 text-orange-600',
  registration: 'bg-green-100 text-green-600',
  inn: 'bg-indigo-100 text-indigo-600',
  snils: 'bg-teal-100 text-teal-600',
  dms: 'bg-red-100 text-red-600',
};

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  const [document, setDocument] = useState<TypedDocument | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { getDocument, deleteDocument, isLoading, error } =
    useDocumentStorage();

  // Загрузка документа
  const loadDocument = useCallback(async () => {
    if (!documentId) return;

    const result = await getDocument(documentId);
    if (result.success) {
      setDocument(result.data);
    }
  }, [documentId, getDocument]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // Статус истечения срока
  const { status, daysRemaining, progressPercent } = useDocumentExpiryStatus(
    document?.expiryDate
  );

  const statusColors = getStatusColor(status);

  // Иконка статуса
  const StatusIcon = useMemo(() => {
    switch (status) {
      case 'expired':
        return AlertCircle;
      case 'expiring_soon':
        return Clock;
      default:
        return CheckCircle;
    }
  }, [status]);

  // Обработка удаления
  const handleDelete = useCallback(async () => {
    if (!document) return;

    setIsDeleting(true);
    const result = await deleteDocument(document.id);

    if (result.success) {
      router.replace('/documents');
    } else {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [document, deleteDocument, router]);

  // Переход к редактированию
  const handleEdit = useCallback(() => {
    if (!document) return;
    router.push(`/documents/edit/${document.id}`);
  }, [document, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
        </div>
        <div className="flex-1 p-4 space-y-4">
          <div className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !document) {
    return (
      <div className="h-screen bg-gray-50 flex flex-col">
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Документ</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Документ не найден
          </h2>
          <p className="text-gray-500 mb-6">
            {error?.message || 'Возможно, документ был удалён'}
          </p>
          <button
            onClick={() => router.replace('/documents')}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            К списку документов
          </button>
        </div>
      </div>
    );
  }

  const Icon = documentIcons[document.type];
  const typeColor = documentTypeColors[document.type];

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">
            {documentTypeLabels[document.type]}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Edit2 className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-500" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {/* Document Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
          <div className="p-4">
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${typeColor}`}
              >
                <Icon className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900">
                  {documentTypeLabels[document.type]}
                </h2>
                {document.expiryDate && (
                  <div className="flex items-center gap-2 mt-2">
                    <StatusIcon className={`w-5 h-5 ${statusColors.text}`} />
                    <span className={`text-sm font-medium ${statusColors.text}`}>
                      {getStatusText(status)}
                      {daysRemaining !== null && daysRemaining >= 0 && (
                        <span className="text-gray-500 font-normal ml-1">
                          (ещё {daysRemaining} дн.)
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {document.expiryDate && (
            <div className="h-2 bg-gray-100">
              <div
                className={`h-full transition-all duration-300 ${statusColors.progressBar}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Document Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Данные документа
          </h3>

          <DocumentDetails document={document} />
        </div>

        {/* Meta info */}
        <div className="mt-4 p-4 bg-gray-100 rounded-xl">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Создан:</span>
            <span>{new Date(document.createdAt).toLocaleDateString('ru-RU')}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
            <span>Обновлён:</span>
            <span>{new Date(document.updatedAt).toLocaleDateString('ru-RU')}</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 animate-in zoom-in-95">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Удалить документ?
              </h2>
              <p className="text-gray-500 mb-6">
                Документ будет удалён безвозвратно. Это действие нельзя отменить.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Удаление...' : 'Удалить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Компонент отображения данных документа в зависимости от типа
 */
function DocumentDetails({ document }: { document: TypedDocument }) {
  switch (document.type) {
    case 'passport':
      return <PassportDetails document={document} />;
    case 'migration_card':
      return <MigrationCardDetails document={document} />;
    case 'patent':
      return <PatentDetails document={document} />;
    case 'registration':
      return <RegistrationDetails document={document} />;
    case 'inn':
      return <InnDetails document={document} />;
    case 'snils':
      return <SnilsDetails document={document} />;
    case 'dms':
      return <DmsDetails document={document} />;
    default:
      return null;
  }
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <Icon className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 mb-0.5">{label}</div>
        <div className="text-sm font-medium text-gray-900">{value}</div>
      </div>
    </div>
  );
}

function PassportDetails({ document }: { document: PassportDocument }) {
  const data = document.data;
  const fullName = [data.lastName, data.firstName, data.middleName]
    .filter(Boolean)
    .join(' ');
  const fullNameLatin = [data.lastNameLatin, data.firstNameLatin]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="space-y-0">
      <DetailRow icon={User} label="ФИО" value={fullName} />
      <DetailRow icon={User} label="ФИО (латиница)" value={fullNameLatin} />
      <DetailRow
        icon={Hash}
        label="Номер паспорта"
        value={
          data.passportNumber
            ? `${data.passportSeries || ''} ${data.passportNumber}`.trim()
            : undefined
        }
      />
      <DetailRow
        icon={Calendar}
        label="Дата рождения"
        value={data.birthDate ? formatExpiryDate(data.birthDate) : undefined}
      />
      <DetailRow icon={MapPin} label="Место рождения" value={data.birthPlace} />
      <DetailRow icon={MapPin} label="Гражданство" value={data.citizenship} />
      <DetailRow
        icon={Calendar}
        label="Дата выдачи"
        value={data.issueDate ? formatExpiryDate(data.issueDate) : undefined}
      />
      <DetailRow
        icon={Calendar}
        label="Срок действия"
        value={data.expiryDate ? formatExpiryDate(data.expiryDate) : undefined}
      />
      <DetailRow icon={Building} label="Кем выдан" value={data.issuedBy} />
    </div>
  );
}

function MigrationCardDetails({
  document,
}: {
  document: MigrationCardDocument;
}) {
  const data = document.data;

  const purposeLabels: Record<string, string> = {
    work: 'Работа',
    tourist: 'Туризм',
    study: 'Учёба',
    private: 'Частный визит',
    business: 'Деловой визит',
    transit: 'Транзит',
    humanitarian: 'Гуманитарная',
    other: 'Другое',
  };

  return (
    <div className="space-y-0">
      <DetailRow
        icon={Hash}
        label="Номер карты"
        value={
          data.cardNumber
            ? `${data.cardSeries || ''} ${data.cardNumber}`.trim()
            : undefined
        }
      />
      <DetailRow
        icon={Calendar}
        label="Дата въезда"
        value={data.entryDate ? formatExpiryDate(data.entryDate) : undefined}
      />
      <DetailRow icon={MapPin} label="Пункт въезда" value={data.entryPoint} />
      <DetailRow
        icon={FileText}
        label="Цель визита"
        value={data.purpose ? purposeLabels[data.purpose] : undefined}
      />
      <DetailRow
        icon={Calendar}
        label="Срок пребывания до"
        value={data.stayUntil ? formatExpiryDate(data.stayUntil) : undefined}
      />
    </div>
  );
}

function PatentDetails({ document }: { document: PatentDocument }) {
  const data = document.data;

  return (
    <div className="space-y-0">
      <DetailRow
        icon={Hash}
        label="Номер патента"
        value={
          data.patentNumber
            ? `${data.patentSeries || ''} ${data.patentNumber}`.trim()
            : undefined
        }
      />
      <DetailRow icon={MapPin} label="Регион" value={data.region} />
      <DetailRow icon={Briefcase} label="Профессия" value={data.profession} />
      <DetailRow
        icon={Calendar}
        label="Дата выдачи"
        value={data.issueDate ? formatExpiryDate(data.issueDate) : undefined}
      />
      <DetailRow
        icon={Calendar}
        label="Действует до"
        value={data.expiryDate ? formatExpiryDate(data.expiryDate) : undefined}
      />
      <DetailRow
        icon={Calendar}
        label="Оплачено до"
        value={data.paidUntil ? formatExpiryDate(data.paidUntil) : undefined}
      />
    </div>
  );
}

function RegistrationDetails({
  document,
}: {
  document: RegistrationDocument;
}) {
  const data = document.data;

  const typeLabels: Record<string, string> = {
    temporary: 'Временная регистрация',
    permanent: 'Постоянная регистрация',
  };

  const fullAddress = [
    data.region,
    data.city,
    data.street,
    data.building && `д. ${data.building}`,
    data.apartment && `кв. ${data.apartment}`,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div className="space-y-0">
      <DetailRow
        icon={FileText}
        label="Тип регистрации"
        value={data.type ? typeLabels[data.type] : undefined}
      />
      <DetailRow icon={MapPin} label="Адрес" value={fullAddress || data.address} />
      <DetailRow
        icon={Calendar}
        label="Дата регистрации"
        value={
          data.registrationDate
            ? formatExpiryDate(data.registrationDate)
            : undefined
        }
      />
      <DetailRow
        icon={Calendar}
        label="Действует до"
        value={data.expiryDate ? formatExpiryDate(data.expiryDate) : undefined}
      />
      <DetailRow
        icon={User}
        label="Принимающая сторона"
        value={data.hostFullName}
      />
    </div>
  );
}

function InnDetails({ document }: { document: InnDocument }) {
  const data = document.data;

  return (
    <div className="space-y-0">
      <DetailRow icon={User} label="ФИО" value={data.fullName} />
      <DetailRow icon={Hash} label="Номер ИНН" value={data.innNumber} />
      <DetailRow
        icon={Calendar}
        label="Дата выдачи"
        value={data.issueDate ? formatExpiryDate(data.issueDate) : undefined}
      />
      <DetailRow icon={Building} label="Выдан" value={data.issuedBy} />
      <DetailRow icon={Hash} label="Код налогового органа" value={data.taxAuthorityCode} />
    </div>
  );
}

function SnilsDetails({ document }: { document: SnilsDocument }) {
  const data = document.data;

  const genderLabels: Record<string, string> = {
    male: 'Мужской',
    female: 'Женский',
  };

  return (
    <div className="space-y-0">
      <DetailRow icon={User} label="ФИО" value={data.fullName} />
      <DetailRow icon={Hash} label="Номер СНИЛС" value={data.snilsNumber} />
      <DetailRow
        icon={Calendar}
        label="Дата рождения"
        value={data.birthDate ? formatExpiryDate(data.birthDate) : undefined}
      />
      <DetailRow icon={MapPin} label="Место рождения" value={data.birthPlace} />
      <DetailRow icon={User} label="Пол" value={data.gender ? genderLabels[data.gender] : undefined} />
      <DetailRow
        icon={Calendar}
        label="Дата регистрации"
        value={data.registrationDate ? formatExpiryDate(data.registrationDate) : undefined}
      />
    </div>
  );
}

function DmsDetails({ document }: { document: DmsDocument }) {
  const data = document.data;

  return (
    <div className="space-y-0">
      <DetailRow icon={User} label="ФИО застрахованного" value={data.fullName} />
      <DetailRow icon={Hash} label="Номер полиса" value={data.policyNumber} />
      <DetailRow icon={Building} label="Страховая компания" value={data.insuranceCompany} />
      <DetailRow icon={FileText} label="Программа страхования" value={data.programName} />
      <DetailRow
        icon={Calendar}
        label="Дата начала"
        value={data.startDate ? formatExpiryDate(data.startDate) : undefined}
      />
      <DetailRow
        icon={Calendar}
        label="Дата окончания"
        value={data.expiryDate ? formatExpiryDate(data.expiryDate) : undefined}
      />
      <DetailRow icon={MapPin} label="Территория покрытия" value={data.coverageTerritory} />
      <DetailRow icon={Hash} label="Телефон страховой" value={data.insurancePhone} />
    </div>
  );
}
