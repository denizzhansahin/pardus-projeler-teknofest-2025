// @ts-nocheck
import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import WidgetCard from '../WidgetCard';
import { WidgetSectionProps, PardusShortcutSuggestion } from '../../types';
import { geminiService } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { SparklesIcon } from '../icons/SparklesIcon';

const PardusShortcutRecWidget: React.FC<WidgetSectionProps> = ({ apiKeyAvailable }) => {
  const [userAction, setUserAction] = useState('');
  const [suggestions, setSuggestions] = useState<PardusShortcutSuggestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetShortcuts = async () => {
    if (!userAction.trim() || !apiKeyAvailable) {
      if (!apiKeyAvailable) setError("API Anahtarı yapılandırılmadığı için bu özellik kullanılamıyor.");
      else setError("Lütfen bir eylem belirtin.");
      return;
    }
    setIsLoading(true);
    setError('');
    setSuggestions(null);
    try {
      const result = await geminiService.getPardusShortcutSuggestion(userAction);
      if (result && result.length > 0) {
        setSuggestions(result);
      } else {
        setError('Uygun klavye kısayolu bulunamadı.');
      }
    } catch (err) {
      console.error("Pardus kısayol önerisi hatası:", err);
      setError("Klavye kısayolu alınırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WidgetCard title="Pardus AI Klavye Kısayolları" icon={<Lightbulb className="w-6 h-6 text-orange-500" />}>
      {!apiKeyAvailable ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <Lightbulb className="w-12 h-12 mx-auto text-orange-300 mb-3" />
          <p className="text-sm text-red-600">
            API Anahtarı (API_KEY) ayarlanmadığı için bu özellik kullanılamıyor.
          </p>
        </div>
      ) : (
        <div className="space-y-3 p-2">
          <div>
            <label htmlFor="user-action-shortcut" className="block text-sm font-medium text-gray-700 mb-1">
              Hangi eylem için kısayol arıyorsunuz?
            </label>
            <input
              type="text"
              id="user-action-shortcut"
              value={userAction}
              onChange={(e) => setUserAction(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none placeholder-gray-400"
              placeholder="Örn: Ekran görüntüsü alma, Pencereyi kapatma"
            />
          </div>
          <button
            onClick={handleGetShortcuts}
            disabled={isLoading || !userAction.trim()}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-70"
          >
            {isLoading ? <LoadingSpinner size="w-5 h-5" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
            Kısayol Bul
          </button>

          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}

          {suggestions && suggestions.length > 0 && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              <h4 className="text-sm font-semibold text-gray-800 mb-1">Önerilen Kısayollar:</h4>
              {suggestions.map((s, index) => (
                <div key={index} className="p-2.5 bg-gray-50 rounded-md border border-gray-200">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium text-gray-700">Eylem:</span> {s.action}
                  </p>
                  <p className="text-sm text-orange-700 font-semibold">
                    Kısayol: <code className="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">{s.shortcut}</code>
                  </p>
                  {s.notes && <p className="text-xs text-gray-500 mt-1">Not: {s.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </WidgetCard>
  );
};

export default PardusShortcutRecWidget;
