'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShieldAlert, CreditCard, FileCheck, Hash } from 'lucide-react';
import { SectionHeader, QuickActionCard } from '@/components/ui';
import { BanChecker } from '@/features/services/components/BanChecker';
import { PassportValidityModal } from '@/components/prototype/services/PassportValidityModal';
import { PatentCheckModal } from '@/components/prototype/services/PatentCheckModal';
import { InnCheckModal } from '@/components/prototype/services/InnCheckModal';
import { useTranslation } from '@/lib/i18n';

type ActiveCheck = 'ban' | 'passport' | 'patent' | 'inn' | null;

interface CheckItem {
  id: ActiveCheck;
  icon: typeof ShieldAlert;
  title: string;
  variant: 'default' | 'primary' | 'warning' | 'danger';
}

/**
 * ChecksSection - shows available verification services for anonymous users
 * - Entry ban check
 * - Passport validity check
 * - Patent check
 * - INN lookup
 */
export function ChecksSection() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [activeCheck, setActiveCheck] = useState<ActiveCheck>(null);

  // Section title with fallback
  const sectionTitle = language === 'ru' ? 'Проверки' : 'Checks';

  const checks: CheckItem[] = [
    {
      id: 'ban',
      icon: ShieldAlert,
      title: t('services.banCheck.title'),
      variant: 'warning',
    },
    {
      id: 'passport',
      icon: CreditCard,
      title: t('services.items.passportValidity.title'),
      variant: 'default',
    },
    {
      id: 'patent',
      icon: FileCheck,
      title: t('services.patentCheck.title'),
      variant: 'default',
    },
    {
      id: 'inn',
      icon: Hash,
      title: language === 'ru' ? 'Проверка ИНН' : 'INN Check',
      variant: 'default',
    },
  ];

  return (
    <section>
      <SectionHeader
        icon={Search}
        title={sectionTitle}
        action={{
          label: t('common.all'),
          onClick: () => router.push('/services'),
        }}
      />
      <div className="grid grid-cols-2 gap-3 mt-3">
        {checks.map((check) => (
          <QuickActionCard
            key={check.id}
            icon={check.icon}
            title={check.title}
            onClick={() => setActiveCheck(check.id)}
            variant={check.variant}
          />
        ))}
      </div>

      {/* Ban Check Modal */}
      {activeCheck === 'ban' && (
        <BanChecker onClose={() => setActiveCheck(null)} />
      )}

      {/* Passport Validity Modal */}
      {activeCheck === 'passport' && (
        <PassportValidityModal onClose={() => setActiveCheck(null)} />
      )}

      {/* Patent Check Modal */}
      {activeCheck === 'patent' && (
        <PatentCheckModal onClose={() => setActiveCheck(null)} />
      )}

      {/* INN Check Modal */}
      {activeCheck === 'inn' && (
        <InnCheckModal onClose={() => setActiveCheck(null)} />
      )}
    </section>
  );
}

export default ChecksSection;
