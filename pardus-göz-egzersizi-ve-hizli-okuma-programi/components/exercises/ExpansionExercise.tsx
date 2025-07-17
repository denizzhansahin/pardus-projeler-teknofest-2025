import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayIcon } from '../icons/PlayIcon';
import { PauseIcon } from '../icons/PauseIcon';
import { RefreshCwIcon } from '../icons/RefreshCwIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';

const defaultSentence = "Geniş bir açıyla bakarak daha hızlı okumayı öğrenebilirsiniz.";

const generateLevelsFromWords = (words: string[]): string[][] => {
    if (words.length === 0) return [[]];

    const midIndex = Math.floor(words.length / 2);
    const generatedLevels: string[][] = [];

    // This loop creates levels expanding from the middle.
    for (let i = 0; i < Math.ceil(words.length / 2); i++) {
        const start = Math.max(0, midIndex - i);
        const end = Math.min(words.length, midIndex + i + 1);
        const currentLevel = words.slice(start, end);
        
        // Add level only if it's different from the previous one to avoid duplicates
        if (generatedLevels.length === 0 || generatedLevels[generatedLevels.length - 1].join(' ') !== currentLevel.join(' ')) {
             generatedLevels.push(currentLevel);
        }
    }
    
    // Ensure the very last level is always the full sentence array
    const lastGeneratedLevel = generatedLevels[generatedLevels.length - 1];
    if (lastGeneratedLevel.length < words.length) {
        generatedLevels.push(words);
    }
    
    // Handle edge case for short sentences to ensure there's progression
    if (generatedLevels.length === 1 && words.length > 1) {
        return [ [words[midIndex]], words ];
    }
    
    return generatedLevels.length > 0 ? generatedLevels : [['']];
};


interface ExpansionExerciseProps {
  onBack: () => void;
}

const ExpansionExercise: React.FC<ExpansionExerciseProps> = ({ onBack }) => {
  const [userSentence, setUserSentence] = useState('');
  const [levels, setLevels] = useState<string[][]>(() => generateLevelsFromWords(defaultSentence.split(' ')));

  const [level, setLevel] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(3); // seconds per level
  const intervalRef = useRef<number | null>(null);

  const stopExercise = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);
  
  const resetExercise = useCallback(() => {
      stopExercise();
      setLevel(0);
  }, [stopExercise]);

  const handleSentenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSentence = e.target.value;
    setUserSentence(newSentence);
    resetExercise();
    
    const words = newSentence.trim().split(/\s+/).filter(Boolean);
    
    if (words.length > 0) {
      const limitedWords = words.slice(0, 10);
      setLevels(generateLevelsFromWords(limitedWords));
    } else {
      setLevels(generateLevelsFromWords(defaultSentence.split(' ')));
    }
  };

  useEffect(() => {
    if (isRunning) {
        if (levels.length <= 1) {
            stopExercise();
            return;
        }
        intervalRef.current = window.setInterval(() => {
            setLevel(prevLevel => {
                if (prevLevel < levels.length - 1) {
                    return prevLevel + 1;
                }
                stopExercise();
                return prevLevel;
            });
        }, speed * 1000);
    }
    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [isRunning, speed, stopExercise, levels]);
  
  useEffect(() => {
    return () => stopExercise();
  }, [stopExercise]);
  
  const isFinished = level >= levels.length - 1 && !isRunning;
  const currentLevelWords = levels[level] || [];

  return (
    <div className="max-w-4xl mx-auto">
       <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Egzersiz Menüsüne Dön</span>
        </button>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-xl space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-4">Görüş Alanı Genişletme</h2>
            <p className="text-slate-600 dark:text-slate-400">Merkeze odaklanın ve beliren tüm kelime grubunu tek seferde okumaya çalışın. Gözlerinizi gezdirmeyin.</p>
        </div>

        <div>
            <label htmlFor="user-sentence" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                10 kelimelik bir cümle yazınız
            </label>
            <input
                id="user-sentence"
                type="text"
                value={userSentence}
                onChange={handleSentenceChange}
                placeholder={defaultSentence}
                className="w-full p-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                disabled={isRunning}
            />
        </div>

        <div className="relative w-full h-64 md:h-80 bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center border border-slate-200 dark:border-slate-700">
          <div key={level + userSentence} className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-white animate-fade-in text-center px-4">
            {currentLevelWords.map((word, index) => (
                <span key={index} className={`mx-1 ${index === Math.floor(currentLevelWords.length / 2) ? 'text-teal-500 dark:text-teal-400' : ''}`}>
                    {word}
                </span>
            ))}
          </div>
        </div>
        <div className="space-y-4">
            <div>
              <label htmlFor="speed" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Seviye Süresi: {speed} saniye</label>
              <input type="range" id="speed" min="1" max="10" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                    onClick={() => {
                        if (isRunning) {
                            stopExercise();
                        } else {
                            if (level >= levels.length - 1) resetExercise();
                            setIsRunning(true);
                        }
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                    disabled={levels.length <= 1}
                >
                    {isRunning ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                    <span>{isRunning ? 'Durdur' : (isFinished ? 'Yeniden Başlat' : 'Başlat')}</span>
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
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ExpansionExercise;
