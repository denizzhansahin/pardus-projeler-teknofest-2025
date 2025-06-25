
import React, { useCallback } from 'react';
import WidgetCard from '../WidgetCard';
import { WidgetSectionProps, NewsCategory } from '../../types';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';

const EmergencyNewsWidget: React.FC<WidgetSectionProps> = ({ openModal }) => {
  const category = NewsCategory.AcilDurum; // This is already "Son Dakika Acil Durum"
  const title = category.toString();

  const handleCardClick = useCallback(() => {
    const searchTerm = "son dakika acil durum haberleri";
    const iframeSrc = `https://www.google.com/search?igu=1&tbm=nws&hl=tr&q=${encodeURIComponent(searchTerm)}`;
    openModal(
      title,
      <div className="aspect-[9/16] sm:aspect-video bg-gray-900 rounded-lg">
        <iframe
          src={iframeSrc}
          title={title}
          className="w-full h-full border-0 rounded-lg"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>,
      false, 
      '5xl' 
    );
  }, [openModal, title]);

  return (
    <WidgetCard
      title={title}
      icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-600" />}
      titleClassName="text-red-700"
      onCardClick={handleCardClick}
    >
      <div className="flex flex-col items-center justify-center h-full text-center p-4 group">
        <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-red-500 mb-3 group-hover:scale-110 transition-transform" />
        <p className="text-sm text-gray-600 mb-3">
          En son acil durum ve son dakika haberlerini Google üzerinden görmek için tıklayın.
        </p>
        <button
            onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
            }}
            className="mt-2 w-full text-sm text-red-600 hover:text-red-700 transition-colors py-2 px-4 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-white font-medium"
        >
            Haberleri Görüntüle
        </button>
      </div>
    </WidgetCard>
  );
};

export default EmergencyNewsWidget;
