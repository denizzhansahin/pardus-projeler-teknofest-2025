
import { SiteLink, NewsCategory, ChatBackgroundStyle, AISiteLink } from './types';
import { GlobeAltIcon } from './components/icons/GlobeAltIcon';
import { VideoCameraIcon } from './components/icons/VideoCameraIcon';
import { NewspaperIcon } from './components/icons/NewspaperIcon';
import { ChatBubbleLeftRightIcon } from './components/icons/ChatBubbleLeftRightIcon';
import { TvIcon } from './components/icons/TvIcon';
import { BoltIcon } from './components/icons/BoltIcon';
import { WrenchScrewdriverIcon } from './components/icons/WrenchScrewdriverIcon'; // Example for AI tools
import { CalendarDaysIcon } from './components/icons/CalendarDaysIcon';
import { ChatBubbleLeftEllipsisIcon } from './components/icons/ChatBubbleLeftEllipsisIcon';
import { ClipboardDocumentListIcon } from './components/icons/ClipboardDocumentListIcon';


export const POPULAR_SITES: SiteLink[] = [
  { name: "Pardus", url: "https://www.pardus.org.tr", icon: GlobeAltIcon, bgColor: "bg-green-500", textColor: "text-white" },
  { name: "Facebook", url: "https://www.facebook.com", icon: ChatBubbleLeftRightIcon, bgColor: "bg-blue-600", textColor: "text-white" },
  { name: "Instagram", url: "https://www.instagram.com", icon: VideoCameraIcon, bgColor: "bg-pink-500", textColor: "text-white" },
  { name: "Telegram", url: "https://telegram.org", icon: ChatBubbleLeftRightIcon, bgColor: "bg-sky-500", textColor: "text-white" },
  { name: "Gemini", url: "https://gemini.google.com", icon: BoltIcon, bgColor: "bg-purple-500", textColor: "text-white" },
  { name: "TRT Haber", url: "https://www.trthaber.com", icon: NewspaperIcon, bgColor: "bg-red-600", textColor: "text-white" },
  { name: "TRT Spor", url: "https://www.trtspor.com.tr", icon: TvIcon, bgColor: "bg-red-700", textColor: "text-white" },
  { name: "Tabii", url: "https://www.tabii.com", icon: TvIcon, bgColor: "bg-teal-500", textColor: "text-white" },
  { name: "Netflix", url: "https://www.netflix.com", icon: VideoCameraIcon, bgColor: "bg-black", textColor: "text-red-600" },
];

export const PARDUS_SITES: SiteLink[] = [
  { name: "Pardus Resmi Sitesi", url: "https://www.pardus.org.tr" },
  { name: "Pardus Forumları", url: "https://forum.pardus.org.tr" },
  { name: "Pardus Wiki", url: "https://wiki.pardus.org.tr" },
  { name: "Pardus Mağazası", url: "https://magaza.pardus.org.tr" },
];

export const NEWS_CATEGORIES_AVAILABLE = [
  NewsCategory.AcilDurum,
  NewsCategory.Spor,
  NewsCategory.Siyaset,
  NewsCategory.Saglik,
  NewsCategory.Magazin,
  NewsCategory.Kultur,
];

export const GEMINI_TEXT_MODEL = "gemini-2.5-flash-preview-04-17";
export const GEMINI_IMAGE_MODEL = "imagen-3.0-generate-002";


export const WORLD_CITIES = [
  { name: "Londra", timeZone: "Europe/London" },
  { name: "New York", timeZone: "America/New_York" },
  { name: "Tokyo", timeZone: "Asia/Tokyo" },
  { name: "Moskova", timeZone: "Europe/Moscow" },
  { name: "Pekin", timeZone: "Asia/Shanghai" },
  { name: "İstanbul", timeZone: "Europe/Istanbul" },
];

export const DEFAULT_APP_BACKGROUND_COLOR = "#f3f4f6"; // gray-100

export const DEFAULT_SETTINGS = {
  defaultCity: "İstanbul",
  appBackgroundColor: DEFAULT_APP_BACKGROUND_COLOR,
  appBackgroundImage: "", 
  backgroundStyle: { type: 'default', value: DEFAULT_APP_BACKGROUND_COLOR } as ChatBackgroundStyle,
};

export const BACKGROUND_COLORS = [
  { name: 'Varsayılan', type: 'default', value: DEFAULT_APP_BACKGROUND_COLOR },
  { name: 'Beyaz', type: 'color', value: '#ffffff' },
  { name: 'Krem', type: 'color', value: '#fffdd0' },
  { name: 'Açık Gri', type: 'color', value: '#e5e7eb' }, 
  { name: 'Kurşun', type: 'color', value: '#475569' },
  { name: 'Gök Mavisi', type: 'color', value: '#0ea5e9' },
  { name: 'Zümrüt', type: 'color', value: '#10b981' },
  { name: 'Gül', type: 'color', value: '#f43f5e' },
  { name: 'Çivit', type: 'color', value: '#6366f1' },
  { name: 'Turuncu', type: 'color', value: '#f97316' },
  { name: 'Kehribar', type: 'color', value: '#f59e42' },
  { name: 'Açık Sarı', type: 'color', value: '#fff9c4' },
];

