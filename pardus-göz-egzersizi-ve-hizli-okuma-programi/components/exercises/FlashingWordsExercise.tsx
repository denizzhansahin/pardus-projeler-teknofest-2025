import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayIcon } from '../icons/PlayIcon';
import { PauseIcon } from '../icons/PauseIcon';
import { RefreshCwIcon } from '../icons/RefreshCwIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';

const turkishWords = [
  've', 'bir', 'bu', 'da', 'için', 'çok', 'ama', 'ben', 'o', 'ne', 'gibi', 'sonra', 'daha', 'her', 'şey', 'kadar', 'en', 'yok', 'olan', 'değil',
  'kitap', 'okumak', 'zaman', 'insan', 'dünya', 'hayat', 'bilgi', 'gelişim', 'odak', 'hız', 'beyin', 'göz', 'teknik', 'eğitim', 'başarı', 'hedef',
  'motivasyon', 'öğrenme', 'potansiyel', 'verim', 'güç', 'yetenek', 'amaç', 'strateji', 'algı', 'dikkat', 'hafıza', 'kelime', 'anlamak', 'düşünce'
];

interface FlashingWordsExerciseProps {
  onBack: () => void;
}

const FlashingWordsExercise: React.FC<FlashingWordsExerciseProps> = ({ onBack }) => {
  const [currentWord, setCurrentWord] = useState('Başla');
  const [isRunning, setIsRunning] = useState(false);
  const [wpm, setWpm] = useState(150);
  const intervalRef = useRef<number | null>(null);

  const startExercise = useCallback(() => {
    setIsRunning(true);
    const interval = 60000 / wpm;
    intervalRef.current = window.setInterval(() => {
      const randomIndex = Math.floor(Math.random() * turkishWords.length);
      setCurrentWord(turkishWords[randomIndex]);
    }, interval);
  }, [wpm]);

  const stopExercise = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);
  
  const resetExercise = useCallback(() => {
      stopExercise();
      setCurrentWord('Başla');
  }, [stopExercise]);

  useEffect(() => {
    return () => {
      stopExercise();
    };
  }, [stopExercise]);

  return (
    <div className="max-w-4xl mx-auto">
       <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Egzersiz Menüsüne Dön</span>
        </button>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-xl">
        <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">Kelime Flaşlama Egzersizi</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Kelimeleri tek seferde görme ve algılama hızınızı artırın. (Tachistoscope)</p>
        <div className="relative w-full h-64 md:h-80 bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-700">
          <span key={currentWord} className="text-4xl font-semibold text-slate-900 dark:text-white animate-fade-in">{currentWord}</span>
        </div>
        <div className="space-y-4">
            <div>
              <label htmlFor="wpm" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Kelime/Dakika: {wpm}</label>
              <input type="range" id="wpm" min="50" max="600" step="10" value={wpm} onChange={e => setWpm(Number(e.target.value))} className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={() => {
                      if (isRunning) {
                        stopExercise();
                      } else {
                        const randomIndex = Math.floor(Math.random() * turkishWords.length);
                        setCurrentWord(turkishWords[randomIndex]);
                        startExercise();
                      }
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-md transition-colors"
                >
                    {isRunning ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                    <span>{isRunning ? 'Durdur' : 'Başlat'}</span>
                </button>
                <button
                    onClick={resetExercise}
                    className="w-full flex items-center justify-center space-x-2 bg-slate-500 dark:bg-slate-600 hover:bg-slate-600 dark:hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-md transition-colors"
                >
                    <RefreshCwIcon className="h-5 w-5" />
                    <span>Sıfırla</span>
                </button>
            </div>
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

export default FlashingWordsExercise;