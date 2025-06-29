import React from 'react';
import { HistoryItem } from '../types';
import { DownloadIcon, ImageIcon } from '../constants';

interface ImageModalProps {
  imageItem: HistoryItem;
  onClose: () => void;
  onUseImage: (imageUrl: string) => void;
  onDownload: (item: HistoryItem) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageItem, onClose, onUseImage, onDownload }) => {
  // Prevent clicks inside the modal from closing it
  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 z-40 bg-black/70 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row gap-4 p-4 animate-fade-in-up"
        onClick={handleModalContentClick}
      >
        <div className="flex-1 flex items-center justify-center md:h-auto min-h-[300px]">
           <img 
              src={imageItem.imageUrl} 
              alt={imageItem.prompt} 
              className="max-w-full max-h-full object-contain rounded-lg"
              style={{ maxHeight: 'calc(90vh - 100px)' }}
            />
        </div>
        <div className="md:w-80 flex flex-col space-y-4">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Detaylar</h2>
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">İstem (TR)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 break-words max-h-24 overflow-y-auto">{imageItem.prompt}</p>
            </div>
            {imageItem.translatedPrompt && (
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">İstem (EN - Çeviri)</h3>
                <p className="text-sm text-gray-500 dark:text-gray-500 break-words font-mono max-h-24 overflow-y-auto">{imageItem.translatedPrompt}</p>
              </div>
            )}
            <div className="mt-auto space-y-2 pt-4">
                 <button 
                    onClick={() => onUseImage(imageItem.imageUrl)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                  >
                    <ImageIcon /> Bu Görseli Kullan
                  </button>
                  <button 
                    onClick={() => onDownload(imageItem)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
                  >
                    <DownloadIcon /> İndir
                  </button>
            </div>
             <button 
                onClick={onClose}
                className="absolute -top-3 -right-3 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-white text-xl font-bold hover:bg-black transition-all transform hover:scale-110 md:hidden"
                aria-label="Kapat"
            >
              &times;
            </button>
        </div>
      </div>
       <button 
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white text-2xl font-bold hover:bg-black/80 transition-all transform hover:scale-110 hidden md:flex"
        aria-label="Kapat"
      >
        &times;
      </button>
    </div>
  );
};

export default ImageModal;
