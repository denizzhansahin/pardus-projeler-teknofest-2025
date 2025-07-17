import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayIcon } from '../icons/PlayIcon';
import { PauseIcon } from '../icons/PauseIcon';
import { RefreshCwIcon } from '../icons/RefreshCwIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';

interface CustomTextExerciseProps {
  onBack: () => void;
}

const CustomTextExercise: React.FC<CustomTextExerciseProps> = ({ onBack }) => {
  const [userText, setUserText] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [displayText, setDisplayText] = useState('Metin Yapıştırın');
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
    if (!isRunning || words.length === 0) {
      return;
    }

    const interval = (60000 / wpm) * chunkSize;
    intervalRef.current = window.setInterval(() => {
      setCurrentIndex(prevIndex => prevIndex + chunkSize);
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, wpm, words.length, chunkSize]);
  
  useEffect(() => {
    if (currentIndex >= words.length) {
      stopExercise();
      if (words.length > 0) {
        setDisplayText('Bitti!');
      }
    } else {
      const chunk = words.slice(currentIndex, currentIndex + chunkSize).join(' ');
      setDisplayText(chunk);
    }
  }, [currentIndex, words, stopExercise, chunkSize]);


  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    stopExercise();
    const text = e.target.value;
    setUserText(text);
    const parsedWords = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWords(parsedWords);
    setCurrentIndex(0);
    if (parsedWords.length === 0) {
        setDisplayText('Metin Yapıştırın');
    } else {
        const chunk = parsedWords.slice(0, chunkSize).join(' ');
        setDisplayText(chunk);
    }
  };
  
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
    setCurrentIndex(0);
    if (words.length > 0) {
        const chunk = words.slice(0, chunkSize).join(' ');
        setDisplayText(chunk);
    } else {
        setDisplayText('Metin Yapıştırın');
    }
  }, [stopExercise, words, chunkSize]);

  const isFinished = currentIndex >= words.length && words.length > 0;
  const canStart = words.length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Egzersiz Menüsüne Dön</span>
        </button>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-xl space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-2">Özel Metin Egzersizi</h2>
            <p className="text-slate-600 dark:text-slate-400">Aşağıdaki alana kendi metninizi yapıştırın, ayarları düzenleyin ve başlat butonuna tıklayın.</p>
        </div>
        
        <textarea
          value={userText}
          onChange={handleTextChange}
          placeholder="Hızlı okumak istediğiniz metni buraya yapıştırın..."
          className="w-full h-32 p-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
          disabled={isRunning}
        />
        
        <div className="relative w-full h-64 bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center border border-slate-200 dark:border-slate-700">
          <span key={displayText + currentIndex} className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white animate-fade-in text-center px-4">{displayText}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
                <label htmlFor="custom-wpm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kelime/Dakika: {wpm}</label>
                <input 
                    type="range" 
                    id="custom-wpm" 
                    min="50" 
                    max="1000" 
                    step="10" 
                    value={wpm} 
                    onChange={e => setWpm(Number(e.target.value))} 
                    className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500" 
                />
            </div>
            <div>
                <label htmlFor="chunk-size" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Grup Boyutu: {chunkSize} kelime</label>
                <input 
                    type="range" 
                    id="chunk-size" 
                    min="1" 
                    max="5" 
                    step="1" 
                    value={chunkSize} 
                    onChange={e => setChunkSize(Number(e.target.value))} 
                    className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
                onClick={handleStartPause}
                disabled={!canStart}
                className="w-full flex items-center justify-center space-x-2 bg-violet-500 hover:bg-violet-600 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
                {isRunning ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                <span>{isRunning ? 'Durdur' : (isFinished ? 'Yeniden Başlat' : 'Başlat')}</span>
            </button>
            <button
                onClick={resetExercise}
                disabled={!canStart}
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

export default CustomTextExercise;