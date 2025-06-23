import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Note, ModalType, Category, AiHelperSuggestion, VoiceAction, VoiceCommandResponse, CreateNoteAction, ClarifyAction } from './types';
import { useNotes, useCategories } from './hooks/useNotes';
import useAudioRecorder, { AudioData } from './hooks/useAudioRecorder'; // Import useAudioRecorder
import NoteCard from './components/NoteCard';
import NoteFormModal from './components/NoteFormModal';
import AiHelperModal from './components/AiHelperModal';
import AiChatModal from './components/AiChatModal';
import NotificationModal from './components/NotificationModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import VoiceCommandModal from './components/VoiceCommandModal';
import NoteViewModal from './components/NoteViewModal';
import SettingsApiKeyModal from './components/SettingsApiKeyModal';
import { summarizeTextWithAI, processVoiceCommand, getAiAssistance, transcribeAudioWithAI } from './services/geminiService'; // Added transcribeAudioWithAI
import { speakText, stopSpeaking } from './services/speechService';
import LoadingSpinner from './components/LoadingSpinner';
import Modal from './components/Modal';
import { getCategoryStyle, NOTE_BACKGROUND_COLORS } from './constants';
import CogIcon from './components/icons/CogIcon';

// Define the type for items in processedVoiceActions state
type ProcessedVoiceActionDisplayItem = {
  action: VoiceAction;
  status: 'success' | 'error';
  message?: string;
  noteId?: string;
};

// Type for pending new note data from AI
type PendingNewNoteDataType = {
  title?: string;
  content?: string;
};

