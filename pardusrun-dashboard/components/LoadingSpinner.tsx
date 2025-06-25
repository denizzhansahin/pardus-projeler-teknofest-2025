
import React from 'react';

const LoadingSpinner: React.FC<{ size?: string }> = ({ size = "w-8 h-8" }) => {
  return (
    <div className="flex justify-center items-center h-full">
      <div 
        className={`animate-spin rounded-full ${size} border-t-2 border-b-2 border-purple-500`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
