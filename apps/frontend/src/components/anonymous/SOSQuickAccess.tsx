'use client';

import { useRouter } from 'next/navigation';
import { Phone, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

/**
 * SOSQuickAccess component - quick access to emergency help
 * Always displayed at the top of the anonymous dashboard
 */
export function SOSQuickAccess() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <button
      onClick={() => router.push('/sos')}
      className="w-full bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-xl border border-red-400 shadow-md hover:from-red-600 hover:to-red-700 transition-all active:scale-[0.98]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Phone className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-white text-lg">
              SOS
            </h3>
            <p className="text-sm text-red-100">
              {t('sos.subtitle')}
            </p>
          </div>
        </div>
        <ChevronRight className="w-6 h-6 text-white/80" />
      </div>
    </button>
  );
}

export default SOSQuickAccess;
