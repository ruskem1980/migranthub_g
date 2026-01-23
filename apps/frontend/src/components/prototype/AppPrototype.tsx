'use client';

import { useState, useEffect } from 'react';
import { WelcomeScreen } from './onboarding/WelcomeScreen';
import { LegalScreen } from './onboarding/LegalScreen';
import { ProfilingScreen } from './onboarding/ProfilingScreen';
import { AuditScreen } from './onboarding/AuditScreen';
import { RoadmapScreen } from './onboarding/RoadmapScreen';
import { DashboardLayout } from './DashboardLayout';

type Screen = 'welcome' | 'legal' | 'profiling' | 'audit' | 'roadmap' | 'dashboard' | null;

export function AppPrototype() {
  const [currentScreen, setCurrentScreen] = useState<Screen | null>(null);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  // Determine starting screen based on completed steps
  useEffect(() => {
    const profileCompleted = localStorage.getItem('migranthub-profile-completed');

    if (profileCompleted) {
      // User completed profiling, go to dashboard
      setCurrentScreen('dashboard');
    } else {
      // Start from profiling (welcome/legal handled in auth flow)
      setCurrentScreen('profiling');
    }
  }, []);

  const renderScreen = () => {
    // Loading state - wait for useEffect to determine starting screen
    if (currentScreen === null) {
      return (
        <div className="h-screen bg-blue-600 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🛡️</span>
            </div>
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
          </div>
        </div>
      );
    }

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
