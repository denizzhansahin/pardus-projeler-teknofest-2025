import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayIcon } from '../icons/PlayIcon';
import { PauseIcon } from '../icons/PauseIcon';
import { RefreshCwIcon } from '../icons/RefreshCwIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';

const items = ['hız', 'odak', 'göz', 'algı', 'beyin', '17', '99', '42', 'okuma', 'güç', 'dikkat', 'hedef', 'anla', 'çabuk', 'seri', '25', '81', '53'];

interface FocusShiftExerciseProps {
  onBack: () => void;
}

const FocusShiftExercise: React.FC<FocusShiftExerciseProps> = ({ onBack }) => {
  const [currentItem, setCurrentItem] = useState<{ text: string, x: number, y: number } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(120); // Items per minute
  const intervalRef = useRef<number | null>(null);
  const displayBoxRef = useRef<HTMLDivElement>(null);

  const showNewItem = useCallback(() => {
      if (!displayBoxRef.current) return;
      const randomIndex = Math.floor(Math.random() * items.length);
      const text = items[randomIndex];
      const x = Math.random() * (displayBoxRef.current.clientWidth - 80) + 40; // padding
      const y = Math.random() * (displayBoxRef.current.clientHeight - 80) + 40; // padding
      setCurrentItem({ text, x, y });
  }, []);


  const stopExercise = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);
  
  const resetExercise = useCallback(() => {
      stopExercise();
      setCurrentItem(null);
  }, [stopExercise]);

  useEffect(() => {
    if (isRunning) {
        showNewItem();
        const interval = 60000 / speed;
        intervalRef.current = window.setInterval(showNewItem, interval);
    }
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isRunning, speed, showNewItem]);
  
  useEffect(() => {
    return () => stopExercise();
  }, [stopExercise]);

  return (
    <div className="max-w-4xl mx-auto">
       <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Egzersiz Menüsüne Dön</span>
        </button>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-xl">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">Odak Değiştirme Egzersizi</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Ekranda beliren kelime veya sayıları mümkün olduğunca hızlı bir şekilde gözlerinizle yakalayın. Başınızı oynatmamaya çalışın.</p>
        <div ref={displayBoxRef} className="relative w-full h-64 md:h-80 bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden mb-6 border border-slate-200 dark:border-slate-700">
          {currentItem && (
            <span 
                key={`${currentItem.text}-${currentItem.x}-${currentItem.y}`} 
                className="absolute text-3xl font-semibold text-slate-900 dark:text-white animate-pop-in"
                style={{ top: `${currentItem.y}px`, left: `${currentItem.x}px`, transform: 'translate(-50%, -50%)' }}
            >
                {currentItem.text}
            </span>
          )}
           {!currentItem && !isRunning && (
            <div className="flex items-center justify-center h-full">
                <p className="text-slate-500 dark:text-slate-400">Başlamak için Oynat'a basın</p>
            </div>
           )}
        </div>
        <div className="space-y-4">
            <div>
              <label htmlFor="speed" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Hız (Öğe/Dakika): {speed}</label>
              <input type="range" id="speed" min="30" max="300" step="10" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={() => setIsRunning(!isRunning)}
                    className="w-full flex items-center justify-center space-x-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-md transition-colors"
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
        @keyframes pop-in {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          70% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        .animate-pop-in {
          animation: pop-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default FocusShiftExercise;
