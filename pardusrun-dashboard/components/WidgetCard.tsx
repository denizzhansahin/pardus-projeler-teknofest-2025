
import React from 'react';
import { WidgetCardProps } from '../types';

const WidgetCard: React.FC<WidgetCardProps> = ({ title, icon, children, className = '', onCardClick, titleClassName = 'text-gray-700' }) => {
  const cardBaseStyle = "bg-white shadow-lg hover:shadow-xl rounded-xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out hover:ring-2 hover:ring-purple-500/70 focus-within:ring-2 focus-within:ring-purple-500/70 border border-gray-200";
  
  const clickableStyle = onCardClick ? "cursor-pointer" : "";

  return (
    <div 
      className={`${cardBaseStyle} ${clickableStyle} ${className}`} 
      onClick={onCardClick}
      tabIndex={onCardClick ? 0 : -1}
      onKeyDown={onCardClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onCardClick(); } : undefined}
      role={onCardClick ? "button" : undefined}
      aria-label={onCardClick ? title : undefined}
    >
      <div className="p-4 flex items-center space-x-3 border-b border-gray-200">
        <div className="text-purple-600 flex-shrink-0">{icon}</div> {/* Default icon color for light theme */}
        <h3 className={`text-lg font-semibold truncate ${titleClassName}`}>{title}</h3>
      </div>
      <div className="p-4 flex-grow min-h-[12rem] overflow-y-auto text-gray-600"> {/* Default text color for content */}
        {children}
      </div>
    </div>
  );
};

export default WidgetCard;
