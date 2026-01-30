'use client';

import { useAuthStore } from '@/lib/stores';
import { AnonymousDashboard } from '@/components/anonymous';
import { PersonalDashboard } from '@/components/personal';

/**
 * Main Home Page
 *
 * Lazy Auth Flow:
 * - Anonymous users see AnonymousDashboard
 * - Registered users see PersonalDashboard
 */
export default function HomePage() {
  const { isAnonymous } = useAuthStore();

  // Show appropriate dashboard based on auth state
  if (isAnonymous) {
    return <AnonymousDashboard />;
  }

  return <PersonalDashboard />;
}
