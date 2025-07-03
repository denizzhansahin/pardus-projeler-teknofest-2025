import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, MediaItem } from '../types';
import SparklesIcon from './icons/SparklesIcon';

interface ChatViewProps {
    history: ChatMessage[];
    isThinking: boolean;
    onSendMessage: (message: string) => void;
    onItemClick: (item: MediaItem) => void;
}

const ChatView: React.FC<ChatViewProps> = ({ history, isThinking, onSendMessage, onItemClick }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [history, isThinking]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim()) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="h-full flex flex-col bg-pardus-light-dark/20 dark:bg-pardus-dark">
            <header className="p-4 border-b border-pardus-light-dark flex items-center flex-shrink-0">
                <SparklesIcon className="w-6 h-6 text-pardus-accent" />
                <h2 className="text-xl font-bold text-pardus-text ml-3">AI Sohbet Asistanı</h2>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                    {history.map((msg) => (
                        <div key={msg.id} className={`flex items-end gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'ai' && (
                                <div className="w-10 h-10 rounded-full bg-pardus-accent flex items-center justify-center flex-shrink-0">
                                    <SparklesIcon className="w-6 h-6 text-white"/>
                                </div>
                            )}
                            <div className={`max-w-lg lg:max-w-2xl p-4 rounded-2xl ${
                                msg.role === 'user'
                                    ? 'bg-pardus-accent text-white rounded-br-none'
                                    : 'bg-pardus-light-dark text-pardus-text rounded-bl-none'
                            }`}>
                                <p className="text-sm md:text-base whitespace-pre-wrap">{msg.text}</p>
                                {msg.mediaItems && msg.mediaItems.length > 0 && (
                                    <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {msg.mediaItems.map(item => (
                                            <div key={item.id} onClick={() => onItemClick(item)} className="cursor-pointer group relative rounded-lg overflow-hidden">
                                                <img src={item.url} alt={item.title} className="w-full h-20 object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                     {isThinking && (
                        <div className="flex items-end gap-3 justify-start">
                             <div className="w-10 h-10 rounded-full bg-pardus-accent flex items-center justify-center flex-shrink-0">
                                <SparklesIcon className="w-6 h-6 text-white"/>
                            </div>
                            <div className="max-w-lg p-4 rounded-2xl bg-pardus-light-dark text-pardus-text rounded-bl-none">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-pardus-text-dark rounded-full animate-bounce [animation-delay:-0.3s]"></div>
	                                <div className="w-2 h-2 bg-pardus-text-dark rounded-full animate-bounce [animation-delay:-0.15s]"></div>
	                                <div className="w-2 h-2 bg-pardus-text-dark rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <footer className="p-4 border-t border-pardus-light-dark">
                <form onSubmit={handleSend} className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Piksella'ya bir mesaj yaz..."
                        className="w-full bg-pardus-light-dark text-pardus-text placeholder-pardus-text-dark rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-pardus-accent"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isThinking}
                        className="p-3 bg-pardus-accent text-white rounded-full transition-colors duration-200 hover:bg-pardus-accent-hover disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default ChatView;