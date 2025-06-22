import {create} from 'zustand';
import { persist, PersistStorage } from 'zustand/middleware';
import { Note, Notebook } from '../types';
import { localForageAdapter } from '../services/localForageService';
import { initialNotes, initialNotebooks } from '../constants';

// Define the shape of the state that gets persisted.
// This is what partialize will return and what onRehydrateStorage will receive.
interface PersistedNoteState {
  notes: Note[];
  notebooks: Notebook[];
  activeNotebookId: string | null;
}

export interface NoteState extends PersistedNoteState {
  searchTerm: string;
  
  // Notebook actions
  addNotebook: (name: string) => void;
  deleteNotebook: (notebookId: string) => void;
  setActiveNotebookId: (notebookId: string | null) => void;
  updateNotebook: (notebookId: string, name: string) => void;

  // Note actions
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (note: Note) => void;
  deleteNote: (noteId: string) => void;
  getNoteById: (noteId: string) => Note | undefined;
  getNotesByNotebookId: (notebookId: string) => Note[];
  
  // Search
  setSearchTerm: (term: string) => void;

  // Hydration check
  _hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: initialNotes,
      notebooks: initialNotebooks,
      activeNotebookId: initialNotebooks.length > 0 ? initialNotebooks[0].id : null,
      searchTerm: '',
      _hasHydrated: false,

      setHasHydrated: (hydrated) => {
        set({ _hasHydrated: hydrated });
      },

      addNotebook: (name) =>
        set((state) => {
          const newNotebook: Notebook = {
            id: `notebook-${Date.now()}`,
            name,
            createdAt: Date.now(),
          };
          return { notebooks: [...state.notebooks, newNotebook] };
        }),
      deleteNotebook: (notebookId) =>
        set((state) => ({
          notebooks: state.notebooks.filter((nb) => nb.id !== notebookId),
          notes: state.notes.filter((note) => note.notebookId !== notebookId),
          activeNotebookId: state.activeNotebookId === notebookId ? (state.notebooks.length > 1 ? state.notebooks.filter(nb => nb.id !== notebookId)[0].id : null) : state.activeNotebookId,
        })),
      setActiveNotebookId: (notebookId) => set({ activeNotebookId: notebookId, searchTerm: '' }), // Reset search on notebook change
      updateNotebook: (notebookId, name) => set(state => ({
        notebooks: state.notebooks.map(nb => nb.id === notebookId ? {...nb, name} : nb)
      })),

      addNote: (noteData) => {
        const newNote: Note = {
          ...noteData,
          id: `note-${Date.now()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({ notes: [...state.notes, newNote] }));
        return newNote;
      },
      updateNote: (updatedNote) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === updatedNote.id ? { ...updatedNote, updatedAt: Date.now() } : note
          ),
        })),
      deleteNote: (noteId) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== noteId),
        })),
      getNoteById: (noteId) => get().notes.find(note => note.id === noteId),
      getNotesByNotebookId: (notebookId) => get().notes.filter(note => note.notebookId === notebookId),
      
      setSearchTerm: (term) => set({ searchTerm: term }),
    }),
    {
      name: 'intellinote-storage',
      storage: localForageAdapter as PersistStorage<PersistedNoteState>, // Cast because localForageAdapter is generic and matches partialize
      onRehydrateStorage: () => (persistedState, error) => { // persistedState is the rehydrated part
        if (error) {
          console.error("Failed to rehydrate state from storage:", error);
        } else {
          // It's crucial to call methods on the store instance, not on the persistedState object.
          useNoteStore.getState().setHasHydrated(true);
        }
      },
      partialize: (state): PersistedNoteState => ({ // Explicitly type the return of partialize
        notes: state.notes,
        notebooks: state.notebooks,
        activeNotebookId: state.activeNotebookId,
      }),
    }
  )
);

// Initialize activeNotebookId after hydration if it's null and notebooks exist
// This subscription runs after the store is created and whenever its state changes.
useNoteStore.subscribe(
  (newState, oldState) => { 
    // Check if hydration status changed to true and activeNotebookId needs setting
    if (newState._hasHydrated && !oldState._hasHydrated && newState.activeNotebookId === null && newState.notebooks.length > 0) {
      useNoteStore.setState({ activeNotebookId: newState.notebooks[0].id });
    }
  }
);