import { GoogleGenAI } from "@google/genai";
import type { MediaItem, Memory, DailyHighlight, MoreInfoResult, ChatMessage } from "../types";

// UYARI: Bu kodun çalışması için ortam değişkenlerinde (environment variable) API_KEY'in ayarlanmış olması gerekmektedir.
// API anahtarını localStorage'dan oku
function getUserApiKey(): string | undefined {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('PARDUS_PIKSELLA_API_KEY') || undefined;
  }
  return undefined;
}

export interface AnalysisResult {
    description: string;
    tags: string[];
}

// Dosyayı Gemini API'nin anlayacağı formata dönüştüren yardımcı fonksiyon
async function fileToGenerativePart(file: Blob) {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
}

/**
 * Bir görseli Gemini kullanarak analiz eder
 */
export const analyzeImage = async (image: Blob): Promise<AnalysisResult> => {
    const apiKey = getUserApiKey();
    if (!apiKey) throw new Error('API anahtarı girilmedi.');
    const ai = new GoogleGenAI({ apiKey });
    const imagePart = await fileToGenerativePart(image);
    
    const prompt = `Bu görseli Türkçe olarak analiz et. Yanıtı JSON formatında döndür. Yanıt, 'description' (görselin ayrıntılı bir Türkçe açıklaması) ve 'tags' (görselle ilgili en fazla 5 adet Türkçe anahtar kelime içeren bir dizi) alanlarını içermelidir. Örneğin: {"description": "Yemyeşil bir vadide akan bir nehrin güzel manzarası.", "tags": ["doğa", "manzara", "nehir", "vadi", "yeşillik"]}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
            }
        });

        let jsonStr = response.text?.trim() || '';
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        
        const parsedData = JSON.parse(jsonStr);
        if (parsedData.description && Array.isArray(parsedData.tags)) {
            return parsedData;
        } else {
            throw new Error("API'den geçersiz JSON yapısı geldi.");
        }
    } catch (e) {
        console.error("Gemini API analyzeImage hatası:", e);
        throw new Error("Görüntü analizi sırasında bir hata oluştu.");
    }
};

/**
 * Görsel arama için bir görselden anahtar kelimeler alır
 */
export const getKeywordsForImageSearch = async (image: Blob): Promise<string> => {
     const apiKey = getUserApiKey();
     if (!apiKey) throw new Error('API anahtarı girilmedi.');
     const ai = new GoogleGenAI({ apiKey });
     const imagePart = await fileToGenerativePart(image);
     const prompt = "Bu görseli boşluklarla ayrılmış 2-3 Türkçe anahtar arama terimiyle tanımlayın. Örneğin: 'plaj gün batımı okyanus'.";
     
     try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: { parts: [imagePart, {text: prompt}] }
        });
        return response.text.trim();
     } catch (e) {
        console.error("Gemini API getKeywordsForImageSearch hatası:", e);
        throw new Error("Görsel arama için anahtar kelimeler alınamadı.");
     }
}


/**
 * Medya öğeleri listesinden anılar önerir
 */
export const suggestMemories = async (items: MediaItem[]): Promise<Omit<Memory, 'id'>[]> => {
    const analyzedItems = items.filter(item => item.analyzed && item.tags && item.tags.length > 0);
    if (analyzedItems.length < 3) {
        return []; // Bir anı oluşturmak için yeterli veri yok
    }

    const itemsData = analyzedItems.map(item => ({
        id: item.id,
        title: item.title,
        tags: item.tags,
        description: item.description,
    }));

    const prompt = `Aşağıdaki JSON verileri, bir fotoğraf koleksiyonunu temsil etmektedir. Her nesne bir fotoğrafın kimliğini, başlığını, Türkçe etiketlerini ve Türkçe açıklamasını içerir. Bu fotoğrafları ortak temalara göre mantıklı gruplara ayırarak anılar oluştur. Her anı en az 3 fotoğraftan oluşmalıdır. Anı başlıkları da Türkçe olmalıdır (örneğin: "Doğa Gezileri", "Şehir Maceraları", "Lezzetli Anlar"). Yanıtı, her biri bir 'title' (anı için Türkçe bir başlık) ve ilgili fotoğrafların 'id'lerini içeren bir 'imageIds' dizisi olan JSON nesnelerinden oluşan bir dizi olarak döndür. İşte fotoğraflar: ${JSON.stringify(itemsData)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        const memories = JSON.parse(jsonStr);
        if (Array.isArray(memories)) {
            // Yapıyı doğrula
            return memories.filter(mem => mem.title && Array.isArray(mem.imageIds) && mem.imageIds.length > 0);
        }
        return [];
    } catch (e) {
        console.error("Gemini API suggestMemories hatası:", e);
        return []; // Hata durumunda boş dizi döndür
    }
}

/**
 * Kullanıcının galerisinden günlük bir özet oluşturur
 */
