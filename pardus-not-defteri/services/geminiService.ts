import { GoogleGenAI, GenerateContentResponse, Chat, Content } from "@google/genai";
import { Note, AiChatMessage, VoiceCommandResponse, VoiceAction, CreateNoteAction, ClarifyAction, NoActionDetectedAction, DEFAULT_CATEGORIES, SimplifiedNoteDataFromAI } from '../types';
import { AI_MODEL_TEXT, MAX_NOTES_FOR_AI_CONTEXT, MAX_NOTE_CONTENT_FOR_AI_CONTEXT } from '../constants';

let ai: GoogleGenAI | null = null;

const LOCAL_STORAGE_KEY = 'PARDUS_AI_API_KEY';

const getApiKey = (): string => {
  // Önce localStorage'dan oku (tarayıcıda çalışıyorsa)
  if (typeof window !== 'undefined' && window.localStorage) {
    const key = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (key && key.trim()) return key.trim();
  }
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

const handleError = (error: unknown, contextAction: string): Error => {
  console.error(`Error during ${contextAction}:`, error);
  let finalErrorMessage = `Yapay zeka ile '${contextAction}' işlemi sırasında bilinmeyen bir hata oluştu.`;
  if (error && typeof error === 'object') {
    const errorObj = error as any; 
    if (errorObj.error && typeof errorObj.error === 'object' && errorObj.error.message) {
      // Specifically handle Google API errors
      if (errorObj.error.code === 429 || errorObj.error.status === "RESOURCE_EXHAUSTED") {
        finalErrorMessage = "Yapay zeka servis kullanım limitinize ulaştınız veya servis geçici olarak meşgul. Lütfen daha sonra tekrar deneyin veya planınızı kontrol edin.";
      } else {
        finalErrorMessage = `Yapay zeka hatası (${contextAction}): ${errorObj.error.message}`;
      }
    } else if ('message' in errorObj && typeof errorObj.message === 'string') { // Standard JS error
      finalErrorMessage = `Bir hata oluştu (${contextAction}): ${errorObj.message}`;
    }
  }
  return new Error(finalErrorMessage);
};


export const getAiAssistance = async (text: string, task: string, contextField?: 'title' | 'content'): Promise<string> => {
  const client = getAiClient();
  let userQuery: string;

  const baseInstruction = `Sen bir not alma uygulamasında kullanıcıya yardımcı olan bir yapay zekasın. Görevin, kullanıcının isteklerine göre kısa, öz ve kaliteli metin önerileri sunmaktır. HER ZAMAN bir metin önerisi döndürmelisin. Eğer isteği yerine getiremiyorsan, bunun nedenini kısaca açıkla, ancak yine de ilgili bir öneri sunmaya çalış. Sadece ve sadece istenen metin sonucunu döndür, başına veya sonuna açıklama, yorum veya "İşte öneriniz:" gibi ifadeler EKLEME.`;

  if (contextField === 'title') {
    if (text.trim() === '') {
      userQuery = `Yeni bir not için kısa, etkileyici ve konuyla alakalı bir başlık oluştur. Notun teması veya görevi: "${task}". Başlık, bir not uygulaması için uygun olmalı. Örneğin, eğer görev "proje planı" ise, "Proje Planı Taslağı" veya "Yeni Proje Adımları" gibi bir başlık öner.`;
      if (task.toLowerCase().includes("kısalt") || task.toLowerCase().includes("geliştir") || task.toLowerCase().includes("dikkat çekici yap") || task.toLowerCase().includes("alternatif öner")) {
          userQuery = `Kullanıcı mevcut bir başlık sağlamadı ancak "${task}" ile ilgili bir başlık istiyor. Bu tema/görev için kısa, öz ve dikkat çekici YENİ bir başlık öner. Sadece başlık metnini döndür.`;
      }
    } else {
      userQuery = `Mevcut bir not başlığını değiştirmek isteniyor.
Mevcut başlık: "${text}"
İstenen değişiklik/görev: "${task}"
Lütfen yeni, geliştirilmiş başlığı sağla. Başlık kısa ve not için alakalı olmalı. Sadece yeni başlık metnini döndür.`;
      if (task.toLowerCase() === "kısalt") {
        userQuery = `Aşağıdaki not başlığını, anlamını koruyarak önemli ölçüde kısalt ve daha öz hale getir: "${text}". Sadece kısaltılmış başlığı döndür.`;
      } else if (task.toLowerCase() === "daha dikkat çekici yap" || task.toLowerCase().includes("geliştir")) {
        userQuery = `Aşağıdaki not başlığını daha ilgi çekici ve anlaşılır hale getirerek geliştir: "${text}". Sadece geliştirilmiş başlığı döndür.`;
      } else if (task.toLowerCase().includes("alternatif öner")) {
        userQuery = `Mevcut not başlığı için bir adet alternatif ve etkileyici başlık öner: "${text}". Sadece alternatif başlığı döndür.`;
      }
    }
  } else if (contextField === 'content') {
    if (text.trim() === '') {
      userQuery = `Aşağıdaki konu veya görev için bir not içeriği oluştur: "${task}". İçerik, bir not uygulaması için bilgilendirici ve iyi yapılandırılmış olmalı. Sadece oluşturulan içeriği döndür.`;
    } else {
      userQuery = `Mevcut bir not içeriğini değiştirmek isteniyor.
Mevcut içerik: "${text}"
İstenen değişiklik/görev: "${task}"
Lütfen yeni, geliştirilmiş içeriği sağla. Sadece yeni içerik metnini döndür.`;
      if (task.toLowerCase() === "kısalt") {
        userQuery = `Aşağıdaki not içeriğini önemli ölçüde kısaltarak anahtar noktalara odaklan: "${text}". Sadece kısaltılmış içeriği döndür.`;
      } else if (task.toLowerCase().includes("geliştir") || task.toLowerCase().includes("daha ilgi çekici hale getir")) {
        userQuery = `Aşağıdaki not içeriğini daha ayrıntılı, ilgi çekici veya daha iyi yapılandırılmış hale getirerek geliştir. Görev: "${task}". Orijinal içerik: "${text}". Sadece geliştirilmiş içeriği döndür.`;
      } else if (task.toLowerCase().includes("genişlet")) {
        userQuery = `Aşağıdaki not içeriğini genişleterek daha fazla ayrıntı veya ilgili bilgi ekle. Görev: "${task}". Orijinal içerik: "${text}". Sadece genişletilmiş içeriği döndür.`;
      } else if (task.toLowerCase().includes("dilbilgisini düzelt")) {
        userQuery = `Aşağıdaki not içeriğindeki dilbilgisi hatalarını düzelt ve ifadeyi geliştir: "${text}". Sadece düzeltilmiş içeriği döndür.`;
      } else if (task.toLowerCase().includes("özetle")) {
         userQuery = `Aşağıdaki metnin kısa ve öz bir özetini (yaklaşık 2-3 cümle) yap: "${text}". Sadece özeti döndür.`;
      }
    }
  } else { 
    userQuery = `"${task}" görevini şu metin üzerinde gerçekleştir: "${text}". Sadece sonuç metnini döndür.`;
  }
  
  const fullPrompt = `${baseInstruction}\n\nKullanıcının isteği:\n${userQuery}`;
  
  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: AI_MODEL_TEXT,
      contents: fullPrompt,
    });
    let suggestion = response.text.trim();
    
    if (suggestion.startsWith('"') && suggestion.endsWith('"')) {
        suggestion = suggestion.substring(1, suggestion.length - 1);
    }
    if (suggestion.startsWith("'") && suggestion.endsWith("'")) {
        suggestion = suggestion.substring(1, suggestion.length - 1);
    }
    suggestion = suggestion.replace(/^#+\s*/, '');

    if (!suggestion.trim()) {
        throw new Error(`AI, belirtilen görev ("${task}") için bir öneri döndürmedi. Lütfen tekrar deneyin veya görevi farklı şekilde ifade edin.`);
    }
    
    return suggestion;
  } catch (error) {
    throw handleError(error, `AI yardımı (${task})`);
  }
};

