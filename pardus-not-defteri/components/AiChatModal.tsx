
import React, { useState, useEffect, useRef } from 'react';
import { Note, AiChatMessage } from '../types';
import Modal from './Modal';
import { streamChatResponse, resetChat } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';
import IconButton from './IconButton'; // For send button

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
    // Reset chat state when modal opens/closes or notes change significantly (optional)
    if (isOpen) {
      resetChat(); // Reset the backend chat session
      // setChatHistory([]); // Optionally clear visual history too, or keep it for the session
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
      chatHistory, // Pass current history for context if needed by service
      (chunkText) => {
        fullAiResponse += chunkText;
        setChatHistory(prev => {
          const lastMessage = prev[prev.length -1];
          if(lastMessage.sender === 'ai') {
            return [...prev.slice(0, -1), { ...lastMessage, text: fullAiResponse }];
          }
          return prev; // Should not happen if AI message was pre-added
        });
      },
      (err) => {
        console.error("Streaming error:", err);
        setError(`AI yanıtı alınırken bir hata oluştu: ${err.message}`);
        setChatHistory(prev => prev.filter(msg => !(msg.sender === 'ai' && msg.text === ''))); // Remove empty AI placeholder
        setIsLoading(false);
      },
      () => { // onComplete
        setIsLoading(false);
      }
    );
  };
  
  const handleClose = () => {
    // Optionally reset chat history on close, or maintain it for the session
    // setChatHistory([]); 
    // resetChat(); // Reset backend chat session
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Notlarınız Hakkında AI ile Sohbet Edin" size="xl">
      <div className="flex flex-col h-[70vh]">
        <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto bg-slate-50 rounded-md mb-4">
          {chatHistory.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] p-3 rounded-xl shadow ${
                  msg.sender === 'user'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text || (msg.sender === 'ai' && isLoading && index === chatHistory.length -1 ? <LoadingSpinner size="sm" color="text-slate-500" /> : '...')}</p>
                <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400 text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && chatHistory.length > 0 && chatHistory[chatHistory.length -1].sender === 'user' && (
             <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-lg shadow bg-white text-slate-700 border border-slate-200">
                    <LoadingSpinner size="sm" />
                </div>
             </div>
          )}
        </div>
        {error && <p className="text-sm text-red-500 mb-2 px-1">{error}</p>}
        <div className="flex items-center p-2 border-t border-slate-200">
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
            className="flex-grow p-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={2}
            disabled={isLoading}
          />
          <IconButton
            label="Gönder"
            onClick={handleSendMessage}
            disabled={isLoading || !userInput.trim()}
            className="ml-2 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-400"
            size="lg"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </IconButton>
        </div>
      </div>
    </Modal>
  );
};

// SVG Icon (Heroicons)
const PaperAirplaneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
  </svg>
);


export default AiChatModal;
