
import { Category } from './types';

export const AI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

const PREDEFINED_CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  General:  { bg: 'bg-slate-200', text: 'text-slate-800', border: 'border-slate-400', ring: 'ring-slate-500' },
  Work:     { bg: 'bg-blue-200', text: 'text-blue-800', border: 'border-blue-400', ring: 'ring-blue-500' },
  Personal: { bg: 'bg-green-200', text: 'text-green-800', border: 'border-green-400', ring: 'ring-green-500' },
  Shopping: { bg: 'bg-yellow-200', text: 'text-yellow-800', border: 'border-yellow-400', ring: 'ring-yellow-500' },
  Ideas:    { bg: 'bg-purple-200', text: 'text-purple-800', border: 'border-purple-400', ring: 'ring-purple-500' },
  Urgent:   { bg: 'bg-red-200', text: 'text-red-800', border: 'border-red-400', ring: 'ring-red-500' },
};

// More vibrant palette for custom categories
const CUSTOM_CATEGORY_COLOR_PALETTE = [
  { bg: 'bg-pink-200', text: 'text-pink-800', border: 'border-pink-400', ring: 'ring-pink-500' },
  { bg: 'bg-cyan-200', text: 'text-cyan-800', border: 'border-cyan-400', ring: 'ring-cyan-500' },
  { bg: 'bg-lime-200', text: 'text-lime-800', border: 'border-lime-400', ring: 'ring-lime-500' },
  { bg: 'bg-fuchsia-200', text: 'text-fuchsia-800', border: 'border-fuchsia-400', ring: 'ring-fuchsia-500' },
  { bg: 'bg-orange-200', text: 'text-orange-800', border: 'border-orange-400', ring: 'ring-orange-500' },
  { bg: 'bg-emerald-200', text: 'text-emerald-800', border: 'border-emerald-400', ring: 'ring-emerald-500' },
];

export const getCategoryStyle = (categoryName: Category): { bg: string; text: string; border: string; ring: string } => {
  if (PREDEFINED_CATEGORY_COLORS[categoryName]) {
    return PREDEFINED_CATEGORY_COLORS[categoryName];
  }
  // Simple hashing for custom categories to pick a color from palette
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % CUSTOM_CATEGORY_COLOR_PALETTE.length;
  return CUSTOM_CATEGORY_COLOR_PALETTE[index] || PREDEFINED_CATEGORY_COLORS.General;
};


export const NOTE_BACKGROUND_COLORS: { name: string; value: string; textColor: string; sampleBg: string; }[] = [
  { name: 'Varsayılan Beyaz', value: 'bg-white', textColor: 'text-slate-800', sampleBg: 'bg-white border border-slate-300' },
  { name: 'Gül Pembesi', value: 'bg-rose-50', textColor: 'text-rose-800', sampleBg: 'bg-rose-50' },
  { name: 'Gök Mavisi', value: 'bg-sky-50', textColor: 'text-sky-800', sampleBg: 'bg-sky-50' },
  { name: 'Çam Yeşili', value: 'bg-teal-50', textColor: 'text-teal-800', sampleBg: 'bg-teal-50' },
  { name: 'Kehribar', value: 'bg-amber-50', textColor: 'text-amber-800', sampleBg: 'bg-amber-50' },
  { name: 'Menekşe', value: 'bg-violet-50', textColor: 'text-violet-800', sampleBg: 'bg-violet-50' },
  { name: 'Pastel Yeşil', value: 'bg-lime-50', textColor: 'text-lime-800', sampleBg: 'bg-lime-50' },
  { name: 'Açık Gri', value: 'bg-slate-100', textColor: 'text-slate-800', sampleBg: 'bg-slate-100' },
  { name: 'Lavanta', value: 'bg-fuchsia-50', textColor: 'text-fuchsia-800', sampleBg: 'bg-fuchsia-50' },
  { name: 'Şeftali', value: 'bg-orange-50', textColor: 'text-orange-800', sampleBg: 'bg-orange-50' },
];


export const MAX_NOTES_FOR_AI_CONTEXT = 10; 
export const MAX_NOTE_CONTENT_FOR_AI_CONTEXT = 500; // Increased for better context
