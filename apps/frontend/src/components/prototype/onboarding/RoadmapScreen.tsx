'use client';

import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';

interface RoadmapScreenProps {
  onComplete: () => void;
  checkedItems?: string[];
}

export function RoadmapScreen({ onComplete, checkedItems = [] }: RoadmapScreenProps) {
  const { t } = useTranslation();

  const hasPassport = checkedItems.includes('passport');
  const hasMigrationCard = checkedItems.includes('migration_card');
  const hasPatent = checkedItems.includes('patent');
  const hasRegistration = checkedItems.includes('registration');

  const steps = [
    {
      titleKey: 'roadmap.steps.passport',
      status: hasPassport ? 'completed' : 'urgent',
      icon: hasPassport ? CheckCircle2 : XCircle,
      color: hasPassport ? 'green' : 'red',
      descriptionKey: hasPassport ? 'roadmap.status.done' : 'roadmap.steps.passportDeadline',
    },
    {
      titleKey: 'roadmap.steps.migCard',
      status: hasMigrationCard ? 'completed' : 'urgent',
      icon: hasMigrationCard ? CheckCircle2 : XCircle,
      color: hasMigrationCard ? 'green' : 'red',
      descriptionKey: hasMigrationCard ? 'roadmap.status.done' : 'roadmap.steps.migCardDeadline',
    },
    {
      titleKey: 'roadmap.steps.registration',
      status: hasRegistration ? 'completed' : 'warning',
      icon: hasRegistration ? CheckCircle2 : AlertTriangle,
      color: hasRegistration ? 'green' : 'yellow',
      descriptionKey: hasRegistration ? 'roadmap.status.done' : 'roadmap.steps.registrationDeadline',
    },
    {
      titleKey: 'roadmap.steps.patent',
      status: hasPatent ? 'completed' : 'urgent',
      icon: hasPatent ? CheckCircle2 : XCircle,
      color: hasPatent ? 'green' : 'red',
      descriptionKey: hasPatent ? 'roadmap.status.done' : 'roadmap.steps.patentDeadline',
    },
  ];

  return (
    <div className="h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Header with Language Switcher */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">MigrantHub</h1>
        <LanguageSwitcher variant="compact" />
      </div>

      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t('roadmap.title')}
          </h2>
          <p className="text-gray-600">
            {t('roadmap.subtitle')}
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
                  <div className={`w-12 h-12 rounded-full ${colorClasses!.bg} flex items-center justify-center z-10 shadow-md`}>
                    <Icon className={`w-6 h-6 ${colorClasses!.icon}`} strokeWidth={2} />
                  </div>

                  {/* Content */}
                  <div className={`flex-1 bg-white border-2 ${colorClasses!.border} rounded-xl p-4 shadow-sm`}>
                    <h3 className="font-bold text-gray-900 mb-1">
                      {t(step.titleKey)}
                    </h3>
                    <p className={`text-sm font-semibold ${colorClasses!.text}`}>
                      {t(step.descriptionKey)}
                    </p>
                    {step.color === 'red' && step.status === 'urgent' && (
                      <div className="mt-2 inline-block px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                        ⚠️ {t('roadmap.risk.deportation')}
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
                {t('roadmap.nextStep.title')}
              </h4>
              <p className="text-sm text-blue-800">
                {t('roadmap.nextStep.description')}
              </p>
            </div>
          </div>
        </div>
        </div>

        <button
          onClick={onComplete}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all active:scale-98 shadow-xl"
        >
          {t('roadmap.proceedButton')}
        </button>
      </div>
    </div>
  );
}
