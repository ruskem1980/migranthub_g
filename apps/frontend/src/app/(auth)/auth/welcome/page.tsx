'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ArrowRight, Shield, FileText, Bell, Map } from 'lucide-react';
import { useTranslation, LANGUAGES, Language } from '@/lib/i18n';

export default function WelcomePage() {
  const router = useRouter();
  const { t, language, setLanguage: setAppLanguage } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);

  const handleLanguageSelect = (code: Language) => {
    setSelectedLanguage(code);
    // Immediately apply language change for preview
    setAppLanguage(code);
  };

  const handleContinue = () => {
    if (selectedLanguage) {
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
                  selectedLanguage === lang.code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="flex-1 text-left font-semibold text-gray-900">
                  {lang.nativeName}
                </span>
                {selectedLanguage === lang.code && (
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

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={!selectedLanguage}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-4 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {t('common.continue')}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
