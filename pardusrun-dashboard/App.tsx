// @ts-nocheck
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import CentralSearch from './components/CentralSearch';
import ProminentSites from './components/ProminentSites';
import Dashboard from './components/Dashboard';
import Modal from './components/Modal';
import type { ModalProps, AppSettings, ChatBackgroundStyle } from './types'; 
import { SparklesIcon } from './components/icons/SparklesIcon';
import LoadingSpinner from './components/LoadingSpinner';
import DateTimeDisplay from './components/DateTimeDisplay';
import WorldClockWidget from './components/WorldClockWidget';
import SettingsPanel from './components/SettingsPanel';
import AIQuickResponseModal from './components/AIQuickResponseModal';
import DailyInsightSection from './components/DailyInsightSection'; 
import PardusSupportChatButton from './components/PardusSupportChatButton';
import PardusSupportChatModal from './components/PardusSupportChatModal';
import { DEFAULT_SETTINGS, DEFAULT_APP_BACKGROUND_COLOR } from './constants';
import ApiKeyInput from './components/ApiKeyInput';
import { AppIcon } from './assets/AppIcon';
import { Image as LucideImage, Download as LucideDownload, Lightbulb, Languages, CalendarDays, Sparkles } from 'lucide-react';

const getApiKeyFromStorage = () => localStorage.getItem('pardusRunApiKey') || '';

