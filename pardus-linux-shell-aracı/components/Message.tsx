import React from 'react';
import { Message, MessageType, AICommand } from '../types';

interface MessageBubbleProps {
  message: Message;
  onConfirm?: (messageId: string, confirmed: boolean) => void;
}

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => (
  <div className="my-2 bg-gray-900/70 rounded-md overflow-hidden">
    <div className="px-4 py-1 bg-gray-700/50 text-xs text-gray-300 font-semibold">{language}</div>
    <pre className="p-4 text-sm whitespace-pre-wrap break-words">
      <code className={`language-${language}`}>{code}</code>
    </pre>
  </div>
);


const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onConfirm }) => {
  const getAvatar = (type: MessageType) => {
    switch (type) {
      case MessageType.USER:
        return <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm flex-shrink-0">K</div>;
      case MessageType.AI:
        return <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-sm flex-shrink-0">AI</div>;
      case MessageType.SYSTEM:
         return <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold text-sm flex-shrink-0">✓</div>;
      case MessageType.ERROR:
         return <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center font-bold text-sm flex-shrink-0">!</div>;
    }
  };

  const renderAIResponse = (response: typeof message.aiResponse) => {
    if (!response) return null;
    // Güvenli şekilde message.text.replace kullanımı
    const safeText = typeof message.text === 'string' ? message.text : '';
    return (
      <div className="mt-2 p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-sm">
        <p className="text-gray-400 italic mb-2">
            <span className="font-bold">Düşünce: </span>{response.thought}
        </p>
        <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: safeText.replace(/\n/g, '<br/>') }} />
        {response.commands && response.commands.length > 0 && (
          <div className="mt-3">
            <h4 className="font-semibold text-gray-300 mb-1">Önerilen Komutlar:</h4>
            {response.commands.map((cmd, index) => {
              if (cmd.type === 'bash') {
                return <CodeBlock key={index} language="bash" code={`$ ${cmd.command}`} />;
              }
              if (cmd.type === 'file_operation') {
                 const lang = cmd.filename?.endsWith('.py') ? 'python' : cmd.filename?.endsWith('.js') ? 'javascript' : 'text';
                 const content = `Dosya: ${cmd.filename}\nİşlem: ${cmd.operation || 'oluşturma'}\n\n${cmd.content}`;
                 return <CodeBlock key={index} language={lang} code={content} />;
              }
              return null;
            })}
          </div>
        )}
        {message.isConfirmed === null && onConfirm && (
            <div className="mt-4 pt-3 border-t border-gray-700 flex items-center justify-end space-x-3">
                <p className="text-sm text-yellow-300 mr-auto">Bu komutları çalıştırmak istiyor musunuz?</p>
                <button
                    onClick={() => onConfirm(message.id, false)}
                    className="px-4 py-2 text-sm font-semibold bg-gray-600 text-white rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
                >
                    İptal Et
                </button>
                <button
                    onClick={() => onConfirm(message.id, true)}
                    className="px-4 py-2 text-sm font-semibold bg-green-600 text-white rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
                >
                    Onayla & Çalıştır
                </button>
            </div>
        )}
      </div>
    );
  };
  
  if (message.type === MessageType.SYSTEM || message.type === MessageType.ERROR) {
      const baseClasses = "text-center text-xs italic p-2 rounded-md";
      const typeClasses = message.type === MessageType.SYSTEM 
        ? "text-yellow-300/90 bg-yellow-900/20"
        : "text-red-300/90 bg-red-900/20";
    return (
        <div className={`${baseClasses} ${typeClasses}`}>
            {message.text}
        </div>
    )
  }

  return (
    <div className={`flex items-start space-x-3 ${message.type === MessageType.USER ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
      {getAvatar(message.type)}
      <div className={`max-w-xl p-3 rounded-lg ${message.type === MessageType.USER ? 'bg-indigo-600' : 'bg-gray-700'}`}>
        {message.type === MessageType.AI ? renderAIResponse(message.aiResponse) : <p>{message.text}</p>}
      </div>
    </div>
  );
};

export default MessageBubble;