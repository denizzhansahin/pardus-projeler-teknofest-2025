
import React, { useCallback } from 'react';
import WidgetCard from '../WidgetCard';
import { WidgetSectionProps } from '../../types';
import { PuzzlePieceIcon } from '../icons/PuzzlePieceIcon';

const GamesWidget: React.FC<WidgetSectionProps> = ({ openModal }) => {
  const title = "Oyun Dünyası";

  const handleCardClick = useCallback(() => {
    const searchTerm = "ücretsiz online oyunlar oyna";
    const iframeSrc = `https://www.google.com/search?igu=1&hl=tr&q=${encodeURIComponent(searchTerm)}`;
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
      icon={<PuzzlePieceIcon className="w-6 h-6" />}
      onCardClick={handleCardClick}
    >
      <div className="flex flex-col items-center justify-center h-full text-center p-4 group">
        <PuzzlePieceIcon className="w-12 h-12 mx-auto text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
        <p className="text-sm text-gray-600 mb-3">
          Eğlenceli online oyunları keşfetmek ve oynamak için tıklayın.
        </p>
         <button
            onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
            }}
            className="mt-2 w-full text-sm text-orange-600 hover:text-orange-700 transition-colors py-2 px-4 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-white font-medium"
        >
            Oyun Ara
        </button>
      </div>
    </WidgetCard>
  );
};

export default GamesWidget;