const App: React.FC = () => {
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(null);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalSize, setModalSize] = useState<ModalProps['size']>('2xl');
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isAIQuickResponseModalOpen, setIsAIQuickResponseModalOpen] = useState(false);
  const [isPardusSupportChatModalOpen, setIsPardusSupportChatModalOpen] = useState(false);
  const [userApiKey, setUserApiKey] = useState<string>(getApiKeyFromStorage());

  useEffect(() => {
    const storedSettings = localStorage.getItem('pardusRunAppSettings');
    if (storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings) as AppSettings;
        if (!parsedSettings.backgroundStyle) {
          parsedSettings.backgroundStyle = { type: 'default', value: parsedSettings.appBackgroundColor || DEFAULT_APP_BACKGROUND_COLOR };
          if(parsedSettings.appBackgroundImage) {
            parsedSettings.backgroundStyle = { type: 'imageURL', value: parsedSettings.appBackgroundImage };
          }
        }
        setAppSettings(parsedSettings);
      } catch (error) {
        console.error("Failed to parse settings from localStorage", error);
        setAppSettings(DEFAULT_SETTINGS); 
      }
    }
    setUserApiKey(getApiKeyFromStorage());
  }, []);

  const handleSaveSettings = (newSettings: AppSettings) => {
    let finalBackgroundColor = DEFAULT_APP_BACKGROUND_COLOR;
    let finalBackgroundImage = "";

    if (newSettings.backgroundStyle.type === 'color') {
      finalBackgroundColor = newSettings.backgroundStyle.value;
    } else if (newSettings.backgroundStyle.type === 'default') {
      finalBackgroundColor = DEFAULT_APP_BACKGROUND_COLOR; 
    } else if (newSettings.backgroundStyle.type === 'imageURL' || newSettings.backgroundStyle.type === 'imageData') {
      finalBackgroundImage = newSettings.backgroundStyle.value;
      finalBackgroundColor = 'transparent'; 
    }
    
    const settingsToSave: AppSettings = {
      ...newSettings,
      appBackgroundColor: finalBackgroundColor,
      appBackgroundImage: finalBackgroundImage,
    };

    setAppSettings(settingsToSave);
    localStorage.setItem('pardusRunAppSettings', JSON.stringify(settingsToSave));
    setIsSettingsPanelOpen(false);
  };

  const openModal = useCallback((title: string, content: React.ReactNode, isLoading: boolean = false, size: ModalProps['size'] = '2xl') => {
    setModalTitle(title);
    setModalContent(content);
    setIsModalLoading(isLoading);
    setModalSize(size);
  }, []);

  const closeModal = useCallback(() => {
    setModalContent(null);
    setModalTitle('');
    setIsModalLoading(false);
    setModalSize('2xl');
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (query.trim()) {
      const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query.trim())}&hl=tr`;
      window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const appStyle: React.CSSProperties = {
    backgroundColor: appSettings.backgroundStyle.type === 'imageURL' || appSettings.backgroundStyle.type === 'imageData' ? 'transparent' : appSettings.backgroundStyle.value || DEFAULT_APP_BACKGROUND_COLOR,
    backgroundImage: (appSettings.backgroundStyle.type === 'imageURL' || appSettings.backgroundStyle.type === 'imageData') && appSettings.backgroundStyle.value ? `url('${appSettings.backgroundStyle.value}')` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

  if (!userApiKey) {
    return <ApiKeyInput onApiKeySave={() => window.location.reload()} initialApiKey={userApiKey} />;
  }

  return (
    <div 
      className="min-h-screen flex flex-col text-gray-800 selection:bg-purple-500 selection:text-white"
      style={appStyle}
    >
      <Header 
        onOpenSettings={() => setIsSettingsPanelOpen(true)} 
        apiKeyAvailable={!!userApiKey}
      />
      
      <div className="flex-grow flex flex-col items-center w-full px-4 pt-6 pb-10 sm:pt-8 sm:pb-12">
        <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center sm:items-start justify-center sm:gap-x-6 mb-6 sm:mb-8">
          <div className="flex-grow w-full sm:max-w-2xl">
            <CentralSearch 
              onOpenAIQuickResponse={() => setIsAIQuickResponseModalOpen(true)}
              apiKeyAvailable={!!userApiKey}
            />
          </div>
          <div className="mt-3 sm:mt-0 sm:pt-3 flex-shrink-0">
            <DateTimeDisplay />
          </div>
        </div>

        <WorldClockWidget />
        
        <DailyInsightSection apiKeyAvailable={!!userApiKey} />

        <ProminentSites /> 

        <div className="w-full max-w-7xl mx-auto mt-10 sm:mt-12">
          <Dashboard 
            openModal={openModal} 
            defaultCity={appSettings.defaultCity} 
            apiKeyAvailable={!!userApiKey}
          />
        </div>
      </div>

      <footer className="text-center p-5 text-base text-gray-500 border-t border-gray-200 bg-gradient-to-r from-purple-50 via-white to-orange-50 shadow-inner">
        <div className="flex flex-col items-center gap-1">
          <span className="font-semibold text-gray-700 flex items-center gap-2">
            <AppIcon className="w-5 h-5 inline-block align-middle" /> PardusRun
          </span>
          <span className="text-xs text-gray-400">Space Teknopoli Takımı &copy; {new Date().getFullYear()}</span>
        </div>
      </footer>

      {modalContent && (
        <Modal title={modalTitle} isOpen={!!modalContent} onClose={closeModal} size={modalSize}>
          {isModalLoading ? <LoadingSpinner size="w-12 h-12" /> : modalContent}
        </Modal>
      )}

      {isSettingsPanelOpen && (
        <SettingsPanel
          isOpen={isSettingsPanelOpen}
          onClose={() => setIsSettingsPanelOpen(false)}
          currentSettings={appSettings}
          onSave={handleSaveSettings}
        />
      )}
      {isAIQuickResponseModalOpen && (
        <AIQuickResponseModal
          isOpen={isAIQuickResponseModalOpen}
          onClose={() => setIsAIQuickResponseModalOpen(false)}
          apiKeyAvailable={!!userApiKey}
        />
      )}
      {userApiKey && (
        <PardusSupportChatButton onClick={() => setIsPardusSupportChatModalOpen(true)} />
      )}
      {isPardusSupportChatModalOpen && (
         <PardusSupportChatModal
          isOpen={isPardusSupportChatModalOpen}
          onClose={() => setIsPardusSupportChatModalOpen(false)}
          apiKeyAvailable={!!userApiKey} 
        />
      )}
    </div>
  );
};

export default App;
