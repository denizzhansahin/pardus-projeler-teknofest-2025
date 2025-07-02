import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Node, Edge } from 'reactflow';
import { NodeData } from '../types';

let ai: GoogleGenAI | null = null;
let apiKeyError: Error | null = null;

// API anahtarını localStorage'dan oku
const getApiKeyFromLocalStorage = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('flowmind_api_key');
    }
    return null;
};

// This function safely initializes the AI client.
// It avoids crashing the app if the API key is not set.
const getAiClient = (): GoogleGenAI => {
    if (ai) {
        return ai;
    }
    if (apiKeyError) {
        throw apiKeyError;
    }

    // API key artık localStorage'dan okunuyor
    const apiKey = getApiKeyFromLocalStorage();

    if (!apiKey) {
        console.error("API anahtarı yapılandırılmamış. Lütfen ayarlardan API anahtarınızı girin.");
        apiKeyError = new Error("API anahtarı yapılandırılmamış. Lütfen ayarlardan API anahtarınızı girin.");
        throw apiKeyError;
    }

    ai = new GoogleGenAI({ apiKey });
    return ai;
};


const parseJsonResponse = <T>(responseText: string): T => {
    let jsonStr = responseText.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    try {
        return JSON.parse(jsonStr) as T;
    } catch(e) {
        console.error("Failed to parse JSON string:", jsonStr, e);
        throw new Error("Yapay zekadan gelen yanıt JSON formatında değil. Lütfen tekrar deneyin.");
    }
}

export interface AiTaskResponse {
  newTasks: {
    id: string;
    title: string;
    description: string;
  }[];
  dependencies: {
    source: string;
    target: string;
  }[];
}

const callGemini = async (prompt: string) => {
    try {
        const client = getAiClient();
        const response: GenerateContentResponse = await client.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.3,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && (error.message.includes('API_KEY') || error.message.includes('API anahtarı'))) {
            throw new Error("API anahtarı geçersiz veya eksik. Lütfen ortam değişkenlerinizi kontrol edin.");
        }
        throw new Error("Yapay zeka servisine ulaşılamadı. Yanıt hatalı olabilir veya servis kullanılamıyor olabilir.");
    }
};


export const getTaskBreakdown = async (
  mainTask: string,
  existingNodes: Node<NodeData>[]
): Promise<AiTaskResponse> => {
  const existingTaskTitles = existingNodes.map(node => `${node.data.label} (id: ${node.id})`);

  const prompt = `
    Sen FlowMind adında uzman bir proje yöneticisi ve iş akışı optimizasyon yapay zekasısın.
    Görevin, kullanıcının üst düzey hedefini yapılandırılmış bir görev listesine ve bu görevlerin bağımlılıklarına ayırmak.

    Kullanıcının hedefi: "${mainTask}".

    İş akışında mevcut olan görevler:
    ${existingTaskTitles.length > 0 ? existingTaskTitles.join(', ') : 'Yok'}

    Lütfen bu hedefe ulaşmak için YENİ, eyleme geçirilebilir alt görevler oluştur. Her yeni görev için şunları sağla:
    1. 'kebab-case' formatında benzersiz bir 'id' (ör. 'pazarlama-materyallerini-hazirla').
    2. Kısa ve net bir 'title' (başlık).
    3. Öz, tek cümlelik bir 'description' (açıklama).

    Ardından, TÜM görevler (hem yeni hem de mevcut olanlar) arasındaki bağımlılıkları tanımla. Bir bağımlılık, bir görevin başlayabilmesi için diğerinin tamamlanması gerektiği anlamına gelir. Kaynak ve hedef için görev ID'lerini kullan.

    Yanıtını SADECE aşağıdaki yapıya sahip tek ve geçerli bir JSON nesnesi olarak sağla. JSON nesnesinin etrafında başka metin, açıklama veya markdown biçimlendirmesi ekleme.

    {
      "newTasks": [
        { "id": "gorev-id-1", "title": "Görev Başlığı 1", "description": "Açıklama 1." },
        { "id": "gorev-id-2", "title": "Görev Başlığı 2", "description": "Açıklama 2." }
      ],
      "dependencies": [
        { "source": "mevcut-veya-yeni-gorev-id-1", "target": "mevcut-veya-yeni-gorev-id-2" }
      ]
    }
  `;

  const responseText = await callGemini(prompt);
  const parsedData = parseJsonResponse<AiTaskResponse>(responseText);

  if (!parsedData.newTasks || !parsedData.dependencies) {
      throw new Error("Yapay zekadan geçersiz JSON yapısı alındı.");
  }

  return parsedData;
};

export const enhanceTask = async (taskTitle: string, taskDescription: string): Promise<{ newDescription: string }> => {
    const prompt = `
    Bir proje yönetimi asistanısın. Aşağıdaki görevin açıklamasını daha iyi hale getir.
    Açıklamayı daha detaylı, eyleme geçirilebilir adımlar içeren veya olası riskleri belirten bir hale getirerek zenginleştir.
    
    Görev Başlığı: "${taskTitle}"
    Mevcut Açıklama: "${taskDescription}"

    Yanıtını SADECE aşağıdaki yapıya sahip bir JSON nesnesi olarak sağla:
    {
      "newDescription": "Buraya yeni, zenginleştirilmiş açıklama gelecek."
    }
    `;
    const responseText = await callGemini(prompt);
    return parseJsonResponse<{ newDescription: string }>(responseText);
};

export const summarizeWorkflow = async (nodes: Node<NodeData>[], edges: Edge[]): Promise<{ summary: string }> => {
    const workflowData = nodes.map(n => ({ id: n.id, title: n.data.label, status: n.data.status }));
    const dependencies = edges.map(e => ({ from: e.source, to: e.target }));

    const prompt = `
    Sen uzman bir proje analisti olan FlowMind'sın. Aşağıdaki iş akışını analiz et ve bir özet oluştur.
    Özetinde projenin genel durumuna, ana hedefine, tamamlanan ve devam eden görevlere ve olası darboğazlara veya risklere odaklan.
    Özeti, bir proje yöneticisine sunulacak kısa bir rapor gibi yaz.

    İş Akışı Verileri:
    - Görevler: ${JSON.stringify(workflowData)}
    - Bağımlılıklar: ${JSON.stringify(dependencies)}

    Yanıtını SADECE aşağıdaki yapıya sahip bir JSON nesnesi olarak sağla:
    {
        "summary": "Buraya projenin detaylı özeti gelecek."
    }
    `;
    const responseText = await callGemini(prompt);
    return parseJsonResponse<{ summary: string }>(responseText);
};