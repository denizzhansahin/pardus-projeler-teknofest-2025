import React from 'react';
import { HistoryItem } from '../types';
import { DownloadIcon } from '../constants';

interface ImageDisplayProps {
  imageItem: HistoryItem | null;
  onImageClick: (item: HistoryItem) => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ imageItem, onImageClick }) => {
  const handleDownload = () => {
    if (!imageItem) return;
    const link = document.createElement('a');
    link.href = imageItem.imageUrl;
    const safePrompt = imageItem.prompt.slice(0, 30).replace(/[^\w\s]/gi, '').replace(/\s/g, '_');
    link.download = `PardusDream_${safePrompt}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
    
  return (
    <div 
      key={imageItem?.id || 'image-display'}
      className="p-6 bg-white/60 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700/60 sticky top-6 transition-all duration-300 animate-fade-in"
    >
       <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mb-4">2. Sonuç</h2>
      <div className="aspect-square bg-gray-200/80 dark:bg-gray-900/80 rounded-lg flex items-center justify-center overflow-hidden transition-colors duration-300 cursor-pointer group"
           onClick={() => imageItem && onImageClick(imageItem)}>
        {imageItem ? (
          <img src={imageItem.imageUrl} alt={imageItem.prompt} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400 p-4 transition-colors duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l-1.586-1.586a2 2 0 00-2.828 0L6 14m6-6l.586-.586a2 2 0 012.828 0L18 10" />
            </svg>
            <p className="mt-4">Oluşturulan görsel burada görünecek.</p>
          </div>
        )}
      </div>
      {imageItem && (
        <div className="mt-4 space-y-3">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">İstem (TR)</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 break-words">{imageItem.prompt}</p>
          </div>
          {imageItem.translatedPrompt && (
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">İstem (EN - Çeviri)</h3>
              <p className="text-sm text-gray-500 dark:text-gray-500 break-words font-mono">{imageItem.translatedPrompt}</p>
            </div>
          )}
           <button 
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-400/50 transition-all duration-300 transform hover:scale-105"
          >
            <DownloadIcon /> İndir
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageDisplay;