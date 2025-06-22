import { GoogleGenAI, GenerateContentResponse, Chat, GenerateContentStreamResponse } from "@google/genai";
import { Note, AiChatMessage, VoiceCommandResponse, VoiceAction } from '../types';
import { AI_MODEL_TEXT, MAX_NOTES_FOR_AI_CONTEXT, MAX_NOTE_CONTENT_FOR_AI_CONTEXT } from '../constants';

let ai: GoogleGenAI | null = null;

const getApiKey = (): string => {
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof globalThis !== 'undefined' && (globalThis as any).API_KEY) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (globalThis as any).API_KEY;
  }
  console.error("API_KEY is not configured. Please set API_KEY in your environment or on globalThis.");
  throw new Error("API_KEY is not configured.");
};

const getAiClient = (): GoogleGenAI => {
  if (!ai) {
    const apiKey = getApiKey();
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

const parseJsonResponse = <T>(jsonString: string): T | null => {
  try {
    let parsableString = jsonString.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = parsableString.match(fenceRegex);
    if (match && match[2]) {
      parsableString = match[2].trim();
    }
    return JSON.parse(parsableString) as T;
  } catch (error) {
    console.error("Failed to parse JSON response:", error, "Original string:", jsonString);
    return null;
  }
};


export const getAiAssistance = async (text: string, task: string): Promise<string> => {
  const client = getAiClient();
  let prompt: string;
  if (text.trim() === '') {
    prompt = `Lütfen şu görev için bir öneri oluştur: "${task}".`;
  } else {
    prompt = `Lütfen aşağıdaki metin için şu görevi yerine getir: "${task}". Metin: "${text}"`;
  }
  
  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: AI_MODEL_TEXT,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error getting AI assistance:", error);
    if (error && typeof error === 'object' && 'message' in error) {
      return `Yapay zekadan yardım alınırken bir hata oluştu: ${error.message}`;
    }
    return "Yapay zekadan yardım alınırken bir hata oluştu.";
  }
};

export const summarizeTextWithAI = async (text: string): Promise<string> => {
  const client = getAiClient();
  const prompt = `Lütfen aşağıdaki metni kısa ve öz bir şekilde özetle (yaklaşık 2-3 cümle): "${text}"`;
  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: AI_MODEL_TEXT,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing text with AI:", error);
     if (error && typeof error === 'object' && 'message' in error) {
      return `Metin özetlenirken bir hata oluştu: ${error.message}`;
    }
    return "Metin özetlenirken bir hata oluştu.";
  }
};

const formatNotesForContext = (notes: Note[], forChat: boolean = true): string => {
  let context = forChat ? "Kullanıcının mevcut notları aşağıdadır (en yeniden eskiye sıralı):\n\n" : "Mevcut notlar (referans için):\n";
  const notesToInclude = notes.slice(0, MAX_NOTES_FOR_AI_CONTEXT);

  notesToInclude.forEach((note, index) => {
    const contentSnippet = note.content.length > MAX_NOTE_CONTENT_FOR_AI_CONTEXT 
      ? note.content.substring(0, MAX_NOTE_CONTENT_FOR_AI_CONTEXT) + "..."
      : note.content;
    context += `Not ${index + 1}:\n`;
    context += `  Başlık: ${note.title}\n`;
    if (forChat) context += `  Kategori: ${note.category}\n`;
    context += `  İçerik: ${contentSnippet}\n`;
    if (forChat) context += `  Oluşturulma Tarihi: ${new Date(note.createdAt).toLocaleDateString('tr-TR')}\n`;
    if (note.linkUrl && forChat) context += `  Bağlantı: ${note.linkUrl}\n`;
    context += "\n";
  });
  if (notes.length > MAX_NOTES_FOR_AI_CONTEXT && forChat) {
    context += `(ve ${notes.length - MAX_NOTES_FOR_AI_CONTEXT} daha fazla not mevcut)\n`;
  }
  return context;
};

let chatInstance: Chat | null = null;

// startOrContinueChat remains unchanged

