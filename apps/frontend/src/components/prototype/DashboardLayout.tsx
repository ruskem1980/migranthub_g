'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Wallet, LayoutGrid, Bot, Siren, RefreshCw, Cloud, CloudOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useOnlineStatus } from '@/lib/hooks';
import { HomeScreen } from './dashboard/HomeScreen';
import { DocumentsScreen } from './dashboard/DocumentsScreen';
import { ServicesScreen } from './dashboard/ServicesScreen';
import { AssistantScreen } from './dashboard/AssistantScreen';
import { SOSScreen } from './dashboard/SOSScreen';

type TabId = 'home' | 'documents' | 'services' | 'assistant' | 'sos';

export function DashboardLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();
  const { pendingCount, isSyncing, sync } = useOfflineQueue();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    setMounted(true);
  }, []);

  const tabs = [
    {
      id: 'home' as TabId,
      label: t('dashboard.tabs.home'),
      icon: ShieldCheck,
    },
    {
      id: 'documents' as TabId,
      label: t('dashboard.tabs.documents'),
      icon: Wallet,
    },
    {
      id: 'services' as TabId,
      label: t('dashboard.tabs.services'),
      icon: LayoutGrid,
    },
    {
      id: 'assistant' as TabId,
      label: t('dashboard.tabs.assistant'),
      icon: Bot,
    },
    {
      id: 'sos' as TabId,
      label: t('dashboard.tabs.sos'),
      icon: Siren,
    },
  ];

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
      {/* Sync Status Bar */}
      {mounted && (!isOnline || pendingCount > 0) && (
        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-2 safe-area-top">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Cloud className="w-4 h-4 text-blue-500" />
              ) : (
                <CloudOff className="w-4 h-4 text-orange-500" />
              )}
              <span className="text-sm text-gray-600">
                {!isOnline
                  ? t('sync.offline')
                  : pendingCount > 0
                    ? t('sync.pending', { count: pendingCount })
                    : t('sync.synced')}
              </span>
            </div>
            {isOnline && pendingCount > 0 && (
              <button
                onClick={() => sync()}
                disabled={isSyncing}
                className={cn(
                  'flex items-center gap-1 px-3 py-1 text-sm font-medium rounded-full transition-colors',
                  isSyncing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200 active:bg-blue-300'
                )}
              >
                <RefreshCw
                  className={cn('w-3.5 h-3.5', isSyncing && 'animate-spin')}
                />
                {isSyncing ? t('sync.syncing') : t('sync.syncNow')}
              </button>
            )}
            {pendingCount > 0 && (
              <span className="ml-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-orange-500 rounded-full">
                {pendingCount}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      <main className="flex-1 min-h-0 overflow-y-auto">
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
