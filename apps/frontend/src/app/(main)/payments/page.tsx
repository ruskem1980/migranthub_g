'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n';
import { PatentPaymentModal } from '@/components/prototype/services/PatentPaymentModal';
import { Wallet, CreditCard, History } from 'lucide-react';

export default function PaymentsPage() {
  const { t } = useTranslation();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Wallet className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('payments.title')}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Patent Payment Card */}
        <button
          onClick={() => setShowPaymentModal(true)}
          className="w-full bg-white rounded-2xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('payments.patent')}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {t('payments.patentDesc')}
              </p>
            </div>
            <div className="text-blue-600">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </button>

        {/* Payment History Card */}
        <div className="w-full bg-white rounded-2xl p-4 border border-gray-200 shadow-sm opacity-70">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-gray-400 to-gray-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <History className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('payments.history')}
                </h3>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                  {t('common.comingSoon')}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {t('payments.historyDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PatentPaymentModal onClose={() => setShowPaymentModal(false)} />
      )}
    </div>
  );
}
