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
  | 'voiceCommand' // Added for voice input
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
  category?: Category; // Optional category, AI might suggest or use default
}

export interface SetReminderAction {
  type: 'setReminder';
  noteIdentifier: string; // e.g., 'last', or title of the note if user specifies
  time: string; // Time phrase from user, e.g., "tomorrow 3pm", "next Monday"
}

export interface ClarifyAction {
  type: 'clarify';
  message: string; // Message from AI asking for clarification
}

export interface NoActionDetectedAction {
    type: 'noActionDetected';
    message: string; // Message from AI
}

export type VoiceAction = CreateNoteAction | SetReminderAction | ClarifyAction | NoActionDetectedAction;

export interface VoiceCommandResponse {
  actions: VoiceAction[];
}