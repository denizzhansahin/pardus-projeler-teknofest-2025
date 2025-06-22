
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Note, ModalType, Category, AiHelperSuggestion, VoiceAction, VoiceCommandResponse, CreateNoteAction, SetReminderAction } from './types';
import { useNotes, useCategories } from './hooks/useNotes';
import useSpeechRecognition from './hooks/useSpeechRecognition';
import NoteCard from './components/NoteCard';
import NoteFormModal from './components/NoteFormModal';
import AiHelperModal from './components/AiHelperModal';
import AiChatModal from './components/AiChatModal';
import NotificationModal from './components/NotificationModal';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import VoiceCommandModal from './components/VoiceCommandModal'; // Added
import { summarizeTextWithAI, processVoiceCommand } from './services/geminiService'; // Added processVoiceCommand
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

  // Voice Command States
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


  const openModal = (type: ModalType, note?: Note) => {
    setSelectedNote(note || null);
    if (type === 'voiceCommand') {
        resetTranscript();
        setProcessedVoiceActions([]);
        setVoiceProcessingError(null);
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
    if (activeModal === 'voiceCommand' && isListening) {
        stopListening();
    }
    setActiveModal(null);
    // setSelectedNote(null); // Keep selectedNote for forms, clear it on successful save/delete.
  };

  const handleSaveNote = (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> | Note) => {
    if ('id' in noteData) { 
      updateNote(noteData as Note);
    } else { 
      addNote(noteData);
    }
    closeModal(); 
    setSelectedNote(null);
    setLastAiSuggestion(undefined); // Clear suggestion after saving
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

    // We are coming FROM AiHelperModal
    if (selectedNote) { // AI helper was opened while editing an existing note
        setSelectedNote(prev => prev ? { ...prev, [field]: suggestion } : null);
        setLastAiSuggestion(undefined); 
        setActiveModal('editNote'); 
    } else { // AI helper was opened while creating a new note
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
      setSummaryText("Özet alınırken bir hata oluştu.");
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleToggleSpeakSummary = async () => {
    if (!summaryText) return;
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

  // Handle Voice Command Processing
  const handleProcessVoiceTranscript = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessingVoiceCommand(true);
    setVoiceProcessingError(null);
    setProcessedVoiceActions([]);

    try {
      const result: VoiceCommandResponse | null = await processVoiceCommand(text, notes);
      if (result && result.actions) {
        const actionResults: { action: VoiceAction; status: 'success' | 'error'; message?: string; noteId?: string }[] = [];
        let lastCreatedNoteIdForVoice: string | null = null;

        for (const action of result.actions) {
          try {
            if (action.type === 'createNote') {
              const createAction = action as CreateNoteAction;
              const newNoteData = {
                title: createAction.title,
                content: createAction.content,
                category: createAction.category || 'General',
                backgroundColor: NOTE_BACKGROUND_COLORS[0].value, 
                textColor: NOTE_BACKGROUND_COLORS[0].textColor,
              };
              
              const addedNote = addNote(newNoteData); // addNote now returns the created note
              lastCreatedNoteIdForVoice = addedNote.id; 

              actionResults.push({ action, status: 'success', message: `Not "${createAction.title}" oluşturuldu.`, noteId: addedNote.id });
            } else if (action.type === 'setReminder') {
              const reminderAction = action as SetReminderAction;
              let targetNote: Note | undefined;
              const currentNotesSnapshot = notes; // Use a snapshot of notes for this iteration

              if ((reminderAction.noteIdentifier.toLowerCase() === 'last' || reminderAction.noteIdentifier.toLowerCase() === 'lastcreated') && lastCreatedNoteIdForVoice) {
                targetNote = currentNotesSnapshot.find(n => n.id === lastCreatedNoteIdForVoice);
              } else if (reminderAction.noteIdentifier.toLowerCase() === 'last' || reminderAction.noteIdentifier.toLowerCase() === 'lastcreated') {
                targetNote = [...currentNotesSnapshot].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
              } else {
                targetNote = currentNotesSnapshot.find(n => n.title.toLowerCase() === reminderAction.noteIdentifier.toLowerCase());
              }

              if (targetNote) {
                let reminderTime: Date | null = null;
                const timeStr = reminderAction.time.toLowerCase();
                const now = new Date();

                if (timeStr.includes("yarın")) {
                    reminderTime = new Date(now);
                    reminderTime.setDate(now.getDate() + 1);
                } else if (timeStr.includes("bugün") || !timeStr.includes("yarın") && !timeStr.includes("gün sonra")) {
                    reminderTime = new Date(now);
                } else if (timeStr.includes("gün sonra")) {
                    const daysMatch = timeStr.match(/(\d+)\s*gün sonra/);
                    if (daysMatch && daysMatch[1]) {
                        reminderTime = new Date(now);
                        reminderTime.setDate(now.getDate() + parseInt(daysMatch[1], 10));
                    }
                }
                
                if(reminderTime) {
                    const timeMatch = timeStr.match(/(\d{1,2})[:.]?(\d{2})?/); 
                    if (timeMatch && timeMatch[1]) {
                        reminderTime.setHours(parseInt(timeMatch[1], 10));
                        reminderTime.setMinutes(timeMatch[2] ? parseInt(timeMatch[2], 10) : 0);
                        reminderTime.setSeconds(0);

                         if (reminderTime.getTime() <= Date.now()) {
                           actionResults.push({ action, status: 'error', message: `"${reminderAction.time}" geçmiş bir zaman.` });
                        } else {
                            setNoteNotification(targetNote.id, reminderTime.toISOString());
                            actionResults.push({ action, status: 'success', message: `"${targetNote.title}" için hatırlatıcı ayarlandı.` });
                        }
                    } else { // No specific time like HH:MM, try to set a default time like 9 AM if day is set
                        if (timeStr.includes("yarın") || timeStr.includes("gün sonra") || timeStr.includes("bugün")) {
                             reminderTime.setHours(9); // Default to 9 AM if only day is specified
                             reminderTime.setMinutes(0);
                             reminderTime.setSeconds(0);
                             if (reminderTime.getTime() <= Date.now() && timeStr.includes("bugün")) { // If today 9am is past, set for tomorrow 9am
                                 reminderTime.setDate(now.getDate() + 1);
                             }
                             if (reminderTime.getTime() <= Date.now()) { // If still past (e.g. 'yarın' but time parsing failed to set future)
                                actionResults.push({ action, status: 'error', message: `"${reminderAction.time}" için geçerli bir gelecek zamanı ayarlanamadı.` });
                             } else {
                                setNoteNotification(targetNote.id, reminderTime.toISOString());
                                actionResults.push({ action, status: 'success', message: `"${targetNote.title}" için hatırlatıcı (varsayılan saatle) ayarlandı.` });
                             }
                        } else {
                            actionResults.push({ action, status: 'error', message: `"${reminderAction.time}" zamanı anlaşılamadı.` });
                        }
                    }
                } else {
                    actionResults.push({ action, status: 'error', message: `"${reminderAction.time}" zaman ifadesi anlaşılamadı.` });
                }
              } else {
                actionResults.push({ action, status: 'error', message: `Hatırlatıcı için "${reminderAction.noteIdentifier}" notu bulunamadı.` });
              }
            } else if (action.type === 'clarify' || action.type === 'noActionDetected') {
              actionResults.push({ action, status: 'success', message: action.message });
            }
          } catch(innerError) {
             console.error("Error processing single voice action:", innerError, action);
             actionResults.push({ action, status: 'error', message: `Eylem (${action.type}) işlenirken hata.` });
          }
        }
        setProcessedVoiceActions(actionResults);
      } else {
        setVoiceProcessingError("AI'dan beklenen formatta yanıt alınamadı.");
      }
    } catch (error) {
      console.error("Error processing voice command:", error);
      setVoiceProcessingError(error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.");
    } finally {
      setIsProcessingVoiceCommand(false);
      resetTranscript(); // Clear transcript after processing attempt
    }
  };


  useEffect(() => {
    // API Key Check
    if (!(typeof process !== 'undefined' && process.env && process.env.API_KEY) && !(typeof globalThis !== 'undefined' && (globalThis as any).API_KEY)) {
      alert("API Anahtarı yapılandırılmamış. Lütfen 'API_KEY' ortam değişkenini veya globalThis.API_KEY değişkenini ayarlayın. AI özellikleri çalışmayabilir.");
    }
  }, []);


  return (
    <div className="min-h-screen text-slate-800 bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200">
      <header className="bg-white/80 backdrop-blur-lg shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center space-x-3 mb-4 sm:mb-0">
            <SparklesIcon className="w-10 h-10 text-indigo-600" />
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-transparent bg-clip-text">
              AI Not Defteri
            </h1>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
             {speechIsSupported && (
                 <button
                    onClick={() => openModal('voiceCommand')}
                    title="Sesli Komut"
                    className="p-2.5 sm:p-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center text-sm sm:text-base"
                >
                    <MicrophoneIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
             )}
            <button
              onClick={() => { setSelectedNote(null); setLastAiSuggestion(undefined); openModal('addNote');}}
              className="px-3 py-2.5 sm:px-4 sm:py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 text-sm sm:text-base"
            >
              <PlusCircleIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Yeni Not</span>
            </button>
            <button
              onClick={() => openModal('aiChat')}
              className="px-3 py-2.5 sm:px-4 sm:py-2.5 bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 text-sm sm:text-base"
            >
              <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
              <span className="hidden sm:inline">AI Sohbet</span>
            </button>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row gap-4 items-center border-t border-slate-200/80">
            <div className="relative w-full sm:flex-grow">
                <input 
                    type="text"
                    placeholder="Notlarda ve kategorilerde ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-10 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow bg-white/70 placeholder-slate-400"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value as Category | 'All')}
                className="w-full sm:w-auto px-4 py-3 border border-slate-300 bg-white/70 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                {filterCategories.map(cat => (
                  <option key={cat} value={cat} style={{ backgroundColor: cat === 'All' ? '' : getCategoryStyle(cat).bg, color: cat === 'All' ? '' : getCategoryStyle(cat).text}}>
                    {cat === 'All' ? 'Tüm Kategoriler' : cat}
                  </option>
                ))}
            </select>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredNotes.length === 0 && !searchTerm && selectedCategoryFilter === 'All' && notes.length === 0 ? (
          <div className="text-center py-16 opacity-70">
            <DocumentPlusIcon className="w-28 h-28 text-slate-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-slate-700 mb-3">Henüz notunuz yok.</h2>
            <p className="text-slate-500">"Yeni Not" butonuyla veya sesli komutla ilk notunuzu oluşturun!</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-16 opacity-70">
            <FaceFrownIcon className="w-28 h-28 text-slate-400 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-slate-700 mb-3">Aramanızla eşleşen not bulunamadı.</h2>
            <p className="text-slate-500">Farklı bir arama terimi veya kategori deneyin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
            {filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={(n) => { setSelectedNote(n); setLastAiSuggestion(undefined); openModal('editNote', n);}}
                onDelete={(id) => openModal('confirmDelete', notes.find(n => n.id === id))}
                onSetNotification={(n) => openModal('notification', n)}
                onSummarize={(n) => handleSummarizeNote(n)}
              />
            ))}
          </div>
        )}
      </main>

      { (activeModal === 'addNote' || activeModal === 'editNote') && (
        <NoteFormModal
          isOpen={true}
          onClose={() => { closeModal(); setSelectedNote(null); setLastAiSuggestion(undefined);}}
          onSave={handleSaveNote}
          noteToEdit={selectedNote}
          onOpenAiHelper={handleOpenAiHelper}
          categories={categories}
          onAddCategory={addCategory}
          lastAiSuggestion={lastAiSuggestion}
          onClearLastAiSuggestion={() => setLastAiSuggestion(undefined)}
        />
      )}
      
      {activeModal === 'aiHelper' && (
        <AiHelperModal
          isOpen={true}
          onClose={() => setActiveModal(selectedNote ? 'editNote' : 'addNote')} // Go back to the form
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
            {summaryLoading && <div className="py-8"><LoadingSpinner /> <p className="text-center mt-2 text-slate-500">Özet oluşturuluyor...</p></div>}
            {summaryText && !summaryLoading && (
                <div className="space-y-4">
                    <p className="text-slate-700 whitespace-pre-wrap max-h-[60vh] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-slate-300">{summaryText}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-500">Bu özet yapay zeka tarafından oluşturulmuştur.</p>
                      <button
                        onClick={handleToggleSpeakSummary}
                        disabled={!summaryText}
                        className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm flex items-center space-x-2 transition-colors
                                    ${isSpeakingSummary ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white disabled:bg-slate-300'}`}
                      >
                        {isSpeakingSummary ? <StopCircleIcon className="w-5 h-5"/> : <SpeakerWaveIcon className="w-5 h-5"/>}
                        <span>{isSpeakingSummary ? 'Durdur' : 'Sesli Oku'}</span>
                      </button>
                    </div>
                </div>
            )}
             {!summaryText && !summaryLoading && ( 
                <p className="text-red-500">Özet yüklenemedi.</p>
             )}
            <div className="flex justify-end mt-6">
                <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md shadow-sm">
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