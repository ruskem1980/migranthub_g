'use client';

import { Check, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

export interface RoadmapStep {
  id: string;
  label: string;
  completed: boolean;
  current?: boolean;
}

export interface ProgressRoadmapProps {
  steps: RoadmapStep[];
  className?: string;
}

export function ProgressRoadmap({ steps, className }: ProgressRoadmapProps) {
  const { t } = useTranslation();
  const completedCount = steps.filter(s => s.completed).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className={cn('bg-white rounded-2xl p-4 border-2 border-gray-100', className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">
          {t('progress.title')}
        </h3>
        <span className="text-sm text-gray-500">
          {progress}% ({completedCount}/{steps.length})
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full mb-4">
        <div
          className="h-full bg-green-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center flex-1 relative">
            {/* Connector line */}
            {index > 0 && (
              <div
                className={cn(
                  'absolute h-0.5 top-4 right-1/2 w-full -translate-y-1/2',
                  steps[index - 1].completed ? 'bg-green-500' : 'bg-gray-200'
                )}
              />
            )}

            {/* Step circle */}
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center relative z-10',
                step.completed
                  ? 'bg-green-500 text-white'
                  : step.current
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-400'
              )}
            >
              {step.completed ? (
                <Check className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </div>

            {/* Label */}
            <span
              className={cn(
                'text-xs mt-1 text-center max-w-[60px]',
                step.completed ? 'text-green-600 font-medium' : 'text-gray-500'
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressRoadmap;
