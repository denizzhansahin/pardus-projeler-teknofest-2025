
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; // Tailwind color class e.g., 'text-primary'
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'text-primary', className = '' }) => {
  let sizeClasses = '';
  switch (size) {
    case 'sm':
      sizeClasses = 'w-4 h-4 border-2';
      break;
    case 'lg':
      sizeClasses = 'w-12 h-12 border-4';
      break;
    case 'md':
    default:
      sizeClasses = 'w-8 h-8 border-4';
      break;
  }

  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses} ${color} border-solid border-t-transparent ${className}`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <span className="sr-only">Yükleniyor...</span>
    </div>
  );
};

export default LoadingSpinner;
