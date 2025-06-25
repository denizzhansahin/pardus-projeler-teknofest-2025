
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import { ChatMessage } from '../types';
import { geminiService } from '../services/geminiService'; // To use startChat
import { SparklesIcon } from './icons/SparklesIcon'; // User icon for message
import { RocketLaunchIcon } from './icons/RocketLaunchIcon'; // Model icon
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';

interface PardusSupportChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeyAvailable: boolean;
}

const PardusSupportChatModal: React.FC<PardusSupportChatModalProps> = ({ isOpen, onClose, apiKeyAvailable }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && apiKeyAvailable && !chat) {
      const newChat = geminiService.startChat();
      if (newChat) {
        setChat(newChat);
        setMessages([
          {
            id: Date.now().toString(),
            role: 'model',
            text: 'Merhaba! Ben Pardus Destek Asistanı. Size nasıl yardımcı olabilirim?',
            timestamp: new Date(),
          },
        ]);
      } else {
        setError( "Sohbet başlatılamadı. API anahtarı sorunu olabilir.");
      }
    } else if (!isOpen) {
        // Reset chat when modal is closed to start fresh next time
        setChat(null);
        setMessages([]);
        setUserInput('');
        setError('');
    }
  }, [isOpen, apiKeyAvailable, chat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || !chat || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userInput,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError('');

    try {
      // Non-streaming for simplicity in this example
      const response: GenerateContentResponse = await chat.sendMessage({message: userMessage.text});
      
      const modelMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, modelMessage]);

    } catch (err) {
      console.error("Pardus Destek Sohbet hatası:", err);
      setError("Yanıt alınırken bir hata oluştu. Lütfen tekrar deneyin.");
      // Optionally add error message to chat
       setMessages((prevMessages) => [...prevMessages, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: "Üzgünüm, bir sorunla karşılaştım. Lütfen daha sonra tekrar deneyin.",
          timestamp: new Date(),
       }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pardus Destek Sohbeti" size="lg">
      {!apiKeyAvailable ? (
        <p className="text-center text-red-600">
          API Anahtarı (API_KEY) ayarlanmadığı için bu özellik kullanılamıyor.
        </p>
      ) : error && !chat ? (
         <p className="text-center text-red-600">{error}</p>
      ) : (
        <div className="flex flex-col h-[70vh] sm:h-[60vh]">
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-t-md">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end space-x-2 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'model' && (
                  <div className="flex-shrink-0 bg-purple-500 text-white rounded-full p-1.5 self-start">
                    <RocketLaunchIcon className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] p-3 rounded-xl shadow ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-white text-gray-700 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                   <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-purple-200' : 'text-gray-400'} text-right`}>
                    {msg.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                 {msg.role === 'user' && (
                  <div className="flex-shrink-0 bg-gray-300 text-gray-700 rounded-full p-1.5 self-start">
                    <SparklesIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start space-x-2">
                 <div className="flex-shrink-0 bg-purple-500 text-white rounded-full p-1.5 self-start">
                    <RocketLaunchIcon className="w-4 h-4" />
                  </div>
                <div className="p-3 rounded-xl bg-white text-gray-700 border border-gray-200 rounded-bl-none shadow">
                  <LoadingSpinner size="w-5 h-5" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {error && !isLoading && <p className="text-xs text-red-500 p-2 text-center">{error}</p>}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-md">
            <div className="flex items-center space-x-2">
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pardus ile ilgili sorunuzu yazın..."
                rows={1}
                className="flex-grow p-2.5 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                aria-label="Sohbet mesajınızı girin"
                disabled={isLoading || !chat}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !userInput.trim() || !chat}
                className="p-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 focus:ring-offset-white disabled:opacity-50"
                aria-label="Mesajı gönder"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default PardusSupportChatModal;
