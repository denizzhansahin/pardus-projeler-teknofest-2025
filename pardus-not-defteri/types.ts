export const DEFAULT_CATEGORIES = ['General', 'Work', 'Personal', 'Shopping', 'Ideas', 'Urgent'] as const;
export type DefaultCategory = typeof DEFAULT_CATEGORIES[number];
export type Category = string; // Allow custom categories

export interface Note {
  id: string;
  title: string;
  content: string;
  category: Category;
  imageBase64?: string;
  linkUrl?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  notification?: {
    id: string; // Unique ID for the timeout
    time: string; // ISO string for notification time
    triggered: boolean;
  };
  backgroundColor?: string; // e.g., 'bg-rose-100'
  textColor?: string; // e.g., 'text-rose-800' for contrast with backgroundColor
}

export type ModalType =
  | 'addNote'
  | 'editNote'
  | 'aiHelper'
  | 'aiChat'
  | 'notification'
  | 'confirmDelete'
  | 'summary'
  | 'voiceCommand'
  | 'viewNote' // Added for viewing note details
  | null;

export interface AiChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface AiHelperSuggestion {
  field: 'title' | 'content';
  text: string;
}

// Types for Voice Commands
export interface CreateNoteAction {
  type: 'createNote';
  title: string;
  content: string;
  category?: Category;
}

export interface SetReminderAction {
  type: 'setReminder';
  noteIdentifier: string;
  time: string;
}

export interface ClarifyAction {
  type: 'clarify';
  message: string;
}

export interface NoActionDetectedAction {
    type: 'noActionDetected';
    message: string;
}

export type VoiceAction = CreateNoteAction | SetReminderAction | ClarifyAction | NoActionDetectedAction;

export interface VoiceCommandResponse {
  actions: VoiceAction[];
}

// Interface for the ultra-simplified JSON structure AI is expected to return for note creation
export interface SimplifiedNoteDataFromAI {
    title?: string;
    content?: string;
    category?: string;
}