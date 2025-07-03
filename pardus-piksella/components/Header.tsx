import React, { useState, useRef } from 'react';
import ThemeToggle from './ThemeToggle';
import UploadButton from './UploadButton';
import { CameraIcon } from './icons';

interface HeaderProps {
    theme: string;
    setTheme: (theme: string) => void;
    onSearch: (query: string) => void;
    onUpload: (files: FileList) => void;
    onVisualSearch: (file: File) => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme, onSearch, onUpload, onVisualSearch }) => {
    const [query, setQuery] = useState('');
    const visualSearchInputRef = useRef<HTMLInputElement>(null);
    const debounceTimeoutRef = useRef<number | null>(null);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        onSearch(query);
    };
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setQuery(newQuery);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }
        
        debounceTimeoutRef.current = window.setTimeout(() => {
            onSearch(newQuery);
        }, 300); // 300ms gecikme
    };

    const handleVisualSearchClick = () => {
        visualSearchInputRef.current?.click();
    };

    const handleVisualSearchFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onVisualSearch(e.target.files[0]);
             e.target.value = ''; // Reset for re-uploading same file
        }
    };

    return (
        <header className="p-4 flex justify-between items-center gap-4 flex-shrink-0">
            <div className="flex-grow">
                <form onSubmit={handleSearchSubmit} className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-pardus-text-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={handleSearchChange}
                        placeholder="Etiket, başlık veya açıklamaya göre ara..."
                        className="w-full bg-pardus-light-dark/50 dark:bg-pardus-light-dark/70 text-pardus-text placeholder-pardus-text-dark rounded-full py-2 pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-pardus-accent"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <input type="file" ref={visualSearchInputRef} onChange={handleVisualSearchFileChange} className="hidden" accept="image/*" />
                        <button type="button" onClick={handleVisualSearchClick} className="p-1 rounded-full hover:bg-pardus-light-dark" aria-label="Görsel ile ara">
                            <CameraIcon className="w-5 h-5 text-pardus-text-dark"/>
                        </button>
                    </div>
                </form>
            </div>
            <div className="flex items-center gap-2">
                <UploadButton onUpload={onUpload} />
                <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
        </header>
    );
};

export default Header;