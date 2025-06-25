
import React, { useState, useCallback } from 'react';
import WidgetCard from '../WidgetCard';
import { WidgetSectionProps, NewsCategory } from '../../types';
import { NewspaperIcon } from '../icons/NewspaperIcon';
import { NEWS_CATEGORIES_AVAILABLE } from '../../constants';

const NewsWidget: React.FC<WidgetSectionProps> = ({ openModal }) => {
  const [currentCategory, setCurrentCategory] = useState<NewsCategory>(NEWS_CATEGORIES_AVAILABLE.filter(cat => cat !== NewsCategory.AcilDurum)[0] || NewsCategory.Spor);

  const handleCardClick = useCallback(() => {
    let searchTerm = currentCategory.toString(); // Categories are now Turkish
    switch(currentCategory) { // Keep switch for potential specific search terms if needed
        case NewsCategory.Spor: searchTerm = "spor haberleri"; break;
        case NewsCategory.Siyaset: searchTerm = "siyaset haberleri"; break;
        case NewsCategory.Magazin: searchTerm = "magazin haberleri"; break;
        case NewsCategory.Kultur: searchTerm = "kültür sanat haberleri"; break;
        case NewsCategory.Saglik: searchTerm = "sağlık haberleri"; break;
        default: searchTerm = `${currentCategory} haberleri`;
    }

    const iframeSrc = `https://www.google.com/search?igu=1&tbm=nws&hl=tr&q=${encodeURIComponent(searchTerm)}`;
    openModal(
      `${currentCategory} Haberleri`,
      <div className="aspect-[9/16] sm:aspect-video bg-gray-900 rounded-lg">
        <iframe
          src={iframeSrc}
          title={`${currentCategory} Haberleri`}
          className="w-full h-full border-0 rounded-lg"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />
      </div>,
      false,
      '5xl' 
    );
  }, [currentCategory, openModal]);

  return (
    <WidgetCard 
      title="Güncel Haberler" 
      icon={<NewspaperIcon className="w-6 h-6" />}
      onCardClick={handleCardClick} 
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          <label htmlFor="news-category-select" className="sr-only">Haber Kategorisi Seçin</label>
          <select
            id="news-category-select"
            value={currentCategory}
            onChange={(e) => {
              e.stopPropagation(); 
              setCurrentCategory(e.target.value as NewsCategory);
            }}
            onClick={(e) => e.stopPropagation()} 
            className="w-full p-2.5 rounded-md bg-gray-50 text-gray-700 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors mb-4 placeholder-gray-400"
          >
            {NEWS_CATEGORIES_AVAILABLE.filter(cat => cat !== NewsCategory.AcilDurum).map(cat => (
              <option key={cat} value={cat}>{cat}</option> // Directly use Turkish category names
            ))}
          </select>
          <p className="text-sm text-gray-500 text-center px-2">
            Seçili kategorideki en son haberleri Google üzerinden görmek için karta tıklayın.
          </p>
        </div>
         <button
            onClick={(e) => {
                e.stopPropagation(); 
                handleCardClick();
            }}
            className="mt-4 w-full text-sm text-purple-600 hover:text-purple-700 transition-colors py-2.5 px-4 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 focus:ring-offset-white font-medium"
        >
            {currentCategory} Haberlerini Görüntüle
        </button>
      </div>
    </WidgetCard>
  );
};

export default NewsWidget;
