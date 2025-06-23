import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import IconButton from './IconButton';
import { VoiceAction } from '../types';

interface VoiceCommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  
  isRecording: boolean;
  isTranscribing: boolean;
  isProcessingCommand: boolean; 
  
  elapsedTime: number;
  // maxRecordingTime is removed as recording is now indefinite until stopped by user
  // maxRecordingTime: number; 

  transcribedText: string | null;
  
  recorderError: string | null;
  transcriptionError: string | null;
  commandProcessingError: string | null; 
  
  processedCommandActions: { action: VoiceAction; status: 'success' | 'error'; message?: string; noteId?: string }[]; 
  
  onStartRecording: () => void;
  onStopRecording: () => void;

  isMicrophoneSupported: boolean; 
}

const VoiceCommandModal: React.FC<VoiceCommandModalProps> = ({
  isOpen, onClose,
  isRecording, isTranscribing, isProcessingCommand,
  elapsedTime, // maxRecordingTime removed
  transcribedText,
  recorderError, transcriptionError, commandProcessingError,
  processedCommandActions,
  onStartRecording, onStopRecording,
  isMicrophoneSupported
}) => {

  const [currentStatusText, setCurrentStatusText] = useState("Konuşmak için mikrofona tıklayın.");

  useEffect(() => {
    if (!isOpen) {
        setCurrentStatusText("Konuşmak için mikrofona tıklayın.");
        return;
    }

    if (isRecording) {
      setCurrentStatusText(`Kaydediliyor... (${elapsedTime}s)`); // Removed maxRecordingTime display
    } else if (isTranscribing) {
      setCurrentStatusText("Ses yazıya dökülüyor...");
    } else if (isProcessingCommand) {
      setCurrentStatusText("Komut işleniyor...");
    } else if (transcribedText && processedCommandActions.length > 0) {
        setCurrentStatusText("İşlem tamamlandı.");
    } else if (transcribedText) {
        setCurrentStatusText("Yazıya dökülen metin hazır. Komut işleniyor...");
    }
     else if (recorderError || transcriptionError || commandProcessingError) {
        setCurrentStatusText("Bir hata oluştu.");
    }
    else {
      setCurrentStatusText("Konuşmak için mikrofona tıklayın veya kapatın.");
    }
  }, [isOpen, isRecording, isTranscribing, isProcessingCommand, elapsedTime, transcribedText, processedCommandActions, recorderError, transcriptionError, commandProcessingError]);


  const handleMicClick = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      if (!isTranscribing && !isProcessingCommand) {
         onStartRecording();
      }
    }
  };
  
  const showLoadingSpinner = isTranscribing || (isProcessingCommand && !transcribedText);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sesli Komut" size="lg"> {/* Title updated */}
      <div className="space-y-5 min-h-[350px] flex flex-col">
        {!isMicrophoneSupported && (
          <div className="p-4 bg-red-500/20 text-red-300 rounded-lg">
            Tarayıcınız mikrofon kaydını veya gerekli formatları desteklemiyor. Lütfen güncel bir Chrome veya Edge tarayıcı kullanın.
          </div>
        )}

        {isMicrophoneSupported && (
          <div className="flex flex-col items-center justify-center space-y-5 pt-4">
            <IconButton
              label={isRecording ? "Kaydı Durdur" : "Kaydı Başlat"}
              onClick={handleMicClick}
              disabled={isTranscribing || isProcessingCommand} 
              size="lg"
              className={`w-24 h-24 rounded-full transition-all duration-300 ease-in-out transform hover:scale-110 focus:ring-4 focus:ring-offset-2 focus:ring-offset-slate-800
                ${isRecording 
                    ? 'bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 focus:ring-red-400 animate-pulse' 
                    : (isTranscribing || isProcessingCommand 
                        ? 'bg-slate-600 cursor-not-allowed'
                        : 'bg-gradient-to-br from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 focus:ring-sky-400')
                }`}
            >
              {isRecording ? <StopIcon className="w-10 h-10 text-white" /> : <MicrophoneIcon className="w-10 h-10 text-white" />}
            </IconButton>
            <p className="text-base text-slate-400 h-6"> 
              {currentStatusText}
            </p>
          </div>
        )}
        
        {showLoadingSpinner && (
             <div className="py-4 flex flex-col items-center justify-center">
                <LoadingSpinner />
             </div>
        )}

        {recorderError && <p className="text-sm text-red-400 p-3 bg-red-500/20 rounded-lg">Kayıt Hatası: {recorderError}</p>}
        {transcriptionError && <p className="text-sm text-red-400 p-3 bg-red-500/20 rounded-lg">Döküm Hatası: {transcriptionError}</p>}
        {commandProcessingError && <p className="text-sm text-red-400 p-3 bg-red-500/20 rounded-lg">Komut İşleme Hatası: {commandProcessingError}</p>}

        {transcribedText && !isTranscribing && !isProcessingCommand && (
             <div className="mt-4 p-3.5 bg-slate-700/70 rounded-lg my-4">
                <h4 className="text-sm font-medium text-slate-400 mb-1">Yazıya Dökülen Metin:</h4>
                <p className="text-slate-200">{transcribedText}</p>
            </div>
        )}
        
        {processedCommandActions.length > 0 && !isProcessingCommand && (
          <div className="mt-4 space-y-2.5 max-h-60 overflow-y-auto scrollbar-thin p-1 scrollbar-thumb-slate-600">
            <h4 className="font-semibold text-slate-300 mb-2">İşlem Sonuçları:</h4>
            {processedCommandActions.map((pa, index) => (
              <div key={index} className={`p-3 rounded-lg text-sm shadow-md ${pa.status === 'success' ? 'bg-green-500/10 text-green-300 border border-green-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'}`}>
                <strong>{pa.action.type === 'createNote' ? `Not Oluşturuldu: "${(pa.action as any).title}"` : 
                           pa.action.type === 'setReminder' ? `Hatırlatıcı Ayarlandı: "${(pa.action as any).noteIdentifier}" için` :
                           pa.action.type === 'clarify' ? `Açıklama: ` :
                           pa.action.type === 'noActionDetected' ? `Eylem Algılanmadı: ` :
                           "Bilinmeyen Eylem"}
                </strong>
                {pa.message && <p className="mt-1 opacity-90">{pa.message}</p>}
              </div>
            ))}
          </div>
        )}
        
        <div className="flex-grow"></div> 
        
        <div className="flex justify-end pt-5 border-t border-slate-700 mt-auto">
          <button
            type="button"
            onClick={onClose}
            disabled={isRecording || isTranscribing || isProcessingCommand} 
            className="px-5 py-2.5 text-sm font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500 transition-colors disabled:bg-slate-600 disabled:text-slate-400"
          >
            Kapat
          </button>
        </div>
      </div>
    </Modal>
  );
};

const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15c-1.125 0-2.164-.342-3-.938m6 0c-.836.596-1.875.938-3 .938m0-12.75c1.125 0 2.164.342 3 .938m-6 0c.836-.596 1.875-.938 3-.938m0-1.5V6m0 12.75v3.75m0-3.75a3 3 0 01-3-3V9m3 3a3 3 0 003-3V9m0 9.75a3 3 0 01-3 3h0a3 3 0 01-3-3V9.75M12 9.75L12 6" />
  </svg>
);

const StopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
    </svg>
);


export default VoiceCommandModal;