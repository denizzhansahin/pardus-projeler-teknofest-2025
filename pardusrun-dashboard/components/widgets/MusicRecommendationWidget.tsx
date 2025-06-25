
import React, { useCallback } from 'react';
import WidgetCard from '../WidgetCard';
import { WidgetSectionProps } from '../../types';
import { MusicalNoteIcon } from '../icons/MusicalNoteIcon';

const MusicRecommendationWidget: React.FC<WidgetSectionProps> = ({ openModal }) => {
  const title = "Müzik Keşfet";

  const handleCardClick = useCallback(() => {
    const iframeSrc = `https://www.google.com/search?igu=1&hl=tr&q=popüler+müzikler`; // Generic Google search for popular music
    openModal(
      title,
      <div className="aspect-video bg-gray-900 rounded-lg">
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
      icon={<MusicalNoteIcon className="w-6 h-6" />}
      onCardClick={handleCardClick}
    >
      <div className="flex flex-col items-center justify-center h-full text-center p-4 group">
        <MusicalNoteIcon className="w-12 h-12 mx-auto text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
        <p className="text-sm text-gray-600 mb-3">
          Popüler müzikleri ve sanatçıları Google üzerinden keşfedin.
        </p>
         <button
            onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
            }}
            className="mt-2 w-full text-sm text-purple-600 hover:text-purple-700 transition-colors py-2 px-4 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-white font-medium"
        >
            Müzik Ara
        </button>
      </div>
    </WidgetCard>
  );
};

export default MusicRecommendationWidget;