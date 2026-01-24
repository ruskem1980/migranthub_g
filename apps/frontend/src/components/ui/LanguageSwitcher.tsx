'use client';

import { useState } from 'react';
import { Globe, Check, ChevronDown, X, Search } from 'lucide-react';
import { useTranslation, Language, LANGUAGES } from '@/lib/i18n';
import { EXTENDED_LANGUAGES } from '@/lib/stores/languageStore';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'list' | 'compact';
  className?: string;
}

export function LanguageSwitcher({ variant = 'dropdown', className = '' }: LanguageSwitcherProps) {
  const { language, setLanguage, getLanguageInfo } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentLang = getLanguageInfo(language);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
    setShowModal(false);
    setSearchQuery('');
  };

  // Filter out languages already shown in main buttons, then apply search
  const mainLanguageCodes = LANGUAGES.map((l) => l.code);
  const filteredLanguages = EXTENDED_LANGUAGES.filter(
    (lang) =>
      !mainLanguageCodes.includes(lang.code) &&
      (lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Compact variant - just shows current language with flag
  if (variant === 'compact') {
    return (
      <div className="relative">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer ${className}`}
        >
          <span className="text-lg">{currentLang.flag}</span>
          <span className="text-sm font-medium">{currentLang.code.toUpperCase()}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-[70] min-w-[160px]">
              {LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(lang.code);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                    lang.code === language ? 'bg-blue-50' : ''
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="flex-1 text-left text-sm">{lang.nativeName}</span>
                  {lang.code === language && <Check className="w-4 h-4 text-blue-600" />}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // List variant - shows all languages in a 2-column grid with "More" button
  if (variant === 'list') {
    // Check if current language is not in main list
    const isCustomLanguage = !LANGUAGES.find((l) => l.code === language);
    const customLangInfo = isCustomLanguage ? getLanguageInfo(language) : null;

    return (
      <>
        <div className={`grid grid-cols-2 gap-2 ${className}`}>
          {LANGUAGES.map((lang) => (
            <div
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                lang.code === language
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div className="flex-1 text-left min-w-0">
                <div className="font-semibold text-gray-900 text-sm truncate">{lang.nativeName}</div>
              </div>
              {lang.code === language && (
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* 6th button - Choose language / Show selected custom language */}
          <div
            onClick={() => setShowModal(true)}
            className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
              isCustomLanguage
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {isCustomLanguage && customLangInfo ? (
              <>
                <span className="text-2xl">{customLangInfo.flag}</span>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">{customLangInfo.nativeName}</div>
                </div>
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </>
            ) : (
              <>
                <Globe className="w-6 h-6 text-gray-400" />
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-gray-500 text-sm">Другой...</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal with all 50 languages */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <div className="fixed inset-0 bg-black/50" onClick={() => { setShowModal(false); setSearchQuery(''); }} />
            <div className="relative w-full max-w-lg bg-white rounded-t-3xl max-h-[85vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Выберите язык</h3>
                <div
                  onClick={() => { setShowModal(false); setSearchQuery(''); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </div>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Поиск языка..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Language list */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-2">
                  {filteredLanguages.map((lang) => (
                    <div
                      key={lang.code}
                      onClick={() => handleSelect(lang.code)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${
                        lang.code === language
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{lang.nativeName}</div>
                        <div className="text-xs text-gray-500 truncate">{lang.name}</div>
                      </div>
                      {lang.code === language && (
                        <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
                {filteredLanguages.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    Язык не найден
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default dropdown variant
  return (
    <div className={`relative ${className}`}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <Globe className="w-5 h-5 text-gray-600" />
        <span className="text-lg">{currentLang.flag}</span>
        <span className="font-medium">{currentLang.nativeName}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-[70] min-w-[200px]">
            {LANGUAGES.map((lang) => (
              <div
                key={lang.code}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(lang.code);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                  lang.code === language ? 'bg-blue-50' : ''
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-xs text-gray-500">{lang.name}</div>
                </div>
                {lang.code === language && <Check className="w-5 h-5 text-blue-600" />}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default LanguageSwitcher;
