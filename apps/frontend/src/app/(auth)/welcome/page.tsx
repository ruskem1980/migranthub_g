'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, ExternalLink, Key } from 'lucide-react';
import { useTranslation, LANGUAGES } from '@/lib/i18n';
import { type Language } from '@/lib/stores/languageStore';

export default function WelcomePage() {
  const router = useRouter();
  const { t, language, setLanguage } = useTranslation();
  const [agreed, setAgreed] = useState(false);

  const handleLanguageSelect = (code: Language) => {
    setLanguage(code);
  };

  const handleContinue = () => {
    if (agreed) {
      localStorage.setItem('migranthub-welcome-completed', 'true');
      localStorage.setItem('migranthub-legal-agreed', 'true');
      router.push('/auth/method');
    }
  };

  // Убрали проверку isReady - страница должна рендериться сразу

  return (
    <div className="h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-8 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-3xl">🛡️</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">MigrantHub</h1>
            <p className="text-white/70 text-sm">{t('app.tagline')}</p>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 pb-32">
        {/* Language Selection */}
        <div className="mb-6">
          <h2 className="text-white font-semibold text-lg mb-3">{t('welcome.selectLanguage')}</h2>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                  lang.code === language
                    ? 'bg-white shadow-lg'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <span className="text-3xl">{lang.flag}</span>
                <span className={`text-xs font-medium ${
                  lang.code === language ? 'text-gray-900' : 'text-white'
                }`}>
                  {lang.nativeName}
                </span>
                {lang.code === language && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Mission Statements */}
        <div className="space-y-3 mb-6">
          <h2 className="text-white font-semibold text-lg">{t('welcome.whyUs')}</h2>

          {/* Life without fear */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🛡️</span>
              <div>
                <h3 className="font-bold text-white text-base">{t('welcome.benefits.safety.title')}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{t('welcome.benefits.safety.description')}</p>
              </div>
            </div>
          </div>

          {/* Native language */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🗣️</span>
              <div>
                <h3 className="font-bold text-white text-base">{t('welcome.benefits.language.title')}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{t('welcome.benefits.language.description')}</p>
              </div>
            </div>
          </div>

          {/* Save money */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">💰</span>
              <div>
                <h3 className="font-bold text-white text-base">{t('welcome.benefits.savings.title')}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{t('welcome.benefits.savings.description')}</p>
              </div>
            </div>
          </div>

          {/* Technology */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🤖</span>
              <div>
                <h3 className="font-bold text-white text-base">{t('welcome.benefits.technology.title')}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{t('welcome.benefits.technology.description')}</p>
              </div>
            </div>
          </div>

          {/* Honesty */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🤝</span>
              <div>
                <h3 className="font-bold text-white text-base">{t('welcome.benefits.honesty.title')}</h3>
                <p className="text-white/80 text-sm leading-relaxed">{t('welcome.benefits.honesty.description')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <button
          onClick={() => setAgreed(!agreed)}
          className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${
            agreed
              ? 'border-green-400 bg-green-500/20'
              : 'border-white/30 bg-white/10'
          }`}
        >
          <div
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all mt-0.5 ${
              agreed ? 'bg-green-500 border-green-500' : 'border-white/50'
            }`}
          >
            {agreed && <Check className="w-4 h-4 text-white" />}
          </div>
          <div className="flex-1">
            <p className="text-white text-sm leading-relaxed">
              {t('welcome.agreement.text')}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              <span
                onClick={(e) => { e.stopPropagation(); }}
                className="flex items-center gap-1 text-blue-300 text-xs font-medium hover:text-blue-200 cursor-pointer"
              >
                <ExternalLink className="w-3 h-3" />
                {t('welcome.agreement.terms')}
              </span>
              <span
                onClick={(e) => { e.stopPropagation(); }}
                className="flex items-center gap-1 text-blue-300 text-xs font-medium hover:text-blue-200 cursor-pointer"
              >
                <ExternalLink className="w-3 h-3" />
                {t('welcome.agreement.privacy')}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 px-6 py-4 bg-gradient-to-t from-blue-800 via-blue-800/95 to-transparent pt-8">
        {/* Recovery Link */}
        <Link
          href="/recovery"
          className="flex items-center justify-center gap-2 text-white/70 hover:text-white mb-3 text-sm transition-colors"
        >
          <Key className="w-4 h-4" />
          {t('recovery.alreadyHaveCode')}
        </Link>

        {/* Get Started Button */}
        <button
          onClick={handleContinue}
          disabled={!agreed}
          className={`w-full flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-all text-lg ${
            agreed
              ? 'bg-white text-blue-600 hover:bg-gray-100 active:scale-[0.98] shadow-lg'
              : 'bg-white/30 text-white/50 cursor-not-allowed'
          }`}
        >
          {t('welcome.getStarted')}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
