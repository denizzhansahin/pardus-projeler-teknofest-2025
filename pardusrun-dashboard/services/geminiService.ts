import { GoogleGenAI, GenerateContentResponse, Candidate, GenerateImagesResponse, Chat } from "@google/genai";
import { NewsArticle, WeatherInfo, MusicTrack, GameSuggestion, NewsCategory, VideoRecommendation, DailyEvent, DailyQuote, DailyRecipe, TranslationResult, PardusAppSuggestion, PardusShortcutSuggestion } from '../types';
import { GEMINI_TEXT_MODEL, GEMINI_IMAGE_MODEL, TRANSLATOR_SYSTEM_PROMPT, PARDUS_APP_REC_SYSTEM_PROMPT, PARDUS_SHORTCUT_REC_SYSTEM_PROMPT, PARDUS_SUPPORT_CHAT_SYSTEM_PROMPT } from '../constants';

const getApiKey = () => (typeof window !== 'undefined' ? localStorage.getItem('pardusRunApiKey') : '') || '';

const MISSING_API_KEY_MESSAGE = "API Anahtarı (API_KEY) ayarlanmamış. Bu özellik kullanılamıyor.";

if (!getApiKey()) {
  console.warn(MISSING_API_KEY_MESSAGE + " Lütfen ortam değişkenini ayarlayın.");
}

const ai = () => new GoogleGenAI({ apiKey: getApiKey() || "MISSING_API_KEY_FALLBACK" }); // Fallback key to prevent crash if API_KEY is undefined

const parseJsonFromText = <T,>(text: string): T | null => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("JSON parse hatası:", e, "Orijinal metin:", text);
    if (text.includes("error") && text.includes("message")) {
        try {
            const errorObj = JSON.parse(text);
            console.error("Gemini hata objesi algılandı:", errorObj);
        } catch (parseError) {
            // Not a JSON error object from Gemini
        }
    }
    return null;
  }
};