export const getDailyHighlight = async (items: MediaItem[]): Promise<DailyHighlight | null> => {
    const analyzedItems = items.filter(item => item.analyzed);
    if (analyzedItems.length < 3) return null;

    const itemsData = analyzedItems.map(item => ({ id: item.id, description: item.description }));
    const prompt = `Aşağıdaki JSON verileri, bir fotoğraf koleksiyonundan analiz edilmiş görselleri temsil etmektedir. Bu koleksiyondan tematik olarak birbiriyle ilişkili veya sadece estetik olarak günün en dikkat çekici 3 ila 5 fotoğrafını seçerek bir 'günün özeti' oluştur. Yanıtın bir JSON nesnesi olmalı ve şu alanları içermelidir: 'summary' (seçilen fotoğrafları ve neden ilginç olduklarını anlatan 1-2 cümlelik kısa, samimi ve Türkçe bir özet) ve 'imageIds' (seçilen fotoğrafların id'lerini içeren bir dizi). Örnek özet: 'Bugün doğanın en güzel tonlarını yakalamışsın! Özellikle şu gün batımı ve orman manzarası harika görünüyor.'. İşte görseller: ${JSON.stringify(itemsData)}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        const highlight = JSON.parse(jsonStr);
        if (highlight.summary && Array.isArray(highlight.imageIds)) {
            return highlight;
        }
        return null;
    } catch (e) {
        console.error("Gemini API getDailyHighlight hatası:", e);
        return null;
    }
}

/**
 * Bir görseldeki ana konu hakkında ansiklopedik bilgi alır.
 */
export const getMoreInfo = async (image: Blob): Promise<MoreInfoResult | null> => {
    const apiKey = getUserApiKey();
    if (!apiKey) throw new Error('API anahtarı girilmedi.');
    const ai = new GoogleGenAI({ apiKey });
    const imagePart = await fileToGenerativePart(image);
    const prompt = `Bu görseldeki ana nesne, yer veya kavram nedir? Bunu belirledikten sonra, bu konu hakkında kısa (2-3 cümle), ansiklopedik ve Türkçe bir bilgi ver. Yanıtı bir JSON nesnesi olarak döndür ve şu alanları içersin: 'title' (ana konunun Türkçe adı) ve 'content' (konu hakkındaki Türkçe açıklama). Örneğin, bir kedi fotoğrafı için: {"title": "Kedi (Felis catus)", "content": "Kediler, Felidae familyasına ait, evcilleştirilmiş küçük etçil memelilerdir. İnsanlarla olan yakın ilişkileri binlerce yıl öncesine dayanır ve dünya genelinde en popüler evcil hayvanlardan biridir."}`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: { parts: [imagePart, { text: prompt }] },
            config: { responseMimeType: "application/json" }
        });
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        const result = JSON.parse(jsonStr);
        if (result.title && result.content) {
            return result;
        }
        return null;
    } catch (e) {
        console.error("Gemini API getMoreInfo hatası:", e);
        return null;
    }
}

/**
 * Kullanıcının medya kütüphanesi hakkında sohbet eder.
 */
export const chatWithAI = async (
    userMessage: string,
    chatHistory: ChatMessage[],
    mediaLibrary: MediaItem[]
): Promise<{ responseText: string; foundMediaIds: number[] }> => {
    
    const apiKey = getUserApiKey();
    if (!apiKey) throw new Error('API anahtarı girilmedi.');
    const ai = new GoogleGenAI({ apiKey });

    const libraryContext = mediaLibrary
        .filter(item => item.analyzed)
        .map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            tags: item.tags,
        }));

    const historyContext = chatHistory.map(msg => `${msg.role}: ${msg.text}`).join('\n');

    const prompt = `Sen Piksella adında bir fotoğraf kütüphanesi asistanısın. Kullanıcı, fotoğrafları hakkında seninle sohbet edecek. Kullanıcının isteğini, sohbet geçmişini ve sağlanan kütüphane verilerini kullanarak yanıtla.
    Görevin: Kullanıcının isteğini analiz et ve kütüphanedeki ilgili fotoğrafları bul. Yanıtın SADECE aşağıdakileri içeren bir JSON nesnesi olmalıdır:
    1. 'responseText': Kullanıcının isteğine samimi ve Türkçe bir yanıt.
    2. 'foundMediaIds': Bulduğun fotoğrafların ID'lerini içeren bir sayı dizisi. Eşleşme yoksa boş bir dizi [] döndür.

    SOHBET GEÇMİŞİ:
    ${historyContext}

    KULLANICININ FOTOĞRAF KÜTÜPHANESİ (JSON):
    ${JSON.stringify(libraryContext)}

    YENİ KULLANICI MESAJI: "${userMessage}"

    Şimdi, bu mesaja göre JSON yanıtını oluştur.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            }
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }
        
        const parsedData = JSON.parse(jsonStr);
        if (parsedData.responseText && Array.isArray(parsedData.foundMediaIds)) {
            return parsedData;
        } else {
            return { responseText: "Üzgünüm, isteğinizi anlayamadım. Lütfen farklı bir şekilde sormayı deneyin.", foundMediaIds: [] };
        }
    } catch (e) {
        console.error("Gemini API chatWithAI hatası:", e);
        return { responseText: "AI asistanı ile iletişim kurarken bir hata oluştu.", foundMediaIds: [] };
    }
};