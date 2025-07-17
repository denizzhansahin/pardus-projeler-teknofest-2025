import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';
import { PlayIcon } from '../icons/PlayIcon';
import { PauseIcon } from '../icons/PauseIcon';
import { RefreshCwIcon } from '../icons/RefreshCwIcon';
import { SparklesIcon } from '../icons/SparklesIcon';

type TextLength = 'kısa' | 'orta' | 'uzun' | 'rastgele';

interface AITextExerciseProps {
  onBack: () => void;
}

const AITextExercise: React.FC<AITextExerciseProps> = ({ onBack }) => {
  const [topic, setTopic] = useState('');
  const [length, setLength] = useState<TextLength>('orta');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [words, setWords] = useState<string[]>([]);
  const [displayText, setDisplayText] = useState('Konu Seç & Oluştur');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [wpm, setWpm] = useState(200);
  const [chunkSize, setChunkSize] = useState(1);
  const intervalRef = useRef<number | null>(null);
  
  const stopExercise = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (!isRunning || words.length === 0) return;
    const interval = (60000 / wpm) * chunkSize;
    intervalRef.current = window.setInterval(() => {
      setCurrentIndex(prevIndex => prevIndex + chunkSize);
    }, interval);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, wpm, words.length, chunkSize]);
  
  useEffect(() => {
    if (currentIndex >= words.length) {
      stopExercise();
      if (words.length > 0) setDisplayText('Bitti!');
    } else {
      const chunk = words.slice(currentIndex, currentIndex + chunkSize).join(' ');
      setDisplayText(chunk);
    }
  }, [currentIndex, words, stopExercise, chunkSize]);

  const handleStartPause = () => {
    if (isRunning) {
      stopExercise();
    } else {
      if (currentIndex >= words.length && words.length > 0) {
        setCurrentIndex(0);
      }
      setIsRunning(true);
    }
  };

  const resetExercise = useCallback(() => {
    stopExercise();
     if (words.length > 0) {
        const chunk = words.slice(0, chunkSize).join(' ');
        setDisplayText(chunk);
    } else {
        setDisplayText('Konu Seç & Oluştur');
    }
    setCurrentIndex(0);
  }, [stopExercise, words, chunkSize]);

  const handleGenerateText = async () => {
    if (!topic.trim()) {
      setError('Lütfen bir konu girin.');
      return;
    }
    setIsLoading(true);
    setError('');
    setWords([]);
    setCurrentIndex(0);
    setDisplayText('Oluşturuluyor...');
    stopExercise();

    try {
      const apiKey = localStorage.getItem('gemini-api-key');
      if (!apiKey) {
        throw new Error("API anahtarı bulunamadı. Lütfen Ayarlar sayfasından anahtarınızı ekleyin.");
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const lengthMap = {
        'kısa': 'yaklaşık 150 kelime',
        'orta': 'yaklaşık 300 kelime',
        'uzun': 'yaklaşık 600 kelime',
        'rastgele': 'rastgele uzunlukta'
      };
      
      const prompt = `Hızlı okuma egzersizi için, "${topic}" konusu hakkında, Türkçe ve akıcı bir dille bir metin oluştur. Metnin uzunluğu ${lengthMap[length]} olsun. Metin, sadece paragraftan oluşmalı, başlık veya özel formatlama içermemelidir.`;

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const generatedText = response.text;
      if (!generatedText) {
          throw new Error("API'den boş yanıt alındı.");
      }
      const parsedWords = generatedText.trim().split(/\s+/).filter(word => word.length > 0);
      setWords(parsedWords);
      setCurrentIndex(0);
      if (parsedWords.length === 0) {
        throw new Error("Oluşturulan metin işlenemedi veya boş.");
      }

    } catch (err) {
      console.error("Metin oluşturulurken hata:", err);
      const errorMessage = err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu.";
      setError(`Metin oluşturulamadı. ${errorMessage}`);
      setDisplayText('Hata Oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const isFinished = currentIndex >= words.length && words.length > 0;
  const canStartExercise = words.length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Egzersiz Menüsüne Dön</span>
        </button>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-rose-600 dark:text-rose-400 mb-2">Yapay Zeka Metin Egzersizi</h2>
          <p className="text-slate-600 dark:text-slate-400">Bir konu ve uzunluk seçerek yapay zekanın sizin için bir metin oluşturmasını sağlayın.</p>
        </div>
        
        <div className="space-y-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Örn: Uzay yolculuğu, felsefe..."
              className="md:col-span-2 w-full p-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
              disabled={isLoading || isRunning}
            />
            <select 
              value={length}
              onChange={(e) => setLength(e.target.value as TextLength)}
              className="w-full p-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition"
              disabled={isLoading || isRunning}
            >
              <option value="kısa">Kısa (~150 kelime)</option>
              <option value="orta">Orta (~300 kelime)</option>
              <option value="uzun">Uzun (~600 kelime)</option>
              <option value="rastgele">Rastgele</option>
            </select>
          </div>
          <button 
            onClick={handleGenerateText} 
            disabled={!topic.trim() || isLoading || isRunning} 
            className="w-full flex items-center justify-center space-x-2 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : <SparklesIcon className="h-5 w-5" />}
            <span>{isLoading ? 'Oluşturuluyor...' : 'Metin Oluştur'}</span>
          </button>
        </div>

        {error && <div className="bg-red-100 dark:bg-red-900/50 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md">{error}</div>}

        <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center border border-slate-200 dark:border-slate-700">
          <span key={displayText + currentIndex} className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white animate-fade-in text-center px-4">{displayText}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
                <label htmlFor="ai-wpm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kelime/Dakika: {wpm}</label>
                <input 
                    type="range" 
                    id="ai-wpm" 
                    min="50" 
                    max="1000" 
                    step="10" 
                    value={wpm} 
                    onChange={e => setWpm(Number(e.target.value))} 
                    className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500" 
                />
            </div>
             <div>
                <label htmlFor="ai-chunk-size" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Grup Boyutu: {chunkSize} kelime</label>
                <input 
                    type="range" 
                    id="ai-chunk-size" 
                    min="1" 
                    max="5" 
                    step="1" 
                    value={chunkSize} 
                    onChange={e => setChunkSize(Number(e.target.value))} 
                    className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
            </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
                onClick={handleStartPause}
                disabled={!canStartExercise || isLoading}
                className="w-full flex items-center justify-center space-x-2 bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
                {isRunning ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                <span>{isRunning ? 'Durdur' : (isFinished ? 'Yeniden Başlat' : 'Başlat')}</span>
            </button>
            <button
                onClick={resetExercise}
                disabled={!canStartExercise || isLoading}
                className="w-full flex items-center justify-center space-x-2 bg-slate-500 dark:bg-slate-600 hover:bg-slate-600 dark:hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed"
            >
                <RefreshCwIcon className="h-5 w-5" />
                <span>Sıfırla</span>
            </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default AITextExercise;