'use client';

import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

/**
 * Header component for anonymous dashboard
 * Contains logo and language switcher
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-semibold text-gray-900">MigrantHub</span>
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher variant="compact" />
      </div>
    </header>
  );
}

export default Header;
