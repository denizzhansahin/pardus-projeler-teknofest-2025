import React, { useState, useCallback } from 'react';
import { TestConfig, LengthOption, DurationOption } from '../types';
import { Eye, EyeOff, Play } from 'lucide-react';

interface SettingsPanelProps {
    initialConfig: TestConfig;
    onStart: (config: TestConfig) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ initialConfig, onStart }) => {
    const [config, setConfig] = useState<TestConfig>(initialConfig);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onStart(config);
    };

    const handleConfigChange = useCallback(<K extends keyof TestConfig>(key: K, value: TestConfig[K]) => {
        setConfig((prev: TestConfig) => ({ ...prev, [key]: value }));
    }, []);

    const languages = ['Turkish', 'English', 'Spanish', 'German', 'French', 'Japanese'];
    const lengthOptions: { value: LengthOption; label: string }[] = [
        { value: 'short', label: 'Kısa (~30 kelime)' },
        { value: 'medium', label: 'Orta (~60 kelime)' },
        { value: 'long', label: 'Uzun (~120 kelime)' },
        { value: 'custom', label: 'Özel' },
    ];
    const durationOptions: { value: DurationOption; label: string }[] = [
        { value: 15, label: '15sn' },
        { value: 30, label: '30sn' },
        { value: 45, label: '45sn' },
        { value: 60, label: '1 dk' },
        { value: 0, label: 'Alıştırma (süre yok)'},
        { value: 'custom', label: 'Özel' },
    ];

    return (
        <div className="bg-medium p-6 sm:p-8 rounded-lg shadow-xl animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-center">Yazma Testini Ayarla</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center space-x-2 bg-light p-1 rounded-lg">
                    <button
                        type="button"
                        onClick={() => handleConfigChange('type', 'ai')}
                        className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${config.type === 'ai' ? 'bg-primary text-white' : 'bg-transparent text-text_secondary hover:bg-gray-600'}`}
                    >
                        Yapay Zeka Metni
                    </button>
                    <button
                        type="button"
                        onClick={() => handleConfigChange('type', 'custom')}
                        className={`w-full py-2 px-4 rounded-md font-semibold transition-colors ${config.type === 'custom' ? 'bg-primary text-white' : 'bg-transparent text-text_secondary hover:bg-gray-600'}`}
                    >
                        Özel Metin
                    </button>
                </div>

                {config.type === 'ai' ? (
                    <div className="space-y-4 animate-fade-in">
                        <div>
                            <label htmlFor="topic" className="block text-sm font-medium text-text_secondary mb-1">Konu</label>
                            <input
                                id="topic"
                                type="text"
                                value={config.topic}
                                onChange={(e) => handleConfigChange('topic', e.target.value)}
                                className="w-full bg-light border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary"
                                placeholder="ör. bir uzay macerası"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="language" className="block text-sm font-medium text-text_secondary mb-1">Dil</label>
                                <select
                                    id="language"
                                    value={config.language}
                                    onChange={(e) => handleConfigChange('language', e.target.value)}
                                    className="w-full bg-light border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary"
                                >
                                    {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="length" className="block text-sm font-medium text-text_secondary mb-1">Metin Uzunluğu</label>
                                <select
                                    id="length"
                                    value={config.length}
                                    onChange={(e) => handleConfigChange('length', e.target.value as LengthOption)}
                                    className="w-full bg-light border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary"
                                >
                                    {lengthOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                        </div>
                         {config.length === 'custom' && (
                            <div className="animate-fade-in">
                                <label htmlFor="customLength" className="block text-sm font-medium text-text_secondary mb-1">Özel Kelime Sayısı</label>
                                <input
                                    id="customLength"
                                    type="number"
                                    value={config.customLength}
                                    onChange={(e) => handleConfigChange('customLength', parseInt(e.target.value, 10))}
                                    className="w-full bg-light border border-gray-600 rounded-md p-2"
                                    min="10"
                                    max="500"
                                />
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <label htmlFor="customText" className="block text-sm font-medium text-text_secondary mb-1">Metniniz</label>
                        <textarea
                            id="customText"
                            value={config.customText || ''}
                            onChange={(e) => handleConfigChange('customText', e.target.value)}
                            className="w-full bg-light border border-gray-600 rounded-md p-2 h-32 resize-y focus:ring-primary focus:border-primary"
                            placeholder="Alıştırma yapmak için metninizi buraya yapıştırın..."
                        />
                    </div>
                )}
                 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="duration" className="block text-sm font-medium text-text_secondary mb-1">Süre</label>
                        <select
                            id="duration"
                            value={config.duration}
                            onChange={(e) => handleConfigChange('duration', e.target.value as DurationOption)}
                            className="w-full bg-light border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary"
                        >
                            {durationOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                    {config.duration === 'custom' && (
                        <div className="animate-fade-in">
                            <label htmlFor="customDuration" className="block text-sm font-medium text-text_secondary mb-1">Özel Süre (saniye)</label>
                            <input
                                id="customDuration"
                                type="number"
                                value={config.customDuration}
                                onChange={(e) => handleConfigChange('customDuration', parseInt(e.target.value, 10))}
                                className="w-full bg-light border border-gray-600 rounded-md p-2"
                                min="10"
                                max="300"
                            />
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                    <Play size={20} />
                    <span>Yazmaya Başla</span>
                </button>
            </form>
        </div>
    );
};