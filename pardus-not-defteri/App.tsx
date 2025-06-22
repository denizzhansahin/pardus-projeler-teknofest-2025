import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Note, ModalType, Category, AiHelperSuggestion, VoiceAction, VoiceCommandResponse, CreateNoteAction, ClarifyAction } from './types';
import { useNotes, useCategories } from './hooks/useNotes';
import useSpeechRecognition from './hooks/useSpeechRecognition';
import NoteCard from './components/NoteCard';
import NoteFormModal from './components/NoteFormModal';
import AiHelperModal from './components/AiHelperModal';
import AiChatModal from './components/AiChatModal';
import NotificationModal from './components/NotificationModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import VoiceCommandModal from './components/VoiceCommandModal';
import NoteViewModal from './components/NoteViewModal'; // Import NoteViewModal
import ApiKeySettingsModal from './components/ApiKeySettingsModal';
import { summarizeTextWithAI, processVoiceCommand, getAiAssistance } from './services/geminiService';
import { speakText, stopSpeaking } from './services/speechService';
import LoadingSpinner from './components/LoadingSpinner';
import Modal from './components/Modal';
import { getCategoryStyle, NOTE_BACKGROUND_COLORS } from './constants';


const App: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, setNoteNotification } = useNotes();
  const { categories, addCategory } = useCategories();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<Category | 'All'>('All');

  const [aiHelperContext, setAiHelperContext] = useState<{ text: string; field: 'title' | 'content' }>({ text: '', field: 'content' });
  const [lastAiSuggestion, setLastAiSuggestion] = useState<AiHelperSuggestion | undefined>(undefined);

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [isSpeakingSummary, setIsSpeakingSummary] = useState(false);

  const {
    transcript,
    interimTranscript,
    isListening,
    error: speechError,
    isSupported: speechIsSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();
  const [isProcessingVoiceCommand, setIsProcessingVoiceCommand] = useState(false);
  const [voiceProcessingError, setVoiceProcessingError] = useState<string | null>(null);
  const [processedVoiceActions, setProcessedVoiceActions] = useState<{ action: VoiceAction; status: 'success' | 'error'; message?: string; noteId?: string }[]>([]);

  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  const handleClearLastAiSuggestion = useCallback(() => {
    setLastAiSuggestion(undefined);
  }, []);

  const openModal = (type: ModalType, note?: Note) => {
    setSelectedNote(note || null);
    if (type === 'voiceCommand') {
        resetTranscript();
        setProcessedVoiceActions([]);
        setVoiceProcessingError(null);
    }
    // If opening addNote or editNote, and it's not from AI helper returning, clear any last suggestion
    if ((type === 'addNote' || type === 'editNote') && activeModal !== 'aiHelper') {
        handleClearLastAiSuggestion();
    }
    setActiveModal(type);
    if (type === 'summary' && note) {
        handleSummarizeNote(note);
    }
    // For viewNote, selectedNote is already set.
  };

  const closeModal = () => {
    if (activeModal === 'summary' && isSpeakingSummary) {
        stopSpeaking();
        setIsSpeakingSummary(false);
    }
    if (activeModal === 'voiceCommand' && isListening) {
        stopListening();
    }
    setActiveModal(null);
    // setSelectedNote(null); // Keep selectedNote if we transition from view to edit, etc.
                           // Cleared explicitly when needed, e.g. after delete or when opening new addNote.
  };

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> | Note) => {
    if ('id' in noteData) {
      updateNote(noteData as Note);
    } else {
      addNote(noteData);
    }
    closeModal();
    setSelectedNote(null); // Clear selected note after saving.
    handleClearLastAiSuggestion();
  };

  const handleDeleteNoteConfirmed = () => {
    if(selectedNote) {
        deleteNote(selectedNote.id);
    }
    closeModal();
    setSelectedNote(null);
  };

  const handleOpenAiHelper = (currentText: string, targetField: 'title' | 'content') => {
    setAiHelperContext({ text: currentText, field: targetField });
    setActiveModal('aiHelper');
  };

  const handleApplyAiSuggestionToForm = (suggestion: string) => {
    const { field } = aiHelperContext;

    if (selectedNote) {
        setSelectedNote(prev => prev ? { ...prev, [field]: suggestion } : null);
        handleClearLastAiSuggestion();
        setActiveModal('editNote');
    } else {
        setLastAiSuggestion({ field, text: suggestion });
        setActiveModal('addNote');
    }
  };


  const handleSummarizeNote = async (noteToSummarize: Note) => {
    setSelectedNote(noteToSummarize);
    setActiveModal('summary');
    setSummaryLoading(true);
    setSummaryText(null);
    if (isSpeakingSummary) {
        stopSpeaking();
        setIsSpeakingSummary(false);
    }
    try {
      const summary = await summarizeTextWithAI(noteToSummarize.content);
      setSummaryText(summary);
    } catch (error) {
      console.error("Failed to summarize:", error);
      setSummaryText((error as Error).message || "Özet alınırken bir hata oluştu.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleToggleSpeakSummary = async () => {
    if (!summaryText || summaryText.toLowerCase().includes("hata") || summaryText.toLowerCase().includes("limit")) return;
    if (isSpeakingSummary) {
      stopSpeaking();
      setIsSpeakingSummary(false);
    } else {
      try {
        setIsSpeakingSummary(true);
        await speakText(summaryText);
        setIsSpeakingSummary(false);
      } catch (error) {
        console.error("Error speaking summary:", error);
        setIsSpeakingSummary(false);
        alert("Özet okunurken bir hata oluştu.");
      }
    }
  };

  const filterCategories = useMemo(() => ['All', ...categories], [categories]);

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const searchTermLower = searchTerm.toLowerCase();
      const matchesSearchTerm = note.title.toLowerCase().includes(searchTermLower) ||
                                note.content.toLowerCase().includes(searchTermLower) ||
                                note.category.toLowerCase().includes(searchTermLower);
      const matchesCategory = selectedCategoryFilter === 'All' || note.category === selectedCategoryFilter;
      return matchesSearchTerm && matchesCategory;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notes, searchTerm, selectedCategoryFilter]);

  const handleProcessVoiceTranscript = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessingVoiceCommand(true);
    setVoiceProcessingError(null);
    setProcessedVoiceActions([]); 

    try {
      const result: VoiceCommandResponse | null = await processVoiceCommand(text, notes);
      if (result && result.actions) {
        let currentActionResults: { action: VoiceAction; status: 'success' | 'error'; message?: string; noteId?: string }[] = [];

        for (const action of result.actions) {
          try {
            if (action.type === 'createNote') {
              const createAction = action as CreateNoteAction;
              const defaultBg = NOTE_BACKGROUND_COLORS.find(c => c.value === 'bg-slate-50') || NOTE_BACKGROUND_COLORS[0];
              const newNoteData = {
                title: createAction.title,
                content: createAction.content,
                category: createAction.category || 'General',
                backgroundColor: defaultBg.value,
                textColor: defaultBg.textColor,
              };

              const addedNote = addNote(newNoteData);
              currentActionResults.push({ action, status: 'success', message: `Not "${createAction.title}" oluşturuldu.`, noteId: addedNote.id });
              setProcessedVoiceActions([...currentActionResults]);

              try {
                const initialContent = addedNote.content;
                const improvedContent = await getAiAssistance(initialContent, "metni geliştir", 'content');
                
                const updatedNoteWithImprovedContent: Note = { ...addedNote, content: improvedContent };
                updateNote(updatedNoteWithImprovedContent);
                const enhancementMessage = `Notun içeriği AI tarafından geliştirildi.`;
                currentActionResults.push({ 
                    action: {type: 'clarify', message: enhancementMessage} as ClarifyAction, 
                    status: 'success', 
                    message: enhancementMessage,
                    noteId: addedNote.id 
                });
                
              } catch (enhancementError) {
                console.error("Error enhancing note content:", enhancementError);
                const contentEnhancementErrorMessage = (enhancementError as Error).message || "İçerik geliştirilemedi: Bilinmeyen AI Hatası";
                currentActionResults.push({ 
                    action: {type: 'clarify', message: contentEnhancementErrorMessage} as ClarifyAction, 
                    status: 'error', 
                    message: contentEnhancementErrorMessage,
                    noteId: addedNote.id 
                });
              }
              setProcessedVoiceActions([...currentActionResults]);

            } else if (action.type === 'clarify' || action.type === 'noActionDetected') {
              currentActionResults.push({ action, status: 'success', message: action.message });
            }
          } catch(innerError) {
             console.error("Error processing single voice action:", innerError, action);
             currentActionResults.push({ action, status: 'error', message: `Eylem (${action.type}) işlenirken hata.` });
          }
        }
        setProcessedVoiceActions(currentActionResults);
      } else {
        setVoiceProcessingError("AI'dan beklenen formatta yanıt alınamadı veya eylem bulunamadı.");
        setProcessedVoiceActions([{ action: {type: 'clarify', message: "Yanıt işlenemedi."}, status: 'error', message: "AI'dan beklenen formatta yanıt alınamadı veya eylem bulunamadı." }]);
      }
    } catch (error) {
      console.error("Error processing voice command:", error);
      const errorMessage = error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.";
      setVoiceProcessingError(errorMessage);
      setProcessedVoiceActions([{ action: {type: 'clarify', message: errorMessage}, status: 'error', message: `Sesli komut işlenirken hata: ${errorMessage}` }]);
    } finally {
      setIsProcessingVoiceCommand(false);
      resetTranscript(); 
    }
  };


  useEffect(() => {
    if (!(typeof process !== 'undefined' && process.env && process.env.API_KEY) && !(typeof globalThis !== 'undefined' && (globalThis as any).API_KEY)) {
        const errorMsg = "API Anahtarı yapılandırılmamış. Lütfen 'API_KEY' ortam değişkenini veya globalThis.API_KEY değişkenini ayarlayın. AI özellikleri çalışmayabilir.";
        console.error(errorMsg);
    }
  }, []);


  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="bg-slate-800/70 backdrop-blur-lg shadow-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-10 h-10 text-sky-400" />
            <h1 className="text-3xl font-bold tracking-tight gradient-text bg-gradient-to-r from-sky-400 via-rose-400 to-lime-400">
              AI Not Defteri
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
             {speechIsSupported && (
                 <button
                    onClick={() => openModal('voiceCommand')}
                    title="Sesli Komut"
                    className="p-3 bg-gradient-to-br from-teal-500 via-cyan-600 to-sky-500 hover:from-teal-600 hover:via-cyan-700 hover:to-sky-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                    <MicrophoneIcon className="w-6 h-6" />
                </button>
             )}
            <button
              onClick={() => { setSelectedNote(null); handleClearLastAiSuggestion(); openModal('addNote');}}
              className="px-4 py-3 bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:via-purple-700 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2.5"
            >
              <PlusCircleIcon className="w-6 h-6" />
              <span className="hidden sm:inline">Yeni Not</span>
            </button>
            <button
              onClick={() => openModal('aiChat')}
              className="px-4 py-3 bg-gradient-to-r from-sky-600 via-cyan-600 to-teal-500 hover:from-sky-700 hover:via-cyan-700 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2.5"
            >
              <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6" />
              <span className="hidden sm:inline">AI Sohbet</span>
            </button>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row gap-4 items-center border-t border-slate-700/80">
            <div className="relative w-full sm:flex-grow">
                <input
                    type="text"
                    placeholder="Notlarda ve kategorilerde ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border border-slate-600/70 bg-slate-700/50 text-slate-100 placeholder-slate-400 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-shadow"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value as Category | 'All')}
                className="w-full sm:w-auto px-4 py-3.5 border border-slate-600/70 bg-slate-700/50 text-slate-100 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
                {filterCategories.map(cat => (
                  <option key={cat} value={cat} style={{ backgroundColor: cat === 'All' ? '#334155' /*slate-700*/ : getCategoryStyle(cat).bg.replace('bg-', '#'), color: cat === 'All' ? 'white' : getCategoryStyle(cat).text.replace('text-','').includes('100') || getCategoryStyle(cat).text.includes('200') || getCategoryStyle(cat).text.includes('300') ? getCategoryStyle(cat).text.replace('text-','') : 'white' }}>
                    {cat === 'All' ? 'Tüm Kategoriler' : cat}
                  </option>
                ))}
            </select>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredNotes.length === 0 && !searchTerm && selectedCategoryFilter === 'All' && notes.length === 0 ? (
          <div className="text-center py-20 opacity-60">
            <DocumentPlusIcon className="w-32 h-32 text-slate-500 mx-auto mb-8" />
            <h2 className="text-3xl font-semibold text-slate-300 mb-4">Henüz notunuz yok.</h2>
            <p className="text-slate-400 text-lg">"Yeni Not" butonuyla veya sesli komutla ilk notunuzu oluşturun!</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-20 opacity-60">
            <FaceFrownIcon className="w-32 h-32 text-slate-500 mx-auto mb-8" />
            <h2 className="text-3xl font-semibold text-slate-300 mb-4">Aramanızla eşleşen not bulunamadı.</h2>
            <p className="text-slate-400 text-lg">Farklı bir arama terimi veya kategori deneyin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
            {filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={(n) => { setSelectedNote(n); handleClearLastAiSuggestion(); openModal('editNote', n);}}
                onDelete={(id) => openModal('confirmDelete', notes.find(n => n.id === id))}
                onSetNotification={(n) => openModal('notification', n)}
                onSummarize={(n) => handleSummarizeNote(n)}
                onViewDetails={(n) => openModal('viewNote', n)} // Pass onViewDetails
              />
            ))}
          </div>
        )}
      </main>

      { (activeModal === 'addNote' || activeModal === 'editNote') && (
        <NoteFormModal
          isOpen={true}
          onClose={() => { closeModal(); setSelectedNote(null); handleClearLastAiSuggestion();}}
          onSave={handleSaveNote}
          noteToEdit={selectedNote}
          onOpenAiHelper={handleOpenAiHelper}
          categories={categories}
          onAddCategory={addCategory}
          lastAiSuggestion={lastAiSuggestion}
          onClearLastAiSuggestion={handleClearLastAiSuggestion}
        />
      )}

      {activeModal === 'aiHelper' && (
        <AiHelperModal
          isOpen={true}
          onClose={() => setActiveModal(selectedNote ? 'editNote' : 'addNote')}
          currentText={aiHelperContext.text}
          contextField={aiHelperContext.field}
          onApplySuggestion={handleApplyAiSuggestionToForm}
        />
      )}

      {activeModal === 'aiChat' && (
        <AiChatModal
          isOpen={true}
          onClose={closeModal}
          notes={notes}
        />
      )}

      {activeModal === 'notification' && selectedNote && (
        <NotificationModal
          isOpen={true}
          onClose={closeModal}
          onSetNotification={(noteId, time) => {
            setNoteNotification(noteId, time);
            closeModal();
          }}
          note={selectedNote}
        />
      )}

      {activeModal === 'confirmDelete' && selectedNote && (
        <ConfirmDeleteModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={handleDeleteNoteConfirmed}
          noteTitle={selectedNote.title}
        />
      )}

      {activeModal === 'summary' && selectedNote && (
        <Modal isOpen={true} onClose={closeModal} title={`"${selectedNote.title}" için AI Özeti`} size="lg">
            {summaryLoading && <div className="py-8 flex flex-col items-center"><LoadingSpinner color="text-sky-400" /> <p className="text-center mt-3 text-slate-400">Özet oluşturuluyor...</p></div>}
            {summaryText && !summaryLoading && (
                <div className="space-y-4">
                    <p className={`whitespace-pre-wrap max-h-[60vh] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-600 ${summaryText.toLowerCase().includes("hata") || summaryText.toLowerCase().includes("limit") ? 'text-red-400' : 'text-slate-300'}`}>
                        {summaryText}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                      <p className="text-xs text-slate-500">Bu özet yapay zeka tarafından oluşturulmuştur.</p>
                      <button
                        onClick={handleToggleSpeakSummary}
                        disabled={!summaryText || summaryText.toLowerCase().includes("hata") || summaryText.toLowerCase().includes("limit")}
                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg shadow-md flex items-center space-x-2 transition-colors
                                    ${isSpeakingSummary ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-sky-600 hover:bg-sky-700 text-white disabled:bg-slate-600 disabled:text-slate-400'}`}
                      >
                        {isSpeakingSummary ? <StopCircleIcon className="w-5 h-5"/> : <SpeakerWaveIcon className="w-5 h-5"/>}
                        <span>{isSpeakingSummary ? 'Durdur' : 'Sesli Oku'}</span>
                      </button>
                    </div>
                </div>
            )}
             {!summaryText && !summaryLoading && ( // This case might be covered by summaryText having an error message already
                <p className="text-red-400">Özet yüklenemedi.</p>
             )}
            <div className="flex justify-end mt-6">
                <button onClick={closeModal} className="px-5 py-2.5 text-sm font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg shadow-md">
                    Kapat
                </button>
            </div>
        </Modal>
      )}

      {activeModal === 'voiceCommand' && (
        <VoiceCommandModal
          isOpen={true}
          onClose={closeModal}
          isListening={isListening}
          isProcessing={isProcessingVoiceCommand}
          transcript={transcript}
          interimTranscript={interimTranscript}
          speechError={speechError}
          processingError={voiceProcessingError}
          processedActions={processedVoiceActions}
          onStartListening={startListening}
          onStopListening={stopListening}
          onProcessTranscript={handleProcessVoiceTranscript}
          isSupported={speechIsSupported}
        />
      )}

      {activeModal === 'viewNote' && selectedNote && (
        <NoteViewModal
          isOpen={true}
          onClose={() => { closeModal(); setSelectedNote(null); }}
          note={selectedNote}
          onEdit={(noteToEdit) => {
            // closeModal(); 
            openModal('editNote', noteToEdit);
          }}
          onDelete={(noteIdToDelete) => {
            // closeModal(); 
            openModal('confirmDelete', notes.find(n => n.id === noteIdToDelete));
          }}
          onSetNotification={(noteForNotification) => {
            // closeModal(); 
            openModal('notification', noteForNotification);
          }}
          onSummarize={(noteToSummarize) => {
            // closeModal(); 
            handleSummarizeNote(noteToSummarize); 
          }}
        />
      )}

      <button
        className="fixed bottom-6 right-6 z-50 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-lg shadow-lg font-semibold"
        onClick={() => setApiKeyModalOpen(true)}
      >
        API Anahtarı
      </button>
      <ApiKeySettingsModal isOpen={apiKeyModalOpen} onClose={() => setApiKeyModalOpen(false)} />
    </div>
  );
};

