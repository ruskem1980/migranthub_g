'use client';

import { useState } from 'react';
import { BottomNav, TabId } from './BottomNav';
import { HomeTab } from './tabs/HomeTab';
import { DocumentsTab } from './tabs/DocumentsTab';
import { ServicesTab } from './tabs/ServicesTab';
import { AssistantTab } from './tabs/AssistantTab';
import { SOSTab } from './tabs/SOSTab';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('home');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'documents':
        return <DocumentsTab />;
      case 'services':
        return <ServicesTab />;
      case 'assistant':
        return <AssistantTab />;
      case 'sos':
        return <SOSTab />;
      default:
        return <HomeTab />;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Main Content Area - Zero Scroll Container */}
      <main className="flex-1 overflow-hidden">
        {renderActiveTab()}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
