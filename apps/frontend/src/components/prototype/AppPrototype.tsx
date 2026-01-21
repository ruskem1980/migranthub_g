'use client';

import { useState } from 'react';
import { WelcomeScreen } from './onboarding/WelcomeScreen';
import { LegalScreen } from './onboarding/LegalScreen';
import { ProfilingScreen } from './onboarding/ProfilingScreen';
import { AuditScreen } from './onboarding/AuditScreen';
import { RoadmapScreen } from './onboarding/RoadmapScreen';
import { DashboardLayout } from './DashboardLayout';

type Screen = 'welcome' | 'legal' | 'profiling' | 'audit' | 'roadmap' | 'dashboard';

export function AppPrototype() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onNext={() => setCurrentScreen('legal')} />;
      
      case 'legal':
        return <LegalScreen onNext={() => setCurrentScreen('profiling')} />;
      
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
        return <WelcomeScreen onNext={() => setCurrentScreen('legal')} />;
    }
  };

  return (
    <div className="relative">
      {renderScreen()}
      
      {/* Debug Navigation (Remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-2 right-2 z-50 bg-black/80 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg shadow-xl">
          <div className="flex flex-col gap-1">
            <button onClick={() => setCurrentScreen('welcome')} className="hover:text-blue-400">
              1. Welcome
            </button>
            <button onClick={() => setCurrentScreen('legal')} className="hover:text-blue-400">
              2. Legal
            </button>
            <button onClick={() => setCurrentScreen('profiling')} className="hover:text-blue-400">
              3. Profiling
            </button>
            <button onClick={() => setCurrentScreen('audit')} className="hover:text-blue-400">
              4. Audit
            </button>
            <button onClick={() => setCurrentScreen('roadmap')} className="hover:text-blue-400">
              5. Roadmap
            </button>
            <button onClick={() => setCurrentScreen('dashboard')} className="hover:text-blue-400">
              6. Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
