import React, { useEffect, useRef } from 'react';
import { ChatMessage, SpeechSynthesisHook, ChatBackgroundStyle } from '../types';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: ChatMessage[];
  speechHook: SpeechSynthesisHook;
  chatBackgroundStyle?: ChatBackgroundStyle;
}

const MessageList: React.FC<MessageListProps> = ({ messages, speechHook, chatBackgroundStyle }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const getBackgroundStyles = (): React.CSSProperties => {
    if (!chatBackgroundStyle || chatBackgroundStyle.type === 'default') {
      return {}; 
    }
    if (chatBackgroundStyle.type === 'color') {
      return { backgroundColor: chatBackgroundStyle.value, backgroundImage: 'none' };
    }
    if (chatBackgroundStyle.type === 'imageURL' || chatBackgroundStyle.type === 'imageData') {
      return { 
        backgroundImage: `url(${chatBackgroundStyle.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    }
    return {};
  };


  return (
    <div 
      className="flex-grow p-4 space-y-2 overflow-y-auto bg-background/80 dark:bg-gray-900/70 backdrop-blur-sm transition-background duration-500 ease-in-out"
      style={getBackgroundStyles()}
      aria-live="polite" // Announces new messages
    >
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} speechHook={speechHook} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;