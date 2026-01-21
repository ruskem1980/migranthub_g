'use client';

import { useState } from 'react';
import { ShieldCheck, Wallet, LayoutGrid, Bot, Siren } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HomeScreen } from './dashboard/HomeScreen';
import { DocumentsScreen } from './dashboard/DocumentsScreen';
import { ServicesScreen } from './dashboard/ServicesScreen';
import { AssistantScreen } from './dashboard/AssistantScreen';
import { SOSScreen } from './dashboard/SOSScreen';

type TabId = 'home' | 'documents' | 'services' | 'assistant' | 'sos';

const tabs = [
  {
    id: 'home' as TabId,
    label: 'Главная',
    icon: ShieldCheck,
  },
  {
    id: 'documents' as TabId,
    label: 'Документы',
    icon: Wallet,
  },
  {
    id: 'services' as TabId,
    label: 'Сервисы',
    icon: LayoutGrid,
  },
  {
    id: 'assistant' as TabId,
    label: 'Ассистент',
    icon: Bot,
  },
  {
    id: 'sos' as TabId,
    label: 'SOS',
    icon: Siren,
  },
];

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'documents':
        return <DocumentsScreen />;
      case 'services':
        return <ServicesScreen />;
      case 'assistant':
        return <AssistantScreen />;
      case 'sos':
        return <SOSScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Content Area */}
      <main className="flex-1 overflow-hidden">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="flex-shrink-0 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isSOS = tab.id === 'sos';

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full transition-all duration-200',
                  'active:scale-95 focus:outline-none rounded-lg',
                  isActive && 'scale-105'
                )}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 mb-1 transition-colors',
                    isActive
                      ? isSOS
                        ? 'text-red-600'
                        : 'text-blue-600'
                      : 'text-gray-600'
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
    </div>
  );
}
