
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { getAiAssistance } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface AiHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentText: string;
  contextField: 'title' | 'content'; 
  onApplySuggestion: (suggestion: string) => void;
}

const AiHelperModal: React.FC<AiHelperModalProps> = ({ isOpen, onClose, currentText, contextField, onApplySuggestion }) => {
  const [task, setTask] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const commonTasks = contextField === 'title' 
  ? ["Daha dikkat çekici yap", "Kısalt", "Alternatif öner", "Yeni bir başlık oluştur"]
  : [
    "Bu metni geliştir",
    "Bu fikre dayalı bir plan oluştur",
    "Daha ilgi çekici hale getir",
    "Kısalt",
    "Genişlet",
    "Dilbilgisini düzelt",
    "Özetle"
  ];
  
  useEffect(() => {
    if (isOpen) {
      setTask('');
      setSuggestion('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);


  const handleGetSuggestion = async (selectedTask?: string) => {
    const currentTaskToProcess = selectedTask || task;
    if (!currentTaskToProcess.trim()) {
      setError("Lütfen bir görev belirtin.");
      return;
    }
    if (!currentText.trim() && contextField === 'content') { 
      setError("Yardım almak için lütfen önce biraz metin girin.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestion('');
    try {
      const result = await getAiAssistance(currentText, currentTaskToProcess, contextField);
      setSuggestion(result);
    } catch (err) {
      setError("Yapay zekadan yardım alınırken bir hata oluştu.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (suggestion) {
      onApplySuggestion(suggestion);
    }
  };
  
  const handleClose = () => {
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`AI Yardımcısı (${contextField === 'title' ? 'Başlık' : 'İçerik'})`} size="lg">
      <div className="space-y-5">
        <div>
          <h4 className="text-sm font-medium text-slate-400 mb-1.5">Mevcut Metin:</h4>
          <p className="p-3.5 bg-slate-700/70 rounded-lg text-sm text-slate-300 max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600">
            {currentText || (contextField === 'title' ? "Başlık için öneri isteyin veya yeni bir tane oluşturun..." : "Henüz metin yok.")}
          </p>
        </div>
        
        <div>
          <label htmlFor="aiTask" className="block text-sm font-medium text-slate-300 mb-1.5">Ne yapmak istersiniz?</label>
          <div className="flex space-x-3">
            <input
              type="text"
              id="aiTask"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Örn: Bu metni özetle, bir eylem planı oluştur..."
              className="flex-grow mt-1 block w-full px-4 py-2.5 border border-slate-600 bg-slate-700/80 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent sm:text-sm text-slate-100 placeholder-slate-400"
            />
             <button
              onClick={() => handleGetSuggestion()}
              disabled={isLoading || !task.trim() || (!currentText.trim() && contextField === 'content')}
              className="mt-1 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-sky-400 disabled:bg-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed whitespace-nowrap transition-all transform hover:scale-105"
            >
              {isLoading ? <LoadingSpinner size="sm" color="text-white"/> : 'Öneri Al'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5 my-3 items-center">
            <span className="text-sm text-slate-400 mr-2">Hızlı Görevler:</span>
            {commonTasks.map(ct => (
                <button 
                    key={ct}
                    onClick={() => { setTask(ct); handleGetSuggestion(ct); }}
                    disabled={isLoading || (!currentText.trim() && contextField === 'content') || (!currentText.trim() && contextField === 'title' && !(ct.toLowerCase().includes("oluştur") || ct.toLowerCase().includes("öner") || ct.toLowerCase().includes("dikkat çekici")) )}
                    className="px-3.5 py-1.5 bg-sky-500/20 text-sky-300 rounded-full text-xs hover:bg-sky-500/30 transition-colors shadow-sm disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                    {ct}
                </button>
            ))}
        </div>

        {error && <p className="text-sm text-red-400 p-3 bg-red-500/20 rounded-lg">{error}</p>}

        {suggestion && (
          <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg shadow-md">
            <h4 className="text-md font-semibold text-green-300 mb-2">AI Önerisi:</h4>
            <p className="text-sm text-green-200 whitespace-pre-wrap max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-green-500/30">{suggestion}</p>
            <button
              onClick={handleApply}
              className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 transition-colors"
            >
              Öneriyi Uygula
            </button>
          </div>
        )}

        <div className="flex justify-end pt-5 border-t border-slate-700 mt-6">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AiHelperModal;