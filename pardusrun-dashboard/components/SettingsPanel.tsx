// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { AppSettings, ChatBackgroundStyle } from '../types';
import { DEFAULT_SETTINGS, BACKGROUND_COLORS, STOCK_BACKGROUND_IMAGES, DEFAULT_APP_BACKGROUND_COLOR } from '../constants';
import { Upload } from 'lucide-react';

// Simple XMarkIcon as requested by user
const CloseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className || "w-6 h-6"}>
    <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);

// Simple IconButton structure
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  label: string;
}
const IconButton: React.FC<IconButtonProps> = ({ children, label, className, ...props }) => (
  <button aria-label={label} className={`p-1.5 rounded-full transition-colors ${className}`} {...props}>
    {children}
  </button>
);


interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
  const [defaultCity, setDefaultCity] = useState(currentSettings.defaultCity);
  const [currentBackground, setCurrentBackground] = useState<ChatBackgroundStyle>(currentSettings.backgroundStyle);
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('pardusRunApiKey') || '');
  const [prevApiKey, setPrevApiKey] = useState<string>(localStorage.getItem('pardusRunApiKey') || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDefaultCity(currentSettings.defaultCity);
    setCurrentBackground(currentSettings.backgroundStyle);
    setApiKey(localStorage.getItem('pardusRunApiKey') || '');
    setPrevApiKey(localStorage.getItem('pardusRunApiKey') || '');
  }, [currentSettings]);

  // Type assertion for background type
  const getBackgroundType = (type: string): ChatBackgroundStyle['type'] => {
    if (type === 'default' || type === 'color' || type === 'imageURL' || type === 'imageData') return type;
    return 'default';
  };

  const handleApplyBackground = (style: ChatBackgroundStyle) => {
    setCurrentBackground(style);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) { 
        alert("Dosya çok büyük. Lütfen 50MB'ın altında bir resim seçin.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleApplyBackground({ type: 'imageData', value: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = ""; 
  };

  const handleSave = () => {
    const trimmedApiKey = apiKey.trim();
    const apiKeyChanged = trimmedApiKey !== prevApiKey;
    if (apiKeyChanged) {
      const confirmed = window.confirm('API Key değiştirildi. Değişikliklerin geçerli olması için sayfa yenilenecek. Devam etmek istiyor musunuz?');
      if (confirmed) {
        localStorage.setItem('pardusRunApiKey', trimmedApiKey);
        const newSettings: AppSettings = {
          defaultCity: defaultCity.trim() || DEFAULT_SETTINGS.defaultCity,
          backgroundStyle: currentBackground,
          appBackgroundColor: currentBackground.type === 'color' ? currentBackground.value : (currentBackground.type === 'default' ? DEFAULT_APP_BACKGROUND_COLOR : DEFAULT_APP_BACKGROUND_COLOR),
          appBackgroundImage: (currentBackground.type === 'imageURL' || currentBackground.type === 'imageData') ? currentBackground.value : "",
        };
        onSave(newSettings);
        setTimeout(() => {
          window.location.reload();
        }, 500);
        return;
      }
    }
    localStorage.setItem('pardusRunApiKey', trimmedApiKey);
    const newSettings: AppSettings = {
      defaultCity: defaultCity.trim() || DEFAULT_SETTINGS.defaultCity,
      backgroundStyle: currentBackground,
      appBackgroundColor: currentBackground.type === 'color' ? currentBackground.value : (currentBackground.type === 'default' ? DEFAULT_APP_BACKGROUND_COLOR : DEFAULT_APP_BACKGROUND_COLOR),
      appBackgroundImage: (currentBackground.type === 'imageURL' || currentBackground.type === 'imageData') ? currentBackground.value : "",
    };
    onSave(newSettings);
  };

  const resetToDefaults = () => {
    setDefaultCity(DEFAULT_SETTINGS.defaultCity);
    setCurrentBackground(DEFAULT_SETTINGS.backgroundStyle);
    // Directly save default settings
    onSave({
        defaultCity: DEFAULT_SETTINGS.defaultCity,
        backgroundStyle: DEFAULT_SETTINGS.backgroundStyle,
        appBackgroundColor: DEFAULT_APP_BACKGROUND_COLOR,
        appBackgroundImage: "",
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-panel-title"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 id="settings-panel-title" className="text-xl font-semibold text-purple-700">Ayarlar</h2>
          <IconButton 
            label="Ayarlar panelini kapat" 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white"
          >
            <CloseIcon className="w-6 h-6" />
          </IconButton>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-gray-700">
          {/* API Key Alanı */}
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              Google Gemini API Key
            </label>
            <input
              type="text"
              id="apiKey"
              value={apiKey}
              onChange={e => setApiKey((e.target as HTMLInputElement).value)}
              placeholder="API Key girin..."
              className="w-full p-2.5 rounded-md bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-400"
            />
            <p className="text-xs text-gray-500 mt-1">
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline hover:text-purple-800">Anahtarınızı buradan edinebilirsiniz</a>.
            </p>
          </div>

          {/* Arkaplan Ayarları Alanı */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Arkaplan Seçenekleri</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {BACKGROUND_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${currentBackground.type === color.type && currentBackground.value === color.value ? 'border-purple-600 ring-2 ring-purple-300' : 'border-gray-200'} focus:outline-none`}
                  style={{ background: color.value }}
                  title={color.name}
                  onClick={() => handleApplyBackground({ type: getBackgroundType(color.type), value: color.value })}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {STOCK_BACKGROUND_IMAGES.map((img) => (
                <button
                  key={img.value}
                  type="button"
                  className={`w-16 h-10 rounded-lg border-2 bg-cover bg-center ${currentBackground.type === img.type && currentBackground.value === img.value ? 'border-purple-600 ring-2 ring-purple-300' : 'border-gray-200'} focus:outline-none`}
                  style={{ backgroundImage: `url('${img.value}')` }}
                  title={img.name}
                  onClick={() => handleApplyBackground({ type: getBackgroundType(img.type), value: img.value })}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Upload className="w-5 h-5 text-purple-400" />
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              <span className="text-xs text-gray-400">(50MB max)</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-gray-500">Seçili arkaplan: </span>
              {currentBackground.type === 'color' || currentBackground.type === 'default' ? (
                <span className="inline-block w-6 h-6 rounded-full border border-gray-300" style={{ background: currentBackground.value }} />
              ) : (
                <img src={currentBackground.value} alt="Seçili arkaplan" className="w-10 h-6 object-cover rounded border border-gray-300" />
              )}
            </div>
          </div>

          {/* Varsayılan Şehir Alanı */}
          <div>
            <label htmlFor="defaultCity" className="block text-sm font-medium text-gray-700 mb-1">Varsayılan Şehir</label>
            <input
              type="text"
              id="defaultCity"
              value={defaultCity}
              onChange={e => setDefaultCity((e.target as HTMLInputElement).value)}
              placeholder="Varsayılan şehir..."
              className="w-full p-2.5 rounded-md bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-400"
            />
          </div>
        </div>

        <div className="p-5 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            type="button"
            onClick={resetToDefaults}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Varsayılanlara Sıfırla
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Ayarları Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;