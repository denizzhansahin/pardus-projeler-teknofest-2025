import React, { useState } from 'react';
import { Settings } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState<string>(localStorage.getItem('PARDUS_PIKSELLA_API_KEY') || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('PARDUS_PIKSELLA_API_KEY', apiKey);
    setSaved(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-pardus-dark p-6 rounded-lg shadow-lg w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-pardus-accent">
          <span className="sr-only">Kapat</span>
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" /> Ayarlar
        </h2>
        <label className="block mb-2 font-semibold">Google Gemini API Key</label>
        <input
          type="text"
          className="w-full p-2 rounded border border-gray-300 dark:bg-pardus-light-dark dark:text-white mb-4"
          value={apiKey}
          onChange={e => { setApiKey(e.target.value); setSaved(false); }}
          placeholder="API anahtarınızı girin"
        />
        <button
          onClick={handleSave}
          className="w-full bg-pardus-accent hover:bg-pardus-accent-hover text-white font-bold py-2 px-4 rounded mb-2"
        >
          Kaydet
        </button>
        {saved && (
          <div className="bg-yellow-100 text-yellow-800 p-2 rounded text-center mt-2">
            API anahtarı kaydedildi. <b>Sayfayı yenilemeniz gerekmektedir.</b>
            <button onClick={() => window.location.reload()} className="ml-2 underline text-pardus-accent">Yenile</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;
