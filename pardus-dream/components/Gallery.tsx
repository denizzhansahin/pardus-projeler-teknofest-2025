
import React, { useRef } from 'react';
import { HistoryItem } from '../types';

interface GalleryProps {
  items: HistoryItem[];
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
  exportHistory: () => void;
  importHistory: (file: File) => void;
  onImageClick: (item: HistoryItem) => void;
}

const Gallery: React.FC<GalleryProps> = ({ items, deleteHistoryItem, clearHistory, exportHistory, importHistory, onImageClick }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importHistory(file);
      event.target.value = '';
    }
  };

  return (
    <div className="mt-12 p-6 bg-white/60 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700/60 transition-colors duration-300">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Geçmiş</h2>
        <div className="flex gap-2 flex-wrap">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="application/json" />
          <button onClick={handleImportClick} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">İçe Aktar</button>
          <button onClick={exportHistory} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-105">Dışa Aktar</button>
          <button onClick={clearHistory} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105">Temizle</button>
        </div>
      </div>
      
      {items.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">Henüz bir görsel oluşturmadınız.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item, index) => (
            <div 
              key={item.id} 
              className="group relative overflow-hidden rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 animate-fade-in-up cursor-pointer"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onImageClick(item)}
            >
              <img 
                src={item.imageUrl} 
                alt={item.prompt} 
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                <p className="text-xs text-white line-clamp-2">{item.prompt}</p>
              </div>
               <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteHistoryItem(item.id);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-600/80 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-all transform scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100"
                  aria-label="Sil"
                >
                  &times;
                </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
