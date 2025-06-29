import React, { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LOCAL_STORAGE_KEY = 'pardusDreamApiKey';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem(LOCAL_STORAGE_KEY) || '';
      setApiKey(storedKey);
      setShowReload(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, apiKey);
    setShowReload(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Ayarlar</h2>
        <label className="block mb-2 font-medium">API Key</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2 mb-4"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder="API anahtarınızı girin"
        />
        {showReload && (
          <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded flex flex-col items-center">
            <span>API anahtarı kaydedildi. Değişikliğin aktif olması için sayfayı yenileyin.</span>
            <button
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Sayfayı Yenile
            </button>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            İptal
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={handleSave}
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export const getStoredApiKey = () => {
  return localStorage.getItem(LOCAL_STORAGE_KEY) || '';
};

export default SettingsModal;
