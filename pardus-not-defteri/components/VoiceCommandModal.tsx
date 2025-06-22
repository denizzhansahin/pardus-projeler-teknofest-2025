import React from 'react';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import IconButton from './IconButton';
import { VoiceAction } from '../types';

interface VoiceCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  interimTranscript: string;
  speechError: string | null;
  processingError: string | null;
  processedActions: { action: VoiceAction; status: 'success' | 'error'; message?: string; noteId?: string }[];
  onStartListening: () => void;
  onStopListening: () => void;
  onProcessTranscript: (text: string) => void;
  isSupported: boolean;
}

const VoiceCommandModal: React.FC<VoiceCommandModalProps> = ({
  isOpen, onClose, isListening, isProcessing, transcript, interimTranscript,
  speechError, processingError, processedActions,
  onStartListening, onStopListening, onProcessTranscript, isSupported
}) => {

  const handleMicClick = () => {
    if (isListening) {
      onStopListening();
      if (transcript.trim() || interimTranscript.trim()) {
        onProcessTranscript(transcript.trim() + " " + interimTranscript.trim());
      }
    } else {
      onStartListening();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sesli Komut" size="lg">
      <div className="space-y-4 min-h-[300px] flex flex-col">
        {!isSupported && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            Tarayıcınız konuşma tanımayı desteklemiyor. Lütfen Chrome veya Edge gibi destekleyen bir tarayıcı kullanın.
          </div>
        )}

        {isSupported && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <IconButton
              label={isListening ? "Dinlemeyi Durdur" : "Dinlemeyi Başlat"}
              onClick={handleMicClick}
              className={`w-20 h-20 rounded-full transition-all duration-300 ease-in-out transform hover:scale-110 focus:ring-4
                ${isListening ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300 animate-pulse' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-300'}`}
            >
              <MicrophoneIcon className="w-10 h-10 text-white" />
            </IconButton>
            <p className="text-sm text-slate-500">
              {isListening ? "Sizi dinliyorum..." : (isProcessing ? "İşleniyor..." : "Konuşmak için mikrofona tıklayın.")}
            </p>
          </div>
        )}

        {(transcript || interimTranscript) && !isProcessing && (
          <div className="p-3 bg-slate-100 rounded-md my-4">
            <p className="text-slate-700">{transcript} <span className="text-slate-400">{interimTranscript}</span></p>
          </div>
        )}
        
        {isProcessing && !transcript && !interimTranscript && (
             <div className="py-4"> <LoadingSpinner /> <p className="text-center text-slate-500 mt-2">Yapay zeka komutunuzu işliyor...</p></div>
        )}

        {speechError && <p className="text-sm text-red-600 p-2 bg-red-50 rounded-md">{speechError}</p>}
        {processingError && <p className="text-sm text-red-600 p-2 bg-red-50 rounded-md">AI İşleme Hatası: {processingError}</p>}

        {processedActions.length > 0 && (
          <div className="mt-4 space-y-2 max-h-60 overflow-y-auto scrollbar-thin p-1">
            <h4 className="font-semibold text-slate-700">İşlem Sonuçları:</h4>
            {processedActions.map((pa, index) => (
              <div key={index} className={`p-2 rounded-md text-sm ${pa.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <strong>{pa.action.type === 'createNote' ? `Not Oluşturuldu: "${(pa.action as any).title}"` : 
                           pa.action.type === 'setReminder' ? `Hatırlatıcı Ayarlandı: "${(pa.action as any).noteIdentifier}" için` :
                           pa.action.type === 'clarify' ? `Açıklama İsteği: ` :
                           pa.action.type === 'noActionDetected' ? `Eylem Algılanmadı: ` :
                           "Bilinmeyen Eylem"}
                </strong>
                {pa.message && <p>{pa.message}</p>}
              </div>
            ))}
          </div>
        )}
        
        <div className="flex-grow"></div> 
        
        <div className="flex justify-end pt-4 border-t border-slate-200 mt-auto">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
          >
            Kapat
          </button>
        </div>
      </div>
    </Modal>
  );
};

// SVG Icons
const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15c-1.125 0-2.164-.342-3-.938m6 0c-.836.596-1.875.938-3 .938m0-12.75c1.125 0 2.164.342 3 .938m-6 0c.836-.596 1.875-.938 3-.938m0-1.5V6m0 12.75v3.75m0-3.75a3 3 0 01-3-3V9m3 3a3 3 0 003-3V9m0 9.75a3 3 0 01-3 3h0a3 3 0 01-3-3V9.75M12 9.75L12 6" />
  </svg>
);

export default VoiceCommandModal;