'use client';

import { useState } from 'react';
import { Calculator, FileText } from 'lucide-react';
import { SectionHeader, QuickActionCard } from '@/components/ui';
import { StayCalculator } from '@/features/services/components/StayCalculator';
import { PatentCalculatorModal } from '@/components/prototype/services/PatentCalculatorModal';
import { useTranslation } from '@/lib/i18n';

type ActiveCalculator = '90_180' | 'patent' | null;

/**
 * CalculatorsSection - shows available calculators for anonymous users
 * - 90/180 days rule calculator
 * - Patent cost calculator
 */
export function CalculatorsSection() {
  const { t, language } = useTranslation();
  const [activeCalculator, setActiveCalculator] = useState<ActiveCalculator>(null);

  // Use existing translation keys with fallbacks
  const sectionTitle = language === 'ru' ? 'Калькуляторы' : 'Calculators';
  const calculatorTitle = t('services.calculator.title');
  const calculatorSubtitle = t('services.calculator.subtitle');
  const patentTitle = t('services.patentCalculator.title');
  const patentSubtitle = t('services.patentCalculator.subtitle');

  return (
    <section>
      <SectionHeader
        icon={Calculator}
        title={sectionTitle}
      />
      <div className="grid grid-cols-2 gap-3 mt-3">
        <QuickActionCard
          icon={Calculator}
          title={calculatorTitle}
          description={calculatorSubtitle}
          onClick={() => setActiveCalculator('90_180')}
          variant="primary"
        />
        <QuickActionCard
          icon={FileText}
          title={patentTitle}
          description={patentSubtitle}
          onClick={() => setActiveCalculator('patent')}
          variant="default"
        />
      </div>

      {/* 90/180 Calculator Modal */}
      {activeCalculator === '90_180' && (
        <StayCalculator onClose={() => setActiveCalculator(null)} />
      )}

      {/* Patent Calculator Modal */}
      {activeCalculator === 'patent' && (
        <PatentCalculatorModal onClose={() => setActiveCalculator(null)} />
      )}
    </section>
  );
}

export default CalculatorsSection;
