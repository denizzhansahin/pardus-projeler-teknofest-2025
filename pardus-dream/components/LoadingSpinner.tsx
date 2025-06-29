
import React from 'react';

const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-4">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
        <div className="absolute top-0 left-0 w-full h-full border-t-4 border-purple-500 rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300 transition-colors">{message}</p>
    </div>
  );
};

export default LoadingSpinner;