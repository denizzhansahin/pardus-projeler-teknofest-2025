import React, { useState, useEffect } from 'react';
import Modal from './Modal';

interface ApiKeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOCAL_STORAGE_KEY = 'PARDUS_AI_API_KEY';

const ApiKeySettingsModal: React.FC<ApiKeySettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY) || '';
      setApiKey(stored);
      setSaved(false);
      setShowReload(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, apiKey.trim());
    setSaved(true);
    setShowReload(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="API Anahtarı Ayarları">
      <div className="space-y-4 p-2">
        <label className="block text-slate-300 font-medium mb-1">Google Gemini API Key:</label>
        <input
          type="text"
          className="w-full px-3 py-2 rounded bg-slate-800 text-slate-200 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
          value={apiKey}
          onChange={(e: { target: { value: any; }; }) => setApiKey(e.target.value)}
          placeholder="API anahtarınızı girin"
        />
        <button
          className="mt-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded shadow font-semibold"
          onClick={handleSave}
        >
          Kaydet
        </button>
        {saved && <div className="text-green-400 mt-2">API anahtarı kaydedildi!</div>}
        {showReload && (
          <div className="mt-4 p-3 bg-yellow-700/30 text-yellow-200 rounded-lg flex flex-col items-center">
            <span>API anahtarı değişti. Değişikliğin geçerli olması için sayfayı yenilemeniz gerekir.</span>
            <button
              className="mt-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded shadow font-semibold"
              onClick={() => window.location.reload()}
            >
              Sayfayı Yenile
            </button>
          </div>
        )}
        <div className="text-xs text-slate-400 mt-4">
          API anahtarınız sadece bu tarayıcıda ve cihazda saklanır. Güvenliğiniz için kimseyle paylaşmayın.
        </div>
      </div>
    </Modal>
  );
};

export default ApiKeySettingsModal;
