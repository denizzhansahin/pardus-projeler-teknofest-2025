import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { RefreshCwIcon } from '../icons/RefreshCwIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';

interface SchulteTableProps {
  onBack: () => void;
}

const GRID_SIZE = 5;

const shuffle = (array: number[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

const SchulteTable: React.FC<SchulteTableProps> = ({ onBack }) => {
  const [numbers, setNumbers] = useState<number[]>([]);
  const [nextNumber, setNextNumber] = useState(1);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<number | null>(null);

  const totalNumbers = useMemo(() => GRID_SIZE * GRID_SIZE, []);

  const resetGame = useCallback(() => {
    setIsRunning(false);
    setIsFinished(false);
    setNextNumber(1);
    setTimer(0);
    if (timerRef.current) clearInterval(timerRef.current);
    const initialNumbers = Array.from({ length: totalNumbers }, (_, i) => i + 1);
    setNumbers(shuffle(initialNumbers));
  }, [totalNumbers]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleNumberClick = (num: number) => {
    if (isFinished) return;
    
    if (!isRunning) {
        setIsRunning(true);
    }

    if (num === nextNumber) {
      if (num === totalNumbers) {
        setIsRunning(false);
        setIsFinished(true);
      }
      setNextNumber(prev => prev + 1);
    }
  };
  
  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
      const secs = (seconds % 60).toString().padStart(2, '0');
      return `${mins}:${secs}`;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Egzersiz Menüsüne Dön</span>
        </button>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-xl">
        <h2 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-4">Schulte Tablosu</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Gözlerinizi sabitleyin ve çevresel görüşünüzü kullanarak sayıları 1'den {totalNumbers}'e kadar sırayla bulun.</p>

        <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 p-4 rounded-t-lg border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
            <div className="text-lg">Sıradaki: <span className="font-bold text-amber-600 dark:text-amber-400 text-xl">{isFinished ? 'Bitti!' : nextNumber}</span></div>
            <div className="text-lg">Süre: <span className="font-bold text-slate-900 dark:text-white text-xl">{formatTime(timer)}</span></div>
        </div>

        <div
          className="grid gap-2 p-4 bg-slate-100 dark:bg-slate-900 rounded-b-lg"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
        >
          {numbers.map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className={`aspect-square flex items-center justify-center text-2xl font-mono rounded-md transition-colors duration-200
                ${nextNumber > num ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white'}
                ${isFinished ? '!bg-green-500/30 !text-green-500 dark:!text-green-300' : ''}
              `}
            >
              {num}
            </button>
          ))}
        </div>
        
        {isFinished && (
            <div className="mt-6 text-center p-4 bg-green-100 dark:bg-green-900/50 border border-green-300 dark:border-green-700 rounded-lg">
                <p className="text-xl font-bold text-green-700 dark:text-green-300">Tebrikler! Egzersizi {formatTime(timer)} sürede tamamladınız.</p>
            </div>
        )}

        <button
            onClick={resetGame}
            className="w-full mt-6 flex items-center justify-center space-x-2 bg-slate-500 dark:bg-slate-600 hover:bg-slate-600 dark:hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-md transition-colors"
        >
            <RefreshCwIcon className="h-5 w-5" />
            <span>Yeniden Başlat</span>
        </button>

      </div>
    </div>
  );
};

export default SchulteTable;