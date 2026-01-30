'use client';

import { Phone, MapPin, Globe } from 'lucide-react';
import type { Embassy } from '@/data/emergency-contacts';
import { makePhoneCall } from '@/lib/utils';

interface EmbassyCardProps {
  embassy: Embassy;
  isHighlighted?: boolean;
}

export function EmbassyCard({ embassy, isHighlighted = false }: EmbassyCardProps) {
  const handleCall = () => {
    makePhoneCall(embassy.phone);
  };

  const handleOpenMap = () => {
    const encodedAddress = encodeURIComponent(embassy.address);
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
  };

  const handleOpenWebsite = () => {
    if (embassy.website) {
      window.open(embassy.website, '_blank');
    }
  };

  return (
    <div
      className={`
        p-4 mb-3 rounded-xl border-2 transition-all
        ${isHighlighted
          ? 'bg-blue-50 border-blue-300 shadow-md'
          : 'bg-white border-gray-200 shadow-sm'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl" role="img" aria-label={embassy.country}>
          {embassy.flag}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">
              {embassy.country}
            </h4>
            {isHighlighted && (
              <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                Your country
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            {embassy.name}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-3">
            <button
              onClick={handleCall}
              className="
                flex items-center gap-1.5 px-3 py-1.5
                bg-green-500 hover:bg-green-600
                text-white text-sm font-medium rounded-lg
                transition-colors active:scale-95
              "
              aria-label={`Call ${embassy.country} embassy`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span className="font-mono text-xs">{embassy.phone}</span>
            </button>

            <button
              onClick={handleOpenMap}
              className="
                flex items-center gap-1.5 px-3 py-1.5
                bg-gray-100 hover:bg-gray-200
                text-gray-700 text-sm font-medium rounded-lg
                transition-colors active:scale-95
              "
              aria-label={`Open map for ${embassy.country} embassy`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs">Map</span>
            </button>

            {embassy.website && (
              <button
                onClick={handleOpenWebsite}
                className="
                  flex items-center gap-1.5 px-3 py-1.5
                  bg-gray-100 hover:bg-gray-200
                  text-gray-700 text-sm font-medium rounded-lg
                  transition-colors active:scale-95
                "
                aria-label={`Open website for ${embassy.country} embassy`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="text-xs">Website</span>
              </button>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>{embassy.address}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmbassyCard;
