'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Phone, Clock, Train, ChevronRight, X, Filter } from 'lucide-react';
import {
  POI_DATA,
  POI_TYPE_LABELS,
  POI_TYPE_ICONS,
  getPOIByType,
  openInYandexMaps,
  openRouteInYandexMaps,
  type POI,
  type POIType,
} from '../poi';

interface MapScreenProps {
  onClose: () => void;
  initialFilter?: POIType;
}

export function MapScreen({ onClose, initialFilter }: MapScreenProps) {
  const [selectedType, setSelectedType] = useState<POIType | 'all'>(initialFilter || 'all');
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  useEffect(() => {
    // Try to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        () => {
          // Location denied or error - use default (Moscow center)
          setUserLocation([55.7558, 37.6173]);
        }
      );
    }
  }, []);

  const filteredPOI = selectedType === 'all'
    ? POI_DATA
    : getPOIByType(selectedType);

  const poiTypes: (POIType | 'all')[] = ['all', 'mvd', 'mmc', 'medical', 'exam', 'mosque'];

  const handleOpenMap = (poi: POI) => {
    openInYandexMaps(poi);
  };

  const handleGetRoute = (poi: POI) => {
    openRouteInYandexMaps(poi, userLocation || undefined);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-gray-900">Карта мигранта</h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {poiTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? (
                <>
                  <Filter className="w-4 h-4" />
                  Все
                </>
              ) : (
                <>
                  <span>{POI_TYPE_ICONS[type]}</span>
                  {POI_TYPE_LABELS[type]}
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Map placeholder */}
      <div className="h-48 bg-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Интерактивная карта</p>
            <button
              onClick={() => window.open('https://yandex.ru/maps/?ll=37.6173,55.7558&z=10', '_blank')}
              className="mt-2 text-blue-600 font-medium text-sm"
            >
              Открыть в Яндекс.Картах →
            </button>
          </div>
        </div>
      </div>

      {/* POI List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            {selectedType === 'all' ? 'Все точки' : POI_TYPE_LABELS[selectedType]} ({filteredPOI.length})
          </h2>

          <div className="space-y-3">
            {filteredPOI.map((poi) => (
              <div
                key={poi.id}
                className="bg-gray-50 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                    <span className="text-2xl">{POI_TYPE_ICONS[poi.type]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {poi.name}
                    </h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{poi.address}</span>
                      </div>
                      {poi.metro && (
                        <div className="flex items-center gap-2">
                          <Train className="w-4 h-4 flex-shrink-0" />
                          <span>м. {poi.metro}</span>
                        </div>
                      )}
                      {poi.workingHours && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{poi.workingHours}</span>
                        </div>
                      )}
                      {poi.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <a href={`tel:${poi.phone}`} className="text-blue-600">
                            {poi.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleOpenMap(poi)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-medium py-2 rounded-xl hover:bg-gray-50"
                  >
                    <MapPin className="w-4 h-4" />
                    На карте
                  </button>
                  <button
                    onClick={() => handleGetRoute(poi)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-medium py-2 rounded-xl hover:bg-blue-700"
                  >
                    <Navigation className="w-4 h-4" />
                    Маршрут
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
