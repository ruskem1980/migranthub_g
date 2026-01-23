'use client';

import { type ReactNode } from 'react';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useTranslation } from '@/lib/i18n';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { t, isReady } = useTranslation();

  // Loading state while language is loading
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
            <span className="text-4xl">🏠</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MigrantHub</h1>
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher className="bg-white/80 hover:bg-white shadow-sm" />
      </div>

      {/* Logo */}
      <div className="pt-12 pb-6 px-6 text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
          <span className="text-4xl">🏠</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">MigrantHub</h1>
        <p className="text-gray-500 text-sm mt-1">{t('app.tagline')}</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6">
        {children}
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-xs text-gray-400">
          {t('auth.footer.agreement')}{' '}
          <a href="/terms" className="text-blue-600 underline">{t('auth.footer.terms')}</a>
          {' '}{t('common.and')}{' '}
          <a href="/privacy" className="text-blue-600 underline">{t('auth.footer.privacy')}</a>
        </p>
      </div>
    </div>
  );
}