export const startOrContinueChat = async ( 
  userMessage: string, 
  allNotes: Note[],
  chatHistory: AiChatMessage[] 
): Promise<string> => {
  const client = getAiClient();
  
  const systemInstruction = `Sen kullanıcının notlarını yönetmesine yardımcı olan bir yapay zeka asistanısın. Kullanıcının sorularını, sağlanan not bağlamına göre yanıtla. Notlarla ilgili sorular sorabilirler, örneğin belirli bir bilgiyi bulma (bir alışveriş listesindeki ürünün fiyatı gibi) veya genel tavsiye isteyebilirler. Kısa ve öz yanıtlar ver. En son notlar en üstte olacak şekilde notlar listelenmiştir. \n\n${formatNotesForContext(allNotes)}`;

  if (!chatInstance) {
    chatInstance = client.chats.create({
      model: AI_MODEL_TEXT,
      config: { systemInstruction },
    });
  }

  const sdkHistory = chatHistory.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model', 
    parts: [{text: msg.text}]
  }));

  try {
    if (!chatInstance.history || chatInstance.history.length === 0) {
        const response: GenerateContentResponse = await chatInstance.sendMessage({
            message: userMessage,
            history: sdkHistory.slice(0, -1), 
            config: { systemInstruction } 
        });
        return response.text;
    } else {
        const response: GenerateContentResponse = await chatInstance.sendMessage({message: userMessage});
        return response.text;
    }

  } catch (error) {
    console.error("Error in AI chat:", error);
    chatInstance = null; 
    if (error && typeof error === 'object' && 'message' in error) {
      return `Sohbet sırasında bir hata oluştu: ${error.message}`;
    }
    return "Sohbet sırasında bir hata oluştu. Lütfen tekrar deneyin.";
  }
};


export const streamChatResponse = async (
  userMessage: string,
  allNotes: Note[],
  chatHistoryFromUI: AiChatMessage[], 
  onChunk: (chunkText: string) => void,
  onError: (error: Error) => void,
  onComplete: () => void
): Promise<void> => {
  const client = getAiClient();
  const notesContext = formatNotesForContext(allNotes);
  const systemInstruction = `Sen kullanıcının notlarını yönetmesine yardımcı olan bir yapay zeka asistanısın. Kullanıcının sorularını, sağlanan not bağlamına göre yanıtla. Notlarla ilgili sorular sorabilirler, örneğin belirli bir bilgiyi bulma (bir alışveriş listesindeki ürünün fiyatı gibi) veya genel tavsiye isteyebilirler. Kısa ve öz yanıtlar ver. En son notlar en üstte olacak şekilde notlar listelenmiştir. \n\n${notesContext}`;

  if (!chatInstance) {
    console.log("Creating new chat instance for streaming.");
    chatInstance = client.chats.create({
      model: AI_MODEL_TEXT,
      config: { systemInstruction },
      history: chatHistoryFromUI.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{text: msg.text}]
      }))
    });
  } else {
     console.log("Using existing chat instance for streaming.");
  }

  try {
    const responseStream: GenerateContentStreamResponse = await chatInstance.sendMessageStream({ message: userMessage });
    for await (const chunk of responseStream) {
      onChunk(chunk.text);
    }
    onComplete();
  } catch (error) {
    console.error("Error in streaming AI chat:", error);
    if (error instanceof Error) {
        onError(error);
    } else {
        onError(new Error("Bilinmeyen bir sohbet hatası oluştu."));
    }
  }
};

export const resetChat = () => {
    console.log("Resetting chat instance.");
    chatInstance = null;
};

