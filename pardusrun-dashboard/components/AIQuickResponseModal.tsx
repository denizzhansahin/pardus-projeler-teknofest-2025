
import React, { useState, useCallback } from 'react';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import { geminiService } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon'; // Or a more specific AI icon

interface AIQuickResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeyAvailable: boolean;
}

const AIQuickResponseModal: React.FC<AIQuickResponseModalProps> = ({ isOpen, onClose, apiKeyAvailable }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !apiKeyAvailable) {
      if (!apiKeyAvailable) {
        setError("API Anahtarı yapılandırılmadığı için bu özellik kullanılamıyor.");
      }
      return;
    }
    setIsLoading(true);
    setError('');
    setResponse('');
    try {
      const result = await geminiService.getGeneralInfo(prompt);
      setResponse(result.text);
    } catch (err) {
      console.error("AI Hızlı Yanıt hatası:", err);
      setError("Yanıt alınırken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPrompt('');
    setResponse('');
    setError('');
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="AI ile Hızlı Yanıt" size="2xl">
      {!apiKeyAvailable ? (
        <p className="text-center text-red-600">
          API Anahtarı (API_KEY) ayarlanmadığı için bu özellik kullanılamıyor. Lütfen sistem yöneticinize başvurun.
        </p>
      ) : (
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-700 mb-1">
                Sorunuzu veya isteminizi girin:
              </label>
              <textarea
                id="ai-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-md bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-400"
                placeholder="Örn: Türkiye'nin başkenti neresidir?"
                aria-label="AI için soru veya istem girin"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full flex items-center justify-center px-4 py-2.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-70"
            >
              {isLoading ? <LoadingSpinner size="w-5 h-5" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
              Yanıt Al
            </button>
          </form>

          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

          {response && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="text-md font-semibold text-gray-800 mb-2">AI Yanıtı:</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{response}</p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default AIQuickResponseModal;
