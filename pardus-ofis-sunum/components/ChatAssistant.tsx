
import React, { useState, useRef, useEffect } from 'react';
import { Slide, ChatMessage, TextElement } from '../types';
import { chatOnSlide } from '../services/geminiService';
import { BotIcon, UserIcon, LoaderIcon } from './icons';

interface ChatAssistantProps {
  currentSlide: Slide | null;
  onNewMessage: (slideId: string, message: ChatMessage) => void;
  onModelResponse: (slideId: string, message: ChatMessage) => void;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ currentSlide, onNewMessage, onModelResponse }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [currentSlide?.chatHistory]);

  const handleSend = async () => {
    if (!input.trim() || !currentSlide) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    onNewMessage(currentSlide.id, userMessage);
    setInput('');
    setIsLoading(true);

    try {
      const slideContent = currentSlide.userElements.filter(el => el.type === 'text').map(el => (el as TextElement).content).join('\n') || currentSlide.outline.title;
      const modelResponseContent = await chatOnSlide(slideContent, currentSlide.chatHistory, input);
      const modelMessage: ChatMessage = { role: 'model', content: modelResponseContent };
      onModelResponse(currentSlide.id, modelMessage);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = { role: 'model', content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.' };
      onModelResponse(currentSlide.id, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!currentSlide) return null;

  return (
    <div className="w-80 bg-pardus-dark border-l border-pardus-border flex flex-col h-full">
      <div className="p-4 border-b border-pardus-border">
        <h3 className="text-lg font-semibold text-pardus-light flex items-center gap-2"><BotIcon/> Yapay Zeka Asistanı</h3>
        <p className="text-sm text-pardus-secondary">"{currentSlide.outline.title}" sayfası için yardım alın.</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {currentSlide.chatHistory.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <BotIcon className="w-6 h-6 text-pardus-accent flex-shrink-0 mt-1" />}
            <div className={`rounded-lg px-4 py-2 max-w-xs break-words ${msg.role === 'user' ? 'bg-pardus-accent text-white' : 'bg-pardus-secondary/50'}`}>
              <p className="text-sm">{msg.content}</p>
            </div>
             {msg.role === 'user' && <UserIcon className="w-6 h-6 text-pardus-light flex-shrink-0 mt-1" />}
          </div>
        ))}
         {isLoading && (
            <div className="flex items-start gap-3">
                <BotIcon className="w-6 h-6 text-pardus-accent flex-shrink-0 mt-1" />
                <div className="rounded-lg px-4 py-2 bg-pardus-secondary/50 flex items-center">
                    <LoaderIcon className="w-5 h-5"/>
                </div>
            </div>
         )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-pardus-border">
        <div className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Mesajınızı yazın..."
            className="w-full bg-pardus-secondary rounded-lg p-2 text-sm text-pardus-light placeholder-pardus-light/50 focus:outline-none focus:ring-2 focus:ring-pardus-accent resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-pardus-accent rounded-lg p-2 disabled:bg-pardus-secondary disabled:cursor-not-allowed">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
