export interface MediaItem {
  id: number; // Will use Date.now() for uniqueness for new items
  type: 'image' | 'video';
  url: string; // Can be a remote URL or a blob URL
  title: string;
  description?: string;
  tags?: string[];
  analyzed: boolean;
}

export interface Memory {
    id: string;
    title: string;
    imageIds: number[];
}

export interface Album {
    id:string;
    title: string;
    description: string;
    mediaIds: number[];
}

export interface DailyHighlight {
  summary: string;
  imageIds: number[];
}

export interface MoreInfoResult {
    title: string;
    content: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  mediaItems?: MediaItem[];
}