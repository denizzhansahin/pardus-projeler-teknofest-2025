import { GoogleGenAI } from "@google/genai";
import { getStoredApiKey } from '../components/SettingsModal';

function getAIInstance() {
    const apiKey = getStoredApiKey();
    if (!apiKey) {
        throw new Error("API anahtarı ayarlanmamış. Lütfen ayarlar menüsünden API anahtarınızı girin.");
    }
    return new GoogleGenAI({ apiKey });
}

export async function urlToBase64(url: string): Promise<{ base64Data: string; mimeType: string }> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const blob = await response.blob();
    const mimeType = blob.type;
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            if (!base64String) {
                reject(new Error("Failed to convert image to Base64"));
                return;
            }
            resolve({ base64Data: base64String, mimeType });
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
    });
}

export async function describeImage(base64Data: string, mimeType: string): Promise<string> {
    try {
        const ai = getAIInstance();
        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType,
            },
        };
        const textPart = {
            text: "Describe this image for an AI image generator. Be highly detailed and evocative. Mention the artistic style, subject matter, colors, lighting, composition, and overall mood. Your description will be used as a foundation to create a new, similar image."
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-04-17',
            contents: { parts: [imagePart, textPart] },
             config: {
                temperature: 0.3,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });

        return (response.text ?? '').trim();
    } catch (error) {
        console.error("Error describing image:", error);
        throw new Error("Görsel analiz edilirken bir hata oluştu.");
    }
}


export async function translatePrompt(prompt: string): Promise<string> {
    if (!prompt.trim()) {
        return "";
    }
    try {
        const ai = getAIInstance();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                systemInstruction: "Translate the following Turkish text to English for an AI image generator. The translation should be descriptive and clear, capturing the essence of the original text. Return only the translated English text, without any additional comments, preambles, or quotation marks.",
                temperature: 0.2,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return (response.text ?? '').trim();
    } catch (error) {
        console.error("Error translating prompt:", error);
        return prompt;
    }
}

export async function generateImage(prompt: string): Promise<string> {
    try {
        const ai = getAIInstance();
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: `masterpiece, best quality, ultra-detailed, 8k, ${prompt}`,
            config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
        });

        if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0]?.image?.imageBytes) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes ?? '';
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error: any) {
        let extra = '';
        if (error?.message) extra = error.message;
        if (error?.response && typeof error.response === 'object') {
            try {
                extra += '\n' + JSON.stringify(error.response);
            } catch {}
        }
        // Google API'den gelen özel hata mesajı için kullanıcıya Türkçe açıklama
        if (extra.includes('Imagen API is only accessible to billed users')) {
            throw new Error('Google Imagen API sadece ücretli (billed) Google Cloud hesaplarında kullanılabilir. Lütfen Google Cloud hesabınızda faturalandırmayı etkinleştirin.\nDetay: ' + extra);
        }
        console.error("Error generating image:", error);
        throw new Error("Görsel oluşturulurken bir hata oluştu. " + (extra ? `Detay: ${extra}` : "Lütfen daha sonra tekrar deneyin."));
    }
}

export async function enhancePrompt(prompt: string): Promise<string> {
    if (!prompt.trim()) {
        return "";
    }
    try {
        const ai = getAIInstance();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
            config: {
                systemInstruction: "You are a creative assistant. Rewrite the user's prompt to be more descriptive, vivid, and imaginative for an AI image generator. Focus on details, lighting, atmosphere, and artistic style. Return only the enhanced prompt text, without any preamble or explanation. The response must be in Turkish.",
            }
        });
        return (response.text ?? '').trim();
    } catch (error) {
        console.error("Error enhancing prompt:", error);
        throw new Error("Prompt geliştirilirken bir hata oluştu.");
    }
}

export async function getPromptIdeas(prompt: string): Promise<string[]> {
    if (!prompt.trim()) {
        return [];
    }
    try {
        const ai = getAIInstance();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: `Kullanıcının şu istemine dayanarak 5 tane yaratıcı ve alternatif yeni istem fikri oluştur: "${prompt}"`,
            config: {
                systemInstruction: "You are an inspiration engine. Generate creative prompt ideas based on the user's input. Return the ideas as a JSON array of strings, like [\"idea1\", \"idea2\", ...]. Only return the JSON array. The ideas must be in Turkish.",
                responseMimeType: "application/json",
            },
        });
        
        let jsonStr = (response.text ?? '').trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        const ideas = JSON.parse(jsonStr);
        if (Array.isArray(ideas) && ideas.every(i => typeof i === 'string')) {
            return ideas;
        }
        return [];
    } catch (error) {
        console.error("Error getting prompt ideas:", error);
        throw new Error("Prompt fikirleri alınırken bir hata oluştu.");
    }
}