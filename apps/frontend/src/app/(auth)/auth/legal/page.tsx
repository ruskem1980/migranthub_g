'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, Check, ExternalLink } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

export default function LegalPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
  });

  const toggleAgreement = (key: keyof typeof agreements) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allAgreed = agreements.terms && agreements.privacy;

  const handleContinue = () => {
    if (allAgreed) {
      // Save agreement status to localStorage
      localStorage.setItem('migranthub-legal-agreed', 'true');
      router.push('/auth/method');
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header with Mission */}
      <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🛡️</span>
          </div>
          <h1 className="text-xl font-bold text-white">MigrantHub</h1>
        </div>
        <p className="text-white/90 text-sm leading-relaxed">
          {t('app.mission')}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 px-6 py-6 pb-24 overflow-y-auto">
        {/* Language Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">{t('welcome.selectLanguage')}</h2>
          <LanguageSwitcher variant="list" />
        </div>

        {/* Agreement Checkboxes */}
        <div className="space-y-4 mb-8">
          {/* Terms of Service */}
          <button
            onClick={() => toggleAgreement('terms')}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
              agreements.terms
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                agreements.terms ? 'bg-green-600 border-green-600' : 'border-gray-300'
              }`}
            >
              {agreements.terms && <Check className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                {t('legal.agreements.terms.title')}
              </h4>
              <p className="text-sm text-gray-600">
                {t('legal.agreements.terms.description')}
              </p>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  // Open terms in new tab or modal
                }}
                className="flex items-center gap-1 text-blue-600 text-sm font-medium mt-2 hover:text-blue-700 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                {t('legal.readMore')}
              </span>
            </div>
          </button>

          {/* Privacy Policy */}
          <button
            onClick={() => toggleAgreement('privacy')}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
              agreements.privacy
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                agreements.privacy ? 'bg-green-600 border-green-600' : 'border-gray-300'
              }`}
            >
              {agreements.privacy && <Check className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                {t('legal.agreements.privacy.title')}
              </h4>
              <p className="text-sm text-gray-600">
                {t('legal.agreements.privacy.description')}
              </p>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  // Open privacy policy in new tab or modal
                }}
                className="flex items-center gap-1 text-blue-600 text-sm font-medium mt-2 hover:text-blue-700 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                {t('legal.readMore')}
              </span>
            </div>
          </button>

        </div>
      </div>

      {/* Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-gray-200">
        <button
          onClick={handleContinue}
          disabled={!allAgreed}
          className={`w-full flex items-center justify-center gap-2 font-semibold py-4 rounded-xl transition-all ${
            allAgreed
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-98'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {t('common.continue')}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