export const summarizeTextWithAI = async (text: string): Promise<string> => {
  const client = getAiClient();
  const prompt = `Lütfen aşağıdaki metni kısa ve öz bir şekilde özetle (yaklaşık 2-3 cümle). Sadece özet metnini döndür, başına "İşte özet:" gibi ifadeler ekleme.:\n\n"${text}"`;
  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: AI_MODEL_TEXT,
      contents: prompt,
    });
    let summary = response.text.trim();
    if (summary.startsWith('"') && summary.endsWith('"')) {
        summary = summary.substring(1, summary.length - 1);
    }
    if (!summary.trim()) {
        throw new Error("AI metni özetleyemedi. Lütfen tekrar deneyin.");
    }
    return summary;
  } catch (error) {
    throw handleError(error, "metin özetleme");
  }
};

const formatNotesForContext = (notes: Note[], forChatOrVoice: 'chat' | 'voice' = 'chat'): string => {
  let context = "";
  if (forChatOrVoice === 'chat') {
    context = "Kullanıcının mevcut notları aşağıdadır (en yeniden eskiye sıralı):\n\n";
  } else { // 'voice' for simplified note creation
    context = notes.length > 0 ? "Kullanıcının mevcut notlarından bazı başlıklar ve kategoriler (referans için, en yeniden eskiye, KATEGORİ ÇIKARIMI İÇİN KULLANIN):\n" : "Kullanıcının henüz bir notu yok.\n";
  }
  
  const notesToInclude = notes.slice(0, forChatOrVoice === 'voice' ? 5 : MAX_NOTES_FOR_AI_CONTEXT); 

  notesToInclude.forEach((note, index) => {
    if (forChatOrVoice === 'voice') {
        context += `- Başlık: "${note.title}", Kategori: "${note.category}"\n`;
    } else { // 'chat'
        const contentSnippet = note.content.length > MAX_NOTE_CONTENT_FOR_AI_CONTEXT 
        ? note.content.substring(0, MAX_NOTE_CONTENT_FOR_AI_CONTEXT) + "..."
        : note.content;
        context += `Not ${index + 1}:\n`;
        context += `  Başlık: ${note.title}\n`;
        context += `  Kategori: ${note.category}\n`;
        context += `  İçerik: ${contentSnippet}\n`;
        context += `  Oluşturulma Tarihi: ${new Date(note.createdAt).toLocaleDateString('tr-TR')}\n`;
        if (note.linkUrl) context += `  Bağlantı: ${note.linkUrl}\n`;
        context += "\n";
    }
  });
  if (forChatOrVoice === 'voice' && notes.length > 0) context += "\n";

  if (notes.length > MAX_NOTES_FOR_AI_CONTEXT && forChatOrVoice === 'chat') {
    context += `(ve ${notes.length - MAX_NOTES_FOR_AI_CONTEXT} daha fazla not mevcut)\n`;
  }
  return context;
};

