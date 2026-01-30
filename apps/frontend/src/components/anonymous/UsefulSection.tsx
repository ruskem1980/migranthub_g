'use client';

import { useRouter } from 'next/navigation';
import { ClipboardList, GraduationCap, MessageSquare, Scale } from 'lucide-react';
import { SectionHeader, QuickActionCard } from '@/components/ui';
import { useTranslation } from '@/lib/i18n';

/**
 * UsefulSection - shows useful resources for anonymous users
 * - Migrant checklist
 * - Exam preparation (with free trial)
 * - AI assistant (with free questions)
 * - Legal rights information
 */
export function UsefulSection() {
  const router = useRouter();
  const { t, language } = useTranslation();

  // Section title with fallback
  const sectionTitle = language === 'ru' ? 'Полезное' : 'Useful';

  // Free badges
  const examBadge = language === 'ru' ? '10 бесплатно' : '10 free';
  const aiBadge = language === 'ru' ? '3 бесплатно' : '3 free';

  return (
    <section>
      <SectionHeader
        icon={ClipboardList}
        title={sectionTitle}
      />
      <div className="space-y-3 mt-3">
        <QuickActionCard
          icon={ClipboardList}
          title={language === 'ru' ? 'Чек-лист мигранта' : 'Migrant Checklist'}
          description={language === 'ru' ? 'Что нужно сделать' : 'What you need to do'}
          onClick={() => router.push('/checklist')}
          variant="default"
        />
        <QuickActionCard
          icon={GraduationCap}
          title={t('services.exam.title')}
          description={t('services.exam.description')}
          onClick={() => router.push('/exam')}
          badge={examBadge}
          variant="primary"
        />
        <QuickActionCard
          icon={MessageSquare}
          title={t('assistant.title')}
          description={t('assistant.subtitle')}
          onClick={() => router.push('/ai')}
          badge={aiBadge}
          variant="default"
        />
        <QuickActionCard
          icon={Scale}
          title={language === 'ru' ? 'Ваши права' : 'Your Rights'}
          description={language === 'ru' ? 'Юридическая информация' : 'Legal information'}
          onClick={() => router.push('/rights')}
          variant="default"
        />
      </div>
    </section>
  );
}

export default UsefulSection;
