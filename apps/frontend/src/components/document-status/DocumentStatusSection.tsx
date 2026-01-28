'use client';

import { Loader2, ShieldCheck } from 'lucide-react';
import { CheckButton } from './CheckButton';
import { CheckResultModal } from './CheckResultModal';
import { useDocumentCheckStore, type CheckType } from '@/lib/stores/documentCheckStore';

export function DocumentStatusSection() {
  const {
    checks,
    isLoading,
    checkResult,
    isModalOpen,
    lastCheckDate,
    runCheck,
    runAllChecks,
    closeModal,
  } = useDocumentCheckStore();

  const checkTypes: CheckType[] = ['patent', 'entryBan', 'inn', 'days90180', 'rvpVnj'];

  const formatLastCheckDate = (date: string | null): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section className="bg-white rounded-2xl p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Проверка статуса документов
          </h2>
          {lastCheckDate && (
            <p className="text-sm text-gray-500">
              Последняя проверка: {formatLastCheckDate(lastCheckDate)}
            </p>
          )}
        </div>
      </div>

      {/* Full Check Button */}
      <button
        onClick={runAllChecks}
        disabled={isLoading}
        className="w-full py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mb-4"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Проверка...
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            Полная проверка документов
          </>
        )}
      </button>

      {/* Individual Checks Grid */}
      <div className="grid grid-cols-2 gap-3">
        {checkTypes.map((type) => (
          <CheckButton
            key={type}
            type={type}
            status={checks[type]}
            onClick={() => runCheck(type)}
            isLink={type === 'days90180'}
            href={type === 'days90180' ? '/calculator' : undefined}
          />
        ))}
      </div>

      {/* Result Modal */}
      {isModalOpen && checkResult && (
        <CheckResultModal result={checkResult} onClose={closeModal} />
      )}
    </section>
  );
}
