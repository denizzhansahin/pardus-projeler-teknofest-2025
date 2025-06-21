import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessage, Sender, MediaAttachment, MediaType, GroundingSource, ChatBackgroundStyle, Conversation } from './types';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import BackgroundSettingsModal from './components/BackgroundSettingsModal';
import ChatHistorySidebar from './components/ChatHistorySidebar';
import IconButton from './components/IconButton';
import CogIcon from './components/icons/CogIcon';
import { generateTextWithGemma, generateTextFromImageWithGemma, transcribeAudioWithWhisper, generateSpeechWithBark } from './services/aiApiService';
import useSpeechRecognition from './hooks/useSpeechRecognition';
import useSpeechSynthesis from './hooks/useSpeechSynthesis';

const CHAT_BACKGROUND_STORAGE_KEY = 'chatAppBackgroundPreference';
const CHAT_HISTORY_STORAGE_KEY = 'aiChatAppHistory';
const MAX_TITLE_LENGTH = 40;

const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const speechRecognitionHook = useSpeechRecognition();
  const speechHook = useSpeechSynthesis();
  
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [chatBackgroundStyle, setChatBackgroundStyle] = useState<ChatBackgroundStyle>({ type: 'default', value: '' });

  const initialLoadDone = useRef(false);

  // Object URL Management
  const objectUrlsRef = useRef<Set<string>>(new Set());
  const addTrackedUrl = useCallback((url: string) => {
    if (url.startsWith('blob:')) {
      objectUrlsRef.current.add(url);
    }
  }, []);
  const revokeTrackedUrl = useCallback((url: string) => {
    if (url.startsWith('blob:') && objectUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      objectUrlsRef.current.delete(url);
    }
  }, []);
  useEffect(() => { // Cleanup all tracked URLs on unmount
    return () => {
      objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);


  const createMessageObject = useCallback((text: string, sender: Sender, media?: MediaAttachment, isLoading = false, error?: string, groundingSources?: GroundingSource[]): ChatMessage => {
    if (media?.url) addTrackedUrl(media.url);
    return {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        text,
        sender,
        timestamp: new Date(),
        media,
        isLoading,
        error,
        groundingSources,
      };
  }, [addTrackedUrl]);

  const handleNewChat = useCallback((isInitialOrWelcomeChat = false) => {
    const newId = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const now = new Date();
    let title = "";
    let initialMessages: ChatMessage[] = [];

    setConversations(prevConversations => {
        if (isInitialOrWelcomeChat) {
            title = "Sohbete Hoş Geldiniz";
            initialMessages.push(createMessageObject(
                "Merhaba! Ben sizin çok modlu AI asistanınızım. Bugün size nasıl yardımcı olabilirim? Yazabilir, konuşabilir (mikrofonu deneyin!) veya resim/video/ses yükleyebilirsiniz.",
                Sender.AI
            ));
        } else {
            const newChatCount = prevConversations.filter(c => c.title.startsWith("Yeni Sohbet")).length + 1;
            title = `Yeni Sohbet ${newChatCount}`;
        }
        
        const newConversation: Conversation = {
          id: newId,
          title: title,
          messages: initialMessages,
          createdAt: now,
          lastUpdatedAt: now,
        };
        setActiveConversationId(newId); // Set active ID immediately
        return [newConversation, ...prevConversations].sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
    });
    return newId; 
  }, [createMessageObject]); // Removed conversations from deps

  useEffect(() => {
    const storedPreference = localStorage.getItem(CHAT_BACKGROUND_STORAGE_KEY);
    if (storedPreference) {
      try {
        setChatBackgroundStyle(JSON.parse(storedPreference));
      } catch (e) { console.error("Arka plan tercihi ayrıştırılamadı", e); }
    }
  }, []);

  useEffect(() => {
    const storedHistory = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    if (storedHistory) {
      try {
        const parsedHistory: Conversation[] = JSON.parse(storedHistory).map((convo: any) => ({
          ...convo,
          createdAt: new Date(convo.createdAt),
          lastUpdatedAt: new Date(convo.lastUpdatedAt),
          messages: convo.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
            ...(msg.media && msg.media.url && msg.media.url.startsWith('blob:') && msg.media.file 
                ? { media: { ...msg.media, url: '' } } 
                : {})
          })),
        }));
        
        if (parsedHistory.length > 0) {
          const sortedHistory = parsedHistory.sort((a,b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
          setConversations(sortedHistory);
          setActiveConversationId(sortedHistory[0].id); 
        } else {
           handleNewChat(true); 
        }
      } catch (e) {
        console.error("Sohbet geçmişi ayrıştırılamadı", e);
        handleNewChat(true); 
      }
    } else {
      handleNewChat(true); 
    }
    initialLoadDone.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // handleNewChat is stable

  useEffect(() => {
    if (initialLoadDone.current && conversations.length > 0) { 
        localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(conversations));
    } else if (initialLoadDone.current && conversations.length === 0) {
        localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY); 
    }
  }, [conversations]);

  // Effect to manage activeConversationId and ensure a welcome chat if all are deleted
  useEffect(() => {
    if (!initialLoadDone.current) return;

    const activeConvoExists = conversations.some(c => c.id === activeConversationId);

    if (conversations.length === 0) {
      if (activeConversationId !== null) setActiveConversationId(null); 
      handleNewChat(true); 
    } else if (!activeConvoExists) {
      setActiveConversationId(conversations[0].id); 
    }
  }, [conversations, activeConversationId, handleNewChat]);


  const handleApplyBackground = (style: ChatBackgroundStyle) => {
    setChatBackgroundStyle(style);
    localStorage.setItem(CHAT_BACKGROUND_STORAGE_KEY, JSON.stringify(style));
    setIsSettingsModalOpen(false);
  };
  
   useEffect(() => {
    if (!process.env.API_KEY) {
       console.warn("Gemini API anahtarı yapılandırılmamış. AI özellikleri çalışmayacak.");
        if (conversations.length === 1 && conversations[0].title === "Sohbete Hoş Geldiniz" && conversations[0].messages.length === 1) {
             // addMessageToConversation(conversations[0].id, createMessageObject("Warning: AI API Key not set. AI responses disabled.", Sender.System));
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations, createMessageObject]); // Added createMessageObject as it's used if we uncomment the line

  const addMessageToConversation = useCallback((conversationId: string, message: ChatMessage) => {
    setConversations(prev =>
      prev.map(convo => {
        if (convo.id === conversationId) {
          let newTitle = convo.title;
          const isGenericTitle = convo.title.startsWith("Yeni Sohbet") || convo.title === "Yeni Sohbet";
          const canUpdateTitle = message.sender === Sender.User && isGenericTitle && message.text.trim() && message.media?.type !== MediaType.Audio;

          if (canUpdateTitle) {
            newTitle = message.text.trim().substring(0, MAX_TITLE_LENGTH) + (message.text.trim().length > MAX_TITLE_LENGTH ? "..." : "");
          }
          return {
            ...convo,
            messages: [...convo.messages, message],
            lastUpdatedAt: new Date(),
            title: newTitle,
          };
        }
        return convo;
      }).sort((a,b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime())
    );
  }, []); // No direct dependencies on conversations

  const updateMessageInConversation = useCallback((conversationId: string, messageId: string, updates: Partial<ChatMessage>) => {
    setConversations(prev =>
      prev.map(convo =>
        convo.id === conversationId
          ? {
              ...convo,
              messages: convo.messages.map(msg => (msg.id === messageId ? { ...msg, ...updates, isLoading: false } : msg)),
              lastUpdatedAt: new Date(), 
            }
          : convo
      ).sort((a,b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime())
    );
  }, []); // No direct dependencies on conversations
  
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  const handleDeleteConversation = useCallback((idToDelete: string) => {
    setConversations(prevConversations => {
        const convoToDelete = prevConversations.find(c => c.id === idToDelete);
        if (convoToDelete) {
            convoToDelete.messages.forEach(msg => {
                if (msg.media && msg.media.url) {
                    revokeTrackedUrl(msg.media.url);
                }
            });
        }
        return prevConversations.filter(convo => convo.id !== idToDelete);
    });
  }, [revokeTrackedUrl]); // Removed conversations from deps


  const handleSendMessage = useCallback(async (text: string, media?: MediaAttachment) => {
    let currentChatId = activeConversationId;
    if (!currentChatId) { 
      currentChatId = handleNewChat(); 
    }
    if (!text.trim() && !media) return;
    const userMessage = createMessageObject(text, Sender.User, media);
    addMessageToConversation(currentChatId, userMessage);
    setIsAiLoading(true);
    const aiPlaceholderMessage = createMessageObject('...', Sender.AI, undefined, true);
    addMessageToConversation(currentChatId, aiPlaceholderMessage);
    try {
      let aiResultText = '';
      let groundingSources = undefined;
      // Görselden metin üretimi
      if (media?.type === MediaType.Image && media.file instanceof File) {
        const result = await generateTextFromImageWithGemma(media.file, text || 'Bu görseli detaylı açıkla.');
        aiResultText = result.response || result.error || 'Yanıt alınamadı.';
      } 
      // Sesten metin üretimi
      else if (media?.type === MediaType.Audio && media.file instanceof Blob) {
        const audioFile = new File([media.file], media.name || 'audio.webm', { type: media.file.type || 'audio/webm' });
        const result = await transcribeAudioWithWhisper(audioFile);
        aiResultText = result.transcription || result.error || 'Yanıt alınamadı.';
      } 
      // Sadece metin
      else {
        const result = await generateTextWithGemma(text);
        aiResultText = result.response || result.error || 'Yanıt alınamadı.';
      }
      updateMessageInConversation(currentChatId, aiPlaceholderMessage.id, { text: aiResultText, groundingSources });
    } catch (error: any) {
      updateMessageInConversation(currentChatId, aiPlaceholderMessage.id, { text: error?.message || 'Bir hata oluştu.', error: error?.message });
    }
    setIsAiLoading(false);
  }, [activeConversationId, handleNewChat, addMessageToConversation, updateMessageInConversation, createMessageObject]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-600 via-indigo-700 to-teal-500 antialiased">
      <header className="bg-primary/80 dark:bg-primary-dark/80 backdrop-blur-md shadow-lg p-3 sm:p-4 text-center flex justify-between items-center flex-shrink-0">
        <div className="w-10"></div> 
        <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">Pardus AI with Gemini API</h1>
        <IconButton
            label="Chat Settings"
            onClick={() => setIsSettingsModalOpen(true)}
            variant="ghost"
            className="text-white hover:bg-white/20"
        >
            <CogIcon className="w-5 h-5"/>
        </IconButton>
      </header>
      
      <div className="flex flex-row flex-grow overflow-hidden m-1 sm:m-2 md:m-3 rounded-xl shadow-2xl bg-surface/20 dark:bg-gray-900/20 backdrop-blur-md">
        <ChatHistorySidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNewChat={() => handleNewChat()}
            onDeleteConversation={handleDeleteConversation}
        />
        <main className="flex-grow flex flex-col overflow-hidden bg-surface/90 dark:bg-gray-800/90 rounded-r-xl">
            {activeConversation ? (
                <MessageList 
                    messages={activeConversation.messages} 
                    speechHook={speechHook}
                    chatBackgroundStyle={chatBackgroundStyle}
                />
            ) : (
                <div className="flex-grow flex items-center justify-center text-textSecondary dark:text-gray-400 p-4">
                    <p>{initialLoadDone.current ? "Bir sohbet seçin veya yeni bir sohbet başlatın." : "Sohbet geçmişi yükleniyor..."}</p>
                </div>
            )}
            <ChatInput 
                onSendMessage={handleSendMessage} 
                speechRecognitionHook={speechRecognitionHook}
                isSending={isAiLoading}
            />
        </main>
      </div>

      <footer className="p-2 text-center text-xs text-gray-200/70 flex-shrink-0">
        Powered by Denizhan Şahin - ElectronJS,ViteJS,GeminiAPI.
      </footer>

      <BackgroundSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onApplyBackground={handleApplyBackground}
        currentBackground={chatBackgroundStyle}
      />
    </div>
  );
};

export default App;
