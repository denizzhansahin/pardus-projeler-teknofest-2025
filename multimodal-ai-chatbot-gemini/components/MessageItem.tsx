
import React, { useState, useEffect } from 'react';
import { ChatMessage, Sender, GroundingSource } from '../types';
import MediaPreview from './MediaPreview';
import LoadingSpinner from './LoadingSpinner';
import IconButton from './IconButton';
import SpeakerWaveIcon from './icons/SpeakerWaveIcon';
import SpeakerXMarkIcon from './icons/SpeakerXMarkIcon';
import { SpeechSynthesisHook } from '../types';

interface MessageItemProps {
  message: ChatMessage;
  speechHook: SpeechSynthesisHook;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, speechHook }) => {
  const { isSpeaking, isAvailable, speak, cancel } = speechHook;
  // This state tracks if *this specific message instance* requested to be spoken.
  const [thisMessageRequestedSpeak, setThisMessageRequestedSpeak] = useState(false);

  const isUser = message.sender === Sender.User;
  const isSystem = message.sender === Sender.System;
  
  const bubbleAlignment = isUser ? 'justify-end' : 'justify-start';
  const bubbleColor = isUser ? 'chat-bubble-user' : (isSystem ? 'bg-yellow-100 dark:bg-yellow-700 border border-yellow-300 dark:border-yellow-600 text-yellow-800 dark:text-yellow-200' : 'chat-bubble-ai');

  // Determine if this message is the one currently being spoken by the global speech hook
  const isThisMessageCurrentlySpeaking = isSpeaking && thisMessageRequestedSpeak;

  const handleSpeakToggle = () => {
    if (isThisMessageCurrentlySpeaking) {
      cancel(); // Stop speaking this message
      setThisMessageRequestedSpeak(false);
    } else {
      // If another message is speaking, cancel it first
      if (isSpeaking) {
        cancel();
      }
      speak(message.text);
      setThisMessageRequestedSpeak(true);
    }
  };
  
  useEffect(() => {
    // If global speaking stops, or if this message was speaking but another one started (isSpeaking is true but thisMessageRequestedSpeak becomes false implicitly),
    // then this message is no longer the one requesting speech.
    if (!isSpeaking && thisMessageRequestedSpeak) {
      setThisMessageRequestedSpeak(false);
    }
  }, [isSpeaking, thisMessageRequestedSpeak]);


  if (isSystem) {
    return (
      <div className={`flex ${bubbleAlignment} my-1 animate-fade-in animate-slide-up`}>
        <div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-xl shadow-md ${bubbleColor}`}>
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          {message.error && <p className="text-xs text-red-500 dark:text-red-400 mt-1">Error: {message.error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${bubbleAlignment} my-1 animate-fade-in animate-slide-up`}>
      <div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-xl shadow-md ${bubbleColor}`}>
        {message.isLoading ? (
          <div className="flex items-center space-x-2">
            <LoadingSpinner size="sm" color={isUser ? "text-white" : "text-white"} />
            <span className={`text-sm ${isUser ? 'text-gray-200' : 'text-gray-200'}`}>Oluşturuluyor...</span>
          </div>
        ) : (
          <>
            {message.media && <MediaPreview media={message.media} />}
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
            {message.error && <p className="text-xs text-red-200 dark:text-red-300 mt-1">Hata: {message.error}</p>}
            
            {message.groundingSources && message.groundingSources.length > 0 && (
              <div className="mt-2 pt-2 border-t border-white/20">
                <p className="text-xs font-semibold mb-1">Kaynak:</p>
                <ul className="list-disc list-inside space-y-1">
                  {message.groundingSources.map((source, index) => (
                    <li key={index} className="text-xs">
                      <a 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        title={source.title}
                        className="underline hover:opacity-80 transition-opacity truncate block"
                      >
                        {source.title || source.uri}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!isUser && isAvailable && message.text && (
              <IconButton
                label={isThisMessageCurrentlySpeaking ? 'Stop speaking' : 'Speak message'}
                onClick={handleSpeakToggle}
                size="sm"
                variant="ghost"
                className={`mt-2 ${isUser ? 'text-gray-200 hover:bg-white/20' : 'text-gray-200 hover:bg-white/20'}`}
              >
                {isThisMessageCurrentlySpeaking ? <SpeakerWaveIcon className="w-4 h-4" /> : <SpeakerXMarkIcon className="w-4 h-4" />}
              </IconButton>
            )}
          </>
        )}
        <p className={`text-xs mt-1 ${isUser ? 'text-gray-300' : 'text-gray-300'} ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

export default MessageItem;
