import React from 'react';
import { View } from '../types';
import { Keyboard, History, GraduationCap, Settings } from 'lucide-react';
import pardusLogo from '../assets/Pardus-02.png';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Eye, EyeOff } from 'lucide-react';

interface HeaderProps {
    currentView: View;
    setView: (view: View) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
    const [showSettings, setShowSettings] = React.useState(false);
    const navItems = [
        { id: 'test', label: 'Yazma Testi', icon: Keyboard },
        { id: 'training', label: 'Alıştırma', icon: GraduationCap },
        { id: 'history', label: 'Geçmiş', icon: History },
    ];

    return (
        <header className="flex flex-col sm:flex-row justify-between items-center w-full">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                <img src={pardusLogo} alt="Pardus Logosu" className="w-10 h-15" />
                <h1 className="text-2xl sm:text-3xl font-bold text-text_primary tracking-tight">Pardus <span className="text-primary">Hızlı Klavye</span></h1>
                <button onClick={() => setShowSettings(true)} className="ml-2 p-2 rounded-full bg-light hover:bg-gray-600 transition-colors" title="Ayarlar">
                    <Settings className="w-6 h-6" />
                </button>
            </div>
            <nav className="bg-medium p-1.5 rounded-lg">
                <ul className="flex items-center space-x-1">
                    {navItems.map(item => (
                        <li key={item.id}>
                            <button
                                onClick={() => setView(item.id as View)}
                                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                    currentView === item.id 
                                        ? 'bg-primary text-white' 
                                        : 'bg-transparent text-text_secondary hover:bg-gray-600'
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span>{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            {showSettings && (
                <ApiKeyModal onClose={() => setShowSettings(false)} />
            )}
        </header>
    );
};

// Modal bileşeni
const ApiKeyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [apiKey, setApiKey] = useLocalStorage<string>('gemini-api-key', '');
    const [showKey, setShowKey] = React.useState(false);
    const [tempKey, setTempKey] = React.useState(apiKey);
    const [saved, setSaved] = React.useState(false);
    const handleSave = () => {
        setApiKey(tempKey);
        setSaved(true);
    };
    const handleReload = () => {
        window.location.reload();
    };
    const completionRate = apiKey && tempKey ? Math.round((tempKey.length / 39) * 100) : 0; // 39 karakterlik bir Gemini API key örneği için
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-medium p-6 rounded-lg shadow-xl min-w-[320px] relative">
                <button onClick={onClose} className="absolute top-2 right-2 p-1 text-text_secondary hover:text-primary">✕</button>
                <h2 className="text-xl font-bold mb-4 text-center">Gemini API Key</h2>
                <div className="mb-4">
                    <label htmlFor="apiKey" className="block text-sm font-medium text-text_secondary mb-1">API Key</label>
                    <div className="relative flex items-center">
                        <input
                            id="apiKey"
                            type={showKey ? 'text' : 'password'}
                            value={tempKey}
                            onChange={e => setTempKey(e.target.value)}
                            className="w-full bg-light border border-gray-600 rounded-md p-2 pr-10 focus:ring-primary focus:border-primary"
                            placeholder="API anahtarınızı girin"
                            disabled={saved}
                        />
                        <button type="button" className="absolute right-2" onClick={() => setShowKey(v => !v)} tabIndex={-1}>
                            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-text_secondary">API anahtarınız tarayıcıda saklanır ve sadece sizin tarafınızdan kullanılır.</p>
                        <span className="text-xs text-primary font-semibold">Tamamlama: %{completionRate}</span>
                    </div>
                </div>
                {!saved ? (
                    <button onClick={handleSave} className="w-full bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors duration-200 mt-2">Kaydet</button>
                ) : (
                    <div className="flex flex-col items-center space-y-2 mt-2">
                        <span className="text-green-500 font-semibold">API anahtarı kaydedildi.</span>
                        <button onClick={handleReload} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors duration-200">Sayfayı Yeniden Başlat</button>
                        <span className="text-xs text-text_secondary">Değişikliğin etkin olması için sayfayı yeniden başlatmalısınız.</span>
                    </div>
                )}
            </div>
        </div>
    );
};