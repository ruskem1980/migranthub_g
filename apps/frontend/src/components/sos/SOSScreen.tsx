'use client';

import { useState } from 'react';
import { AlertTriangle, Phone, Building2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useProfileStore } from '@/lib/stores';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { EmergencyServiceCard } from './EmergencyServiceCard';
import { HotlineCard } from './HotlineCard';
import { EmbassyCard } from './EmbassyCard';
import { GuideCard } from './GuideCard';
import { EmergencyGuideModal } from './EmergencyGuideModal';
import {
  emergencyServices,
  hotlines,
  emergencyGuides,
  getEmbassiesSortedByCitizenship,
  type EmergencyGuide,
} from '@/data/emergency-contacts';

export function SOSScreen() {
  const { profile } = useProfileStore();
  const [selectedGuide, setSelectedGuide] = useState<EmergencyGuide | null>(null);
  const [showAllEmbassies, setShowAllEmbassies] = useState(false);

  // Get embassies sorted with user's citizenship first
  const sortedEmbassies = getEmbassiesSortedByCitizenship(profile?.citizenship);

  // Show only 3 embassies by default, or all if expanded
  const visibleEmbassies = showAllEmbassies ? sortedEmbassies : sortedEmbassies.slice(0, 3);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-red-50 to-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-4 bg-red-600 text-white shadow-lg z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">SOS Help</h1>
              <p className="text-sm text-red-100">Emergency contacts and guides</p>
            </div>
          </div>
          <LanguageSwitcher variant="compact" className="bg-white/20 hover:bg-white/30" />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Emergency Services Section */}
        <section className="px-4 pt-6">
          <SectionHeader
            icon={Phone}
            title="Emergency Services"
            className="mb-3"
          />
          <div className="grid grid-cols-2 gap-3">
            {emergencyServices.map((service) => (
              <EmergencyServiceCard key={service.id} service={service} />
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center mt-3">
            Tap to call. Free from any phone.
          </p>
        </section>

        {/* Hotlines Section */}
        <section className="px-4 pt-6">
          <SectionHeader
            icon={Phone}
            title="Hotlines"
            className="mb-3"
          />
          {hotlines.map((hotline) => (
            <HotlineCard key={hotline.id} hotline={hotline} />
          ))}
        </section>

        {/* Embassies Section */}
        <section className="px-4 pt-6">
          <SectionHeader
            icon={Building2}
            title="Embassies"
            className="mb-3"
          />
          {visibleEmbassies.map((embassy, index) => (
            <EmbassyCard
              key={embassy.id}
              embassy={embassy}
              isHighlighted={index === 0 && profile?.citizenship === embassy.countryCode}
            />
          ))}

          {sortedEmbassies.length > 3 && (
            <button
              onClick={() => setShowAllEmbassies(!showAllEmbassies)}
              className="
                w-full flex items-center justify-center gap-2 py-3
                text-blue-600 font-medium
                bg-blue-50 hover:bg-blue-100 rounded-xl
                transition-colors
              "
            >
              {showAllEmbassies ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show all {sortedEmbassies.length} embassies
                </>
              )}
            </button>
          )}
        </section>

        {/* Emergency Guides Section */}
        <section className="px-4 pt-6 pb-6">
          <SectionHeader
            icon={HelpCircle}
            title="What to do if..."
            className="mb-3"
          />
          {emergencyGuides.map((guide) => (
            <GuideCard
              key={guide.id}
              guide={guide}
              onClick={() => setSelectedGuide(guide)}
            />
          ))}
        </section>
      </div>

      {/* Emergency Guide Modal */}
      <EmergencyGuideModal
        guide={selectedGuide}
        isOpen={!!selectedGuide}
        onClose={() => setSelectedGuide(null)}
      />
    </div>
  );
}

export default SOSScreen;
