'use client';

import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface RoadmapScreenProps {
  onComplete: () => void;
  checkedItems?: string[];
}

export function RoadmapScreen({ onComplete, checkedItems = [] }: RoadmapScreenProps) {
  const hasPassport = checkedItems.includes('passport');
  const hasMigrationCard = checkedItems.includes('migration_card');
  const hasPatent = checkedItems.includes('patent');
  const hasRegistration = checkedItems.includes('registration');

  const steps = [
    {
      title: 'Паспорт',
      status: hasPassport ? 'completed' : 'urgent',
      icon: hasPassport ? CheckCircle2 : XCircle,
      color: hasPassport ? 'green' : 'red',
      description: hasPassport ? 'Готово' : 'Срок: 7 дней, Штраф: 5000₽',
    },
    {
      title: 'Миграционная карта',
      status: hasMigrationCard ? 'completed' : 'urgent',
      icon: hasMigrationCard ? CheckCircle2 : XCircle,
      color: hasMigrationCard ? 'green' : 'red',
      description: hasMigrationCard ? 'Готово' : 'Срок: 3 дня, Штраф: 5000₽',
    },
    {
      title: 'Регистрация',
      status: hasRegistration ? 'completed' : 'warning',
      icon: hasRegistration ? CheckCircle2 : AlertTriangle,
      color: hasRegistration ? 'green' : 'yellow',
      description: hasRegistration ? 'Готово' : 'Срок: 7 дней, Штраф: 3000₽',
    },
    {
      title: 'Патент',
      status: hasPatent ? 'completed' : 'urgent',
      icon: hasPatent ? CheckCircle2 : XCircle,
      color: hasPatent ? 'green' : 'red',
      description: hasPatent ? 'Готово' : 'Срок: 30 дней, Штраф: 5000₽',
    },
  ];

  return (
    <div className="h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Ваша дорожная карта
        </h2>
        <p className="text-gray-600">
          План действий для легального пребывания
        </p>
      </div>

      <div className="flex-1 overflow-y-auto mb-6">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200" />

          {/* Steps */}
          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const colorClasses = {
                green: {
                  bg: 'bg-green-100',
                  icon: 'text-green-600',
                  border: 'border-green-300',
                  text: 'text-green-700',
                },
                yellow: {
                  bg: 'bg-yellow-100',
                  icon: 'text-yellow-600',
                  border: 'border-yellow-300',
                  text: 'text-yellow-700',
                },
                red: {
                  bg: 'bg-red-100',
                  icon: 'text-red-600',
                  border: 'border-red-300',
                  text: 'text-red-700',
                },
              }[step.color];

              return (
                <div key={index} className="relative flex gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-full ${colorClasses.bg} flex items-center justify-center z-10 shadow-md`}>
                    <Icon className={`w-6 h-6 ${colorClasses.icon}`} strokeWidth={2} />
                  </div>

                  {/* Content */}
                  <div className={`flex-1 bg-white border-2 ${colorClasses.border} rounded-xl p-4 shadow-sm`}>
                    <h3 className="font-bold text-gray-900 mb-1">
                      {step.title}
                    </h3>
                    <p className={`text-sm font-semibold ${colorClasses.text}`}>
                      {step.description}
                    </p>
                    {step.color === 'red' && step.description.includes('Штраф') && (
                      <div className="mt-2 inline-block px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                        ⚠️ Риск: Депортация
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-bold text-blue-900 mb-1">
                Следующий шаг
              </h4>
              <p className="text-sm text-blue-800">
                Оформите миграционный учет в течение 3 дней. Мы поможем найти ближайший отдел МВД.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all active:scale-98 shadow-xl"
      >
        Перейти к оформлению
      </button>
    </div>
  );
}
