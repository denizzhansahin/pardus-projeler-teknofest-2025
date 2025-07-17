import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon } from '../icons/PlayIcon';
import { PauseIcon } from '../icons/PauseIcon';
import { ArrowLeftIcon } from '../icons/ArrowLeftIcon';

type PathType = 'horizontal' | 'vertical' | 'circle' | 'infinity';

interface MovingDotExerciseProps {
  onBack: () => void;
}

const MovingDotExercise: React.FC<MovingDotExerciseProps> = ({ onBack }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [path, setPath] = useState<PathType>('horizontal');

  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const displayBoxRef = useRef<HTMLDivElement>(null);
  
  // Refs to hold the latest values for the animation loop
  const speedRef = useRef(speed);
  const pathRef = useRef(path);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { pathRef.current = path; }, [path]);


  // Initialize position when the component loads
  useEffect(() => {
    // We need to wait a tick for the ref to be populated and for dimensions to be calculated.
    const timerId = setTimeout(() => {
      if (displayBoxRef.current) {
        setPosition({
          x: displayBoxRef.current.clientWidth / 2,
          y: displayBoxRef.current.clientHeight / 2,
        });
      }
    }, 0);
    return () => clearTimeout(timerId);
  }, []);

  // Main animation effect, now only depends on `isRunning`
  useEffect(() => {
    if (!isRunning) {
        if(animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
      return;
    }

    startTimeRef.current = performance.now();
    
    const animate = (time: number) => {
      if (!displayBoxRef.current || !startTimeRef.current) {
         animationRef.current = requestAnimationFrame(animate);
         return;
      }
      
      const elapsedTime = time - startTimeRef.current;
      
      const width = displayBoxRef.current.clientWidth;
      const height = displayBoxRef.current.clientHeight;
      const radiusX = width / 2 - 12; // 12 is half dot size
      const radiusY = height / 2 - 12;
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Use the refs to get the latest values without re-triggering the effect
      const speedFactor = elapsedTime * (speedRef.current / 1000);

      let x = 0, y = 0;

      switch (pathRef.current) {
        case 'horizontal':
          x = centerX + radiusX * Math.sin(speedFactor);
          y = centerY;
          break;
        case 'vertical':
          x = centerX;
          y = centerY + radiusY * Math.sin(speedFactor);
          break;
        case 'circle':
          x = centerX + radiusX * Math.cos(speedFactor);
          y = centerY + radiusY * Math.sin(speedFactor);
          break;
        case 'infinity':
          x = centerX + radiusX * Math.sin(speedFactor);
          y = centerY + radiusY * Math.sin(speedFactor * 2);
          break;
      }

      setPosition({ x, y });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning]);

  const handleStartStop = () => {
    setIsRunning(prev => !prev);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-500 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Egzersiz Menüsüne Dön</span>
        </button>
      </div>
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg dark:shadow-xl">
        <h2 className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mb-4">Takip Egzersizi</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">Göz kaslarınızı güçlendirmek için hareket eden noktayı sadece gözlerinizle takip edin.</p>
        <div ref={displayBoxRef} className="relative w-full h-64 md:h-80 bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden mb-6 border border-slate-200 dark:border-slate-700">
          <div
            className="absolute top-0 left-0 w-6 h-6 bg-cyan-500 dark:bg-cyan-400 rounded-full"
            style={{ transform: `translate(${position.x - 12}px, ${position.y - 12}px)` }}
          ></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="dotSpeed" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Hız: {speed}</label>
              <input type="range" id="dotSpeed" min="1" max="10" value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-full h-2 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
            </div>
            <div>
              <label htmlFor="dotPath" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Yol</label>
              <select id="dotPath" value={path} onChange={e => setPath(e.target.value as PathType)} className="w-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-slate-900 dark:text-white focus:ring-cyan-500 focus:border-cyan-500">
                <option value="horizontal">Yatay</option>
                <option value="vertical">Dikey</option>
                <option value="circle">Dairesel</option>
                <option value="infinity">Sonsuzluk</option>
              </select>
            </div>
          </div>
          <div className="flex items-end">
            <button
                onClick={handleStartStop}
                className="w-full flex items-center justify-center space-x-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-4 rounded-md transition-colors h-fit"
              >
                {isRunning ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                <span>{isRunning ? 'Durdur' : 'Başlat'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovingDotExercise;