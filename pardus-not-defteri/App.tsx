import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './i18n';
import Header from './components/Header';
import NotebookManager from './components/NotebookManager';
import NoteCard from './components/NoteCard';
import NoteEditor from './components/NoteEditor';
import AIChatModal from './components/AIChatModal';
import ReminderModal from './components/ReminderModal';
import { useNoteStore, NoteState } from './store/noteStore';
import { Note, Notebook } from './types';
import { AnimatePresence, motion } from 'framer-motion';
import { checkAndTriggerAlarms, requestNotificationPermission } from './services/notificationAndAlarmService';
import { Menu, X, PlusCircle, Search, Inbox, AlertTriangle, Folder } from 'lucide-react'; // Added Folder
import Modal from './components/Modal'; // Added Modal import

const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <HashRouter>
        <MainApp />
      </HashRouter>
    </I18nextProvider>
  );
};

const MainApp: React.FC = () => {
  const { t } = useTranslation();
  // Zustand selector fonksiyonunu toplu obje olarak DEĞİL, her state/action için ayrı ayrı kullan!
  const notes = useNoteStore(state => state.notes);
  const notebooks = useNoteStore(state => state.notebooks);
  const activeNotebookId = useNoteStore(state => state.activeNotebookId);
  const searchTerm = useNoteStore(state => state.searchTerm);
  const setActiveNotebookId = useNoteStore(state => state.setActiveNotebookId);
  const setSearchTerm = useNoteStore(state => state.setSearchTerm);
  const updateNote = useNoteStore(state => state.updateNote);
  const _hasHydrated = useNoteStore(state => state._hasHydrated);
  // setHasHydrated was only used in the removed useEffect, so it can be omitted from destructuring
  // but keeping it for minimal change as per instructions if it wasn't the direct cause of error.
  // For this fix, setHasHydrated from the store selector is no longer directly used in this component.
  // const setHasHydrated = useNoteStore(state => state.setHasHydrated); // No longer needed by App.tsx directly

  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [noteForReminder, setNoteForReminder] = useState<Note | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // The _hasHydrated state from useNoteStore above will reflect the hydration status.
  // The onRehydrateStorage callback in noteStore.ts already updates this flag in the store.
  // No additional useEffect is needed here to sync or react to _hasHydrated for the loading screen.


  useEffect(() => {
    requestNotificationPermission();
    // Explicitly define the type of the callback function for setInterval
    const timerCallback: () => void = () => {
      checkAndTriggerAlarms(notes, t); 
    };
    const intervalId = setInterval(timerCallback, 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, [notes, t]);

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsNoteEditorOpen(true);
  };

  const handleCreateNewNote = () => {
    if (!activeNotebookId && notebooks.length > 0) {
      setActiveNotebookId(notebooks[0].id); // Default to first notebook if none active
    } else if (notebooks.length === 0) {
      alert(t('noNotebooksPrompt')); // Use a translation key
      return;
    }
    setEditingNote(null);
    setIsNoteEditorOpen(true);
  };

  const handleNoteSave = (savedNote: Note) => {
    setIsNoteEditorOpen(false);
    setEditingNote(null);
    // Optional: setActiveNotebookId(savedNote.notebookId);
  };

  const handleSetReminder = (note: Note) => {
    setNoteForReminder(note);
    setIsReminderModalOpen(true);
  };

  const saveReminder = (noteId: string, reminderTimestamp?: number) => {
    const noteToUpdate = notes.find(n => n.id === noteId);
    if (noteToUpdate) {
      updateNote({ ...noteToUpdate, reminder: reminderTimestamp });
    }
    setIsReminderModalOpen(false);
  };

  const filteredNotes = notes
    .filter(note => activeNotebookId ? note.notebookId === activeNotebookId : true)
    .filter(note => note.title.toLowerCase().includes(searchTerm.toLowerCase()) || note.content.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a,b) => b.updatedAt - a.updatedAt);
  
  const currentNotebook = notebooks.find(nb => nb.id === activeNotebookId);

  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-primary-light to-secondary-light">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-xl font-semibold text-white">{t('loadingAppName')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen font-sans">
      <Header onToggleAIChat={() => setIsAIChatOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for Notebooks */}
        <div className={`md:w-72 flex-shrink-0 border-r border-neutral-200 bg-neutral-50 fixed md:static inset-y-0 left-0 z-30 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out`}>
            <NotebookManager isMobileMenuOpen={isMobileMenuOpen} onNotebookSelect={() => setIsMobileMenuOpen(false)} />
        </div>

        {/* Main content area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-neutral-100">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center">
                <button 
                    className="md:hidden p-2 mr-2 text-neutral-600 hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <h2 className="text-2xl md:text-3xl font-bold text-neutral-800">
                    {currentNotebook ? currentNotebook.name : t('allNotes')}
                </h2>
             </div>
            <button
              onClick={handleCreateNewNote}
              className="bg-secondary hover:bg-secondary-dark text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 flex items-center text-sm"
            >
              <PlusCircle size={20} className="mr-2" />
              {t('createNote')}
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder={t('searchNotes') + '...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow"
            />
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          </div>

          {notebooks.length === 0 && (
            <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md">
                <Inbox size={48} className="mx-auto text-primary-light mb-4" />
                <h3 className="text-xl font-semibold text-neutral-700 mb-2">{t('noNotebooksYet')}</h3> 
                <p className="text-neutral-500 mb-6">{t('createFirstNotebookToGetStarted')}</p>
                 <button
                    onClick={() => { 
                        const managerElement = document.querySelector('.md\\:w-72'); // A bit fragile selector for NotebookManager
                        if (managerElement) {
                            const createButton = managerElement.querySelector('button[title="' + t('createNotebook') + '"]');
                             if (createButton instanceof HTMLElement) {
                                createButton.click();
                             }
                        }
                        if (!isMobileMenuOpen && window.innerWidth < 768) setIsMobileMenuOpen(true);
                    }}
                    className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-md shadow flex items-center mx-auto"
                >
                    <PlusCircle size={18} className="mr-2" />
                    {t('createNotebook')}
                </button>
            </div>
          )}

          {notebooks.length > 0 && !activeNotebookId && (
             <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md">
                <Folder size={48} className="mx-auto text-primary-light mb-4" />
                <h3 className="text-xl font-semibold text-neutral-700 mb-2">{t('selectNotebookPrompt')}</h3>
                <p className="text-neutral-500">{t('orCreateNewOne')}</p>
            </div>
          )}

          {activeNotebookId && filteredNotes.length === 0 && (
            <div className="text-center py-10 px-6 bg-white rounded-lg shadow-md">
              <Inbox size={48} className="mx-auto text-primary-light mb-4" />
              <h3 className="text-xl font-semibold text-neutral-700 mb-2">{t('noNotesInNotebook')}</h3>
              <p className="text-neutral-500 mb-6">{searchTerm ? t('noNotesFoundForSearch', {searchTerm: searchTerm}) : t('createFirstNoteInNotebook')}</p>
               <button
                  onClick={handleCreateNewNote}
                  className="bg-secondary hover:bg-secondary-dark text-white font-semibold py-2 px-4 rounded-md shadow flex items-center mx-auto"
                >
                  <PlusCircle size={18} className="mr-2" />
                  {t('createNote')}
                </button>
            </div>
          )}
          
          <AnimatePresence>
            <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                initial="initial"
                animate="animate"
            >
              {filteredNotes.map((note) => (
                <NoteCard key={note.id} note={note} onEdit={handleEditNote} onSetReminder={handleSetReminder} />
              ))}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <Modal isOpen={isNoteEditorOpen} onClose={() => setIsNoteEditorOpen(false)} title={editingNote ? t('editNote') : t('newNote')} size="xl">
        <NoteEditor
          noteToEdit={editingNote}
          notebookId={activeNotebookId || (notebooks.length > 0 ? notebooks[0].id : '')}
          onSave={handleNoteSave}
          onCancel={() => setIsNoteEditorOpen(false)}
        />
      </Modal>

      <AIChatModal isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} notes={notes} />
      
      <ReminderModal 
        isOpen={isReminderModalOpen} 
        onClose={() => setIsReminderModalOpen(false)} 
        note={noteForReminder}
        onSetReminder={saveReminder}
      />
    </div>
  );
};

export default App;
