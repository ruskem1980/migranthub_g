'use client';

import { Phone, Shield, Heart, Flame } from 'lucide-react';
import type { EmergencyService } from '@/data/emergency-contacts';
import { makePhoneCall } from '@/lib/utils';

const iconMap = {
  Phone,
  Shield,
  Heart,
  Flame,
} as const;

const colorMap = {
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'bg-red-100 text-red-600',
    number: 'text-red-600',
    hover: 'hover:border-red-400 hover:bg-red-100',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'bg-blue-100 text-blue-600',
    number: 'text-blue-600',
    hover: 'hover:border-blue-400 hover:bg-blue-100',
  },
  pink: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    icon: 'bg-pink-100 text-pink-600',
    number: 'text-pink-600',
    hover: 'hover:border-pink-400 hover:bg-pink-100',
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: 'bg-orange-100 text-orange-600',
    number: 'text-orange-600',
    hover: 'hover:border-orange-400 hover:bg-orange-100',
  },
} as const;

interface EmergencyServiceCardProps {
  service: EmergencyService;
}

export function EmergencyServiceCard({ service }: EmergencyServiceCardProps) {
  const Icon = iconMap[service.icon];
  const colors = colorMap[service.color as keyof typeof colorMap] || colorMap.red;

  const handleCall = () => {
    makePhoneCall(service.number);
  };

  return (
    <button
      onClick={handleCall}
      className={`
        flex flex-col items-center justify-center
        p-4 rounded-2xl border-2 transition-all
        active:scale-95 shadow-sm
        ${colors.bg} ${colors.border} ${colors.hover}
      `}
      aria-label={`${service.name}: ${service.number}`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${colors.icon}`}>
        <Icon className="w-6 h-6" strokeWidth={2.5} />
      </div>
      <span className="text-xs font-medium text-gray-600 mb-1 text-center leading-tight">
        {service.name}
      </span>
      <span className={`text-2xl font-bold ${colors.number}`}>
        {service.number}
      </span>
      <span className="text-[10px] text-gray-500 mt-1 text-center">
        {service.description}
      </span>
    </button>
  );
}

export default EmergencyServiceCard;
