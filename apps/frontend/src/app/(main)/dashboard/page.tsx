'use client';

import { HomeScreen } from '@/components/prototype/dashboard/HomeScreen';

export default function DashboardPage() {
  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <HomeScreen />
    </div>
  );
}
