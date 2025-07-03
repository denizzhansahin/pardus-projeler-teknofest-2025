import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { MediaItem, Memory, Album, DailyHighlight, ChatMessage } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MediaGrid from './components/MediaGrid';
import MediaDetailModal from './components/MediaDetailModal';
import MemoriesView from './components/MemoriesView';
import AlbumsView from './components/AlbumsView';
import DailyHighlightComponent from './components/DailyHighlight';
import ChatView from './components/ChatView';
import { useMediaLibrary } from './hooks/useMediaLibrary';
import { getKeywordsForImageSearch, getDailyHighlight, chatWithAI } from './services/geminiService';
import Spinner from './components/Spinner';
import { Settings } from 'lucide-react';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
    const [theme, setTheme] = useState('dark');
    const { 
        mediaItems, 
        memories, 
        albums,
        isLoading, 
        updateMediaItem, 
        addMediaItems, 
        addMemory,
        addAlbum,
        deleteAlbum,
        toggleMediaInAlbum
    } = useMediaLibrary();

    const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
    const [activeView, setActiveView] = useState('library');
    const [isVisualSearching, setIsVisualSearching] = useState(false);
    const [headerText, setHeaderText] = useState('Kütüphane');
    const [dailyHighlight, setDailyHighlight] = useState<DailyHighlight | null>(null);
    const [highlightFetched, setHighlightFetched] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // This state holds the items currently being displayed, which could be all items, search results, an album, or a memory.
    const [viewOverrideItems, setViewOverrideItems] = useState<MediaItem[] | null>(null);


    // Chat state
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    // Initialize chat with a welcome message
    useEffect(() => {
        if(chatHistory.length === 0) {
            setChatHistory([{
                id: 'init',
                role: 'ai',
                text: "Merhaba! Ben Piksella. Fotoğraflarını bulmana yardımcı olabilirim. Örneğin, 'geçen yazki tatil fotoğraflarımı göster' diyebilirsin."
            }]);
        }
    }, [chatHistory.length]);


    // Günlük özeti yalnızca bir kez, yeterli veri olduğunda al
    useEffect(() => {
        const fetchHighlight = async () => {
            if (!highlightFetched && mediaItems.filter(i => i.analyzed).length > 2) {
                setHighlightFetched(true); // Tekrar denemeyi önle
                try {
                    const highlight = await getDailyHighlight(mediaItems);
                    if (highlight) setDailyHighlight(highlight);
                } catch (e) { console.error("Günlük özet alınamadı:", e); }
            }
        };
        fetchHighlight();
    }, [mediaItems, highlightFetched]);
    
    // Tema yönetimi
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        try {
            localStorage.setItem('pardusPiksellaTheme', theme);
        } catch(e) {
            console.error("Tema yerel depolamaya kaydedilemedi.");
        }
    }, [theme]);
    
    useEffect(() => {
      try {
        const savedTheme = localStorage.getItem('pardusPiksellaTheme');
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
            setTheme(savedTheme);
        }
      } catch(e) {
        console.error("Tema yerel depolamadan yüklenemedi.");
      }
    }, []);

    const handleItemClick = useCallback((item: MediaItem) => {
        setSelectedItem(item);
    }, []);

    const handleCloseModal = useCallback(() => {
        setSelectedItem(null);
    }, []);

    const handleUpdateItem = useCallback((updatedItem: MediaItem) => {
        updateMediaItem(updatedItem);
        setSelectedItem(prev => prev ? updatedItem : null);
    }, [updateMediaItem]);
    
    const handleSearch = useCallback((query: string) => {
        setSearchTerm(query);
        setActiveView('library');
        setHeaderText(query ? `Arama Sonuçları: "${query}"` : 'Kütüphane');
        setViewOverrideItems(null); // Clear any album/memory view
        setDailyHighlight(null); // Arama yaparken özeti gizle
    },[]);

    const handleVisualSearch = useCallback(async (file: File) => {
        setIsVisualSearching(true);
        setActiveView('library');
        try {
            const keywords = await getKeywordsForImageSearch(file);
            handleSearch(keywords);
        } catch (error) {
            console.error("Görsel arama başarısız:", error);
            alert("Görsel arama sırasında bir hata oluştu.");
        } finally {
            setIsVisualSearching(false);
        }
    }, [handleSearch]);

    const handleViewMemory = useCallback((memory: Memory) => {
        const memoryItems = mediaItems.filter(item => memory.imageIds.includes(item.id));
        setViewOverrideItems(memoryItems);
        setHeaderText(`Anı: ${memory.title}`);
        setActiveView('library');
        setDailyHighlight(null);
    }, [mediaItems]);

    const handleViewAlbum = useCallback((album: Album) => {
        const albumItems = mediaItems.filter(item => album.mediaIds.includes(item.id));
        setViewOverrideItems(albumItems);
        setHeaderText(`Albüm: ${album.title}`);
        setActiveView('library');
        setDailyHighlight(null);
    }, [mediaItems]);
    
    const handleSetActiveView = useCallback((view: string) => {
        if (view === 'library') {
            setSearchTerm(''); // Arama/filtrelemeyi temizle
            setHeaderText('Kütüphane');
            setViewOverrideItems(null);
            // Kütüphaneye dönüldüğünde özetin tekrar alınabilmesi için durumu sıfırla
            setHighlightFetched(false); 
        } else {
            setDailyHighlight(null); // Diğer görünümlerde özeti gizle
        }
        setActiveView(view);
    }, []);


    const handleSendMessage = useCallback(async (messageText: string) => {
        const userMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            role: 'user',
            text: messageText,
        };
        const newHistory = [...chatHistory, userMessage];
        setChatHistory(newHistory);
        setIsAiThinking(true);

        try {
            const result = await chatWithAI(messageText, newHistory, mediaItems);
            const foundItems = result.foundMediaIds
                .map(id => mediaItems.find(item => item.id === id))
                .filter((item): item is MediaItem => !!item);

            const aiMessage: ChatMessage = {
                id: `msg-${Date.now()}-ai`,
                role: 'ai',
                text: result.responseText,
                mediaItems: foundItems,
            };
            setChatHistory(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Sohbet hatası:", error);
            const errorMessage: ChatMessage = {
                id: `msg-${Date.now()}-error`,
                role: 'ai',
                text: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin."
            };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsAiThinking(false);
        }

    }, [chatHistory, mediaItems]);

    const currentMediaItems = useMemo(() => {
        if (viewOverrideItems) {
            return viewOverrideItems;
        }

        if (!searchTerm) {
            return mediaItems;
        }

        const lowerCaseQuery = searchTerm.toLowerCase();
        return mediaItems.filter(item => {
            const titleMatch = item.title.toLowerCase().includes(lowerCaseQuery);
            const tagMatch = item.tags?.some(tag => tag.toLowerCase().includes(lowerCaseQuery));
            const descriptionMatch = item.description?.toLowerCase().includes(lowerCaseQuery);
            return titleMatch || tagMatch || descriptionMatch;
        });
    }, [mediaItems, searchTerm, viewOverrideItems]);
    
    const emptyStateMessage = useMemo(() => {
        if (headerText.startsWith('Albüm:') && currentMediaItems.length === 0) {
            return (
                <div>
                    <p className="text-lg">Bu albümde henüz fotoğraf yok.</p>
                    <p className="mt-2 text-sm">Fotoğraf eklemek için,
                        <button onClick={() => handleSetActiveView('library')} className="font-bold text-pardus-accent hover:underline mx-1">
                            Kütüphane'ye
                        </button>
                        gidin, bir fotoğrafa tıklayın ve albüme ekleyin.
                    </p>
                </div>
            );
        }
        if (headerText.startsWith('Arama') && currentMediaItems.length === 0) {
            return "Arama kriterlerinize uygun bir sonuç bulunamadı.";
        }
        if (mediaItems.length === 0 && activeView === 'library') {
            return "Kütüphaneniz boş. Başlamak için 'Yükle' butonuna tıklayarak ilk görsellerinizi ekleyin!";
        }
        return "Burada gösterilecek bir şey yok.";
    }, [headerText, currentMediaItems.length, mediaItems.length, handleSetActiveView, activeView]);

    const renderMainContent = () => {
        if (isLoading || isVisualSearching) {
            return (
                <div className="flex-grow flex flex-col justify-center items-center text-pardus-text-dark">
                    <Spinner />
                    <p className="mt-4">{isVisualSearching ? 'Benzer görseller aranıyor...' : 'Kütüphane Yükleniyor...'}</p>
                </div>
            )
        }

        switch(activeView) {
            case 'memories':
                return <MemoriesView 
                            mediaItems={mediaItems} 
                            memories={memories} 
                            onAddMemory={addMemory}
                            onViewMemory={handleViewMemory} 
                        />;
            case 'albums':
                 return <AlbumsView 
                            albums={albums}
                            mediaItems={mediaItems}
                            onViewAlbum={handleViewAlbum}
                            onAddAlbum={addAlbum}
                            onDeleteAlbum={deleteAlbum}
                        />;
            case 'chat':
                return <ChatView 
                            history={chatHistory}
                            isThinking={isAiThinking}
                            onSendMessage={handleSendMessage}
                            onItemClick={handleItemClick}
                        />;
            case 'library':
            default:
                return (
                    <>
                        {dailyHighlight && !headerText.startsWith('Arama') && !viewOverrideItems && <DailyHighlightComponent highlight={dailyHighlight} allItems={mediaItems} onItemClick={handleItemClick}/>}
                        <MediaGrid items={currentMediaItems} onItemClick={handleItemClick} headerText={headerText} emptyStateMessage={emptyStateMessage}/>
                    </>
                );
        }
    };

    return (
        <div className={`flex h-screen bg-white dark:bg-pardus-dark font-sans transition-colors duration-300`}>
            <Sidebar activeView={activeView} setActiveView={handleSetActiveView} />
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex justify-end items-center p-2">
                    <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-pardus-light-dark" aria-label="Ayarlar">
                        <Settings className="w-6 h-6 text-pardus-text-dark" />
                    </button>
                </div>
                <Header 
                    theme={theme} 
                    setTheme={setTheme} 
                    onSearch={handleSearch}
                    onUpload={addMediaItems}
                    onVisualSearch={handleVisualSearch}
                />
                <div className="flex-1 overflow-y-auto">
                    {renderMainContent()}
                </div>
            </main>
            {selectedItem && (
                <MediaDetailModal
                    item={selectedItem}
                    onClose={handleCloseModal}
                    onUpdate={handleUpdateItem}
                    albums={albums}
                    onToggleMediaInAlbum={toggleMediaInAlbum}
                />
            )}
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
};

export default App;
