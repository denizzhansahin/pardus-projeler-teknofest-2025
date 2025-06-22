
import React, { useState, useEffect, useRef } from 'react';
import { Note, AiChatMessage } from '../types';
import Modal from './Modal';
import { streamChatResponse, resetChat } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import IconButton from './IconButton'; 

interface AiChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
}

const AiChatModal: React.FC<AiChatModalProps> = ({ isOpen, onClose, notes }) => {
  const [chatHistory, setChatHistory] = useState<AiChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  useEffect(() => {
    if (isOpen) {
      resetChat(); 
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newUserMessage: AiChatMessage = {
      sender: 'user',
      text: userInput,
      timestamp: new Date().toISOString(),
    };
    setChatHistory(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    let fullAiResponse = "";
    setChatHistory(prev => [...prev, { sender: 'ai', text: '', timestamp: new Date().toISOString() }]);

    await streamChatResponse(
      newUserMessage.text,
      notes,
      chatHistory, 
      (chunkText) => {
        fullAiResponse += chunkText;
        setChatHistory(prev => {
          const lastMessage = prev[prev.length -1];
          if(lastMessage.sender === 'ai') {
            return [...prev.slice(0, -1), { ...lastMessage, text: fullAiResponse }];
          }
          return prev; 
        });
      },
      (err) => {
        console.error("Streaming error:", err);
        setError(`AI yanıtı alınırken bir hata oluştu: ${err.message}`);
        setChatHistory(prev => prev.filter(msg => !(msg.sender === 'ai' && msg.text === '')));
        setIsLoading(false);
      },
      () => { 
        setIsLoading(false);
      }
    );
  };
  
  const handleClose = () => {
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Notlarınız Hakkında AI ile Sohbet Edin" size="xl">
      <div className="flex flex-col h-[70vh]">
        <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto bg-slate-700/50 rounded-lg mb-4 scrollbar-thin scrollbar-thumb-slate-600">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] p-3.5 rounded-xl shadow-md text-sm
                  ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-600 text-slate-100 rounded-bl-none border border-slate-500'
                  }`}
              >
                <p className="whitespace-pre-wrap">{msg.text || (msg.sender === 'ai' && isLoading && index === chatHistory.length -1 ? <LoadingSpinner size="sm" color="text-slate-300" /> : '...')}</p>
                <p className={`text-xs mt-1.5 ${msg.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400 text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && chatHistory.length > 0 && chatHistory[chatHistory.length -1].sender === 'user' && (
             <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-lg shadow-md bg-slate-600">
                    <LoadingSpinner size="sm" color="text-slate-300" />
                </div>
             </div>
          )}
        </div>
        {error && <p className="text-sm text-red-400 mb-2 px-1">{error}</p>}
        <div className="flex items-center p-2 border-t border-slate-700">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Mesajınızı yazın..."
            className="flex-grow p-3.5 border border-slate-600 bg-slate-700/80 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none text-slate-100 placeholder-slate-400 scrollbar-thin"
            rows={2}
            disabled={isLoading}
          />
          <IconButton
            label="Gönder"
            onClick={handleSendMessage}
            disabled={isLoading || !userInput.trim()}
            className="ml-3 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white disabled:from-slate-500 disabled:to-slate-600 disabled:text-slate-400 disabled:cursor-not-allowed transform hover:scale-105"
            size="lg" 
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </IconButton>
        </div>
      </div>
    </Modal>
  );
};

const PaperAirplaneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);

export default AiChatModal;