export const STOCK_BACKGROUND_IMAGES = [
  { name: 'Pardus Soyut', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2019/08/Pardus-03.png' },
  { name: 'Pardus Geometrik', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2019/08/Pardus-04.png' },
  { name: 'Pardus Minimal', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2019/08/Pardus-02.png' },
  { name: 'Pardus Koyu 1', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2022/04/5-dark.png' },
  { name: 'Pardus Koyu 2', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2022/04/3-dark.png' },
  { name: 'Pardus Duvar Kağıdı', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/DuvarKagidi-2-scaled.webp' },
  { name: 'Pardus Camgöbeği', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2019/08/Pardus-cyan.png' },
  { name: 'Pardus 23 Koyu Varsayılan', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_default-dark-2.webp' },
  { name: 'Pardus 23 Anıtkabir', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Anitkabir-Ankara-scaled.webp' },
  { name: 'Pardus 23 Amasya', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Amasya-2-scaled.webp' },
  { name: 'Pardus 23 Şehitler Anıtı', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Sehitler-Aniti-Canakkale-scaled.webp' },
  { name: 'Pardus 23 Anıtkabir 2', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Anitkabir-Ankara-2-scaled.webp' },
  { name: 'Pardus 23 Göcek', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Gocek-Fethiye-scaled.webp' },
  { name: 'Pardus 23 Gün Doğumu Aksaray', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Gun-Dogumu-Aksaray-scaled.webp' },
  { name: 'Pardus 23 Gün Doğumu Kapadokya', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Gun-Dogumu-Kapadokya-Nevsehir-scaled.webp' },
  { name: 'Pardus 23 İsmil Konya', type: 'imageURL', value: 'https://pardus.org.tr/wp-content/uploads/2024/05/pardus23-0_Ismil-Konya-scaled.webp' },
];

export const OTHER_AI_TOOLS: AISiteLink[] = [
  { name: "ChatGPT (OpenAI)", url: "https://chat.openai.com/", icon: GlobeAltIcon, description: "Gelişmiş dil modeli." },
  { name: "Perplexity AI", url: "https://www.perplexity.ai/", icon: GlobeAltIcon, description: "Konuşmalı arama motoru." },
  { name: "Midjourney", url: "https://www.midjourney.com/", icon: GlobeAltIcon, description: "Yapay zeka ile görsel oluşturma." },
  { name: "Poe by Quora", url: "https://poe.com/", icon: GlobeAltIcon, description: "Çeşitli AI botlarına erişim." },
  { name: "Hugging Face", url: "https://huggingface.co/", icon: GlobeAltIcon, description: "AI modelleri ve veri setleri topluluğu." },
];

export const DAILY_INSIGHT_PLACEHOLDER_ICONS = {
  event: CalendarDaysIcon,
  quote: ChatBubbleLeftEllipsisIcon,
  recipe: ClipboardDocumentListIcon,
};

// System Prompts for new AI features
export const TRANSLATOR_SYSTEM_PROMPT = "You are a helpful and accurate multilingual translator. Provide concise translations. If the source language is ambiguous, try to infer it from the text. If target language is 'Otomatik', default to English or a common language based on the text.";
export const PARDUS_APP_REC_SYSTEM_PROMPT = "You are a helpful assistant specializing in Pardus Linux. Provide Pardus-compatible application recommendations based on user needs. Suggest app names, brief descriptions, and if possible, a typical installation command (e.g., sudo apt install app-name) or indicate if it's available via Flatpak/Snap or Apper. Format output as JSON: { \"appName\": \"string\", \"description\": \"string\", \"installCommand\": \"string_or_null\" } or an array of these objects if multiple suggestions fit. Provide valid JSON. If no specific Pardus app is known, you can suggest a popular Linux alternative known to work well.";
export const PARDUS_SHORTCUT_REC_SYSTEM_PROMPT = "You are a helpful assistant specializing in Pardus Linux keyboard shortcuts. Provide the relevant Pardus keyboard shortcut(s) for the user's described action. Be concise. Format output as JSON: { \"action\": \"string\", \"shortcut\": \"string\", \"notes\": \"string_or_null\" } or an array of these objects. Provide valid JSON.";
export const PARDUS_SUPPORT_CHAT_SYSTEM_PROMPT = "You are Pardus Destek Asistanı, a friendly and knowledgeable AI assistant for Pardus Linux users. Your goal is to help users with their Pardus-related questions and issues. Provide clear, concise, and helpful information. If you don't know an answer, say so. You can guide users on where to find more information (e.g., Pardus forumları, Pardus Wiki). Speak Turkish unless the user speaks in another language. Always be polite and professional.";
