
import React from 'react';
import { WidgetSectionProps } from '../types';
import PopularSitesWidget from './widgets/PopularSitesWidget';
import NewsWidget from './widgets/NewsWidget';
import MusicRecommendationWidget from './widgets/MusicRecommendationWidget';
import PardusSitesWidget from './widgets/PardusSitesWidget';
import GamesWidget from './widgets/GamesWidget';
import PlaceholderWidget from './widgets/PlaceholderWidget';
import EmergencyNewsWidget from './widgets/EmergencyNewsWidget'; 
import VideoRecommendationWidget from './widgets/VideoRecommendationWidget'; 
import TrafficMapWidget from './widgets/TrafficMapWidget'; 
import OtherAIToolsWidget from './widgets/OtherAIToolsWidget'; 
import ImageGeneratorWidget from './widgets/ImageGeneratorWidget'; 
import AITranslatorWidget from './widgets/AITranslatorWidget'; // New
import PardusAppRecWidget from './widgets/PardusAppRecWidget'; // New
import PardusShortcutRecWidget from './widgets/PardusShortcutRecWidget'; // New
import { BuildingStorefrontIcon } from './icons/BuildingStorefrontIcon';
import { LinkIcon } from './icons/LinkIcon';
import { LifebuoyIcon } from './icons/LifebuoyIcon';
import { PresentationChartLineIcon } from './icons/PresentationChartLineIcon'; 
import { TrophyIcon } from './icons/TrophyIcon'; 
import { MapPinIcon } from './icons/MapPinIcon';
import { BoltIcon } from './icons/BoltIcon';
import { ArrowTopRightOnSquareIcon } from './icons/ArrowTopRightOnSquareIcon';
import { StreetViewIcon } from './icons/StreetViewIcon';

