import React from 'react';

interface StorageIndicatorProps {
  usage: {
    used: number;
    total: number;
    percentage: number;
  };
}

const StorageIndicator: React.FC<StorageIndicatorProps> = ({ usage }) => {
  const getBarColor = () => {
    if (usage.percentage > 90) return 'bg-red-500';
    if (usage.percentage > 70) return 'bg-yellow-500';
    return 'bg-pardus-accent';
  };

  return (
    <div className="p-3 bg-pardus-dark/50 rounded-lg">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-pardus-text">Depolama Alanı</span>
        <span className="text-xs text-pardus-text-dark">{usage.used} / {usage.total} MB</span>
      </div>
      <div className="w-full bg-pardus-dark rounded-full h-2">
        <div 
            className={`h-2 rounded-full transition-all duration-500 ${getBarColor()}`} 
            style={{ width: `${usage.percentage}%` }}
        ></div>
      </div>
       {usage.percentage > 90 && (
          <p className="text-xs text-red-400 mt-2 text-center">
              Depolama alanı neredeyse dolu!
          </p>
      )}
    </div>
  );
};

export default StorageIndicator;