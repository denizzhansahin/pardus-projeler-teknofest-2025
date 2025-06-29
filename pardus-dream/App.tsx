import React, { useState, useEffect, useCallback } from 'react';
import Generator from './components/Generator';
import Gallery from './components/Gallery';
import ImageDisplay from './components/ImageDisplay';
import SplashScreen from './components/SplashScreen';
import ImageModal from './components/ImageModal';
import SettingsModal from './components/SettingsModal';
import { useHistory } from './hooks/useHistory';
import { HistoryItem } from './types';
import { SunIcon, MoonIcon } from './constants';
import { Settings } from 'lucide-react';

function App() {
  const { items, addHistoryItem, deleteHistoryItem, clearHistory, exportHistory, importHistory } = useHistory();
  const [displayedImage, setDisplayedImage] = useState<HistoryItem | null>(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('theme')) {
      return localStorage.getItem('theme') as 'dark' | 'light';
    }
    return 'dark';
  });

  const [showSplash, setShowSplash] = useState(true);
  const [isAppVisible, setIsAppVisible] = useState(false);

  const [modalItem, setModalItem] = useState<HistoryItem | null>(null);
  const [imageForGeneration, setImageForGeneration] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Sync theme with DOM
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Set initial displayed image once history is loaded
  useEffect(() => {
    if (items.length > 0 && !displayedImage) {
      setDisplayedImage(items[0]);
    }
  }, [items, displayedImage]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalItem) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => document.body.classList.remove('no-scroll');
  }, [modalItem]);

  const handleSplashFinished = () => {
    setShowSplash(false);
    setIsAppVisible(true);
  };

  const handleToggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  }, []);

  const handleImageGenerated = useCallback((item: Omit<HistoryItem, 'id' | 'createdAt'>) => {
    addHistoryItem(item);
    // The useHistory hook will update `items`, and the useEffect above will set the new image
  }, [addHistoryItem]);

  const handleOpenModal = (item: HistoryItem) => {
    setModalItem(item);
  };

  const handleCloseModal = () => {
    setModalItem(null);
  };

  const handleUseImageFromModal = (imageUrl: string) => {
    setImageForGeneration(imageUrl);
    handleCloseModal();
  };

  const handleClearImageForGeneration = () => {
    setImageForGeneration(null);
  }

  const handleDownloadFromModal = (item: HistoryItem) => {
    const link = document.createElement('a');
    link.href = item.imageUrl;
    const safePrompt = item.prompt.slice(0, 30).replace(/[^\w\s]/gi, '').replace(/\s/g, '_');
    link.download = `PardusDream_${safePrompt}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <>
      {showSplash && <SplashScreen onFinished={handleSplashFinished} />}
      {modalItem && (
        <ImageModal
          imageItem={modalItem}
          onClose={handleCloseModal}
          onUseImage={handleUseImageFromModal}
          onDownload={handleDownloadFromModal}
        />
      )}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <div className={`min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-800 text-gray-800 dark:text-gray-200 font-sans p-4 sm:p-6 lg:p-8 transition-opacity duration-700 ${isAppVisible ? 'opacity-100' : 'opacity-0'}`}>
        <div className="max-w-screen-2xl mx-auto">
          <header className="flex justify-between items-center mb-10">
            <div className="text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                Pardus Dream
              </h1>
              <p className="mt-2 text-lg text-gray-500 dark:text-gray-400">AI Görsel Stüdyosu</p>
            </div>
            <div className="flex gap-2 items-center">
                {/* 
                <button
                onClick={handleToggleTheme}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-110"
                aria-label="Toggle theme"
                >
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
                </button>
                */}
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-full text-blue-600 bg-blue-100 hover:bg-blue-200 transition-all duration-300 transform hover:scale-110 shadow-lg"
                aria-label="Ayarlar"
              >
                <Settings size={32} />
              </button>
            </div>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <Generator
                onImageGenerated={handleImageGenerated}
                setDisplayedImage={setDisplayedImage}
                imageForGeneration={imageForGeneration}
                clearImageForGeneration={handleClearImageForGeneration}
              />
            </div>
            <div className="lg:col-span-3">
              <ImageDisplay imageItem={displayedImage} onImageClick={handleOpenModal} />
            </div>
          </main>

          <Gallery
            items={items}
            deleteHistoryItem={deleteHistoryItem}
            clearHistory={clearHistory}
            exportHistory={exportHistory}
            importHistory={importHistory}
            onImageClick={handleOpenModal}
          />
        </div>
      </div>
    </>
  );
}

export default App;