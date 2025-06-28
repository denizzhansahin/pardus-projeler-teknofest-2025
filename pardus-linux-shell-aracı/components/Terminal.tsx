
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import MessageBubble from './Message';
import SpinnerIcon from './icons/SpinnerIcon';

interface TerminalProps {
  messages: Message[];
  isLoading: boolean;
  isAwaitingConfirmation: boolean;
  onSendMessage: (text: string) => void;
  onConfirm: (messageId: string, confirmed: boolean) => void;
  terminalBodyRef: React.RefObject<HTMLDivElement>;
}

const Terminal: React.FC<TerminalProps> = ({ messages, isLoading, isAwaitingConfirmation, onSendMessage, onConfirm, terminalBodyRef }) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [isLoading, isAwaitingConfirmation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-900 overflow-hidden">
      <div ref={terminalBodyRef} className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} onConfirm={onConfirm} />
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-400">
            <SpinnerIcon />
            <span>Düşünüyor...</span>
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-700 bg-gray-800">
        <form onSubmit={handleSubmit} className="flex items-center">
          <span className="text-cyan-400 font-mono mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isAwaitingConfirmation ? "Lütfen yukarıdaki işlemi onaylayın veya iptal edin." : "ör., 'app.js' adında bir dosya oluştur"}
            className="flex-1 bg-transparent border-none text-gray-100 focus:outline-none placeholder-gray-500"
            disabled={isLoading || isAwaitingConfirmation}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isLoading || isAwaitingConfirmation || !inputText.trim()}
            className="ml-4 px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
          >
            Gönder
          </button>
        </form>
      </div>
    </div>
  );
};

export default Terminal;