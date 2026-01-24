'use client';

import { useState } from 'react';
import { ProfilingScreen } from './onboarding/ProfilingScreen';
import { AuditScreen } from './onboarding/AuditScreen';
import { RoadmapScreen } from './onboarding/RoadmapScreen';
import { DashboardLayout } from './DashboardLayout';

type Screen = 'profiling' | 'audit' | 'roadmap' | 'dashboard';

export function AppPrototype() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('profiling');
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

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
          onComplete={() => setCurrentScreen('dashboard')}
        />;

      case 'dashboard':
        return <DashboardLayout />;

      default:
        return <ProfilingScreen onNext={() => setCurrentScreen('audit')} />;
    }
  };

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