export const App: React.FC = () => {
  const { notes, addNote, updateNote, deleteNote, setNoteNotification } = useNotes();
  const { categories, addCategory } = useCategories();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<Category | 'All'>('All');

  const [aiHelperContext, setAiHelperContext] = useState<{ text: string; field: 'title' | 'content' }>({ text: '', field: 'content' });
  const [pendingNewNoteData, setPendingNewNoteData] = useState<PendingNewNoteDataType | null>(null);

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [isSpeakingSummary, setIsSpeakingSummary] = useState(false);

  // Voice Command States (New Flow)
  const { 
    isRecording, 
    elapsedTime, 
    audioData, 
    error: recorderError, 
    startRecording, 
    stopRecording,
    resetRecording 
  } = useAudioRecorder(); 
  
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  
  const [isProcessingVoiceCommand, setIsProcessingVoiceCommand] = useState(false);
  const [commandProcessingError, setCommandProcessingError] = useState<string | null>(null);
  const [processedVoiceActions, setProcessedVoiceActions] = useState<ProcessedVoiceActionDisplayItem[]>([]);
  const [isMicrophoneSupported, setIsMicrophoneSupported] = useState(true); 

  const audioDataProcessedRef = useRef(false);


  useEffect(() => {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder)) {
      setIsMicrophoneSupported(false);
    }
  }, []);

  const resetVoiceCommandStates = useCallback(() => {
    resetRecording(); 
    audioDataProcessedRef.current = false; 
    setIsTranscribing(false);
    setTranscribedText(null);
    setTranscriptionError(null);
    setIsProcessingVoiceCommand(false);
    setCommandProcessingError(null);
    setProcessedVoiceActions([]);
  }, [resetRecording]);


  useEffect(() => {
    if (audioData && audioData.base64 && audioData.mimeType && activeModal === 'voiceCommand' && !audioDataProcessedRef.current) {
      audioDataProcessedRef.current = true; 
      handleTranscribeAudio(audioData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioData, activeModal]); 


  const onConsumePendingNewNoteData = useCallback(() => {
    setPendingNewNoteData(null);
  }, []);

  const openModal = (type: ModalType, note?: Note) => {
    setSelectedNote(note || null);
    if (type === 'voiceCommand') {
        resetVoiceCommandStates();
    }
    // If opening 'addNote' or 'editNote' *manually* (not from AI Helper flow)
    // then clear any pending new note data.
    if ((type === 'addNote' || type === 'editNote') && activeModal !== 'aiHelper') {
        setPendingNewNoteData(null); 
    }
    setActiveModal(type);
    if (type === 'summary' && note) {
        handleSummarizeNote(note);
    }
  };

  const closeModal = () => {
    if (activeModal === 'summary' && isSpeakingSummary) {
        stopSpeaking();
        setIsSpeakingSummary(false);
    }
    if (activeModal === 'voiceCommand' && isRecording) {
        stopRecording(); 
    }
    if (activeModal === 'voiceCommand') { 
        resetVoiceCommandStates();
    }
    setActiveModal(null);
  };

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> | Note) => {
    if ('id' in noteData) {
      updateNote(noteData as Note);
    } else {
      addNote(noteData);
    }
    closeModal();
    setSelectedNote(null); 
    setPendingNewNoteData(null); // Clear pending data after save
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
    // If opening AI helper for a new note, ensure any old pending data is cleared
    // before potentially setting new pending data via onApplyAiSuggestionToForm.
    // If selectedNote exists, this doesn't apply to pendingNewNoteData.
    if (!selectedNote) {
        setPendingNewNoteData(null);
    }
    setActiveModal('aiHelper');
  };

  const handleApplyAiSuggestionToForm = (suggestion: string) => {
    const { field } = aiHelperContext;

    if (selectedNote) { // Editing existing note
        setSelectedNote(prev => prev ? { ...prev, [field]: suggestion } : null);
        setPendingNewNoteData(null); // Clear any pending data if user was working on new, then switched
        setActiveModal('editNote');
    } else { // Creating a new note
        setPendingNewNoteData(prev => ({ 
            // Preserve other field if already set, e.g., user got title suggestion, then gets content
            ...(prev || {}), 
            [field]: suggestion 
        }));
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


  const handleStartRecording = async () => {
    resetVoiceCommandStates(); 
    try {
      await startRecording();
    } catch (e) {
      console.error("Failed to start recording from App:", e);
      // Error state is handled by useAudioRecorder hook
    }
  };
  
  const handleTranscribeAudio = async (recordedData: AudioData) => {
    if (isTranscribing) {
      return; 
    }

    setIsTranscribing(true);
    setTranscriptionError(null);
    setTranscribedText(null); 
    setProcessedVoiceActions([]); 

    try {
      const transcript = await transcribeAudioWithAI(recordedData.base64, recordedData.mimeType);
      setTranscribedText(transcript); 

      if (transcript && transcript.trim()) {
        await handleProcessTranscribedText(transcript); 
      } else {
        const errorMsg = "AI boş bir döküm metni döndürdü veya döküm başarısız oldu.";
        setTranscriptionError(errorMsg);
        setIsProcessingVoiceCommand(false); 
        setProcessedVoiceActions([{ 
            action: {type: 'clarify', message: "Ses kaydı anlaşılamadı veya boştu."},
            status: 'error',
            message: errorMsg
        }]);
      }
    } catch (error) {
      console.error("Error transcribing audio:", error);
      const errorMessage = error instanceof Error ? error.message : "Bilinmeyen bir döküm hatası.";
      setTranscriptionError(errorMessage);
      setProcessedVoiceActions([{
          action: {type: 'clarify', message: `Döküm hatası: ${errorMessage}`},
          status: 'error',
          message: `Ses yazıya dökülürken hata: ${errorMessage}`
      }]);
      setIsProcessingVoiceCommand(false);
    } finally {
      setIsTranscribing(false);
    }
  };
  
  const handleProcessTranscribedText = async (text: string) => {
    if (!text.trim()) {
      setCommandProcessingError("İşlenecek bir komut metni yok.");
      setIsProcessingVoiceCommand(false);
      return;
    }
    setIsProcessingVoiceCommand(true);
    setCommandProcessingError(null);
    setProcessedVoiceActions([]); 

    try {
      const result: VoiceCommandResponse | null = await processVoiceCommand(text, notes);
      if (result && result.actions && result.actions.length > 0) {
        const actionToProcess = result.actions[0]; 

        if (actionToProcess.type === 'createNote') {
          const createAction = actionToProcess as CreateNoteAction;
          const defaultBg = NOTE_BACKGROUND_COLORS.find(c => c.value === 'bg-slate-50') || NOTE_BACKGROUND_COLORS[0];
          const newNoteData = {
            title: createAction.title,
            content: createAction.content,
            category: createAction.category || 'General',
            backgroundColor: defaultBg.value,
            textColor: defaultBg.textColor,
          };

          const addedNote = addNote(newNoteData);
          let message = `Not "${createAction.title}" oluşturuldu.`;
          let finalStatus: 'success' | 'error' = 'success';
          
          try {
            const initialContent = addedNote.content;
            const improvedContent = await getAiAssistance(initialContent, "metni geliştir ve hataları düzelt", 'content');
            
            if (improvedContent.trim() && improvedContent.trim() !== initialContent.trim()) {
                const updatedNoteWithImprovedContent: Note = { ...addedNote, content: improvedContent };
                updateNote(updatedNoteWithImprovedContent);
                message += ` İçeriği AI tarafından ayrıca geliştirildi.`;
            }
          } catch (enhancementError) {
            console.error("Error enhancing note content:", enhancementError);
            const contentEnhancementErrorMessage = (enhancementError as Error).message || "İçerik geliştirilemedi: Bilinmeyen AI Hatası";
            message += ` İçerik geliştirme başarısız oldu: ${contentEnhancementErrorMessage}.`;
          }
          
          const finalActionItem: ProcessedVoiceActionDisplayItem = { 
            action: actionToProcess, 
            status: finalStatus, 
            message: message, 
            noteId: addedNote.id 
          };
          setProcessedVoiceActions([finalActionItem]);

        } else if (actionToProcess.type === 'clarify' || actionToProcess.type === 'noActionDetected') {
          const clarifyResultAction: ProcessedVoiceActionDisplayItem = { 
            action: actionToProcess, 
            status: 'success', 
            message: actionToProcess.message 
          };
          setProcessedVoiceActions([clarifyResultAction]);
        } else {
            const unknownActionItem: ProcessedVoiceActionDisplayItem = { 
              action: actionToProcess, 
              status: 'error', 
              message: `Bilinmeyen eylem türü (${actionToProcess.type}) işlenemedi.` 
            };
            setProcessedVoiceActions([unknownActionItem]);
        }
      } else {
        const noActionResultMessage = "AI'dan beklenen formatta yanıt alınamadı veya eylem bulunamadı.";
        setCommandProcessingError(noActionResultMessage);
        setProcessedVoiceActions([{ 
            action: {type: 'clarify', message: "Yanıt işlenemedi."}, 
            status: 'error', 
            message: noActionResultMessage
        }]);
      }
    } catch (error) {
      console.error("Error processing voice command:", error);
      const errorMessage = error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.";
      setCommandProcessingError(errorMessage);
      setProcessedVoiceActions([{
          action: {type: 'clarify', message: errorMessage},
          status: 'error',
          message: `Sesli komut işlenirken hata: ${errorMessage}`
      }]);
    } finally {
      setIsProcessingVoiceCommand(false);
    }
  };


  useEffect(() => {
    if (!(typeof process !== 'undefined' && process.env && process.env.API_KEY) && !(typeof globalThis !== 'undefined' && (globalThis as any).API_KEY)) {
        const errorMsg = "API Anahtarı yapılandırılmamış. Lütfen 'API_KEY' ortam değişkenini veya globalThis.API_KEY değişkenini ayarlayın. AI özellikleri çalışmayabilir.";
        console.error(errorMsg);
    }
  }, []);


  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem('GOOGLE_API_KEY');
    setHasApiKey(!!key);
  }, []);

  return (
    <div className="min-h-screen text-slate-100 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      <header className="bg-slate-800/70 backdrop-blur-lg shadow-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="w-10 h-10 text-sky-400" />
            <h1 className="text-3xl font-bold tracking-tight gradient-text bg-gradient-to-r from-sky-400 via-rose-400 to-lime-400">
              Pardus AI Not Defteri
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center shadow-md border border-slate-600"
              title="Ayarlar"
            >
              <CogIcon className="w-7 h-7" />
            </button>
             {isMicrophoneSupported && ( 
                 <button
                    onClick={() => openModal('voiceCommand')}
                    title="Sesli Komut"
                    className="p-3 bg-gradient-to-br from-teal-500 via-cyan-600 to-sky-500 hover:from-teal-600 hover:via-cyan-700 hover:to-sky-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                    <MicrophoneIcon className="w-6 h-6" />
                </button>
             )}
            <button
              onClick={() => { setSelectedNote(null); openModal('addNote');}}
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
                  <option key={cat} value={cat} style={{ backgroundColor: cat === 'All' ? '#334155' : getCategoryStyle(cat).bg.replace('bg-', '#'), color: cat === 'All' ? 'white' : getCategoryStyle(cat).text.replace('text-','').includes('100') || getCategoryStyle(cat).text.includes('200') || getCategoryStyle(cat).text.includes('300') ? getCategoryStyle(cat).text.replace('text-','') : 'white' }}>
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
                onEdit={(n) => { setSelectedNote(n); openModal('editNote', n);}}
                onDelete={(id) => openModal('confirmDelete', notes.find(n => n.id === id))}
                onSetNotification={(n) => openModal('notification', n)}
                onSummarize={(n) => handleSummarizeNote(n)}
                onViewDetails={(n) => openModal('viewNote', n)}
              />
            ))}
          </div>
        )}
      </main>

      { (activeModal === 'addNote' || activeModal === 'editNote') && (
        <NoteFormModal
          isOpen={true}
          onClose={() => { closeModal(); setSelectedNote(null); }}
          onSave={handleSaveNote}
          noteToEdit={selectedNote}
          onOpenAiHelper={handleOpenAiHelper}
          categories={categories}
          onAddCategory={addCategory}
          pendingNewNoteData={pendingNewNoteData}
          onConsumePendingNewNoteData={onConsumePendingNewNoteData}
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
             {!summaryText && !summaryLoading && ( 
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
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          isProcessingCommand={isProcessingVoiceCommand}
          elapsedTime={elapsedTime}
          transcribedText={transcribedText}
          recorderError={recorderError}
          transcriptionError={transcriptionError}
          commandProcessingError={commandProcessingError}
          processedCommandActions={processedVoiceActions}
          onStartRecording={handleStartRecording}
          onStopRecording={stopRecording}
          isMicrophoneSupported={isMicrophoneSupported}
        />
      )}

      {activeModal === 'viewNote' && selectedNote && (
        <NoteViewModal
          isOpen={true}
          onClose={() => { closeModal(); setSelectedNote(null); }}
          note={selectedNote}
          onEdit={(noteToEdit) => {
            openModal('editNote', noteToEdit);
          }}
          onDelete={(noteIdToDelete) => {
            openModal('confirmDelete', notes.find(n => n.id === noteIdToDelete));
          }}
          onSetNotification={(noteForNotification) => {
            openModal('notification', noteForNotification);
          }}
          onSummarize={(noteToSummarize) => {
            handleSummarizeNote(noteToSummarize); 
          }}
        />
      )}

      {isSettingsModalOpen && (
        <SettingsApiKeyModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      )}
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

// Remove default export if it exists
// export default App; 
// The 'export const App' above handles the named export.
