
import React, { useEffect, useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '3xl' | '4xl' | '5xl'; // Updated sizes
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 10); 
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '3xl': 'max-w-3xl', // Renamed 'full' to '3xl' for consistency
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center p-4 z-50
                  bg-black/70 backdrop-blur-md transition-opacity duration-300 ease-out
                  ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div 
        className={`bg-gradient-to-br from-slate-800 to-slate-900 text-slate-200 rounded-xl shadow-2xl p-6 sm:p-8 w-full ${sizeClasses[size]}
                    transform transition-all duration-300 ease-out
                    ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex justify-between items-center pb-4 mb-5 border-b border-slate-700">
            <h3 id="modal-title" className="text-xl sm:text-2xl font-semibold gradient-text bg-gradient-to-r from-sky-400 via-rose-400 to-lime-400">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-sky-400 transition-colors p-1 -m-1 rounded-full"
              aria-label="Kapat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;