
import React, { useState, useEffect } from 'react';
import { ModalProps } from '../types';
import { XMarkIcon } from './icons/XMarkIcon';

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = '2xl' }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 10); 
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-full h-full sm:max-h-[95vh] sm:m-4',
  };

  if (!isOpen && !showContent) {
      return null;
  }
  
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[100] transition-opacity duration-300 ease-out"
      style={{ opacity: showContent ? 1 : 0 }}
      onClick={onClose} 
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} ${size === 'full' ? '' : 'max-h-[90vh]'} flex flex-col transform transition-all duration-300 ease-out ${
          showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 id="modal-title" className="text-xl sm:text-2xl font-semibold text-purple-700 truncate pr-4">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 transition-colors p-1.5 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-white flex-shrink-0"
            aria-label="Modalı kapat"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-5 sm:p-6 overflow-y-auto flex-grow text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