export const geminiService = {
  fetchNews: async (category: NewsCategory, count: number = 5): Promise<NewsArticle[]> => {
    if (!getApiKey()) return Promise.resolve([]);
    try {
      let promptTopicMessage: string = category.toString(); 
      if (category === NewsCategory.AcilDurum) {
        promptTopicMessage = "Türkiye ve dünya genelindeki en son acil durum haber başlıkları";
      }
      const prompt = `${count} adet en son "${promptTopicMessage}" kategorisinden haber başlığı ve kısa özetlerini getir. Her makale için başlık, kısa özet (1-2 cümle), mümkünse kaynak adı ve bir placeholder resim URL'si (çeşitlilik için her başlık veya içeriğe göre benzersiz bir seed kullanarak https://picsum.photos/seed/{unique_seed}/300/200?grayscale&blur=1 formatında) ekle. JSON objeleri dizisi olarak döndür. Her obje "title", "summary", "source", "imageUrl" anahtarlarına sahip olmalı. Geçerli JSON çıktısı sağla.`;
      
      const response: GenerateContentResponse = await ai().models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const articles = parseJsonFromText<NewsArticle[]>(response.text || '');
      return articles || [];
    } catch (error) {
      console.error(`${category} haberleri alınırken hata:`, error);
      return [];
    }
  },

  fetchWeather: async (city: string): Promise<WeatherInfo | null> => {
    if (!getApiKey()) return Promise.resolve(null);
    try {
      const prompt = `${city} için mevcut hava durumu bilgisini ver. Santigrat cinsinden sıcaklık, mevcut durum (örn: Güneşli, Bulutlu, Yağmurlu) ve kısa bir detay (örn: 'Açık gökyüzü, hafif esinti') ekle. "city", "temperature", "condition", "details" anahtarlarına sahip bir JSON objesi olarak döndür. Geçerli JSON çıktısı sağla.`;
      
      const response: GenerateContentResponse = await ai().models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const weatherData = parseJsonFromText<WeatherInfo>(response.text || '');
      if (weatherData) {
        return { ...weatherData, city: city }; 
      }
      return null;
    } catch (error) {
      console.error(`${city} için hava durumu alınırken hata:`, error);
      return null;
    }
  },

  fetchMusicRecommendations: async (count: number = 3): Promise<MusicTrack[]> => {
    if (!getApiKey()) return Promise.resolve([]);
    try {
      const prompt = `${count} adet çeşitli ve popüler müzik parçası öner. Her parça için başlık, sanatçı, tür belirt. Mümkünse bir youtubeVideoId, yoksa bir youtubeSearchQuery (örn: "başlık sanatçı resmi ses") sağla. Bir placeholder albüm kapağı URL'si ekle (benzersiz bir seed kullanarak https://picsum.photos/seed/{unique_seed}/200/200 formatında). JSON objeleri dizisi olarak döndür. Her obje "title", "artist", "genre", "albumArtUrl", "youtubeVideoId", "youtubeSearchQuery" anahtarlarına sahip olmalı. Geçerli JSON çıktısı sağla.`;

      const response: GenerateContentResponse = await ai().models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const tracks = parseJsonFromText<MusicTrack[]>(response.text || '');
      return tracks || [];
    } catch (error) {
      console.error("Müzik önerileri alınırken hata:", error);
      return [];
    }
  },
  
  fetchGameSuggestions: async (count: number = 3): Promise<GameSuggestion[]> => {
    if (!getApiKey()) return Promise.resolve([]);
    try {
      const prompt = `${count} adet eğlenceli ve basit tarayıcı tabanlı oyun öner. Her oyun için adını, kısa bir açıklamasını, oyunu oynamak veya erişmek için doğrudan bir URL ve bir placeholder resim URL'si (çeşitlilik için https://picsum.photos/seed/{oyun_adi_slug}/300/200?grayscale formatında) sağla. "name", "description", "url", "imageUrl" anahtarlarına sahip JSON objeleri dizisi olarak döndür. Geçerli JSON sağla.`;
      
      const response: GenerateContentResponse = await ai().models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const games = parseJsonFromText<GameSuggestion[]>(response.text || '');
      return games || [];
    } catch (error) {
      console.error("Oyun önerileri alınırken hata:", error);
      return [];
    }
  },

  fetchVideoRecommendations: async (count: number = 3): Promise<VideoRecommendation[]> => {
    if (!getApiKey()) return Promise.resolve([]);
    try {
      const prompt = `${count} adet çeşitli konularda (örn: bilim, kısa belgeseller, teknoloji, eğlence) ilginç veya trend YouTube videosu öner. Her video için başlık, kısa açıklama, kanal adı (varsa), belirli bir tane bulabilirsen youtubeVideoId, yoksa bir youtubeSearchQuery sağla. Ayrıca bir placeholder küçük resim URL'si (https://picsum.photos/seed/{benzersik_video_seed}/320/180 formatında) sağla. "title", "description", "channelName", "thumbnailUrl", "youtubeVideoId", "youtubeSearchQuery" anahtarlarına sahip JSON objeleri dizisi olarak döndür. Geçerli JSON çıktısı sağla.`;
      
      const response: GenerateContentResponse = await ai().models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const videos = parseJsonFromText<VideoRecommendation[]>(response.text || '');
      return videos || [];
    } catch (error) {
      console.error("Video önerileri alınırken hata:", error);
      return [];
    }
  },

  searchWithGoogle: async (query: string): Promise<{text: string, candidates?: Candidate[]}> => {
    if (!getApiKey()) return Promise.resolve({text: MISSING_API_KEY_MESSAGE, candidates: []});
    try {
      const response: GenerateContentResponse = await ai().models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: query,
        config: {
          tools: [{googleSearch: {}}], 
        },
      });
      const responseText = response.text || "Modelden metinsel yanıt alınamadı.";
      return {text: responseText, candidates: response.candidates};
    } catch (error) {
      console.error(`"${query}" sorgusu için Google araması yapılırken hata:`, error);
      const errorMessage = (error instanceof Error) ? error.message : "Arama sırasında bilinmeyen bir hata oluştu.";
      return {text: `Üzgünüm, şu anda arama yapamadım. Hata: ${errorMessage}`, candidates: []};
    }
  },

  getGeneralInfo: async (topicPrompt: string): Promise<{text: string, sources?: Candidate[]}> => {
     if (!getApiKey()) return Promise.resolve({text: MISSING_API_KEY_MESSAGE, sources: []});
    try {
      const response: GenerateContentResponse = await ai().models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: topicPrompt,
      });
      return {text: response.text, sources: response.candidates};
    } catch (error) {
      console.error(`"${topicPrompt}" istemi için genel bilgi alınırken hata:`, error);
      return {text: "Üzgünüm, bu bilgiyi şu anda alamadım."};
    }
  },

  generateImage: async (prompt: string): Promise<string | null> => {
    if (!getApiKey()) {
      console.warn(MISSING_API_KEY_MESSAGE);
      alert(MISSING_API_KEY_MESSAGE);
      return null;
    }
    if (!prompt || prompt.trim().length < 5) {
      alert("Lütfen daha açıklayıcı bir görsel istemi girin (en az 5 karakter).");
      return null;
    }
    try {
      const response: GenerateImagesResponse = await ai().models.generateImages({
        model: GEMINI_IMAGE_MODEL,
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
      });
      if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
        return response.generatedImages[0].image.imageBytes;
      }
      // Gemini API'den hata mesajı response'ta yoksa, kullanıcıya genel bir mesaj göster
      alert('Görsel oluşturulamadı. Model bir sonuç döndürmedi veya API bir hata iletti. Lütfen daha açıklayıcı bir istem deneyin.');
      return null;
    } catch (error: any) {
      console.error("Görsel oluşturulurken hata:", error);
      alert(`Görsel oluşturulurken bir hata oluştu: ${error?.message || error}`);
      return null;
    }
  },

  fetchEventOfTheDay: async (): Promise<DailyEvent | null> => {
    if (!getApiKey()) return null;
    try {
      const prompt = "Bugün tarihte gerçekleşmiş önemli bir olayı belirtin (yıl ve olay açıklaması). JSON formatında { \"year\": \"YYYY\", \"event\": \"Olayın kısa açıklaması\" } şeklinde yanıt verin.";
      const response = await ai().models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const parsedData = parseJsonFromText<DailyEvent>(response.text || '');
      if (!parsedData) {
        console.error("Günün olayı parse edilemedi veya boş yanıt:", response.text);
        throw new Error("Günün olayı API'den alınırken format hatası.");
      }
      return parsedData;
    } catch (error) {
      console.error("Günün olayı alınırken hata:", error);
      throw error; 
    }
  },

  fetchQuoteOfTheDay: async (): Promise<DailyQuote | null> => {
    if (!getApiKey()) return null;
    try {
      const prompt = "İlham verici veya düşündürücü bir günün sözü belirtin (söz ve yazarı). JSON formatında { \"quote\": \"Söz metni\", \"author\": \"Yazarın adı\" } şeklinde yanıt verin.";
      const response = await ai().models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const parsedData = parseJsonFromText<DailyQuote>(response.text || '');
      if (!parsedData) {
        console.error("Günün sözü parse edilemedi veya boş yanıt:", response.text);
        throw new Error("Günün sözü API'den alınırken format hatası.");
      }
      return parsedData;
    } catch (error) {
      console.error("Günün sözü alınırken hata:", error);
      throw error; 
    }
  },

  fetchRecipeOfTheDay: async (): Promise<DailyRecipe | null> => {
    if (!getApiKey()) return null;
    try {
      const prompt = "Basit ve pratik bir günlük yemek tarifi önerin. JSON formatında { \"name\": \"Yemeğin Adı\", \"ingredients\": [\"Malzeme 1\", \"Malzeme 2\"], \"instructions\": \"Hazırlanışı...\", \"prepTime\": \"Hazırlık Süresi\" } şeklinde yanıt verin.";
      const response = await ai().models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const parsedData = parseJsonFromText<DailyRecipe>(response.text || '');
       if (!parsedData) {
        console.error("Günün tarifi parse edilemedi veya boş yanıt:", response.text);
        throw new Error("Günün tarifi API'den alınırken format hatası.");
      }
      return parsedData;
    } catch (error) {
      console.error("Günün yemek tarifi alınırken hata:", error);
      throw error; 
    }
  },

  translateText: async (text: string, targetLanguage: string, sourceLanguage?: string): Promise<TranslationResult | null> => {
    if (!getApiKey()) return null;
    try {
      let prompt = `Translate the following text to ${targetLanguage}: "${text}"`;
      if (sourceLanguage && sourceLanguage.trim() !== "") {
        prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}: "${text}"`;
      }
      
      const response: GenerateContentResponse = await ai().models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: {
            systemInstruction: TRANSLATOR_SYSTEM_PROMPT,
            responseMimeType: "application/json" // Expecting JSON { "translatedText": "...", "detectedSourceLang": "..." }
        }
      });

      const result = parseJsonFromText<TranslationResult>(response.text || '');
      if (result && result.translatedText) {
        return result;
      } else if (response.text && response.text.trim()) { // Fallback if not JSON but plain text translation
        return { translatedText: response.text.trim() };
      }
      return null;
    } catch (error) {
      console.error("Çeviri hatası:", error);
      throw error;
    }
  },

  getPardusAppRecommendation: async (userNeed: string): Promise<PardusAppSuggestion[] | null> => {
    if (!getApiKey()) return null;
    try {
      const prompt = `Kullanıcı Pardus Linux için "${userNeed}" ihtiyacını karşılayacak bir uygulama arıyor. Bir veya daha fazla Pardus uyumlu uygulama öner. JSON formatında bir dizi olarak döndür: [{ "appName": "Uygulama Adı", "description": "Kısa açıklama", "installCommand": "sudo apt install uygulama-adı (veya 'Flatpak/Snap üzerinden' veya null)" }].`;
      const response: GenerateContentResponse = await ai().models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: { 
            systemInstruction: PARDUS_APP_REC_SYSTEM_PROMPT,
            responseMimeType: "application/json" 
        }
      });
      const suggestions = parseJsonFromText<PardusAppSuggestion[]>(response.text || '');
      return suggestions || [];
    } catch (error) {
      console.error("Pardus uygulama önerisi alınırken hata:", error);
      throw error;
    }
  },

  getPardusShortcutSuggestion: async (userAction: string): Promise<PardusShortcutSuggestion[] | null> => {
    if (!getApiKey()) return null;
    try {
      const prompt = `Kullanıcı Pardus Linux'ta "${userAction}" eylemi için klavye kısayolunu soruyor. İlgili kısayolu/kısayolları öner. JSON formatında bir dizi olarak döndür: [{ "action": "Eylem", "shortcut": "Kısayol Tuşları", "notes": "Ek notlar (isteğe bağlı)" }].`;
      const response: GenerateContentResponse = await ai().models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: { 
            systemInstruction: PARDUS_SHORTCUT_REC_SYSTEM_PROMPT,
            responseMimeType: "application/json"
        }
      });
      const suggestions = parseJsonFromText<PardusShortcutSuggestion[]>(response.text || '');
      return suggestions || [];
    } catch (error) {
      console.error("Pardus kısayol önerisi alınırken hata:", error);
      throw error;
    }
  },

  // For Pardus Support Chat
  startChat: (): Chat | null => {
    if (!getApiKey()) {
      console.warn(MISSING_API_KEY_MESSAGE);
      return null;
    }
    return ai().chats.create({
      model: GEMINI_TEXT_MODEL,
      config: {
        systemInstruction: PARDUS_SUPPORT_CHAT_SYSTEM_PROMPT,
      },
    });
  }
};
