
import React from 'react';
import { Conversation } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import ChatBubbleLeftRightIcon from './icons/ChatBubbleLeftRightIcon'; // Using this for general chat item
import IconButton from './IconButton';

interface ChatHistorySidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}) => {
  
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent selection when deleting
    if (window.confirm('Bu sohbeti silmek istediğinizden emin misiniz? Bu eylem geri alınamaz.')) {
      onDeleteConversation(id);
    }
  };

  return (
    <div className="w-64 sm:w-72 flex-shrink-0 bg-gray-100 dark:bg-gray-800/70 p-3 flex flex-col border-r border-gray-200 dark:border-gray-700/50 shadow-md">
      <button
        onClick={onNewChat}
        className="flex items-center justify-center w-full p-3 mb-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-accent-hover focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        Yeni Sohbet
      </button>
      <div className="flex-grow overflow-y-auto space-y-1 pr-1 -mr-1"> {/* Negative margin for scrollbar */}
        {conversations.length === 0 && (
            <p className="text-sm text-textSecondary dark:text-gray-400 text-center py-4">Henüz sohbet yok. Yeni bir tane başlat!</p>
        )}
        {conversations.map((convo) => (
          <div
            key={convo.id}
            onClick={() => onSelectConversation(convo.id)}
            className={`
              p-2.5 rounded-lg cursor-pointer transition-all duration-150 ease-in-out group
              flex items-center justify-between
              ${activeConversationId === convo.id 
                ? 'bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary-light font-medium' 
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-textPrimary dark:text-gray-300'}
            `}
            role="button"
            aria-pressed={activeConversationId === convo.id}
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectConversation(convo.id);}}
          >
            <div className="flex items-center overflow-hidden">
                <ChatBubbleLeftRightIcon className={`w-4 h-4 mr-2 flex-shrink-0 ${activeConversationId === convo.id ? 'text-primary dark:text-primary-light' : 'text-textSecondary dark:text-gray-400'}`} />
                <span className="truncate text-sm" title={convo.title}>{convo.title}</span>
            </div>
            <IconButton 
                label="Sohbeti Sil"
                onClick={(e) => handleDelete(e, convo.id)}
                variant="ghost"
                size="sm"
                className="p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-red-500 hover:bg-red-100 dark:hover:bg-red-700/50"
            >
                <TrashIcon className="w-4 h-4"/>
            </IconButton>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatHistorySidebar;
