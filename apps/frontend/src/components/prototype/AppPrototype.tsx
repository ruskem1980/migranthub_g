'use client';

import { useState, useEffect } from 'react';
import { ProfilingScreen } from './onboarding/ProfilingScreen';
import { AuditScreen } from './onboarding/AuditScreen';
import { RoadmapScreen } from './onboarding/RoadmapScreen';
import { DashboardLayout } from './DashboardLayout';

type Screen = 'profiling' | 'audit' | 'roadmap' | 'dashboard';

const ONBOARDING_COMPLETE_KEY = 'migranthub-onboarding-complete';

export function AppPrototype() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('profiling');
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Check if onboarding was completed before
  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_COMPLETE_KEY);
    if (completed === 'true') {
      setCurrentScreen('dashboard');
    }
    setIsHydrated(true);
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'profiling':
        return <ProfilingScreen onNext={() => setCurrentScreen('audit')} />;

      case 'audit':
        return <AuditScreen onNext={(items) => {
          setCheckedItems(items);
          setCurrentScreen('roadmap');
        }} />;

      case 'roadmap':
        return <RoadmapScreen
          checkedItems={checkedItems}
          onComplete={() => {
            localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
            setCurrentScreen('dashboard');
          }}
        />;

      case 'dashboard':
        return <DashboardLayout />;

      default:
        return <ProfilingScreen onNext={() => setCurrentScreen('audit')} />;
    }
  };

  // Show nothing until hydrated to prevent flash of profiling screen
  if (!isHydrated) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="relative">
      {renderScreen()}

      {/* Debug Navigation (Remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-2 right-2 z-50 bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg shadow-xl">
          <div className="flex flex-col gap-1">
            <button onClick={() => setCurrentScreen('profiling')} className="hover:text-blue-400">
              1. Profiling
            </button>
            <button onClick={() => setCurrentScreen('audit')} className="hover:text-blue-400">
              2. Audit
            </button>
            <button onClick={() => setCurrentScreen('roadmap')} className="hover:text-blue-400">
              3. Roadmap
            </button>
            <button onClick={() => setCurrentScreen('dashboard')} className="hover:text-blue-400">
              4. Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
