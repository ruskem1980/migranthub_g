'use client';

import { useMemo } from 'react';
import { useProfileStore } from '@/lib/stores';
import { useDeadlines } from '@/hooks/useDeadlines';
import { PersonalHeader } from './PersonalHeader';
import { LegalStatusCard, type LegalStatus } from './LegalStatusCard';
import { DeadlinesSection } from './DeadlinesSection';
import { DocumentsSection } from './DocumentsSection';
import { QuickActionsSection } from './QuickActionsSection';
import type { UserProfile } from '@/lib/stores/profileStore';
import type { Deadline } from './DeadlinesSection';

/**
 * Calculate legal status based on profile data and deadlines
 */
function calculateLegalStatus(
  profile: UserProfile | null,
  deadlines: Deadline[]
): { status: LegalStatus; daysRemaining: number | undefined } {
  // Default status if no profile
  if (!profile) {
    return { status: 'warning', daysRemaining: undefined };
  }

  // Calculate days remaining based on entry date (90-day rule)
  let daysRemaining: number | undefined;
  if (profile.entryDate) {
    const entryDate = new Date(profile.entryDate);
    const deadline = new Date(entryDate);
    deadline.setDate(deadline.getDate() + 90);
    const today = new Date();
    daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  // Check selected documents for status calculation
  const checkedDocs = profile.selectedDocuments || [];

  // Status logic based on documents
  if (checkedDocs.length >= 7) {
    return { status: 'legal', daysRemaining };
  }

  // Check for urgent deadlines
  const hasUrgentDeadline = deadlines.some((d) => d.urgent);

  // Check if any critical documents are missing for work purpose
  const criticalMissing =
    profile.purpose === 'work' &&
    (!checkedDocs.includes('patent') || !checkedDocs.includes('registration'));

  if (daysRemaining !== undefined && daysRemaining <= 0) {
    return { status: 'illegal', daysRemaining };
  }

  if (criticalMissing || hasUrgentDeadline || checkedDocs.length < 4) {
    return {
      status: daysRemaining !== undefined && daysRemaining <= 14 ? 'illegal' : 'warning',
      daysRemaining,
    };
  }

  if (checkedDocs.length >= 4) {
    return { status: daysRemaining !== undefined && daysRemaining <= 30 ? 'warning' : 'legal', daysRemaining };
  }

  return { status: 'warning', daysRemaining };
}

export function PersonalDashboard() {
  const profile = useProfileStore((state) => state.profile);
  const deadlines = useDeadlines();

  const { status, daysRemaining } = useMemo(
    () => calculateLegalStatus(profile, deadlines),
    [profile, deadlines]
  );

  // Find next deadline for status card
  const nextDeadline = deadlines.length > 0
    ? deadlines[0].date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      })
    : undefined;

  return (
    <div className="min-h-screen bg-background pb-20">
      <PersonalHeader />

      <main className="p-4 space-y-6">
        {/* Legal Status Card */}
        <LegalStatusCard
          status={status}
          daysRemaining={daysRemaining}
          nextDeadline={nextDeadline}
        />

        {/* Deadlines Section */}
        <DeadlinesSection deadlines={deadlines} />

        {/* Documents Section */}
        <DocumentsSection />

        {/* Quick Actions */}
        <QuickActionsSection />
      </main>
    </div>
  );
}

export default PersonalDashboard;
