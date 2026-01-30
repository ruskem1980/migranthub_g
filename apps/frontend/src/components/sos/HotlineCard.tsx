'use client';

import { Phone, Clock } from 'lucide-react';
import type { Hotline } from '@/data/emergency-contacts';
import { makePhoneCall } from '@/lib/utils';

interface HotlineCardProps {
  hotline: Hotline;
}

export function HotlineCard({ hotline }: HotlineCardProps) {
  const handleCall = () => {
    makePhoneCall(hotline.number);
  };

  return (
    <div
      className="
        flex items-center gap-4 p-4 mb-3
        bg-white rounded-xl border border-gray-200
        shadow-sm hover:shadow-md transition-all
      "
    >
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate">
          {hotline.name}
        </h4>
        <p className="text-sm text-gray-600 truncate">
          {hotline.description}
        </p>
        <div className="flex items-center gap-1 mt-1">
          <Clock className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500">{hotline.hours}</span>
        </div>
      </div>

      <button
        onClick={handleCall}
        className="
          flex items-center gap-2 px-4 py-2
          bg-green-500 hover:bg-green-600
          text-white font-medium rounded-xl
          transition-colors active:scale-95
          whitespace-nowrap
        "
        aria-label={`${hotline.name}: ${hotline.number}`}
      >
        <Phone className="w-4 h-4" />
        <span className="text-sm font-mono">{hotline.number}</span>
      </button>
    </div>
  );
}

export default HotlineCard;
