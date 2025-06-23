import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [showReload, setShowReload] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('GOOGLE_API_KEY') || '';
      setApiKey(storedKey);
      setShowReload(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('GOOGLE_API_KEY', apiKey);
    setShowReload(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg relative">
        <h2 className="text-2xl font-bold mb-4 text-slate-800 flex items-center gap-2">
          <span>Google AI Studio API Key</span>
        </h2>
        <p className="mb-4 text-slate-600 text-sm">Kendi Google AI Studio API anahtarınızı giriniz. Anahtarınız tarayıcınızda güvenli bir şekilde saklanır.</p>
        <input
          type="text"
          className="w-full border border-slate-300 p-3 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-800"
          placeholder="API Key giriniz..."
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
        />
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-2">
          <button
            className="px-4 py-2 bg-gray-200 text-slate-700 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Kapat
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            onClick={handleSave}
            disabled={!apiKey}
          >
            Kaydet
          </button>
        </div>
        {showReload && (
          <div className="mt-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 rounded">
            <p className="mb-2 font-semibold">API anahtarı kaydedildi!</p>
            <p>Değişikliğin geçerli olması için sayfayı yenilemeniz gerekmektedir.</p>
            <button
              className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center gap-2"
              onClick={() => window.location.reload()}
            >
              Sayfayı Yenile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiKeyModal;
