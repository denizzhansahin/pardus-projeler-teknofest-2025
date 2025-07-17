import React, { useState, useEffect } from 'react';
import { CogIcon } from './icons/CogIcon';

interface SettingsViewProps {
  theme: string;
  setTheme: (theme: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ theme, setTheme }) => {
  const [apiKey, setApiKey] = useState('');
  const [isKeySaved, setIsKeySaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini-api-key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem('gemini-api-key', apiKey);
    setIsKeySaved(true);
    setTimeout(() => {
      setIsKeySaved(false);
    }, 2500);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-lg shadow-lg dark:shadow-xl">
      <div className="flex items-center space-x-4 mb-8">
        <CogIcon className="h-10 w-10 text-cyan-600 dark:text-cyan-400" />
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Ayarlar</h2>
          <p className="text-slate-500 dark:text-slate-400">Uygulama tercihlerinizi buradan yönetin.</p>
        </div>
      </div>
      
      <div className="space-y-10">
        
        <div>
          <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Görünüm</h3>
          <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-700/50 p-4 rounded-md">
            <span className="text-slate-700 dark:text-slate-300 font-medium">Uygulama Teması</span>
            <div className="flex space-x-2">
              <button onClick={() => setTheme('light')} className={`px-4 py-1 rounded-md text-sm font-semibold ${theme === 'light' ? 'bg-cyan-500 text-white' : 'bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-400 dark:hover:bg-slate-500'}`}>Açık</button>
              <button onClick={() => setTheme('dark')} className={`px-4 py-1 rounded-md text-sm font-semibold ${theme === 'dark' ? 'bg-cyan-500 text-white' : 'bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-400 dark:hover:bg-slate-500'}`}>Koyu</button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Yapay Zeka Özellikleri</h3>
          <div className="space-y-4">
             <div className="p-4 bg-sky-50 dark:bg-sky-900/30 border-l-4 border-sky-400 dark:border-sky-500 rounded-r-lg">
                <p className="text-sm text-sky-800 dark:text-sky-300">
                    "Yapay Zeka Metin Egzersizi" özelliği, Google Gemini API kullanılarak güçlendirilmiştir. Bu özelliği kullanmak için Google AI Studio'dan aldığınız API anahtarınızı aşağıya girmeniz gerekmektedir.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input 
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Google Gemini API Anahtarınızı buraya yapıştırın"
                    className="flex-grow w-full p-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                />
                <button 
                    onClick={handleSaveApiKey}
                    className="px-4 py-2 bg-cyan-500 text-white font-semibold rounded-md hover:bg-cyan-600 transition-colors disabled:bg-slate-400"
                    disabled={!apiKey}
                >
                    Kaydet
                </button>
            </div>
             {isKeySaved && (
              <p className="text-sm text-green-600 dark:text-green-400">API anahtarı başarıyla kaydedildi.</p>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-cyan-600 dark:text-cyan-400 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Hakkında</h3>
          <div className="text-slate-500 dark:text-slate-400 space-y-2">
            <p><strong>Uygulama Adı:</strong> Hızlı Oku</p>
            <p><strong>Versiyon:</strong> 1.2.0</p>
            <p>Bu uygulama, göz kaslarını güçlendirerek okuma hızını artırmak ve odaklanmayı geliştirmek amacıyla tasarlanmıştır.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;