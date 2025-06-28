import React, { useState, useEffect } from 'react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      const storedKey = localStorage.getItem('API_KEY') || '';
      setApiKey(storedKey);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('API_KEY', apiKey);
    onSave(apiKey);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-lg font-bold mb-4">API Anahtarını Gir</h2>
        <input
          type="text"
          className="w-full border p-2 rounded mb-4"
          value={apiKey}
          onChange={e => setApiKey(e.target.value)}
          placeholder="API Key"
        />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>İptal</button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSave}>Kaydet</button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
