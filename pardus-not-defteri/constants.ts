import { Notebook, Note } from './types';

export const APP_NAME = "IntelliNote";
export const DEFAULT_NOTEBOOK_NAME = "My Notebook";

export const initialNotebooks: Notebook[] = [
  { id: 'notebook-1', name: 'General Notes', createdAt: Date.now() },
  { id: 'notebook-2', name: 'Work Projects', createdAt: Date.now() },
];

export const initialNotes: Note[] = [
  { 
    id: 'note-1', 
    title: 'Welcome to IntelliNote!', 
    content: '<p>This is your first note. Feel free to edit or delete it.</p><p>You can use the <strong>AI Assistant</strong> for help!</p>', 
    notebookId: 'notebook-1', 
    createdAt: Date.now(), 
    updatedAt: Date.now() 
  },
  { 
    id: 'note-2', 
    title: 'Shopping List', 
    content: '<p>Milk - $2.50</p><p>Eggs - $3.00</p><p>Bread - $2.00</p>', 
    notebookId: 'notebook-1', 
    createdAt: Date.now() - 86400000 * 7, // 1 week ago 
    updatedAt: Date.now() - 86400000 * 7 
  },
];

export const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";
export const GEMINI_IMAGE_MODEL = "imagen-3.0-generate-002"; // Example, not used in this version

export const ALARM_SOUND_URL = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"+Array(1e3).join("12112132"); // Simple beep
