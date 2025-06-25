// @ts-nocheck
import React, { useState } from 'react';
import { LucideImage, LucideDownload } from 'lucide-react';
import WidgetCard from '../WidgetCard';
import { WidgetSectionProps } from '../../types';
import { geminiService } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';

// Placeholder for ArrowDownTrayIcon if not created separately
const DownloadIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);


const ImageGeneratorWidget: React.FC<WidgetSectionProps> = ({ apiKeyAvailable }) => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateImage = async () => {
    if (!prompt.trim() || !apiKeyAvailable) {
      if (!apiKeyAvailable) setError("API Anahtarı yapılandırılmadığı için bu özellik kullanılamıyor.");
      return;
    }
    setIsLoading(true);
    setError('');
    setImageUrl(null);
    try {
      const base64ImageBytes = await geminiService.generateImage(prompt);
      if (base64ImageBytes) {
        setImageUrl(`data:image/jpeg;base64,${base64ImageBytes}`);
      } else {
        setError('Görsel oluşturulamadı. Model bir sonuç döndürmedi.');
      }
    } catch (err) {
      console.error("Görsel oluşturma hatası:", err);
      setError("Görsel oluşturulurken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${prompt.substring(0, 30).replace(/\s+/g, '_') || 'ai_generated_image'}.jpeg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <WidgetCard title="AI Görsel Oluşturucu" icon={<LucideImage className="w-6 h-6 text-indigo-500" />}>
      {!apiKeyAvailable ? (
         <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <LucideImage className="w-12 h-12 mx-auto text-indigo-300 mb-3" />
            <p className="text-sm text-red-600">
                API Anahtarı (API_KEY) ayarlanmadığı için bu özellik kullanılamıyor. Lütfen sistem yöneticinize başvurun.
            </p>
        </div>
      ) : (
        <div className="space-y-3 p-2">
          <div>
            <label htmlFor="image-prompt" className="block text-sm font-medium text-gray-700 mb-1">
              Görsel istemi:
            </label>
            <textarea
              id="image-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              className="w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none placeholder-gray-400"
              placeholder="Örn: Kırmızı bir kaykay tutan robot"
              aria-label="Görsel oluşturma istemi girin"
            />
          </div>
          <button
            onClick={handleGenerateImage}
            disabled={isLoading || !prompt.trim()}
            className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70"
          >
            {isLoading ? <LoadingSpinner size="w-5 h-5" /> : 'Oluştur'}
          </button>

          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error.includes('Model bir sonuç döndürmedi') ? 'Görsel oluşturulamadı. Lütfen daha açıklayıcı ve uygun bir istem girin.' : error}</p>}

          {imageUrl && (
            <div className="mt-3 space-y-2">
              <img src={imageUrl} alt={prompt || "Oluşturulan görsel"} className="w-full h-auto rounded-md border border-gray-200 shadow-sm" />
              <button
                onClick={handleDownloadImage}
                className="w-full flex items-center justify-center text-sm text-indigo-600 hover:text-indigo-700 transition-colors py-1.5 px-3 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-indigo-100/70 font-medium"
              >
                <DownloadIcon className="w-4 h-4 mr-2" />
                İndir
              </button>
            </div>
          )}
        </div>
      )}
    </WidgetCard>
  );
};

export default ImageGeneratorWidget;
