'use client';

import { ShieldCheck, Wallet, LayoutGrid, Bot, Siren } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'home' | 'documents' | 'services' | 'assistant' | 'sos';

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs = [
  {
    id: 'home' as TabId,
    label: 'Главная',
    icon: ShieldCheck,
    color: 'text-blue-600',
    activeColor: 'text-blue-600',
  },
  {
    id: 'documents' as TabId,
    label: 'Документы',
    icon: Wallet,
    color: 'text-gray-600',
    activeColor: 'text-blue-600',
  },
  {
    id: 'services' as TabId,
    label: 'Сервисы',
    icon: LayoutGrid,
    color: 'text-gray-600',
    activeColor: 'text-blue-600',
  },
  {
    id: 'assistant' as TabId,
    label: 'Ассистент',
    icon: Bot,
    color: 'text-gray-600',
    activeColor: 'text-blue-600',
  },
  {
    id: 'sos' as TabId,
    label: 'SOS',
    icon: Siren,
    color: 'text-gray-600',
    activeColor: 'text-red-600',
  },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-50">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isSOS = tab.id === 'sos';

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-all duration-200',
                'active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg',
                isActive && 'scale-105'
              )}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn(
                  'w-6 h-6 mb-1 transition-colors',
                  isActive
                    ? isSOS
                      ? tab.activeColor
                      : tab.activeColor
                    : tab.color
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  'text-xs font-medium transition-colors',
                  isActive
                    ? isSOS
                      ? 'text-red-600'
                      : 'text-blue-600'
                    : 'text-gray-600'
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
