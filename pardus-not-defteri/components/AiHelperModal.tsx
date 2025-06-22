
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { getAiAssistance } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

interface AiHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentText: string;
  contextField: 'title' | 'content'; // Renamed from targetField for clarity
  onApplySuggestion: (suggestion: string) => void;
}

const AiHelperModal: React.FC<AiHelperModalProps> = ({ isOpen, onClose, currentText, contextField, onApplySuggestion }) => {
  const [task, setTask] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const commonTasks = contextField === 'title' 
  ? ["Daha dikkat çekici yap", "Kısalt", "Alternatif öner"]
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
      // Reset state when modal opens
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
    if (!currentText.trim() && contextField !== 'title') { // Title can be empty for initial suggestion
      setError("Yardım almak için lütfen önce biraz metin girin.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuggestion('');
    try {
      const result = await getAiAssistance(currentText, currentTaskToProcess);
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
      // onClose(); // App.tsx will handle closing by changing activeModal
    }
  };
  
  const handleClose = () => {
    // State reset is handled by useEffect on isOpen
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`AI Yardımcısı (${contextField === 'title' ? 'Başlık' : 'İçerik'})`} size="lg">
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-slate-600 mb-1">Mevcut Metin:</h4>
          <p className="p-3 bg-slate-100 rounded-md text-sm text-slate-700 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
            {currentText || (contextField === 'title' ? "Başlık için öneri isteyin..." : "Henüz metin yok.")}
          </p>
        </div>
        
        <div>
          <label htmlFor="aiTask" className="block text-sm font-medium text-slate-700 mb-1">Ne yapmak istersiniz?</label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="aiTask"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Örn: Bu metni özetle, bir eylem planı oluştur..."
              className="flex-grow mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
             <button
              onClick={() => handleGetSuggestion()}
              disabled={isLoading || !task.trim() || (!currentText.trim() && contextField !== 'title')}
              className="mt-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? <LoadingSpinner size="sm" color="text-white"/> : 'Öneri Al'}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 my-3">
            <span className="text-sm text-slate-500 mr-2 self-center">Hızlı Görevler:</span>
            {commonTasks.map(ct => (
                <button 
                    key={ct}
                    onClick={() => { setTask(ct); handleGetSuggestion(ct); }}
                    className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs hover:bg-indigo-200 transition-colors shadow-sm"
                >
                    {ct}
                </button>
            ))}
        </div>

        {error && <p className="text-sm text-red-600 p-2 bg-red-50 rounded-md">{error}</p>}

        {suggestion && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md shadow">
            <h4 className="text-md font-semibold text-green-800 mb-2">AI Önerisi:</h4>
            <p className="text-sm text-green-700 whitespace-pre-wrap max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-green-200">{suggestion}</p>
            <button
              onClick={handleApply}
              className="mt-3 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Öneriyi Uygula
            </button>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-slate-200 mt-5">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
          >
            Kapat
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AiHelperModal;
