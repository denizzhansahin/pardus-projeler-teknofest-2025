
import React from 'react';
import { ChatBubbleOvalLeftEllipsisIcon } from './icons/ChatBubbleOvalLeftEllipsisIcon';

interface PardusSupportChatButtonProps {
  onClick: () => void;
}

const PardusSupportChatButton: React.FC<PardusSupportChatButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-100 z-50"
      aria-label="Pardus Destek Sohbetini Aç"
      title="Pardus Destek"
    >
      <ChatBubbleOvalLeftEllipsisIcon className="w-7 h-7" />
    </button>
  );
};

export default PardusSupportChatButton;
