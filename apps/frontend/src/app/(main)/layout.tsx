'use client';

import { type ReactNode } from 'react';
import { BottomNavigation } from '@/components/ui';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
      <BottomNavigation />
    </div>
  );
}
