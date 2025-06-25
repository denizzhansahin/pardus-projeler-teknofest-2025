
import React, { useState } from 'react';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { ChatBubbleBottomCenterTextIcon } from './icons/ChatBubbleBottomCenterTextIcon';

interface CentralSearchProps {
  onSearch: (query: string) => void;
  onOpenAIQuickResponse: () => void;
  apiKeyAvailable: boolean;
}

const CentralSearch: React.FC<CentralSearchProps> = ({ onSearch, onOpenAIQuickResponse, apiKeyAvailable }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <section className="w-full max-w-2xl mt-5 mb-6 sm:mt-6 sm:mb-8 px-4">
      <form 
        onSubmit={handleSearchSubmit} 
        className="relative flex items-center w-full shadow-lg rounded-full group" 
        role="search"
        aria-label="Merkezi Arama Formu"
      >
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Bir şeyler sorun veya arayın..."
          aria-label="Arama yapın"
          className={`w-full pl-6 ${apiKeyAvailable ? 'pr-28 sm:pr-32' : 'pr-16'} py-3.5 sm:py-4 text-base sm:text-lg rounded-full border-2 border-gray-300 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-3 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 ease-in-out shadow-sm`}
        />
        <div className="absolute right-0 top-0 bottom-0 flex items-center">
          {apiKeyAvailable && (
            <button
              type="button"
              onClick={onOpenAIQuickResponse}
              aria-label="AI ile Hızlı Yanıt Al"
              title="AI ile Hızlı Yanıt Al"
              className="flex items-center justify-center h-full text-purple-600 hover:text-purple-700 px-3 sm:px-4 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 rounded-l-full"
            >
              <ChatBubbleBottomCenterTextIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          )}
          <button
            type="submit"
            aria-label="Aramayı gönder"
            className="flex items-center justify-center h-full bg-purple-600 hover:bg-purple-700 text-white px-5 sm:px-6 rounded-r-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-3 focus:ring-purple-500 focus:ring-offset-1 focus:ring-offset-white"
            style={{ borderTopLeftRadius: apiKeyAvailable ? 0 : undefined, borderBottomLeftRadius: apiKeyAvailable ? 0 : undefined }}
          >
            <MagnifyingGlassIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      </form>
    </section>
  );
};

export default CentralSearch;
