'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/lib/stores';
import {
  Home,
  FileText,
  ClipboardList,
  Search,
  AlertTriangle,
  User,
  LogIn,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  highlight?: boolean;
}

// Navigation items for anonymous users
const anonymousItems: NavItem[] = [
  { href: '/', labelKey: 'nav.home', icon: Home },
  { href: '/checklist', labelKey: 'nav.checklist', icon: ClipboardList },
  { href: '/checks', labelKey: 'nav.checks', icon: Search },
  { href: '/sos', labelKey: 'nav.sos', icon: AlertTriangle, highlight: true },
  { href: '/login', labelKey: 'nav.login', icon: LogIn },
];

// Navigation items for registered users
const registeredItems: NavItem[] = [
  { href: '/', labelKey: 'nav.home', icon: Home },
  { href: '/documents', labelKey: 'nav.documents', icon: FileText },
  { href: '/checks', labelKey: 'nav.checks', icon: Search },
  { href: '/sos', labelKey: 'nav.sos', icon: AlertTriangle, highlight: true },
  { href: '/profile', labelKey: 'nav.profile', icon: User },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { isAnonymous } = useAuthStore();

  const items = isAnonymous ? anonymousItems : registeredItems;

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/' || pathname === '/prototype';
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
        {items.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          const isHighlighted = item.highlight && !active;

          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active
                  ? 'text-primary'
                  : isHighlighted
                    ? 'text-red-500 hover:text-red-600'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
              aria-current={active ? 'page' : undefined}
              aria-label={t(item.labelKey)}
            >
              <Icon
                className={`w-6 h-6 ${active ? 'stroke-[2.5]' : 'stroke-[1.5]'} ${
                  isHighlighted ? 'animate-pulse' : ''
                }`}
                aria-hidden="true"
              />
              <span className={`text-xs mt-1 font-medium ${isHighlighted ? 'text-red-500' : ''}`}>
                {t(item.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavigation;
