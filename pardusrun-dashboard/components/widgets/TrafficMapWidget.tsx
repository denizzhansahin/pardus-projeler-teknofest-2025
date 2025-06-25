
import React, { useState, useCallback, useEffect } from 'react';
import WidgetCard from '../WidgetCard';
import LoadingSpinner from '../LoadingSpinner';
import { WidgetSectionProps } from '../../types';
import { MapIcon } from '../icons/MapIcon';
import { MagnifyingGlassIcon } from '../icons/MagnifyingGlassIcon';

const TrafficMapWidget: React.FC<WidgetSectionProps> = ({ openModal, defaultCity: propDefaultCity = "İstanbul" }) => {
  const [cityInput, setCityInput] = useState<string>(propDefaultCity); 
  const [currentMapUrl, setCurrentMapUrl] = useState<string>(
    `https://maps.google.com/maps?q=trafik+durumu+${encodeURIComponent(propDefaultCity)}&hl=tr&t=m&z=10&output=embed`
  );
  const [isLoading, setIsLoading] = useState(false); 
  const [tempCity, setTempCity] = useState<string>(propDefaultCity);

  useEffect(() => {
    // Update if propDefaultCity changes (e.g., from settings)
    setCityInput(propDefaultCity);
    setTempCity(propDefaultCity);
    setCurrentMapUrl(`https://maps.google.com/maps?q=trafik+durumu+${encodeURIComponent(propDefaultCity)}&hl=tr&t=m&z=10&output=embed`);
  }, [propDefaultCity]);


  const handleMapUpdate = useCallback(() => {
    if (tempCity.trim() === "") {
      return;
    }
    setIsLoading(true);
    setCityInput(tempCity);
    const newMapUrl = `https://maps.google.com/maps?q=trafik+durumu+${encodeURIComponent(tempCity.trim())}&hl=tr&t=m&z=10&output=embed`;
    setCurrentMapUrl(newMapUrl);
    setTimeout(() => setIsLoading(false), 300); 
  }, [tempCity]);

  const handleCardClick = () => { // This now refers to the button inside the card
    openModal(
      `Canlı Trafik Haritası - ${cityInput}`,
      <div className="aspect-video bg-gray-900 rounded-lg">
        <iframe
          src={currentMapUrl}
          title={`Canlı Trafik Haritası - ${cityInput}`}
          className="w-full h-full border-0 rounded-lg"
          allow="geolocation" 
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>,
      false, 
      '5xl'
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); 
    handleMapUpdate();
  };

  return (
    <WidgetCard
      title="Canlı Trafik Haritası"
      icon={<MapIcon className="w-6 h-6 text-blue-500" />}
    >
      <div className="flex flex-col h-full p-4 space-y-3">
        <p className="text-sm text-gray-600 text-center">
          Trafik durumunu görmek istediğiniz şehri girin:
        </p>
        <form onSubmit={handleSubmit} className="flex space-x-2" aria-label="Şehir için trafik haritası arama formu">
          <input
            type="text"
            value={tempCity}
            onChange={(e) => {
                e.stopPropagation();
                setTempCity(e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            placeholder="Şehir adı (örn: Ankara)"
            className="flex-grow p-2.5 text-sm rounded-md bg-gray-50 text-gray-700 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-400"
            aria-label="Şehir adı girin"
          />
          <button
            type="submit"
            onClick={(e) => { e.stopPropagation(); handleSubmit(e); }} // Ensure form submission
            disabled={isLoading}
            className="p-2.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 focus:ring-offset-white disabled:opacity-70"
            aria-label="Trafik haritasını güncelle"
          >
            {isLoading ? <LoadingSpinner size="w-5 h-5" /> : <MagnifyingGlassIcon className="w-5 h-5" />}
          </button>
        </form>
        
        <p className="text-xs text-gray-500 text-center mt-1">
          Şu anki harita: <span className="font-medium">{cityInput}</span>
        </p>

        <button
          onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
          disabled={isLoading}
          className="mt-auto w-full text-sm text-blue-600 hover:text-blue-700 transition-colors py-2 px-4 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-white font-medium disabled:opacity-50"
        >
          {cityInput} Trafik Haritasını Aç
        </button>
      </div>
    </WidgetCard>
  );
};

export default TrafficMapWidget;
