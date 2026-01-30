'use client';

import { Header } from './Header';
import { SOSQuickAccess } from './SOSQuickAccess';
import { CalculatorsSection } from './CalculatorsSection';
import { ChecksSection } from './ChecksSection';
import { UsefulSection } from './UsefulSection';
import { ConversionBanner } from '@/components/ui';
import { QuickRegistrationSheet } from '@/components/registration/QuickRegistrationSheet';
import { useQuickRegistration } from '@/hooks/useQuickRegistration';
import { useTranslation } from '@/lib/i18n';

/**
 * AnonymousDashboard - Main screen for anonymous users
 *
 * Shows app value immediately without registration:
 * - SOS quick access (always at top)
 * - Calculators (90/180 days, patent cost)
 * - Verification services (ban check, passport, patent, INN)
 * - Useful resources (checklist, exam, AI, rights)
 * - Conversion banner to encourage registration
 */
export function AnonymousDashboard() {
  const { language } = useTranslation();
  const quickReg = useQuickRegistration();

  // Conversion banner texts with fallbacks
  const bannerTitle = language === 'ru' ? 'Создайте профиль' : 'Create Profile';
  const bannerDescription = language === 'ru'
    ? 'Сохраняйте результаты и получайте напоминания'
    : 'Save results and get reminders';
  const bannerCta = language === 'ru' ? 'Создать' : 'Create';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />

      <main className="p-4 space-y-6">
        {/* SOS Quick Access - Always at top */}
        <SOSQuickAccess />

        {/* Calculators Section */}
        <CalculatorsSection />

        {/* Checks Section */}
        <ChecksSection />

        {/* Useful Section */}
        <UsefulSection />

        {/* Conversion Banner */}
        <ConversionBanner
          variant="subtle"
          title={bannerTitle}
          description={bannerDescription}
          ctaLabel={bannerCta}
          onCtaClick={() => quickReg.open('general')}
        />
      </main>

      {/* Quick Registration Sheet */}
      <QuickRegistrationSheet
        isOpen={quickReg.isOpen}
        onClose={quickReg.close}
        onComplete={() => {
          quickReg.close();
          // After registration, user will see PersonalDashboard
          // The routing is handled by the parent component based on auth state
        }}
        trigger={quickReg.trigger || 'general'}
        prefillData={quickReg.prefillData || undefined}
      />
    </div>
  );
}

export default AnonymousDashboard;
