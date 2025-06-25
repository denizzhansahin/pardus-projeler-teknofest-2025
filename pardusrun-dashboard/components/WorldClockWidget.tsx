
import React, { useState, useEffect } from 'react';
import { WORLD_CITIES } from '../constants';
import { GlobeAltIcon } from './icons/GlobeAltIcon'; // Or ClockIcon if more appropriate

interface WorldCityTime {
  name: string;
  time: string;
}

const WorldClockWidget: React.FC = () => {
  const [cityTimes, setCityTimes] = useState<WorldCityTime[]>([]);

  useEffect(() => {
    const updateTimes = () => {
      const now = new Date();
      const newTimes = WORLD_CITIES.map(city => ({
        name: city.name,
        time: now.toLocaleTimeString('tr-TR', {
          timeZone: city.timeZone,
          hour: '2-digit',
          minute: '2-digit',
        //   second: '2-digit', // Optional: if seconds are needed
        }),
      }));
      setCityTimes(newTimes);
    };

    updateTimes(); // Initial update
    const timerId = setInterval(updateTimes, 1000 * 30); // Update every 30 seconds

    return () => clearInterval(timerId);
  }, []);

  if (!cityTimes.length) {
    return null;
  }

  return (
    <section className="w-full max-w-4xl mb-8 px-4" aria-labelledby="world-clocks-title">
      <h2 id="world-clocks-title" className="sr-only">Dünya Saatleri</h2>
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-4 gap-y-3 text-center">
          {cityTimes.map(cityTime => (
            <div key={cityTime.name} className="py-1">
              <p className="text-xs font-medium text-gray-500 truncate">{cityTime.name}</p>
              <p className="text-lg font-semibold text-purple-700 tracking-wide">{cityTime.time}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorldClockWidget;