const Dashboard: React.FC<WidgetSectionProps> = ({ openModal, defaultCity = "İstanbul", apiKeyAvailable }) => {
  const defaultCityEncoded = encodeURIComponent(defaultCity);
  
  let dynamicWeatherMapIframeSrc = `https://www.meteoblue.com/tr/hava/widget/map/${defaultCityEncoded}_Türkiye_?geoloc=fixed&windAnimation=1&temperature=1&tempunit=C&windunit=kmh&lang=tr& στην=0`;
  if (defaultCity.toLowerCase() === 'istanbul') {
    dynamicWeatherMapIframeSrc = `https://www.meteoblue.com/tr/hava/widget/map/İstanbul_Türkiye_745044?geoloc=fixed&windAnimation=1&temperature=1&tempunit=C&windunit=kmh&lang=tr& στην=0&zoom=7`;
  } else if (defaultCity.toLowerCase() === 'ankara') {
     dynamicWeatherMapIframeSrc = `https://www.meteoblue.com/tr/hava/widget/map/Ankara_Türkiye_323786?geoloc=fixed&windAnimation=1&temperature=1&tempunit=C&windunit=kmh&lang=tr& στην=0&zoom=7`;
  } else if (defaultCity.toLowerCase() === 'izmir') {
     dynamicWeatherMapIframeSrc = `https://www.meteoblue.com/tr/hava/widget/map/İzmir_Türkiye_311046?geoloc=fixed&windAnimation=1&temperature=1&tempunit=C&windunit=kmh&lang=tr& στην=0&zoom=7`;
  } else {
    dynamicWeatherMapIframeSrc = `https://www.meteoblue.com/tr/hava/widget/map/Türkiye_?geoloc=fixed&windAnimation=1&temperature=1&tempunit=C&windunit=kmh&lang=tr& στην=0&zoom=5`;
  }

  const streetViewSearchQuery = `Google Sokak Görünümü ${defaultCity}`;
  const streetViewIframeSrc = `https://www.google.com/search?igu=1&hl=tr&q=${encodeURIComponent(streetViewSearchQuery)}`;

  const afadKoeriModalContent = (
    <div className="space-y-4">
      <div className="aspect-video bg-gray-900 rounded-lg">
        <iframe
          src="https://deprem.afad.gov.tr/last-earthquakes.html"
          title="Son Depremler - AFAD"
          className="w-full h-full border-0 rounded-lg"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600 mb-2">Alternatif Kaynak:</p>
        <a
          href="http://udim.koeri.boun.edu.tr/zeqmap/hgmmap.asp"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-white"
        >
          KOERI Son Depremler Haritası <ArrowTopRightOnSquareIcon className="w-4 h-4 inline-block ml-2" />
        </a>
      </div>
    </div>
  );


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 sm:gap-8">
      <PlaceholderWidget
        openModal={openModal}
        title="Anlık Depremler (AFAD & KOERI)"
        icon={<BoltIcon className="w-8 h-8 mx-auto text-orange-500" />}
        contentMessage="Türkiye ve yakın çevresindeki son depremleri AFAD ve KOERI üzerinden takip edin."
        modalContent={afadKoeriModalContent}
        modalTitle="Son Depremler - AFAD & KOERI"
        modalSize='5xl' 
        apiKeyAvailable={apiKeyAvailable}
      />

      <EmergencyNewsWidget openModal={openModal} apiKeyAvailable={apiKeyAvailable} />
      <NewsWidget openModal={openModal} apiKeyAvailable={apiKeyAvailable} />
      
      <PlaceholderWidget 
        openModal={openModal} 
        title={`Hava Durumu Haritası (${defaultCity})`} 
        icon={<MapPinIcon className="w-8 h-8 mx-auto text-sky-500" />}
        contentMessage={`${defaultCity} ve çevresi için Meteoblue üzerinden canlı hava durumu haritasını görüntüleyin.`}
        iframeSrc={dynamicWeatherMapIframeSrc}
        modalTitle={`Canlı Hava Durumu Haritası - ${defaultCity} (Meteoblue)`}
        modalSize='5xl'
        apiKeyAvailable={apiKeyAvailable}
      />
      
      <TrafficMapWidget openModal={openModal} defaultCity={defaultCity} apiKeyAvailable={apiKeyAvailable} />
      
      {apiKeyAvailable && <ImageGeneratorWidget openModal={openModal} apiKeyAvailable={apiKeyAvailable} />}
      {apiKeyAvailable && <AITranslatorWidget openModal={openModal} apiKeyAvailable={apiKeyAvailable} />}
      {apiKeyAvailable && <PardusAppRecWidget openModal={openModal} apiKeyAvailable={apiKeyAvailable} />}
      {apiKeyAvailable && <PardusShortcutRecWidget openModal={openModal} apiKeyAvailable={apiKeyAvailable} />}
      
      <MusicRecommendationWidget openModal={openModal} apiKeyAvailable={apiKeyAvailable} />
      <VideoRecommendationWidget openModal={openModal} apiKeyAvailable={apiKeyAvailable} />
      <GamesWidget openModal={openModal} apiKeyAvailable={apiKeyAvailable} />

      <PlaceholderWidget 
        openModal={openModal} 
        title="Borsa / Döviz Takip" 
        icon={<PresentationChartLineIcon className="w-8 h-8 mx-auto text-green-500" />}
        contentMessage="Borsa ve döviz kurları hakkında güncel bilgileri Google'da arayın."
        iframeSrc="https://www.google.com/search?igu=1&q=borsa+döviz+canlı&hl=tr" 
        modalTitle="Borsa ve Döviz - Google Arama"
        modalSize='5xl'
        apiKeyAvailable={apiKeyAvailable}
      />
      <PlaceholderWidget 
        openModal={openModal} 
        title="UEFA / Süper Lig Puan Durumu" 
        icon={<TrophyIcon className="w-8 h-8 mx-auto text-yellow-500" />}
        contentMessage="UEFA Şampiyonlar Ligi ve Süper Lig puan durumlarını Google'da arayın."
        iframeSrc="https://www.google.com/search?igu=1&q=Süper+Lig+puan+durumu&hl=tr" 
        modalTitle="Lig Puan Durumları - Google Arama"
        modalSize='5xl'
        apiKeyAvailable={apiKeyAvailable}
      />
       <PopularSitesWidget openModal={openModal} apiKeyAvailable={apiKeyAvailable} />

      <PardusSitesWidget openModal={openModal} apiKeyAvailable={apiKeyAvailable} />
      
       <PlaceholderWidget 
        openModal={openModal} 
        title="Nöbetçi Eczaneler"
        icon={<BuildingStorefrontIcon className="w-8 h-8 mx-auto text-red-500" />}
        contentMessage="Size en yakın nöbetçi eczaneleri Google'da arayın."
        iframeSrc={`https://www.google.com/search?igu=1&q=nöbetçi+eczaneler+${defaultCityEncoded}&hl=tr`}
        modalTitle={`Nöbetçi Eczaneler (${defaultCity}) - Google Arama`}
        modalSize='5xl'
        apiKeyAvailable={apiKeyAvailable}
      />
      <PlaceholderWidget
        openModal={openModal}
        title="Link Kısaltıcı"
        icon={<LinkIcon className="w-8 h-8 mx-auto text-indigo-500" />}
        contentMessage="Linksphere.tr ile uzun linklerinizi kısaltın. Siteye gitmek için tıklayın."
        modalTitle="Link Kısaltıcı - Linksphere.tr"
        modalSize='lg' 
        apiKeyAvailable={apiKeyAvailable}
        modalContent={
          <div className="p-4 text-center text-gray-700">
            <LinkIcon className="w-16 h-16 mx-auto mb-4 text-indigo-500" />
            <h3 className="text-2xl font-bold mb-4">Linksphere.tr</h3>
            <p className="mb-6 text-gray-600">
              Uzun URL'lerinizi kısaltmak için Linksphere.tr sitesini ziyaret edin. Devam etmek için aşağıdaki butona tıklayın.
            </p>
            <a
              href="https://linksphere.tr/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white"
            >
              Linksphere.tr'ye Git <ArrowTopRightOnSquareIcon className="w-5 h-5 inline-block ml-2" />
            </a>
          </div>
        }
      />
       <PlaceholderWidget
        openModal={openModal}
        title="Google Sokak Görünümü"
        icon={<StreetViewIcon className="w-8 h-8 mx-auto text-blue-600" />}
        contentMessage={`Google Street View ile ${defaultCity} ve çevresini keşfedin.`}
        iframeSrc={streetViewIframeSrc} 
        modalTitle={`Google Sokak Görünümü - ${defaultCity}`}
        modalSize='5xl'
        apiKeyAvailable={apiKeyAvailable}
      />
      <OtherAIToolsWidget openModal={openModal} apiKeyAvailable={apiKeyAvailable} />
       <PlaceholderWidget
        openModal={openModal}
        title="Acil Durum Bilgileri"
        icon={<LifebuoyIcon className="w-8 h-8 mx-auto text-red-600" />}
        contentMessage="Acil servisler ve kan bağışı hakkında bilgiler." 
        modalTitle="Acil Durum Bilgileri"
        modalSize='md'
        apiKeyAvailable={apiKeyAvailable}
        modalContent={ 
          <div className="p-6 bg-white rounded-lg text-gray-700">
            <h3 className="text-xl font-semibold mb-4 text-red-700">Acil Durum Bilgileri</h3>
            <p className="text-gray-600">
              Acil durum bilgileri ve kan ihtiyacı duyurusu özelliği henüz yapım aşamasındadır. Yakında eklenecektir.
            </p>
            <LifebuoyIcon className="w-16 h-16 mx-auto text-red-400 mt-6" />
          </div>
        }
      />
    </div>
  );
};

export default Dashboard;
