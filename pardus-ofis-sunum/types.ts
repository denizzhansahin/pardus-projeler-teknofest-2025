
export interface Presentation {
  id: string;
  name: string;
  slides: Slide[];
  lastModified: number;
}

export interface SlideOutline {
  page: number;
  title: string;
  summary: string;
}

export interface SlideDetails {
  backgroundColor: string;
}

export interface Slide {
  id: string;
  outline: SlideOutline;
  details: SlideDetails | null;
  userElements: PresentationElement[];
  chatHistory: ChatMessage[];
  isGenerating: boolean;
  hasBeenGenerated: boolean; // To track for auto-generation queue
  backgroundImage?: string;
}

export interface BaseElement {
  id: string;
  type: 'text' | 'image';
  position: { top: number; left: number };
  size: { width: number; height: number };
  zIndex: number;
  rotation: number; // degrees
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize: number;
  color: string;
  fontFamily: string;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  italic: boolean;
  underline: boolean;
  letterSpacing: number; // em
  lineHeight: number; // em
  textShadow: {
    offsetX: number;
    offsetY: number;
    blur: number;
    color: string;
  } | null;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  opacity: number; // 0-1
  borderRadius: number; // px
  borderWidth: number; // px
  borderColor: string;
  boxShadow: {
    offsetX: number;
    offsetY: number;
    blur: number;
    spread: number;
    color: string;
  } | null;
}

export type PresentationElement = TextElement | ImageElement;

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}