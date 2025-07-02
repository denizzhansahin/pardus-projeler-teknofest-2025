import React, { useState } from 'react';

const LOCAL_KEY = 'flowmind_api_key';

export function getApiKey(): string | null {
  return localStorage.getItem(LOCAL_KEY);
}

export function setApiKey(key: string) {
  localStorage.setItem(LOCAL_KEY, key);
}

export const Settings: React.FC = () => {
  const [apiKey, setApiKeyState] = useState<string>(getApiKey() || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(apiKey);
    setSaved(true);
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-white">Ayarlar</h2>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-slate-300 mb-1">Google Gemini API Key</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none"
            value={apiKey}
            onChange={e => { setApiKeyState(e.target.value); setSaved(false); }}
            placeholder="API anahtarınızı girin"
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition-colors"
        >Kaydet</button>
      </form>
      {saved && (
        <div className="mt-4 bg-yellow-100 text-yellow-800 p-3 rounded flex items-center justify-between">
          <span>API anahtarı kaydedildi. Değişikliklerin geçerli olması için sayfayı yenileyin.</span>
          <button
            onClick={handleReload}
            className="ml-4 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold py-1 px-3 rounded"
          >Yenile</button>
        </div>
      )}
    </div>
  );
};
