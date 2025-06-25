
import React, { useState, useEffect } from 'react';
import { ClockIcon } from './icons/ClockIcon'; 

const DateTimeDisplay: React.FC = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000); 

    return () => clearInterval(timerId); 
  }, []);

  const dateString = currentDateTime.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const timeString = currentDateTime.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  
  const dayOfWeekString = currentDateTime.toLocaleDateString('tr-TR', { weekday: 'long' });


  return (
    <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-full shadow-md border border-gray-200 text-sm">
      <ClockIcon className="w-5 h-5 text-purple-600" />
      <div className="text-right sm:text-left">
        <p className="font-semibold text-gray-700">{dayOfWeekString}</p>
        <p className="text-gray-600">{dateString}</p>
        <p className="text-gray-500 tracking-wider">{timeString}</p>
      </div>
    </div>
  );
};

export default DateTimeDisplay;
