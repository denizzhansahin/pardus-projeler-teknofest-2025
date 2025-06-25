// @ts-nocheck
import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import WidgetCard from '../WidgetCard';
import { WidgetSectionProps, PardusAppSuggestion } from '../../types';
import { geminiService } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { SparklesIcon } from '../icons/SparklesIcon';

const PardusAppRecWidget: React.FC<WidgetSectionProps> = ({ apiKeyAvailable }) => {
  const [userNeed, setUserNeed] = useState('');
  const [suggestions, setSuggestions] = useState<PardusAppSuggestion[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetRecommendations = async () => {
    if (!userNeed.trim() || !apiKeyAvailable) {
      if (!apiKeyAvailable) setError("API Anahtarı yapılandırılmadığı için bu özellik kullanılamıyor.");
      else setError("Lütfen bir ihtiyaç veya uygulama türü belirtin.");
      return;
    }
    setIsLoading(true);
    setError('');
    setSuggestions(null);
    try {
      const result = await geminiService.getPardusAppRecommendation(userNeed);
      if (result && result.length > 0) {
        setSuggestions(result);
      } else {
        setError('Uygun uygulama önerisi bulunamadı.');
      }
    } catch (err) {
      console.error("Pardus uygulama önerisi hatası:", err);
      setError("Uygulama önerisi alınırken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WidgetCard title="Pardus AI Uygulama Önerileri" icon={<Lightbulb className="w-6 h-6 text-green-500" />}>
      {!apiKeyAvailable ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <Lightbulb className="w-12 h-12 mx-auto text-green-300 mb-3" />
          <p className="text-sm text-red-600">
            API Anahtarı (API_KEY) ayarlanmadığı için bu özellik kullanılamıyor.
          </p>
        </div>
      ) : (
        <div className="space-y-3 p-2">
          <div>
            <label htmlFor="user-need-app" className="block text-sm font-medium text-gray-700 mb-1">
              Hangi türde bir uygulamaya ihtiyacınız var?
            </label>
            <input
              type="text"
              id="user-need-app"
              value={userNeed}
              onChange={(e) => setUserNeed(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none placeholder-gray-400"
              placeholder="Örn: Resim düzenleme, Not alma, Video oynatıcı"
            />
          </div>
          <button
            onClick={handleGetRecommendations}
            disabled={isLoading || !userNeed.trim()}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-70"
          >
            {isLoading ? <LoadingSpinner size="w-5 h-5" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
            Öneri Al
          </button>

          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}

          {suggestions && suggestions.length > 0 && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              <h4 className="text-sm font-semibold text-gray-800 mb-1">Önerilen Uygulamalar:</h4>
              {suggestions.map((app, index) => (
                <div key={index} className="p-2.5 bg-gray-50 rounded-md border border-gray-200">
                  <h5 className="font-medium text-green-700">{app.appName}</h5>
                  <p className="text-xs text-gray-600">{app.description}</p>
                  {app.installCommand && (
                    <p className="text-xs text-gray-500 mt-1">
                      Kurulum: <code className="bg-gray-200 text-gray-700 px-1 py-0.5 rounded text-xs">{app.installCommand}</code>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </WidgetCard>
  );
};

export default PardusAppRecWidget;
