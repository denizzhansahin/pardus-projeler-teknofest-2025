import { GoogleGenAI, GenerateContentResponse, Part, Content } from "@google/genai";
import { GroundingSource } from "../types";

// API anahtarı önce localStorage'dan, yoksa env'den alınır
function getGeminiApiKey(): string | undefined {
  let localKey;
  if (typeof window !== 'undefined') {
    localKey = localStorage.getItem('geminiApiKey');
    console.log('[GeminiService] localStorage geminiApiKey:', localKey);
    if (localKey && localKey.trim().length > 0) return localKey.trim();
  }
  let viteKey;
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env.VITE_API_KEY) {
    viteKey = (import.meta as any).env.VITE_API_KEY;
    console.log('[GeminiService] import.meta.env.VITE_API_KEY:', viteKey);
    return viteKey;
  }
  let processKey;
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    processKey = process.env.API_KEY;
    console.log('[GeminiService] process.env.API_KEY:', processKey);
    return processKey;
  }
  console.warn('[GeminiService] API anahtarı bulunamadı!');
  return undefined;
}

const TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';
const IMAGE_MODEL = 'imagen-3.0-generate-002'; // For image generation only

interface GenerateContentParams {
  prompt: string;
  imageBase64?: string;
  imageMimeType?: string;
  audioBase64?: string;
  audioMimeType?: string;
  useGoogleSearch?: boolean;
}

interface GenerateContentResult {
  text: string | null;
  error?: string;
  groundingSources?: GroundingSource[];
}

export const generateContent = async ({
  prompt,
  imageBase64,
  imageMimeType,
  audioBase64,
  audioMimeType,
  useGoogleSearch = false,
}: GenerateContentParams): Promise<GenerateContentResult> => {
  console.log('[GeminiService] generateContent çağrıldı, prompt:', prompt);
  try {
    const apiKey = getGeminiApiKey();
    console.log('[GeminiService] generateContent apiKey:', apiKey);
    if (!apiKey) {
      console.error('[GeminiService] generateContent: API anahtarı bulunamadı!');
      return { text: null, error: "Gemini API anahtarı bulunamadı." };
    }
    const ai = new GoogleGenAI({ apiKey });
    const parts: Part[] = [];

    if (imageBase64 && imageMimeType) {
      parts.push({ 
        inlineData: {
          mimeType: imageMimeType,
          data: imageBase64,
        },
      });
    }

    if (audioBase64 && audioMimeType) {
      parts.push({
        inlineData: {
          mimeType: audioMimeType,
          data: audioBase64,
        }
      });
    }
    
    // Add text prompt last, or only text if no media
     if (prompt || parts.length === 0) { // Ensure prompt is added if it exists, or if no media, prompt is required
        parts.push({ text: prompt });
    }


    if (parts.length === 0) {
        return {
            text: null,
            error: "No content provided to generate.",
        };
    }
    
    const contents: Content = { parts };
    
    const modelConfig: any = {
      // thinkingConfig: { thinkingBudget: 0 } 
    };

    if (useGoogleSearch) {
      modelConfig.tools = [{googleSearch: {}}];
      // Note: As per guidelines, if googleSearch is used, responseMimeType should not be application/json.
      // And also, thinkingConfig might not be compatible.
      // For now, assuming TEXT_MODEL default behavior with search.
    }


    const response: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: contents,
      config: Object.keys(modelConfig).length > 0 ? modelConfig : undefined,
    });

    const text = response.text;
    let groundingSources: GroundingSource[] | undefined = undefined;

    if (useGoogleSearch && response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        groundingSources = response.candidates[0].groundingMetadata.groundingChunks
            .filter(chunk => chunk.web && chunk.web.uri && chunk.web.title)
            .map(chunk => ({
                uri: chunk.web!.uri!,
                title: chunk.web!.title!,
            }));
    }

    return { text: text ?? null, groundingSources };

  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    // Attempt to parse more specific Gemini API error details if available
    let errorMessage = "An unknown error occurred with the AI service.";
    if (error.message) {
        errorMessage = error.message;
    }
    // if (error.error && error.error.message) { // For specific GoogleGenAIError structure
    //    errorMessage = error.error.message;
    // } else if (error.message) {
    //    errorMessage = error.message;
    // }
    return {
      text: null,
      error: errorMessage,
    };
  }
};

export const fileToBase64 = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove "data:mime/type;base64," prefix
    };
    reader.onerror = (error) => reject(error);
  });
};

// Simplified alias for clarity, as fileToBase64 already handles Blobs
export const blobToBase64 = fileToBase64;
