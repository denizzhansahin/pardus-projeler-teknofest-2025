import React from 'react';
import { AppIcon } from '../assets/AppIcon';
import { CogIcon } from './icons/CogIcon';
// ChatBubbleBottomCenterTextIcon is removed as the button is moved

interface HeaderProps {
  onOpenSettings: () => void;
  apiKeyAvailable: boolean; 
}

const Header: React.FC<HeaderProps> = ({ onOpenSettings, apiKeyAvailable }) => {
  return (
    <header className="bg-gray-50/80 backdrop-blur-lg shadow-sm p-3.5 sticky top-0 z-50 border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <AppIcon className="h-8 w-8 drop-shadow-md" />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-transparent bg-clip-text drop-shadow">PardusRun</h1>
        </div>
        <div className="flex items-center space-x-2">
          {/* AI Quick Response button removed from here */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-50"
            aria-label="Ayarları Aç"
            title="Ayarlar"
          >
            <CogIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
