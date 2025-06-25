import React, { useState } from 'react';
import { AppIcon } from '../assets/AppIcon';

interface ApiKeyInputProps {
  onApiKeySave: (apiKey: string) => void;
  initialApiKey?: string;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySave, initialApiKey }) => {
  const [apiKey, setApiKey] = useState<string>(initialApiKey || '');
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('pardusRunApiKey', apiKey.trim());
      setShowSaved(true);
      onApiKeySave(apiKey.trim());
      setTimeout(() => setShowSaved(false), 1500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-2xl max-w-md mx-auto mt-24 border border-purple-100 animate-fade-in">
      <AppIcon className="w-16 h-16 mb-2" />
      <h2 className="text-2xl font-bold text-purple-700 mb-1">Google Gemini API Anahtarı Gerekli</h2>
      <p className="text-gray-600 text-center text-sm mb-2">
        Uygulamayı kullanabilmek için kendi Google Gemini API anahtarınızı girmeniz gerekmektedir.<br/>
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline hover:text-purple-800">Anahtarınızı buradan edinebilirsiniz</a>.<br/>
        <span className="text-xs text-gray-400">(Örnek: AIzaSyA...)</span>
      </p>
      <input
        type="text"
        className="border-2 border-purple-300 focus:border-purple-500 rounded px-3 py-2 w-full text-sm outline-none transition"
        value={apiKey}
        onChange={e => setApiKey((e.target as HTMLInputElement).value)}
        placeholder="API Key girin..."
        autoFocus
      />
      <button
        className="mt-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg shadow hover:scale-105 transition font-semibold"
        onClick={handleSave}
      >Kaydet ve Yenile</button>
      {showSaved && <span className="text-green-600 text-xs mt-1">Kaydedildi!</span>}
    </div>
  );
};

export default ApiKeyInput;
