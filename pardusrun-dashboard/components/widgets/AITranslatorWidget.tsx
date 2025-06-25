
import React, { useState } from 'react';
import WidgetCard from '../WidgetCard';
import { WidgetSectionProps, TranslationResult } from '../../types';
import { LanguageIcon } from '../icons/LanguageIcon';
import { geminiService } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';
import { SparklesIcon } from '../icons/SparklesIcon';

const AITranslatorWidget: React.FC<WidgetSectionProps> = ({ apiKeyAvailable }) => {
  const [textToTranslate, setTextToTranslate] = useState('');
  const [sourceLang, setSourceLang] = useState(''); // Optional, user can specify
  const [targetLang, setTargetLang] = useState('Türkçe'); // Default to Turkish
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTranslate = async () => {
    if (!textToTranslate.trim() || !targetLang.trim() || !apiKeyAvailable) {
      if (!apiKeyAvailable) setError("API Anahtarı yapılandırılmadığı için bu özellik kullanılamıyor.");
      else if (!targetLang.trim()) setError("Lütfen hedef dil belirtin.");
      else setError("Lütfen çevrilecek metni girin.");
      return;
    }
    setIsLoading(true);
    setError('');
    setTranslationResult(null);
    try {
      const result = await geminiService.translateText(textToTranslate, targetLang, sourceLang);
      if (result) {
        setTranslationResult(result);
      } else {
        setError('Çeviri yapılamadı. Model bir sonuç döndürmedi.');
      }
    } catch (err) {
      console.error("Çeviri hatası:", err);
      setError("Çeviri sırasında bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WidgetCard title="AI Çevirmen" icon={<LanguageIcon className="w-6 h-6 text-sky-500" />}>
      {!apiKeyAvailable ? (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
          <LanguageIcon className="w-12 h-12 mx-auto text-sky-300 mb-3" />
          <p className="text-sm text-red-600">
            API Anahtarı (API_KEY) ayarlanmadığı için bu özellik kullanılamıyor.
          </p>
        </div>
      ) : (
        <div className="space-y-3 p-2">
          <div>
            <label htmlFor="text-to-translate" className="block text-sm font-medium text-gray-700 mb-1">
              Çevrilecek Metin:
            </label>
            <textarea
              id="text-to-translate"
              value={textToTranslate}
              onChange={(e) => setTextToTranslate(e.target.value)}
              rows={3}
              className="w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none placeholder-gray-400"
              placeholder="Çevirmek istediğiniz metni buraya yazın..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="source-lang" className="block text-sm font-medium text-gray-700 mb-1">
                Kaynak Dil (İsteğe Bağlı):
              </label>
              <input
                type="text"
                id="source-lang"
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none placeholder-gray-400"
                placeholder="Örn: İngilizce (veya boş bırakın)"
              />
            </div>
            <div>
              <label htmlFor="target-lang" className="block text-sm font-medium text-gray-700 mb-1">
                Hedef Dil:
              </label>
              <input
                type="text"
                id="target-lang"
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full p-2 rounded-md bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none placeholder-gray-400"
                placeholder="Örn: Türkçe"
              />
            </div>
          </div>
          <button
            onClick={handleTranslate}
            disabled={isLoading || !textToTranslate.trim() || !targetLang.trim()}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-70"
          >
            {isLoading ? <LoadingSpinner size="w-5 h-5" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
            Çevir
          </button>

          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">{error}</p>}

          {translationResult && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-800 mb-1">Çeviri Sonucu:</h4>
              {translationResult.detectedSourceLang && (
                <p className="text-xs text-gray-500 mb-1">Algılanan Kaynak Dil: {translationResult.detectedSourceLang}</p>
              )}
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{translationResult.translatedText}</p>
            </div>
          )}
        </div>
      )}
    </WidgetCard>
  );
};

export default AITranslatorWidget;
