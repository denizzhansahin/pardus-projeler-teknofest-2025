import { GoogleGenAI } from "@google/genai";
import { Model, Message, AIResponse } from '../types';

// process.env.API_KEY kontrolü kaldırıldı, localStorage kullanılacak

const getApiKey = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('API_KEY') || '';
  }
  return '';
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

const getSystemInstruction = (fileSystemState: string, currentPath: string) => `
Sen, 'Pardus Asistanı' adında, Pardus işletim sistemi (Debian tabanlı) ve Python konusunda uzman bir AI'sın.
Görevin, kullanıcının isteklerini analiz etmek, bir eylem planı oluşturmak ve bu planı gerçekleştirmek için Python betikleri üretmektir. Pardus'un komut satırı araçlarına ve yapısına hakimsin.

TEMEL PRENSİPLER:
1.  **Sistem Bilinci:** Her zaman bir Pardus sistemi üzerinde çalıştığını unutma. Bu, \`apt\` ile paket yönetimi, \`/etc/\` altındaki yapılandırma dosyaları ve genel Debian mimarisi anlamına gelir.
2.  **Güvenlik Önce Gelir:** Ürettiğin kod, kullanıcı tarafından onaylanacaktır. Tehlikeli olabilecek (\`rm -rf\` gibi) veya \`sudo\` gerektiren komutlar için kullanıcıyı kod içindeki yorumlarla veya print ifadeleriyle açıkça uyar.
3.  **Geri Bildirim Döngüsü:** Bir önceki komutun çıktısını (stdout/stderr) bir sonraki istemde bilgi olarak verilecektir. Bu çıktıyı kullanarak bir sonraki adımını planla. \`apt install\` komutu hata verirse, hatayı analiz et ve \`apt update\` çalıştırmayı öner.
4.  **Planlı Hareket Et:** Karmaşık görevleri adımlara böl. Düşünce sürecini ('''...''') bloğunda bu planı içerecek şekilde açıkla.

KULLANABİLECEĞİN ARAÇLAR (PYTHON MODÜLLERİ):
- \`os\`: Dosya/dizin işlemleri için.
- \`subprocess\`: \`apt\`, \`ls\`, \`systemctl\`, \`git\` gibi harici Pardus komutlarını çalıştırmak için.
- \`shutil\`: Dosya kopyalama/taşıma/silme (\`shutil.rmtree\`) için.
- \`requests\`: Web'den veri çekmek için.
- \`gitpython\`: Git repolarını programatik olarak yönetmek için (\`from git import Repo\`).

CEVAP FORMATIN:
- **Eylem Gerekiyorsa:** Cevabını HER ZAMAN tek bir Python kod bloğu (\`\`\`python ... \`\`\`) içinde ver. Kodun başında planı ve açıklamayı üç tırnak (''') bloğunda belirt.
- **Sohbet Gerekiyorsa:** Kullanıcıya bir soru sorman veya bilgi vermen gerekiyorsa, kod bloğu olmadan sade metin olarak cevap ver.

// ÖRNEK İSTEK: "Pardus sistemime 'htop' aracını kur."
// ÖRNEK CEVAP: Kodun başında '''Plan: ... Kod Açıklaması: ...''' bloğu ve ardından Python kodu olacak şekilde tek bir python kod bloğu döndür.
`;

export const generateResponse = async (
  model: Model,
  prompt: string,
  history: Message[],
  vfsState: string,
  currentPath: string
): Promise<AIResponse> => {
  try {
    const geminiModel = ai.models.generateContent;
    const result = await geminiModel({
      model: model,
      contents: `Kullanıcı istemi: "${prompt}"`,
      config: {
        systemInstruction: getSystemInstruction(vfsState, currentPath),
        responseMimeType: "application/json",
        temperature: 0.1, // Hassasiyet için çok düşük sıcaklık
        topP: 0.9,
        topK: 30,
        thinkingConfig: { thinkingBudget: 0 } // CLI benzeri his için hızlı yanıt
      },
    });

    const responseText = result.text.trim();
    
    // The AI might still wrap the JSON in markdown fences.
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = responseText.match(fenceRegex);
    const jsonStr = match && match[2] ? match[2].trim() : responseText;
    
    const parsedData = JSON.parse(jsonStr);
    return parsedData as AIResponse;

  } catch (error) {
    console.error("Gemini API çağrısı başarısız oldu:", error);
    let rawResponse = '';
    if (error instanceof Error) {
        // Try to find the raw text if it's a response error
        const anyError = error as any;
        if(anyError.response && anyError.response.text) {
            rawResponse = anyError.response.text;
        } else if (anyError.message.includes('JSON')) {
            // If it's a JSON parse error, the raw text is likely what we tried to parse
            rawResponse = (error.message.split('Raw response: "')[1] || '').slice(0, -1);
        }
       throw new Error(`Yapay zeka yanıtı ayrıştırılamadı: ${error.message}. Ham yanıt: "${rawResponse}"`);
    }
    throw error;
  }
};