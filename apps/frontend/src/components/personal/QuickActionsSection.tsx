'use client';

import { Calculator, Search, MessageSquare, GraduationCap, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { QuickActionCard } from '@/components/ui/QuickActionCard';
import { useTranslation } from '@/lib/i18n';

export function QuickActionsSection() {
  const router = useRouter();
  const { language } = useTranslation();

  const title = language === 'ru' ? 'Быстрые действия' : 'Quick Actions';

  const actions = [
    {
      id: 'calculator',
      icon: Calculator,
      title: language === 'ru' ? 'Калькулятор' : 'Calculator',
      description: language === 'ru' ? 'Расчёт патента и сроков' : 'Calculate patent costs',
      onClick: () => router.push('/calculator'),
      variant: 'default' as const,
    },
    {
      id: 'checks',
      icon: Search,
      title: language === 'ru' ? 'Проверки' : 'Checks',
      description: language === 'ru' ? 'Проверка статуса документов' : 'Check document status',
      onClick: () => router.push('/checks'),
      variant: 'default' as const,
    },
    {
      id: 'ai',
      icon: MessageSquare,
      title: language === 'ru' ? 'AI помощник' : 'AI Assistant',
      description: language === 'ru' ? 'Задайте вопрос' : 'Ask a question',
      onClick: () => router.push('/ai'),
      variant: 'primary' as const,
    },
    {
      id: 'exam',
      icon: GraduationCap,
      title: language === 'ru' ? 'Экзамен' : 'Exam',
      description: language === 'ru' ? 'Подготовка к экзамену' : 'Exam preparation',
      onClick: () => router.push('/exam'),
      variant: 'default' as const,
    },
  ];

  return (
    <section>
      <SectionHeader title={title} icon={Zap} />
      <div className="grid grid-cols-1 gap-3 mt-3">
        {actions.map((action) => (
          <QuickActionCard
            key={action.id}
            icon={action.icon}
            title={action.title}
            description={action.description}
            onClick={action.onClick}
            variant={action.variant}
          />
        ))}
      </div>
    </section>
  );
}

export default QuickActionsSection;
