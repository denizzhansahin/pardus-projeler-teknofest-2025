import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AIChatMessage, Note } from '../types';
import { streamChatWithAI } from '../services/geminiAIService'; // Corrected import
import { Send, User, Bot, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { AnimatePresence, motion } from 'framer-motion';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
}

const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose, notes }) => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: input,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const aiTypingId = `ai-typing-${Date.now()}`;
    // Add a temporary "typing" message for AI
    setMessages(prev => [...prev, {id: aiTypingId, sender: 'ai', text: '', timestamp: Date.now()}]);
    
    try {
        // streamChatWithAI yields GenerateContentResponse chunks
        for await (const aiChunk of streamChatWithAI(userMessage.text, notes)) { 
            setMessages(prev => {
                const lastMessage = prev[prev.length -1];
                // Update the "typing" message with new text
                if(lastMessage && lastMessage.sender === 'ai' && lastMessage.id === aiTypingId) {
                    return [...prev.slice(0, -1), {...lastMessage, text: lastMessage.text + aiChunk.text }];
                }
                // Fallback: if "typing" message isn't last, or stream starts without it (should not happen with current logic)
                console.warn("AIChatModal: Could not find AI typing message to update. Appending new message chunk.");
                // This case should ideally not be hit if the "typing" message is correctly managed.
                // If it is, create a new message for this chunk, though it might lead to fragmented display.
                const newAiMessageChunk: AIChatMessage = {
                    id: `ai-chunk-${Date.now()}`, // Or use a more stable ID if possible from aiChunk if it had one
                    sender: 'ai',
                    text: aiChunk.text ?? '',
                    timestamp: Date.now(),
                };
                return [...prev, newAiMessageChunk];
            });
        }
    } catch(e) {
        console.error("Streaming chat error", e);
         // Replace "typing" message with an error message, or add a new error message
        setMessages(prev => {
            const lastMessage = prev[prev.length -1];
            if(lastMessage && lastMessage.sender === 'ai' && lastMessage.id === aiTypingId) {
                 return [...prev.slice(0, -1), {...lastMessage, text: t('errorOccurred'), id: `ai-err-${Date.now()}` }];
            }
            return [...prev, {id: `ai-err-${Date.now()}`, sender: 'ai', text: t('errorOccurred'), timestamp: Date.now()}];
        });
    } finally {
        setIsLoading(false);
        // KALDIRILDI: setMessages(prev => prev.map(msg => msg.id === aiTypingId ? {...msg, id: `ai-msg-${Date.now()}`} : msg));
        // Artık AI mesajının ID'si değiştirilmiyor, böylece sonsuz güncelleme tetiklenmez.
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('aiChat')} size="lg">
      <div className="flex flex-col h-[60vh]">
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-neutral-50 rounded-md mb-4">
          <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2.5 rounded-xl shadow ${
                  msg.sender === 'user'
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-white text-neutral-800 rounded-bl-none border border-neutral-200'
                }`}
              >
                <div className="flex items-start space-x-2">
                    {msg.sender === 'ai' && <Bot size={20} className="text-secondary flex-shrink-0 mt-0.5" />}
                     {/* Show loader only if it's an AI message, it's loading, and text is empty (initial typing state) */}
                    <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.text || (msg.sender === 'ai' && isLoading && msg.id.startsWith('ai-typing')) 
                            ? msg.text 
                            : (msg.sender === 'ai' && <Loader2 size={16} className="animate-spin" />)
                        }
                    </p>
                    {msg.sender === 'user' && <User size={20} className="text-neutral-200 flex-shrink-0 mt-0.5" />}
                </div>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
        <div className="flex items-center space-x-2 border-t pt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder={t('typeYourQuestion')}
            className="flex-grow px-4 py-2.5 border border-neutral-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            aria-label={t('send')}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin"/> : <Send size={20} />}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AIChatModal;