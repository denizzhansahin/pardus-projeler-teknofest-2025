export interface Note {
  id: string;
  title: string;
  content: string; // Rich text content (HTML string)
  notebookId: string;
  createdAt: number;
  updatedAt: number;
  image?: string; // Base64 encoded image or URL
  reminder?: number; // Timestamp for reminder
}

export interface Notebook {
  id: string;
  name: string;
  createdAt: number;
}

export interface AIContentRequest {
  type: 'summarize' | 'suggest' | 'plan';
  noteContent: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export enum AIServiceProviders {
  GEMINI = 'gemini',
}

export enum Language {
  EN = 'en',
  TR = 'tr',
}
