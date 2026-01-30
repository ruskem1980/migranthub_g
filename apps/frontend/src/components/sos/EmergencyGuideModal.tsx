'use client';

import { Shield, Wallet, FileX, Building, Scale, AlertTriangle, Check } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { SpeakButton } from '@/components/ui/SpeakButton';
import type { EmergencyGuide } from '@/data/emergency-contacts';

const iconMap = {
  Shield,
  Wallet,
  FileX,
  Building,
  Scale,
  AlertTriangle,
} as const;

const colorMap = {
  Shield: {
    header: 'bg-blue-600',
    step: 'bg-blue-500',
    icon: 'text-blue-600',
  },
  Wallet: {
    header: 'bg-green-600',
    step: 'bg-green-500',
    icon: 'text-green-600',
  },
  FileX: {
    header: 'bg-orange-600',
    step: 'bg-orange-500',
    icon: 'text-orange-600',
  },
  Building: {
    header: 'bg-purple-600',
    step: 'bg-purple-500',
    icon: 'text-purple-600',
  },
  Scale: {
    header: 'bg-indigo-600',
    step: 'bg-indigo-500',
    icon: 'text-indigo-600',
  },
  AlertTriangle: {
    header: 'bg-red-600',
    step: 'bg-red-500',
    icon: 'text-red-600',
  },
} as const;

interface EmergencyGuideModalProps {
  guide: EmergencyGuide | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EmergencyGuideModal({ guide, isOpen, onClose }: EmergencyGuideModalProps) {
  if (!guide) return null;

  const Icon = iconMap[guide.icon];
  const colors = colorMap[guide.icon];

  // Prepare text for speech
  const speechText = `${guide.title}. ${guide.steps.map((step, i) => `Step ${i + 1}: ${step}`).join('. ')}`;

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoint="full"
    >
      {/* Header */}
      <div className={`-mx-6 -mt-4 px-6 py-6 ${colors.header} text-white mb-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Icon className="w-7 h-7" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{guide.title}</h2>
              <p className="text-sm text-white/80">{guide.steps.length} steps</p>
            </div>
          </div>
          <SpeakButton
            text={speechText}
            size="md"
            variant="default"
            showLabel
            label="Listen"
            className="bg-white/20 hover:bg-white/30 text-white"
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {guide.steps.map((step, index) => (
          <div key={index} className="flex gap-4">
            {/* Step number */}
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 ${colors.step} text-white font-bold rounded-full flex items-center justify-center text-sm shadow-md`}>
                {index + 1}
              </div>
              {/* Connector line */}
              {index < guide.steps.length - 1 && (
                <div className="w-0.5 h-full bg-gray-200 mx-auto mt-2" style={{ minHeight: '16px' }} />
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 pb-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <p className="text-gray-800 leading-relaxed">{step}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Completion indicator */}
      <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center">
            <Check className="w-6 h-6" strokeWidth={3} />
          </div>
          <div>
            <h4 className="font-semibold text-green-800">Important</h4>
            <p className="text-sm text-green-700">
              Save this guide for quick access. Stay calm and follow the steps.
            </p>
          </div>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="w-full mt-6 bg-gray-900 text-white font-semibold py-4 rounded-xl hover:bg-gray-800 transition-colors active:scale-[0.98]"
      >
        Close
      </button>
    </Sheet>
  );
}

export default EmergencyGuideModal;
