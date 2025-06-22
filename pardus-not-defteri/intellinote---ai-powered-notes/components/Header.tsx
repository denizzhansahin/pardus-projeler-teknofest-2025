
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Globe } from 'lucide-react';
import { Language } from '../types';
import { APP_NAME } from '../constants';

interface HeaderProps {
  onToggleAIChat: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleAIChat }) => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: Language) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="bg-primary shadow-md p-4 flex justify-between items-center text-white">
      <h1 className="text-2xl font-bold tracking-tight">{t('appName', APP_NAME)}</h1>
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleAIChat}
          className="px-3 py-2 bg-secondary hover:bg-secondary-dark text-white font-medium rounded-md shadow-sm flex items-center transition-colors duration-150"
          title={t('aiChat')}
        >
          <Languages size={20} className="mr-2" />
          {t('aiChat')}
        </button>
        <div className="relative">
          <Globe size={24} className="text-white cursor-pointer" />
          <select
            value={i18n.language}
            onChange={(e) => changeLanguage(e.target.value as Language)}
            className="absolute opacity-0 inset-0 w-full h-full cursor-pointer"
            aria-label="Language switcher"
          >
            <option value={Language.EN}>EN</option>
            <option value={Language.TR}>TR</option>
          </select>
           <span className="ml-1 font-semibold">{i18n.language.toUpperCase()}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
