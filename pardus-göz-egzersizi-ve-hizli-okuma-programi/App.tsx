import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ExerciseView from './components/ExerciseView';
import EducationView from './components/EducationView';
import SettingsView from './components/SettingsView';
import { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Exercises);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleNavigate = useCallback((page: Page) => {
    setCurrentPage(page);
  }, []);

  const renderContent = () => {
    switch (currentPage) {
      case Page.Exercises:
        return <ExerciseView />;
      case Page.Education:
        return <EducationView />;
      case Page.Settings:
        return <SettingsView theme={theme} setTheme={setTheme} />;
      default:
        return <ExerciseView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-gray-200 font-sans transition-colors duration-300">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      <main className="p-4 sm:p-6 md:p-8">
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>&copy; 2024 Göz Egzersizi ve Hızlı Okuma. Tüm hakları saklıdır.</p>
      </footer>
    </div>
  );
};

export default App;