'use client';

import { useRouter } from 'next/navigation';
import { Check, ArrowRight, Shield, FileText, Bell, Map } from 'lucide-react';
import { LANGUAGES, Language } from '@/lib/stores/languageStore';
import { useTranslation } from '@/lib/i18n';

export default function WelcomePage() {
  const router = useRouter();
  const { language, setLanguage, t, isReady } = useTranslation();

  console.log('[WelcomePage] language:', language, 'isReady:', isReady, 't(common.continue):', t('common.continue'));

  const handleLanguageSelect = (code: Language) => {
    console.log('[WelcomePage] Language selected:', code);
    setLanguage(code);
  };

  const handleContinue = () => {
    router.push('/legal');
  };

  // Prevent hydration mismatch
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
            <span className="text-4xl">🛡️</span>
          </div>
          <h1 className="text-3xl font-bold">MigrantHub</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center pt-8 pb-6 px-6 text-white">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
          <span className="text-4xl">🛡️</span>
        </div>

        <h1 className="text-3xl font-bold mb-2 text-center">MigrantHub</h1>

        <p className="text-sm text-center text-blue-100 max-w-sm leading-relaxed">
          {t('welcome.tagline')}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-t-3xl px-6 pt-6 pb-8 overflow-y-auto">
        {/* Language Selection */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            {t('welcome.selectLanguage')}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  language === lang.code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="flex-1 text-left font-semibold text-gray-900">
                  {lang.nativeName}
                </span>
                {language === lang.code && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* App Description - Features */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            {t('welcome.whatCanDo')}
          </h2>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {t('welcome.features.legal.title')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('welcome.features.legal.description')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {t('welcome.features.documents.title')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('welcome.features.documents.description')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {t('welcome.features.notifications.title')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('welcome.features.notifications.description')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Map className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {t('welcome.features.map.title')}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('welcome.features.map.description')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 transition-colors"
        >
          {t('common.continue')}
          <ArrowRight className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
}