let chatInstance: Chat | null = null;

export const startOrContinueChat = async ( 
  userMessage: string, 
  allNotes: Note[],
  chatHistory: AiChatMessage[] 
): Promise<string> => {
  const client = getAiClient();
  
  const systemInstruction = `Sen kullanıcının notlarını yönetmesine yardımcı olan bir yapay zeka asistanısın. Kullanıcının sorularını, sağlanan not bağlamına göre yanıtla. Notlarla ilgili sorular sorabilirler, örneğin belirli bir bilgiyi bulma veya genel tavsiye isteyebilirler. Kısa ve öz yanıtlar ver. En son notlar en üstte olacak şekilde notlar listelenmiştir. \n\n${formatNotesForContext(allNotes, 'chat')}`;

  const sdkHistoryForInitialization: Content[] = chatHistory.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model', 
    parts: [{ text: msg.text }]
  }));
  
  if (!chatInstance) {
    chatInstance = client.chats.create({
      model: AI_MODEL_TEXT,
      config: { systemInstruction },
      history: sdkHistoryForInitialization
    });
  }

  try {
    const response: GenerateContentResponse = await chatInstance.sendMessage({message: userMessage});
    return response.text;
  } catch (error) {
    console.error("Error in AI chat:", error);
    chatInstance = null; 
    const err = handleError(error, "AI sohbet");
    return err.message; // Return the error message string for chat
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
  const notesContext = formatNotesForContext(allNotes, 'chat');
  const systemInstruction = `Sen kullanıcının notlarını yönetmesine yardımcı olan bir yapay zeka asistanısın. Kullanıcının sorularını, sağlanan not bağlamına göre yanıtla. Notlarla ilgili sorular sorabilirler, örneğin belirli bir bilgiyi bulma veya genel tavsiye isteyebilirler. Kısa ve öz yanıtlar ver. En son notlar en üstte olacak şekilde notlar listelenmiştir. \n\n${notesContext}`;

  const sdkMappedHistoryForInitialization: Content[] = chatHistoryFromUI.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }] 
  }));

  if (!chatInstance) {
    chatInstance = client.chats.create({
      model: AI_MODEL_TEXT,
      config: { systemInstruction },
      history: sdkMappedHistoryForInitialization 
    });
  }

  try {
    const responseStreamIterator: AsyncIterable<GenerateContentResponse> = await chatInstance.sendMessageStream({ message: userMessage });
    for await (const chunk of responseStreamIterator) { 
      onChunk(chunk.text);
    }
    onComplete();
  } catch (error) {
    console.error("Error in streaming AI chat:", error);
    chatInstance = null; 
    onError(handleError(error, "AI sohbet (streaming)"));
  }
};

