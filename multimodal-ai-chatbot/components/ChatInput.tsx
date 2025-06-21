
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MediaAttachment, MediaType, SpeechRecognitionHook } from '../types';
import IconButton from './IconButton';
import SendIcon from './icons/SendIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';
import PaperClipIcon from './icons/PaperClipIcon';
import LoadingSpinner from './LoadingSpinner';
import StopIcon from './icons/StopIcon'; // Import StopIcon

interface ChatInputProps {
  onSendMessage: (text: string, media?: MediaAttachment) => void;
  speechRecognitionHook: SpeechRecognitionHook;
  isSending: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, speechRecognitionHook, isSending }) => {
  const [inputText, setInputText] = useState('');
  const [selectedMediaFile, setSelectedMediaFile] = useState<MediaAttachment | null>(null); // For file picker
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasSentAfterRecordingRef = useRef(false); // To prevent double send

  const { 
    isListening, 
    error: sttError, 
    hasPermission,
    countdown,
    recordedAudio, // Use this to get the Blob
    startListening,
    stopListening,
    resetRecorder,
  } = speechRecognitionHook;

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
  };

  const prepareAndSendMessage = (text: string, audioBlob: Blob | null) => {
    let mediaAttachment: MediaAttachment | undefined = undefined;

    if (audioBlob) {
      const audioUrl = URL.createObjectURL(audioBlob);
      mediaAttachment = {
        type: MediaType.Audio,
        url: audioUrl,
        name: `voice_message_${Date.now()}.webm`,
        file: audioBlob, // Include the Blob itself
      };
    } else if (selectedMediaFile) {
      mediaAttachment = selectedMediaFile;
    }

    if (text.trim() || mediaAttachment) {
      onSendMessage(text.trim(), mediaAttachment);
      setInputText('');
      setSelectedMediaFile(null);
      if (mediaPreviewUrl && (!mediaAttachment || mediaAttachment.type !== MediaType.Audio)) {
        // Only revoke if it's not the audio URL we just created for sending
        URL.revokeObjectURL(mediaPreviewUrl);
      }
      setMediaPreviewUrl(null);
      resetRecorder(); // Reset recorder after sending (clears recordedAudio)
      hasSentAfterRecordingRef.current = false;
    }
  };
  
  // Effect to send message when recording finishes and audio is available
  useEffect(() => {
    if (!isListening && recordedAudio && !hasSentAfterRecordingRef.current) {
      hasSentAfterRecordingRef.current = true; // Mark as attempting to send
      prepareAndSendMessage(inputText, recordedAudio); 
      // inputText will be current text in field
    }
  }, [isListening, recordedAudio, inputText, prepareAndSendMessage]);


  const handleSendViaButton = () => {
    if (isSending) return;
    if (isListening) { // If listening, stop first, then useEffect will handle send
      stopListening();
    } else { // If not listening, send immediately with current text/file
      prepareAndSendMessage(inputText, null); // No new audio from mic button here
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isListening) { // Don't send on Enter if recording
      e.preventDefault();
      handleSendViaButton();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsMediaLoading(true);
      if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl); // Clean up previous if any
      setMediaPreviewUrl(null); 

      const objectUrl = URL.createObjectURL(file);
      setMediaPreviewUrl(objectUrl);

      let mediaType: MediaType;
      if (file.type.startsWith('image/')) {
        mediaType = MediaType.Image;
      } else if (file.type.startsWith('video/')) {
        mediaType = MediaType.Video;
      } else if (file.type.startsWith('audio/')) {
        mediaType = MediaType.Audio;
      } else {
        alert('Desteklenmeyen dosya türü. Lütfen bir resim, video veya ses dosyası yükleyin.');
        setIsMediaLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = ""; 
        URL.revokeObjectURL(objectUrl); 
        setMediaPreviewUrl(null);
        return;
      }
      
      setSelectedMediaFile({
        type: mediaType,
        url: objectUrl, 
        name: file.name,
        file: file,
      });
      setIsMediaLoading(false);
    }
     if (fileInputRef.current) fileInputRef.current.value = ""; 
  };

  const triggerFileInput = () => {
    if (isListening) return; // Don't allow file input while recording
    fileInputRef.current?.click();
  };

  const removeMedia = () => {
    if (mediaPreviewUrl) URL.revokeObjectURL(mediaPreviewUrl);
    setSelectedMediaFile(null);
    setMediaPreviewUrl(null);
    setIsMediaLoading(false);
  };

  const toggleMicButton = useCallback(async () => {
    if (isSending) return; // Don't allow mic interaction if AI is processing
    hasSentAfterRecordingRef.current = false; // Reset for new recording attempt

    if(isListening) { 
        stopListening(); // useEffect will handle sending
    } else {
        resetRecorder(); // Clear any previous recording/error states before starting
        await startListening();
        // If startListening fails (e.g. permission denied), error state in hook will be set.
    }
  }, [isListening, stopListening, startListening, resetRecorder, isSending]);

  const micButtonDisabled = (hasPermission === false && !isListening) || isSending;

  useEffect(() => {
    return () => { // Cleanup for selected file media preview
      if (mediaPreviewUrl) {
         URL.revokeObjectURL(mediaPreviewUrl); 
      }
    };
  }, [mediaPreviewUrl]);


  return (
    <>
      <div className="bg-surface dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-top">
        {sttError && <p className="text-xs text-red-500 mb-2 text-center">Mikrofon Hatası: {sttError}</p>}
        {(mediaPreviewUrl && selectedMediaFile || isMediaLoading) && ( 
          <div className="mb-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg relative">
            {isMediaLoading ? (
              <div className="flex items-center justify-center h-24"><LoadingSpinner /></div>
            ) : selectedMediaFile?.type === MediaType.Image ? (
              <img src={mediaPreviewUrl!} alt="Preview" className="max-h-24 rounded" />
            ) : selectedMediaFile?.type === MediaType.Video ? (
              <video src={mediaPreviewUrl!} controls className="max-h-24 rounded" />
            ) : selectedMediaFile?.type === MediaType.Audio ? (
               <audio src={mediaPreviewUrl!} controls className="w-full h-12 rounded" />
            )
             : null}
            <button 
              onClick={removeMedia}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 z-10"
              aria-label="Remove media"
            >
              &times;
            </button>
            {selectedMediaFile && <p className="text-xs text-textSecondary dark:text-gray-400 mt-1 truncate" title={selectedMediaFile.name}>{selectedMediaFile.name}</p>}
          </div>
        )}
        <div className="flex items-end space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,video/*,audio/*"
            disabled={isListening || isSending}
          />
          <IconButton 
              label="Attach file" 
              onClick={triggerFileInput} 
              className="text-textSecondary hover:text-primary dark:text-gray-400 dark:hover:text-primary-light"
              disabled={isListening || isSending}
          >
            <PaperClipIcon />
          </IconButton>
          <textarea
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? "Dinleniyor..." : "Mesajınızı yazın veya medya hakkında soru sorun..."}
            className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-transparent outline-none transition-shadow bg-white dark:bg-gray-700 text-textPrimary dark:text-textPrimary placeholder-gray-400 dark:placeholder-gray-500"
            rows={1}
            style={{ maxHeight: '120px', minHeight: '48px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
            }}
            disabled={isSending || isListening} // Disable text input while listening for simplicity
          />
          <div className="relative flex items-center">
              <IconButton 
                label={isListening ? "Stop recording" : "Start recording"} 
                onClick={toggleMicButton}
                className={`
                  ${isListening ? 'text-red-500 dark:text-red-400 animate-pulse-fast' : 'text-textSecondary hover:text-primary dark:text-gray-400 dark:hover:text-primary-light'}
                  ${micButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                disabled={micButtonDisabled}
              >
                {isListening ? <StopIcon /> : <MicrophoneIcon />}
              </IconButton>
              {isListening && countdown !== null && (
                <span className="text-xs text-red-500 dark:text-red-400 absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  {countdown}s
                </span>
              )}
          </div>
          <IconButton 
            label="Send message" 
            onClick={handleSendViaButton} 
            disabled={isSending || isListening || (!inputText.trim() && !selectedMediaFile && !recordedAudio)}
            className="bg-accent text-white hover:bg-accent-hover disabled:opacity-50"
          >
            {isSending ? <LoadingSpinner size="sm" color="text-white" className="w-5 h-5"/> : <SendIcon className="w-5 h-5"/>}
          </IconButton>
        </div>
      </div>
    </>
  );
};

export default ChatInput;