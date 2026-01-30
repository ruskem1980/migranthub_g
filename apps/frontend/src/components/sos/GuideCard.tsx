'use client';

import { Shield, Wallet, FileX, Building, Scale, AlertTriangle, ChevronRight } from 'lucide-react';
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
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'bg-blue-100 text-blue-600',
    hover: 'hover:border-blue-400',
  },
  Wallet: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'bg-green-100 text-green-600',
    hover: 'hover:border-green-400',
  },
  FileX: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'bg-orange-100 text-orange-600',
    hover: 'hover:border-orange-400',
  },
  Building: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: 'bg-purple-100 text-purple-600',
    hover: 'hover:border-purple-400',
  },
  Scale: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    icon: 'bg-indigo-100 text-indigo-600',
    hover: 'hover:border-indigo-400',
  },
  AlertTriangle: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'bg-red-100 text-red-600',
    hover: 'hover:border-red-400',
  },
} as const;

interface GuideCardProps {
  guide: EmergencyGuide;
  onClick: () => void;
}

export function GuideCard({ guide, onClick }: GuideCardProps) {
  const Icon = iconMap[guide.icon];
  const colors = colorMap[guide.icon];

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-4 p-4 mb-3
        rounded-xl border-2 transition-all
        active:scale-[0.98] shadow-sm
        text-left
        ${colors.bg} ${colors.border} ${colors.hover}
      `}
      aria-label={`${guide.title}`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colors.icon}`}>
        <Icon className="w-6 h-6" strokeWidth={2} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900">
          {guide.title}
        </h4>
        <p className="text-sm text-gray-600 mt-0.5">
          {guide.steps.length} {guide.steps.length === 1 ? 'step' : guide.steps.length < 5 ? 'steps' : 'steps'}
        </p>
      </div>

      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
    </button>
  );
}

export default GuideCard;
