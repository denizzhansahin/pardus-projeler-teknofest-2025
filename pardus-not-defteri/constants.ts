
import { Category } from './types';

export const AI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

const PREDEFINED_CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string; ring: string }> = {
  General:  { bg: 'bg-slate-700', text: 'text-slate-200', border: 'border-slate-500', ring: 'ring-slate-400' },
  Work:     { bg: 'bg-sky-700', text: 'text-sky-100', border: 'border-sky-500', ring: 'ring-sky-400' },
  Personal: { bg: 'bg-emerald-700', text: 'text-emerald-100', border: 'border-emerald-500', ring: 'ring-emerald-400' },
  Shopping: { bg: 'bg-amber-600', text: 'text-amber-100', border: 'border-amber-400', ring: 'ring-amber-300' },
  Ideas:    { bg: 'bg-fuchsia-700', text: 'text-fuchsia-100', border: 'border-fuchsia-500', ring: 'ring-fuchsia-400' },
  Urgent:   { bg: 'bg-red-700', text: 'text-red-100', border: 'border-red-500', ring: 'ring-red-400' },
};

// More vibrant palette for custom categories, suitable for dark theme
const CUSTOM_CATEGORY_COLOR_PALETTE = [
  { bg: 'bg-pink-600', text: 'text-pink-100', border: 'border-pink-400', ring: 'ring-pink-300' },
  { bg: 'bg-cyan-600', text: 'text-cyan-100', border: 'border-cyan-400', ring: 'ring-cyan-300' },
  { bg: 'bg-lime-600', text: 'text-lime-100', border: 'border-lime-400', ring: 'ring-lime-300' },
  { bg: 'bg-purple-600', text: 'text-purple-100', border: 'border-purple-400', ring: 'ring-purple-300' },
  { bg: 'bg-orange-600', text: 'text-orange-100', border: 'border-orange-400', ring: 'ring-orange-300' },
  { bg: 'bg-teal-600', text: 'text-teal-100', border: 'border-teal-400', ring: 'ring-teal-300' },
];

export const getCategoryStyle = (categoryName: Category): { bg: string; text: string; border: string; ring: string } => {
  if (PREDEFINED_CATEGORY_COLORS[categoryName]) {
    return PREDEFINED_CATEGORY_COLORS[categoryName];
  }
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = categoryName.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; 
  }
  const index = Math.abs(hash) % CUSTOM_CATEGORY_COLOR_PALETTE.length;
  return CUSTOM_CATEGORY_COLOR_PALETTE[index] || PREDEFINED_CATEGORY_COLORS.General;
};


// Note background colors are generally light to contrast with the dark app theme.
// Text colors are for text *inside* the note card.
// SampleBg is for the color picker in the (now dark) modal.
export const NOTE_BACKGROUND_COLORS: { name: string; value: string; textColor: string; sampleBg: string; }[] = [
  { name: 'Varsayılan Açık', value: 'bg-slate-50', textColor: 'text-slate-800', sampleBg: 'bg-slate-50 border border-slate-300' },
  { name: 'Kağıt Beyazı', value: 'bg-white', textColor: 'text-slate-900', sampleBg: 'bg-white border border-slate-400' },
  { name: 'Gül Tozu', value: 'bg-rose-100', textColor: 'text-rose-900', sampleBg: 'bg-rose-100' },
  { name: 'Gök Mavişi', value: 'bg-sky-100', textColor: 'text-sky-900', sampleBg: 'bg-sky-100' },
  { name: 'Nane Yeşili', value: 'bg-teal-100', textColor: 'text-teal-900', sampleBg: 'bg-teal-100' },
  { name: 'Sarı Kehribar', value: 'bg-amber-100', textColor: 'text-amber-900', sampleBg: 'bg-amber-100' },
  { name: 'Lavanta Moru', value: 'bg-violet-100', textColor: 'text-violet-900', sampleBg: 'bg-violet-100' },
  { name: 'Pastel Limon', value: 'bg-lime-100', textColor: 'text-lime-900', sampleBg: 'bg-lime-100' },
  { name: 'Açık Kül', value: 'bg-slate-200', textColor: 'text-slate-800', sampleBg: 'bg-slate-200' },
  { name: 'Fuşya Pembesi', value: 'bg-fuchsia-100', textColor: 'text-fuchsia-900', sampleBg: 'bg-fuchsia-100' },
  { name: 'Şeftali Tonu', value: 'bg-orange-100', textColor: 'text-orange-900', sampleBg: 'bg-orange-100' },
];


export const MAX_NOTES_FOR_AI_CONTEXT = 10; 
export const MAX_NOTE_CONTENT_FOR_AI_CONTEXT = 500;
