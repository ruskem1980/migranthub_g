'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, ArrowRight, ArrowLeft, Check, ExternalLink } from 'lucide-react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useTranslation } from '@/lib/i18n';

export default function LegalPage() {
  const router = useRouter();
  const { t, isReady } = useTranslation();

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    legalOnly: false,
  });

  const toggleAgreement = (key: keyof typeof agreements) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const allAgreed = agreements.terms && agreements.privacy && agreements.legalOnly;

  const handleContinue = () => {
    if (allAgreed) {
      // Save agreement status to localStorage
      localStorage.setItem('migranthub-legal-agreed', 'true');
      router.push('/auth/phone');
    }
  };

  const handleBack = () => {
    router.push('/welcome');
  };

  // Prevent hydration mismatch
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">{t('common.back')}</span>
        </button>
        <LanguageSwitcher className="bg-gray-100 hover:bg-gray-200" />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 py-8 overflow-y-auto">
        {/* Icon and Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-yellow-600" strokeWidth={2} />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            {t('legal.title')}
          </h1>

          <p className="text-gray-500 text-center max-w-sm">
            {t('legal.subtitle')}
          </p>
        </div>

        {/* Legal Warning Card */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-5 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold text-yellow-900 mb-1">
                {t('legal.warning.title')}
              </h3>
              <p className="text-sm text-yellow-800 leading-relaxed">
                {t('legal.warning.description')}
              </p>
            </div>
          </div>
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Open terms in new tab or modal
                }}
                className="flex items-center gap-1 text-blue-600 text-sm font-medium mt-2 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
                {t('legal.readMore')}
              </button>
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Open privacy policy in new tab or modal
                }}
                className="flex items-center gap-1 text-blue-600 text-sm font-medium mt-2 hover:text-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
                {t('legal.readMore')}
              </button>
            </div>
          </button>

          {/* Legal Actions Only */}
          <button
            onClick={() => toggleAgreement('legalOnly')}
            className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
              agreements.legalOnly
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                agreements.legalOnly ? 'bg-green-600 border-green-600' : 'border-gray-300'
              }`}
            >
              {agreements.legalOnly && <Check className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 mb-1">
                {t('legal.agreements.legalOnly.title')}
              </h4>
              <p className="text-sm text-gray-600">
                {t('legal.agreements.legalOnly.description')}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Button */}
      <div className="px-6 py-4 bg-white border-t border-gray-200">
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