export const resetChat = () => {
    chatInstance = null;
};


export const processVoiceCommand = async (transcript: string, currentNotes: Note[]): Promise<VoiceCommandResponse | null> => {
  const client = getAiClient();
  const notesContextForVoice = formatNotesForContext(currentNotes, 'voice');
  const availableCategoriesString = DEFAULT_CATEGORIES.join(', ');

  const systemInstruction = `Sen bir not alma uygulaması için sesli komutları işleyen, YARATICI bir yapay zeka asistanısın.
Görevin, kullanıcının konuşmasını analiz ederek aşağıdaki formatta bir JSON nesnesi oluşturmaktır.
SADECE JSON nesnesini döndür. Başına veya sonuna \`\`\`json \`\`\` veya başka bir metin EKLEME.

JSON ÇIKTI FORMATI:
{
  "title": "YARATICI VE İÇERİKTEN FARKLI BAŞLIK",
  "content": "KULLANICININ İFADESİ VEYA NOTUN ÖZÜ",
  "category": "UYGUN KATEGORİ"
}

ANAHTAR KURALLAR:
1.  İÇERİK (content): Kullanıcının söylediği ifadeyi (ne kadar kısa olursa olsun, TEK BİR KELİME bile) doğrudan 'content' alanına yaz.
    *   Eğer kullanıcı "not oluştur" gibi genel bir komut verirse veya hiçbir şey söylemezse, 'content' için "Bu not sesli komutla oluşturuldu. Detaylar kullanıcı tarafından belirtilmedi." gibi bir ifade kullan.

2.  BAŞLIK (title): BU EN ÖNEMLİ KISIMDIR! 'title' alanı, yukarıda belirlediğin 'content' alanından KESİNLİKLE FARKLI OLMALIDIR.
    *   Başlık, içeriği KOPYALAMAMALI; onunla ilgili YARATICI, ÖZETLEYİCİ veya BAĞLAMSAL bir ifade sunmalıdır.
    *   Kullanıcı girdisi kısaysa (1-3 kelime), bu fark daha da önemlidir. Başlık, içeriğin yeniden yazılmış hali olmamalıdır.
    *   ÖRNEKLER:
        *   KÖTÜ BAŞLIK (İçerikle Aynı/Çok Benzer - BUNU YAPMA!):
            *   content: "Süt al" -> title: "Süt al" (YANLIŞ!)
            *   content: "Toplantı yarın" -> title: "Yarınki toplantı" (YANLIŞ!)
        *   İYİ BAŞLIK (İçerikten Farklı ve Yaratıcı - BUNU HEDEFLE!):
            *   content: "Süt al" -> title: "Market Alışverişi Hatırlatması" VEYA "Alınacaklar Listesi"
            *   content: "Proje toplantısı yarın 10'da" -> title: "Önemli Takvim Etkinliği" VEYA "Yarının Gündemi"
            *   content: "Kitap" (Tek kelime) -> title: "Okuma Listesi Notu" VEYA "Kitaplarla İlgili Fikir"
            *   content: "Spor" (Tek kelime) -> title: "Fiziksel Aktivite Planı" VEYA "Egzersiz Programı"
            *   content: "Acil" (Tek kelime) -> title: "Önemli Uyarı" VEYA "Acil Durum Notu"

3.  KATEGORİ (category): Kullanıcının konuşmasından şu kategorilerden birini (${availableCategoriesString}) çıkar veya uygun bir tane bul. Bulamazsan, emin değilsen veya belirtilmemişse HER ZAMAN "General" kullan.

4.  HER ZAMAN yukarıdaki 3 alanı da içeren geçerli bir JSON döndür. Boş veya eksik alanlı JSON döndürme.

Amacın, kullanıcıya değer katan, düşünülmüş notlar oluşturmaktır. Basit bir tekrar yapma. Konuşmanın genel anlamından bu bilgileri kendin belirle.
${notesContextForVoice}
`;

  const userPrompt = `Kullanıcı konuşması: "${transcript}"`;

  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: AI_MODEL_TEXT,
      contents: userPrompt, 
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    let commandData: SimplifiedNoteDataFromAI;
    try {
      commandData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI JSON response for voice command:", parseError, "Raw response:", jsonStr);
      const fallbackActions: VoiceAction[] = [{
        type: 'createNote',
        title: transcript.substring(0, 30) + (transcript.length > 30 ? "..." : ""),
        content: transcript,
        category: 'General'
      }, {
        type: 'clarify',
        message: `Yapay zeka sesli komut yanıtı anlaşılamadı, ancak notunuz ham konuşmanızdan oluşturuldu. Yanıt: ${jsonStr}`
      }];
      return { actions: fallbackActions };
    }
    
    const actions: VoiceAction[] = [];

    if (commandData && (commandData.title || commandData.content)) {
      const title = commandData.title?.trim() || commandData.content?.substring(0, 30) + (commandData.content && commandData.content.length > 30 ? "..." : "") || "Başlıksız Not";
      const content = commandData.content?.trim() || commandData.title?.trim() || "İçerik Belirtilmedi";
      const category = commandData.category?.trim() || 'General';

      if (!title && !content) { 
          actions.push({
            type: 'clarify',
            message: 'Anlamlı bir not başlığı veya içeriği algılayamadım. Lütfen ne istediğinizi daha net söyler misiniz?'
          } as ClarifyAction);
      } else {
        let finalTitle = title;
        if (title.toLowerCase() === content.toLowerCase() && title.length > 0) {
            finalTitle = "Sesli Komut Notu: " + title; 
        }

        actions.push({
          type: 'createNote',
          title: finalTitle,
          content: content,
          category: DEFAULT_CATEGORIES.includes(category as any) ? category : 'General',
        } as CreateNoteAction);
      }
    } else {
      actions.push({
        type: 'noActionDetected',
        message: 'Anlamlı bir not başlığı veya içeriği algılayamadım. Not oluşturmak için ne istediğinizi söyler misiniz?'
      } as NoActionDetectedAction);
    }

    return { actions };

  } catch (error) {
    const err = handleError(error, "sesli komut işleme");
    const fallbackActions: VoiceAction[] = [{
        type: 'createNote',
        title: transcript.substring(0, 30) + (transcript.length > 30 ? "..." : ""),
        content: transcript,
        category: 'General'
    }, {
        type: 'clarify',
        message: `${err.message}. Notunuz ham konuşmanızdan oluşturuldu.`
    }];
    return { actions: fallbackActions };
  }
};
