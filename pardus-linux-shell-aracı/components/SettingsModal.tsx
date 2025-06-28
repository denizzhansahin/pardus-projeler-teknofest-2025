import React from 'react';
import { Model } from '../types';

interface SettingsModalProps {
  currentModel: Model;
  onModelChange: (model: Model) => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ currentModel, onModelChange, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Ayarlar</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="model-select" className="block text-sm font-medium text-gray-300 mb-1">
              Yapay Zeka Modeli
            </label>
            <select
              id="model-select"
              value={currentModel}
              onChange={(e) => onModelChange(e.target.value as Model)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              {Object.values(Model).map(modelValue => (
                <option key={modelValue} value={modelValue}>
                  {modelValue}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-2">
              İsteklerinizi işlemek için Gemini modelini seçin.
            </p>
          </div>
          
          <div className="pt-4 border-t border-gray-700">
             <h3 className="text-md font-semibold text-gray-200">API Anahtarı</h3>
             <input
                type="text"
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 mt-2"
                value={localStorage.getItem('API_KEY') || ''}
                onChange={e => {
                  localStorage.setItem('API_KEY', e.target.value);
                  window.location.reload(); // Anahtarı değiştirdikten sonra uygulamayı yenile
                }}
                placeholder="Google AI API Key"
              />
             <p className="text-xs text-gray-400 mt-2 bg-gray-700/50 p-2 rounded-md">
                Google AI API Anahtarınızı buradan değiştirebilirsiniz. Değişiklikten sonra uygulama otomatik olarak yenilenecektir.
             </p>
          </div>

        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;