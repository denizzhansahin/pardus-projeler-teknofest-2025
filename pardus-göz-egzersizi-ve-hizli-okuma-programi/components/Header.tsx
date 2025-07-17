import React from 'react';
import { Page } from '../types';
import { EyeIcon } from './icons/EyeIcon';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const navItems = [Page.Exercises, Page.Education, Page.Settings];

  return (
    <header className="bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm sticky top-0 z-50 shadow-md shadow-slate-200/20 dark:shadow-slate-900/20">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-3">
            <EyeIcon className="h-8 w-8 text-cyan-500 dark:text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Hızlı Oku
            </h1>
          </div>
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((page) => (
              <button
                key={page}
                onClick={() => onNavigate(page)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  currentPage === page
                    ? 'bg-cyan-500 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {page}
              </button>
            ))}
          </nav>
           <div className="md:hidden">
             <select 
                onChange={(e) => onNavigate(e.target.value as Page)} 
                value={currentPage}
                className="bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
               {navItems.map((page) => (
                 <option key={page} value={page}>{page}</option>
               ))}
             </select>
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;