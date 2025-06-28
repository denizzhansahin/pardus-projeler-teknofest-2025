export enum Model {
  GEMINI_FLASH = 'gemini-2.5-flash-preview-04-17',
  // GEMINI_PRO = 'gemini-1.5-pro-latest' // Example of another model
}

// Represents a node in the displayed file system tree, derived from the local file system.
export interface FileSystemNode {
  name: string;
  kind: 'file' | 'directory';
  handle: FileSystemHandle;
  children?: FileSystemNode[];
}

export enum MessageType {
  USER = 'user',
  AI = 'ai',
  SYSTEM = 'system',
  ERROR = 'error'
}

export interface Message {
  id: string;
  type: MessageType;
  text: string;
  aiResponse?: AIResponse;
  isConfirmed?: boolean | null; // null: awaiting, true: confirmed, false: cancelled
}

export interface AICommand {
  // 'bash' for simple commands like mkdir, ls, cat, rm.
  // 'file_operation' for writing content to files.
  type: 'bash' | 'file_operation';
  command?: string; // For bash commands (e.g., "mkdir new_folder")
  filename?: string; // For file_operation
  content?: string; // For file_operation
  operation?: 'create' | 'update' | 'delete'; // for file_op
}

export interface AIResponse {
  thought: string;
  commands: AICommand[];
  explanation: string;
}