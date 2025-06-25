
import React from 'react'; // Added for React.FC and React.SVGProps

export interface SiteLink {
  name: string;
  url: string;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>; 
  bgColor?: string; 
  textColor?: string;
  description?: string; // Added for Pardus Support FAB and potentially other links
}

export interface AISiteLink extends SiteLink { // For AI Tools widget
  description?: string;
}

export interface NewsArticle {
  title: string;
  summary: string;
  url?: string;
  source?: string;
  imageUrl?: string; 
}

// WeatherInfo might be fully obsolete if no direct weather display needed.
export interface WeatherInfo { 
  city: string;
  temperature: string;
  condition: string;
  details?: string;
}

export interface MusicTrack {
  title: string;
  artist: string;
  genre?: string;
  albumArtUrl?: string; 
  youtubeVideoId?: string;
  youtubeSearchQuery?: string;
}

export interface VideoRecommendation {
  title: string;
  description?: string;
  channelName?: string;
  thumbnailUrl?: string; 
  youtubeVideoId?: string;
  youtubeSearchQuery?: string;
}

export interface StockData {
  symbol: string;
  price: string;
  change: string;
  changePercent?: string;
}

export interface CurrencyRate {
  pair: string; // e.g., "USD/EUR"
  rate: string;
  lastUpdated?: string;
}

export interface GameSuggestion {
  name: string;
  description: string;
  url: string;
  imageUrl?: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}
export interface Candidate {
  groundingMetadata?: GroundingMetadata;
  // other candidate fields
}


export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full'; 
}

export interface WidgetCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onCardClick?: () => void; 
  titleClassName?: string;
}

export interface WidgetSectionProps {
  openModal: (title: string, content: React.ReactNode, isLoading?: boolean, size?: ModalProps['size']) => void;
  defaultCity?: string; 
  apiKeyAvailable: boolean; // To inform widgets if AI features can run
}

export enum NewsCategory {
  AcilDurum = "Son Dakika Acil Durum", 
  Spor = "Spor",
  Siyaset = "Siyaset",
  Magazin = "Magazin",
  Kultur = "Kültür",
  Saglik = "Sağlık",
}

export interface AppSettings {
  defaultCity: string;
  appBackgroundColor: string; 
  appBackgroundImage: string; 
  backgroundStyle: ChatBackgroundStyle; 
}

export interface ChatBackgroundStyle {
  type: 'default' | 'color' | 'imageURL' | 'imageData';
  value: string; 
}

// Types for Daily Insights
export interface DailyEvent {
  year: string;
  event: string;
}

export interface DailyQuote {
  quote: string;
  author: string;
}

export interface DailyRecipe {
  name: string;
  ingredients: string[];
  instructions: string;
  prepTime?: string;
}

// Types for new AI features
export interface TranslationResult {
  translatedText: string;
  detectedSourceLang?: string;
}

export interface PardusAppSuggestion {
  appName: string;
  description: string;
  installCommand?: string;
  // url?: string; // Optional: Link to app's page or Flatpak/Snap store
}

export interface PardusShortcutSuggestion {
  action: string;
  shortcut: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}