// SVG Icons
const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 7.5l.813 2.846a4.5 4.5 0 012.087 2.087L24 12l-2.846.813a4.5 4.5 0 01-2.087 2.087L18.25 17.25l-.813-2.846a4.5 4.5 0 01-2.087-2.087L12.5 12l2.846-.813a4.5 4.5 0 012.087-2.087L18.25 7.5z" /></svg>
);
const PlusCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const ChatBubbleOvalLeftEllipsisIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-3.86 8.25-8.625 8.25S3.75 16.556 3.75 12c0-4.556 3.86-8.25 8.625-8.25S21 7.444 21 12z" /></svg>
);
const DocumentPlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
);
const FaceFrownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75s.168-.75.375-.75S9.75 9.336 9.75 9.75zm4.5 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75z" /></svg>
);
const MagnifyingGlassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
);
const SpeakerWaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" /></svg>
);
const StopCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" /></svg>
);
const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15c-1.125 0-2.164-.342-3-.938m6 0c-.836.596-1.875.938-3 .938m0-12.75c1.125 0 2.164.342 3 .938m-6 0c.836-.596 1.875-.938 3-.938m0-1.5V6m0 12.75v3.75m0-3.75a3 3 0 01-3-3V9m3 3a3 3 0 003-3V9m0 9.75a3 3 0 01-3 3h0a3 3 0 01-3-3V9.75M12 9.75L12 6" />
  </svg>
);

export default App;