export const processVoiceCommand = async (transcript: string, currentNotes: Note[]): Promise<VoiceCommandResponse | null> => {
  const client = getAiClient();
  const notesContextForVoice = currentNotes.length > 0 ? formatNotesForContext(currentNotes.slice(0, 3), false) : "Kullanıcının henüz bir notu yok.";

  const systemInstruction = `Sen bir not alma uygulaması için sesli komut işleyen bir asistansın. Kullanıcının konuşmasını analiz et ve eylemleri yapılandırılmış JSON formatında çıkar.
JSON yanıtın her zaman bir "actions" anahtarına sahip olmalı ve bu bir eylemler dizisi olmalıdır.
Olası eylem türleri:
1.  'createNote': 
    - Gerekli alanlar: 'title' (string), 'content' (string).
    - İsteğe bağlı alan: 'category' (string, eğer kullanıcı belirtirse veya çıkarım yapılabilirse; aksi halde 'General' kullanılabilir).
2.  'setReminder':
    - Gerekli alanlar: 'noteIdentifier' (string, kullanıcı hangi not için hatırlatıcı istediğini belirtir, örn: "son not", "market notu", "bir önceki not". Eğer belirtilmemişse ve sadece bir not yeni oluşturulduysa "lastCreated" kullan), 'time' (string, kullanıcının söylediği zaman ifadesi, örn: "yarın saat 3'te", "2 saat sonra", "salı akşamı").
3.  'clarify': Kullanıcının isteği belirsizse veya daha fazla bilgiye ihtiyaç duyuluyorsa kullanılır.
    - Gerekli alan: 'message' (string, kullanıcıya sorulacak açıklama sorusu).
4.  'noActionDetected': Kullanıcının konuşmasında belirli bir komut algılanmazsa kullanılır.
    - Gerekli alan: 'message' (string, kullanıcıya geri bildirim).

Kullanıcı bir konuşmada birden fazla not oluşturma veya bir not oluşturup hemen hatırlatıcı ekleme gibi birden fazla eylem belirtebilir. Bu durumda, "actions" dizisinde birden fazla eylem nesnesi döndür.
Tarih ve saat ifadelerini (örn: "yarın", "bugün saat 5", "2 gün sonra") olduğu gibi 'time' alanına yaz, ön uç bu ifadeleri işleyecektir.
Eğer not başlığı belirtilmemişse, içerikten kısa bir başlık çıkarmaya çalış veya genel bir başlık kullan.

Örnek Kullanıcı İsteği: "Yeni bir not oluştur başlığı market alışverişi olsun içeriğine süt yumurta ve ekmek yaz. Bu not için bana yarın akşam 5'te hatırlatma yap. Ayrıca proje fikirleri diye bir not oluştur ve içine beyin fırtınası yapacağımı yaz."
Örnek JSON Çıktısı:
{
  "actions": [
    {
      "type": "createNote",
      "title": "Market Alışverişi",
      "content": "Süt, yumurta ve ekmek.",
      "category": "Shopping" 
    },
    {
      "type": "setReminder",
      "noteIdentifier": "Market Alışverişi", 
      "time": "yarın akşam 5'te"
    },
    {
      "type": "createNote",
      "title": "Proje Fikirleri",
      "content": "Beyin fırtınası yapılacak.",
      "category": "Ideas"
    }
  ]
}

Eğer kullanıcı sadece "Merhaba" derse:
{
  "actions": [
    {
      "type": "noActionDetected",
      "message": "Merhaba! Notlarınızla ilgili size nasıl yardımcı olabilirim?"
    }
  ]
}
`;

  const prompt = `Kullanıcının sesli komutu: "${transcript}"\n\n${notesContextForVoice}\n\nLütfen yukarıdaki sistem talimatlarına göre JSON çıktısı oluştur.`;

  try {
    const response = await client.models.generateContent({
      model: AI_MODEL_TEXT,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    // Güvenli JSON ayrıştırma
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim(); 
    }
    
    const parsedData = JSON.parse(jsonStr) as VoiceCommandResponse;
    if (parsedData && Array.isArray(parsedData.actions)) {
        return parsedData;
    }
    console.error("Parsed data is not in expected VoiceCommandResponse format:", parsedData);
    return { actions: [{ type: 'clarify', message: "İsteğinizi işlerken bir sorun oluştu. Lütfen tekrar deneyin." }] };

  } catch (error) {
    console.error("Error processing voice command with AI:", error);
    let errorMessage = "Sesli komut işlenirken bir hata oluştu.";
    if (error instanceof Error) errorMessage += ` Detay: ${error.message}`;
    return { actions: [{ type: 'clarify', message: errorMessage }] };
  }
};