// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { geminiService } from '../../services/geminiService';
import { DailyEvent } from '../../types';
import LoadingSpinner from '../LoadingSpinner';
import { CalendarDays } from 'lucide-react';

interface EventOfTheDayWidgetProps {
    apiKeyAvailable: boolean;
}

const EventOfTheDayWidget: React.FC<EventOfTheDayWidgetProps> = ({ apiKeyAvailable }) => {
  const [eventData, setEventData] = useState<DailyEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!apiKeyAvailable) {
        setError("API Anahtarı eksik.");
        return;
    }
    const fetchEvent = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await geminiService.fetchEventOfTheDay();
        setEventData(data);
      } catch (err) {
        console.error("Günün olayı alınırken hata:", err);
        setError("Günün olayı alınamadı.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [apiKeyAvailable]);

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 h-full flex flex-col">
      <div className="flex items-center mb-2">
        <CalendarDays className="w-5 h-5 text-blue-500 mr-2" />
        <h3 className="text-md font-semibold text-gray-700">Günün Olayı</h3>
      </div>
      {isLoading && <LoadingSpinner size="w-6 h-6" />}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {eventData && !isLoading && !error && (
        <div className="text-sm text-gray-600 flex-grow">
          <p><span className="font-semibold">{eventData.year}:</span> {eventData.event}</p>
        </div>
      )}
      {!eventData && !isLoading && !error && apiKeyAvailable && (
        <p className="text-xs text-gray-400">Günün olayı bulunamadı.</p>
      )}
    </div>
  );
};

export default EventOfTheDayWidget;
