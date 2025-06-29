import React, { useState, useCallback, useEffect } from 'react';
import { generateImage, enhancePrompt, getPromptIdeas, translatePrompt, describeImage, urlToBase64 } from '../services/geminiService';
import { HistoryItem } from '../types';
import { CREATIVE_MODULES, STYLE_SUGGESTIONS, SparklesIcon, LightBulbIcon, ImageIcon } from '../constants';
import LoadingSpinner from './LoadingSpinner';
import { Sparkles, Lightbulb } from 'lucide-react';

interface GeneratorProps {
  onImageGenerated: (item: Omit<HistoryItem, 'id' | 'createdAt'>) => void;
  setDisplayedImage: (item: HistoryItem | null) => void;
  imageForGeneration: string | null;
  clearImageForGeneration: () => void;
}

const Generator: React.FC<GeneratorProps> = ({ onImageGenerated, setDisplayedImage, imageForGeneration, clearImageForGeneration }) => {
  const [prompt, setPrompt] = useState('');
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<false | 'generate' | 'enhance' | 'ideas'>(false);
  const [error, setError] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);

  useEffect(() => {
    if (imageForGeneration) {
      setBaseImage(imageForGeneration);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [imageForGeneration]);

  const handleClearBaseImage = () => {
    setBaseImage(null);
    clearImageForGeneration();
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !baseImage) {
      setError('Lütfen bir istem girin veya bir görsel seçin.');
      return;
    }
    setIsLoading('generate');
    setError('');
    setDisplayedImage(null);

    try {
      let finalPrompt = prompt;
      if (baseImage) {
        const { base64Data, mimeType } = await urlToBase64(baseImage);
        const imageDescription = await describeImage(base64Data, mimeType);
        finalPrompt = `Based on an image described as: "${imageDescription}". The user wants to modify it with the following request: "${prompt}". Generate a new image that merges these concepts.`;
      }
      
      const translatedPrompt = await translatePrompt(finalPrompt);
      const imageUrl = await generateImage(translatedPrompt);
      
      const newItem: Omit<HistoryItem, 'id' | 'createdAt'> = { prompt, translatedPrompt, imageUrl };
      const fullNewItemForDisplay: HistoryItem = { ...newItem, id: 'temp', createdAt: new Date().toISOString() };
      
      onImageGenerated(newItem);
      setDisplayedImage(fullNewItemForDisplay);
      setBaseImage(null);
      clearImageForGeneration();

    } catch (e: any) {
      setError(e.message || 'Bilinmeyen bir hata oluştu.');
      setDisplayedImage(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnhance = async () => {
    if (!prompt.trim()) { setError('Lütfen geliştirmek için bir istem girin.'); return; }
    setIsLoading('enhance'); setError('');
    try {
      setPrompt(await enhancePrompt(prompt));
    } catch (e: any) { setError(e.message); } finally { setIsLoading(false); }
  };

  const handleGetIdeas = async () => {
     if (!prompt.trim()) { setError('Lütfen fikir almak için bir istem girin.'); return; }
    setIsLoading('ideas'); setError(''); setIdeas([]);
    try {
      setIdeas(await getPromptIdeas(prompt));
    } catch (e: any) { setError(e.message); } finally { setIsLoading(false); }
  };
  
  const handleModuleClick = useCallback((modulePrompt: string) => {
    setPrompt(modulePrompt);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setPrompt(p => p ? `${p}, ${suggestion}` : suggestion);
  }, []);

  return (
    <div className="p-6 bg-white/60 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700/60 space-y-6 transition-colors duration-300">
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">1. Hayalini Anlat</h2>
      <textarea
        className="w-full p-3 bg-gray-100 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-gray-800 dark:text-gray-200 resize-none h-32"
        placeholder="Örn: Güneşin altında uyuyan, tüyleri parlayan, mistik bir kedi"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={!!isLoading}
      />
      
      {baseImage && (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200 flex items-center"><ImageIcon /> Temel Alınan Görsel</h3>
          <div className="relative group w-32 h-32">
            <img src={baseImage} alt="Base for generation" className="rounded-lg w-full h-full object-cover"/>
            <button
              onClick={handleClearBaseImage}
              className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 rounded-full flex items-center justify-center text-white text-xl font-bold hover:bg-red-700 transition-all transform group-hover:scale-110 opacity-0 group-hover:opacity-100"
              aria-label="Temel görseli kaldır"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      
      {error && <p className="text-red-500 dark:text-red-400 text-sm">{error.includes('Görsel oluşturulurken') ? 'Görsel oluşturulamadı. Lütfen API anahtarınızı ve internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.' : error}</p>}
      
      <div className="flex flex-wrap gap-2">
        <button onClick={handleEnhance} disabled={!!isLoading} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400/50 transition-all duration-300 transform hover:scale-105">
          {isLoading === 'enhance' ? 'Geliştiriliyor...' : <><Sparkles size={18} /> İstem Geliştir</>}
        </button>
        <button onClick={handleGetIdeas} disabled={!!isLoading} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-400/50 transition-all duration-300 transform hover:scale-105">
          {isLoading === 'ideas' ? 'Fikirler Alınıyor...' : <><Lightbulb size={18} /> Fikir Al</>}
        </button>
      </div>

      {ideas.length > 0 && (
          <div className="p-4 bg-gray-100/70 dark:bg-gray-900/70 rounded-lg border border-gray-200 dark:border-gray-700 space-y-2">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300">İlham Verici Fikirler:</h4>
              <ul className="list-disc list-inside space-y-1">
                  {ideas.map((idea, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-500 dark:hover:text-purple-400 cursor-pointer transition-colors" onClick={() => setPrompt(idea)}>
                          {idea}
                      </li>
                  ))}
              </ul>
          </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Stil ve Anahtar Kelimeler</h3>
        <div className="flex flex-wrap gap-2">
          {STYLE_SUGGESTIONS.map(s => (
            <button key={s} onClick={() => handleSuggestionClick(s)} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs rounded-full hover:bg-purple-500 hover:text-white dark:hover:bg-purple-600 transition-all duration-200">
              {s}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Yaratıcı Modüller</h3>
        <div className="space-y-4">
          {CREATIVE_MODULES.map(category => (
            <div key={category.name}>
              <h4 className="text-md font-bold text-gray-600 dark:text-gray-400 mb-2">{category.name}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {category.modules.map(module => (
                  <button key={module.name} onClick={() => handleModuleClick(module.prompt)} className="flex flex-col items-center justify-center p-3 space-y-2 text-center bg-gray-200/50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200">
                    <span className="text-purple-500 dark:text-purple-400">{module.icon}</span>
                    <span className="text-xs font-medium">{module.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleGenerate} disabled={!!isLoading} className="w-full py-4 text-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:from-purple-400/50 disabled:to-pink-400/50 disabled:opacity-70 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/20">
          {isLoading === 'generate' ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mx-auto"></div> : 'HAYAL ET'}
      </button>

      {isLoading === 'generate' && (
        <div className="mt-4">
            <LoadingSpinner message="Hayaliniz gerçeğe dönüşüyor..." />
        </div>
      )}
    </div>
  );
};

export default Generator;
