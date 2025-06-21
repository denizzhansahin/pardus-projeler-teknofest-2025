
export enum Sender {
  User = 'user',
  AI = 'ai',
  System = 'system',
}

export enum MediaType {
  Image = 'image',
  Video = 'video',
  Audio = 'audio', 
}

export interface MediaAttachment {
  type: MediaType;
  url: string; 
  name: string;
  file?: File | Blob; 
  base64Data?: string; 
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: Sender;
  timestamp: Date;
  media?: MediaAttachment;
  isLoading?: boolean; 
  error?: string; 
  groundingSources?: GroundingSource[];
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface SpeechRecognitionHook {
  isListening: boolean;
  error: string | null;
  hasPermission: boolean | null;
  countdown: number | null;
  finalRecordingDuration: number | null;
  recordedAudio: Blob | null; 
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetRecorder: () => void; 
  requestPermission: () => Promise<boolean>; // Corrected return type
}

export interface SpeechSynthesisHook {
  isSpeaking: boolean;
  isAvailable: boolean;
  speak: (text: string) => void;
  cancel: () => void;
}

export interface ChatBackgroundStyle {
  type: 'default' | 'color' | 'imageURL' | 'imageData';
  value: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastUpdatedAt: Date;
}