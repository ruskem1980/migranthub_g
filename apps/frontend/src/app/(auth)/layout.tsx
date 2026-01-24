'use client';

import { type ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Logo */}
      <div className="pt-12 pb-6 px-6 text-center">
        <div className="w-20 h-20 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4">
          <span className="text-4xl">🏠</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">MigrantHub</h1>
        <p className="text-gray-500 text-sm mt-1">Помощник мигранта</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 overflow-y-auto">
        {children}
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <p className="text-xs text-gray-400">
          Продолжая, вы соглашаетесь с{' '}
          <a href="/terms" className="text-blue-600 underline">условиями использования</a>
          {' '}и{' '}
          <a href="/privacy" className="text-blue-600 underline">политикой конфиденциальности</a>
        </p>
      </div>
    </div>
  );
}
