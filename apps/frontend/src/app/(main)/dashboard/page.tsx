'use client';

import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  FileText,
  Calculator,
  Grid3X3,
  User,
  ChevronRight,
} from 'lucide-react';
import { DocumentStatusSection } from '@/components/document-status';
import { useTranslation } from '@/lib/i18n';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  href: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const quickActions: QuickAction[] = [
    {
      id: 'services',
      title: 'Сервисы',
      description: 'Карта, экзамен, переводчик',
      icon: Grid3X3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/services',
    },
    {
      id: 'documents',
      title: 'Документы',
      description: 'Ваши документы',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/documents',
    },
    {
      id: 'calculator',
      title: 'Калькулятор 90/180',
      description: 'Расчёт дней пребывания',
      icon: Calculator,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/calculator',
    },
    {
      id: 'profile',
      title: 'Профиль',
      description: 'Настройки аккаунта',
      icon: User,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      href: '/profile',
    },
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">MigrantHub</h1>
            <p className="text-sm text-gray-500">Ваш помощник в миграционных вопросах</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 pb-24">
        {/* Document Status Section */}
        <DocumentStatusSection />

        {/* Quick Actions */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Быстрые действия
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => router.push(action.href)}
                  className={`flex flex-col p-4 rounded-xl border-2 border-gray-200 transition-all hover:scale-[1.02] active:scale-100 ${action.bgColor}`}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-white shadow-sm">
                    <Icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 text-left">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-600 text-left">
                    {action.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
          <div className="flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <h3 className="font-semibold text-yellow-900">Совет</h3>
              <p className="text-sm text-yellow-800">
                Регулярно проверяйте статус документов, чтобы избежать проблем с миграционным учётом.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
