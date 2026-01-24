'use client';

import { useRouter } from 'next/navigation';
import { Check, ArrowRight, Shield, FileText, Bell, Map } from 'lucide-react';
import { useTranslation, LANGUAGES, Language } from '@/lib/i18n';

export default function WelcomePage() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();

  const handleLanguageSelect = (code: Language) => {
    setLanguage(code);
  };

  const handleContinue = () => {
    if (language) {
      router.push('/auth/legal');
    }
  };

  // Features shown in the selected language
  const features = [
    {
      icon: Shield,
      title: t('welcome.features.legal.title'),
      description: t('welcome.features.legal.description'),
    },
    {
      icon: FileText,
      title: t('welcome.features.documents.title'),
      description: t('welcome.features.documents.description'),
    },
    {
      icon: Bell,
      title: t('welcome.features.notifications.title'),
      description: t('welcome.features.notifications.description'),
    },
    {
      icon: Map,
      title: t('welcome.features.map.title'),
      description: t('welcome.features.map.description'),
    },
  ];

  return (
    <div className="h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 flex flex-col items-center pt-6 pb-4 px-6 text-white">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
          <span className="text-3xl">🛡️</span>
        </div>

        <h1 className="text-2xl font-bold mb-1 text-center">MigrantHub</h1>

        <p className="text-xs text-center text-blue-100 max-w-sm leading-relaxed">
          {t('welcome.tagline')}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 bg-white rounded-t-3xl flex flex-col">
        <div className="flex-1 min-h-0 px-6 pt-4 pb-24 overflow-y-auto">
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
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">
              {t('welcome.whatCanDo')}
            </h2>

            <div className="space-y-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Fixed Footer with Button */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-white border-t border-gray-100 safe-area-bottom">
        <button
          onClick={handleContinue}
          disabled={!language}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {t('common.continue')}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
