'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import {
  Home,
  FileText,
  Wrench,
  Calculator,
  User
} from 'lucide-react';

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/prototype', labelKey: 'nav.home', icon: Home },
  { href: '/documents', labelKey: 'nav.documents', icon: FileText },
  { href: '/services', labelKey: 'nav.services', icon: Wrench },
  { href: '/calculator', labelKey: 'nav.calculator', icon: Calculator },
  { href: '/profile', labelKey: 'nav.profile', icon: User },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const isActive = (href: string) => {
    if (href === '/prototype') {
      return pathname === '/prototype' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50"
      role="navigation"
      aria-label={t('nav.main')}
    >
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-current={active ? 'page' : undefined}
              aria-label={t(item.labelKey)}
            >
              <Icon
                className={`w-6 h-6 ${active ? 'stroke-[2.5]' : 'stroke-[1.5]'}`}
                aria-hidden="true"
              />
              <span className="text-xs mt-1 font-medium">
                {t(item.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavigation;
