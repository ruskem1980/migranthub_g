'use client';

import { useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useTranslation, Language, LANGUAGES } from '@/lib/i18n';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'list' | 'compact';
  className?: string;
}

export function LanguageSwitcher({ variant = 'dropdown', className = '' }: LanguageSwitcherProps) {
  const { language, setLanguage, getLanguageInfo } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = getLanguageInfo(language);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  // Compact variant - just shows current language with flag
  if (variant === 'compact') {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors ${className}`}
        >
          <span className="text-lg">{currentLang.flag}</span>
          <span className="text-sm font-medium">{currentLang.code.toUpperCase()}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-[70] min-w-[160px]">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(lang.code);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                    lang.code === language ? 'bg-blue-50' : ''
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="flex-1 text-left text-sm">{lang.nativeName}</span>
                  {lang.code === language && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // List variant - shows all languages in a vertical list
  if (variant === 'list') {
    return (
      <div className={`space-y-2 ${className}`}>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
              lang.code === language
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <span className="text-3xl">{lang.flag}</span>
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-900">{lang.nativeName}</div>
              <div className="text-sm text-gray-500">{lang.name}</div>
            </div>
            {lang.code === language && (
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
      >
        <Globe className="w-5 h-5 text-gray-600" />
        <span className="text-lg">{currentLang.flag}</span>
        <span className="font-medium">{currentLang.nativeName}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-[70] min-w-[200px]">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(lang.code);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  lang.code === language ? 'bg-blue-50' : ''
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-xs text-gray-500">{lang.name}</div>
                </div>
                {lang.code === language && <Check className="w-5 h-5 text-blue-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default LanguageSwitcher;
