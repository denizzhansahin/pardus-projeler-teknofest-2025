
import React, { useCallback } from 'react';
import WidgetCard from '../WidgetCard';
import { WidgetSectionProps } from '../../types';
import { FilmIcon } from '../icons/FilmIcon';

const VideoRecommendationWidget: React.FC<WidgetSectionProps> = ({ openModal }) => {
  const title = "Video Keşfet";

  const handleCardClick = useCallback(() => {
    const iframeSrc = `https://www.google.com/search?igu=1&tbm=vid&hl=tr&q=youtube`; // Google Video search for "youtube"
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
      icon={<FilmIcon className="w-6 h-6" />}
      onCardClick={handleCardClick}
    >
      <div className="flex flex-col items-center justify-center h-full text-center p-4 group">
        <FilmIcon className="w-12 h-12 mx-auto text-teal-500 mb-3 group-hover:scale-110 transition-transform" />
        <p className="text-sm text-gray-600 mb-3">
          Popüler YouTube videolarını Google üzerinden keşfetmek için tıklayın.
        </p>
         <button
            onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
            }}
            className="mt-2 w-full text-sm text-teal-600 hover:text-teal-700 transition-colors py-2 px-4 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-white font-medium"
        >
            Video Ara
        </button>
      </div>
    </WidgetCard>
  );
};

export default VideoRecommendationWidget;