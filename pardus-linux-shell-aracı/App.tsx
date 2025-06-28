import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Model, Message, MessageType, AIResponse, AICommand } from './types';
import { useLocalFS } from './hooks/useVFS';
import { generateResponse } from './services/geminiService';
import FileSystemTree from './components/FileSystemTree';
import Terminal from './components/Terminal';
import SettingsModal from './components/SettingsModal';
import SettingsIcon from './components/icons/SettingsIcon';
import FolderIcon from './components/icons/FolderIcon';
import ApiKeyModal from './components/ApiKeyModal';

const App: React.FC = () => {
  const [model, setModel] = useState<Model>(Model.GEMINI_FLASH);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isApiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  const { 
    rootNode, 
    currentPath, 
    selectRootDirectory, 
    executeCommand, 
    getPathString,
    getTreeString,
    isReady
  } = useLocalFS();

  const [messages, setMessages] = useState<Message[]>([]);
  
  const terminalBodyRef = useRef<HTMLDivElement>(null);
  
  // Effect to add initial welcome message only when the FS is ready
  useEffect(() => {
    if (isReady && messages.length === 0) {
      setMessages([
        {
          id: 'init',
          type: MessageType.SYSTEM,
          text: "Hoş geldiniz! Yerel dosyalarınız üzerinde çalışmaya hazırım. Lütfen ne yapmak istediğinizi açıklayın."
        }
      ]);
    }
  }, [isReady, messages.length]);


  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [messages]);

  const isAwaitingConfirmation = messages.some(m => m.type === MessageType.AI && m.isConfirmed === null);

  const handleSendMessage = useCallback(async (inputText: string) => {
    if (!inputText.trim() || isLoading || isAwaitingConfirmation || !isReady) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: MessageType.USER,
      text: inputText,
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const fileSystemState = getTreeString();
      const aiResponse = await generateResponse(model, inputText, messages, fileSystemState, getPathString());

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: MessageType.AI,
        text: aiResponse.explanation,
        aiResponse: aiResponse,
        isConfirmed: null, // Awaiting user confirmation
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("Yapay zeka yanıtı işlenirken hata oluştu:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: MessageType.ERROR,
        text: `Üzgünüm, bir hatayla karşılaştım. Ayrıntılar için lütfen konsolu kontrol edin. Hata: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}.`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isAwaitingConfirmation, model, messages, isReady, getTreeString, getPathString]);

  const handleConfirmation = useCallback(async (messageId: string, confirmed: boolean) => {
    const messageToConfirm = messages.find(m => m.id === messageId);
    if (!messageToConfirm || !messageToConfirm.aiResponse) return;

    let systemMessages: Message[] = [];
    if (confirmed) {
        systemMessages.push({
            id: `sys-exec-${Date.now()}`,
            type: MessageType.SYSTEM,
            text: "Komutlar çalıştırılıyor..."
        });
        setMessages(prev => [...prev.map(m => m.id === messageId ? { ...m, isConfirmed: confirmed } : m), ...systemMessages]);

        let allSucceeded = true;
        // Sadece komut içeren AI yanıtlarında döngüye gir
        if (messageToConfirm.aiResponse && 'commands' in messageToConfirm.aiResponse && Array.isArray(messageToConfirm.aiResponse.commands)) {
          for (const cmd of messageToConfirm.aiResponse.commands) {
            const result = await executeCommand(cmd);
            const resultMessage: Message = {
                 id: `sys-res-${Date.now()}-${Math.random()}`,
                 type: result.success ? MessageType.SYSTEM : MessageType.ERROR,
                 text: result.output || (result.success ? "Komut çalıştırıldı." : "Komut başarısız oldu.")
            };
            systemMessages.push(resultMessage);
            if (!result.success) {
                allSucceeded = false;
            }
          }
        }
        
        const finalText = allSucceeded ? 'Tüm komutlar başarıyla çalıştırıldı.' : 'Bazı komutlar başarısız oldu. Lütfen çıktıyı inceleyin.';
        systemMessages.push({
            id: `sys-final-${Date.now()}`,
            type: allSucceeded ? MessageType.SYSTEM : MessageType.ERROR,
            text: finalText
        });

    } else {
        systemMessages.push({
            id: `sys-cancel-${Date.now()}`,
            type: MessageType.SYSTEM,
            text: 'İşlem kullanıcı tarafından iptal edildi.'
        });
    }
    
    // We update the original message and then add all the new system messages.
    // The initial "Executing..." message is replaced by the detailed results.
    setMessages(prev => [
        ...prev.map(m => m.id === messageId ? { ...m, isConfirmed: confirmed } : m).filter(m => m.id !== `sys-exec-${Date.now()}`),
        ...systemMessages.slice(1) // remove the "Executing..." message
    ]);

  }, [messages, executeCommand]);

  useEffect(() => {
    const storedKey = localStorage.getItem('API_KEY');
    if (!storedKey) {
      setApiKeyModalOpen(true);
    } else {
      setApiKey(storedKey);
    }
  }, []);

  const handleApiKeySave = (key: string) => {
    setApiKey(key);
  };

  if (!isReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900 text-gray-100">
        <div className="text-center p-8 border-2 border-dashed border-gray-600 rounded-lg">
          <h1 className="text-3xl font-bold text-cyan-400 mb-4">Yapay Zeka Yerel Shell Aracına Hoş Geldiniz</h1>
          <p className="text-gray-300 mb-6">Başlamak için lütfen yapay zekanın çalışacağı bir dizin seçin.</p>
          <button
            onClick={selectRootDirectory}
            className="px-6 py-3 bg-cyan-600 text-white font-bold rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
          >
            <span className="flex items-center space-x-2">
              <FolderIcon isOpen={false} />
              <span>Çalışma Dizinini Seç</span>
            </span>
          </button>
          <p className="text-xs text-yellow-400 mt-8 max-w-md mx-auto">
            <span className="font-bold">Güvenlik Notu:</span> Uygulama yalnızca seçtiğiniz dizine erişebilir. <br/>
            <span className="font-bold">Dikkat:</span> Eğer Masaüstü, Belgeler veya sistemdeki başka bir klasörü açmak istiyorsanız, dosya seçici penceresinde ilgili dizine gidip o klasörü manuel olarak seçmelisiniz. <br/>
            <span className="font-bold">Not:</span> Bazı sistem dizinleri (ör. /, /etc, /usr) güvenlik nedeniyle erişilemez. En geniş erişim için ev dizininizi veya Masaüstü klasörünüzü seçin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        onSave={handleApiKeySave}
      />
      <div className="flex h-screen font-sans bg-gray-900 text-gray-100">
        <div className="w-1/3 max-w-md bg-gray-900 border-r border-gray-700 p-4 flex flex-col">
          <h2 className="text-lg font-bold mb-4 text-cyan-400">Dosya Sistemi</h2>
          <div className="flex-grow overflow-y-auto pr-2">
            {rootNode && <FileSystemTree node={rootNode} />}
          </div>
          <div className="mt-4 p-2 bg-gray-800 rounded-md text-sm">
            <p className="text-gray-400">Geçerli Yol:</p>
            <p className="text-green-400 font-mono break-words">{getPathString()}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col h-screen">
          <header className="flex justify-between items-center p-4 bg-gray-800 border-b border-gray-700">
            <h1 className="text-xl font-bold text-white">
              Yapay Zeka Yerel Shell Aracı
            </h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm px-2 py-1 bg-cyan-900/50 text-cyan-300 rounded-md">{model}</span>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                aria-label="Ayarlar"
              >
                <SettingsIcon />
              </button>
            </div>
          </header>

          <Terminal
            messages={messages}
            isLoading={isLoading}
            isAwaitingConfirmation={isAwaitingConfirmation}
            onSendMessage={handleSendMessage}
            onConfirm={handleConfirmation}
            terminalBodyRef={terminalBodyRef}
          />
          
          <footer className="p-2 text-center text-xs text-gray-500 bg-gray-800 border-t border-gray-700">
            <p>
              <span className="font-bold text-red-500">UYARI:</span> Komutlar, yerel makinenizde seçilen dizin içinde ÇALIŞTIRILIR. Onaylamadan önce önerilen eylemleri daima gözden geçirin.
            </p>
          </footer>
        </div>

        {isSettingsOpen && (
          <SettingsModal
            currentModel={model}
            onModelChange={setModel}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default App;