
import { ReactNode } from 'react';

export interface HistoryItem {
  id: string;
  prompt: string;
  translatedPrompt?: string;
  imageUrl: string;
  createdAt: string;
}

export interface Module {
  name:string;
  prompt: string;
  icon: ReactNode;
}

export interface ModuleCategory {
  name: string;
  modules: Module[];
}