
import React, { useState, useEffect } from 'react';
import { geminiService } from '../../services/geminiService';
import { DailyQuote } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import { ChatBubbleLeftEllipsisIcon } from '../icons/ChatBubbleLeftEllipsisIcon'; // Assume this exists

interface QuoteOfTheDayWidgetProps {
    apiKeyAvailable: boolean;
}

const QuoteOfTheDayWidget: React.FC<QuoteOfTheDayWidgetProps> = ({ apiKeyAvailable }) => {
  const [quoteData, setQuoteData] = useState<DailyQuote | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!apiKeyAvailable) {
        setError("API Anahtarı eksik.");
        return;
    }
    const fetchQuote = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await geminiService.fetchQuoteOfTheDay();
        setQuoteData(data);
      } catch (err) {
        console.error("Günün sözü alınırken hata:", err);
        setError("Günün sözü alınamadı.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuote();
  }, [apiKeyAvailable]);

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 h-full flex flex-col">
      <div className="flex items-center mb-2">
        <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-green-500 mr-2" />
        <h3 className="text-md font-semibold text-gray-700">Günün Sözü</h3>
      </div>
      {isLoading && <LoadingSpinner size="w-6 h-6" />}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {quoteData && !isLoading && !error && (
        <div className="text-sm text-gray-600 flex-grow">
          <p className="italic">"{quoteData.quote}"</p>
          <p className="text-right mt-1">- {quoteData.author}</p>
        </div>
      )}
      {!quoteData && !isLoading && !error && apiKeyAvailable && (
         <p className="text-xs text-gray-400">Günün sözü bulunamadı.</p>
      )}
    </div>
  );
};

export default QuoteOfTheDayWidget;
