import { GoogleGenAI, GenerateContentResponse, SendMessageParameters } from "@google/genai";
import { SlideOutline, ChatMessage, TextElement } from '../types';

// Always get API key and Gemini client on demand
const getGeminiClient = () => {
  if (typeof window === 'undefined') throw new Error('API anahtarı ayarlanmamış.');
  const apiKey = localStorage.getItem('pardus-gemini-api-key') || '';
  if (!apiKey) throw new Error('API anahtarı ayarlanmamış. Lütfen ayarlar menüsünden API anahtarınızı girin.');
  return new GoogleGenAI({ apiKey });
};

const parseJsonResponse = <T,>(text: string): T | null => {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Original text:", text);
    return null;
  }
};

export const generatePresentationOutline = async (prompt: string): Promise<SlideOutline[]> => {
  const ai = getGeminiClient();
  const fullPrompt = `
    You are a presentation planning expert for 'Pardus Ofis Sunum'.
    Based on the user's topic, create a structured outline for a presentation.
    The outline should be an array of JSON objects. Each object must contain 'page', 'title', and a brief 'summary'.
    The presentation should have between 3 and 7 slides.
    User Topic: "${prompt}"
    
    Example Response Format:
    [
      {"page": 1, "title": "Introduction to Topic", "summary": "A brief overview of the main subject."},
      {"page": 2, "title": "Key Point 1", "summary": "Elaboration on the first major point."},
      {"page": 3, "title": "Conclusion", "summary": "A summary of the presentation and final thoughts."}
    ]
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-04-17',
    contents: fullPrompt,
    config: {
        responseMimeType: "application/json",
    }
  });
  
  const outlines = parseJsonResponse<SlideOutline[]>(response.text ?? '');
  if (!outlines || !Array.isArray(outlines)) {
      throw new Error("AI failed to generate a valid presentation outline.");
  }
  return outlines;
};

export interface GeneratedSlideData {
    backgroundColor: string;
    elements: Omit<TextElement, 'id' | 'zIndex' | 'type' | 'italic' | 'underline' | 'rotation' | 'letterSpacing' | 'lineHeight' | 'textShadow'>[];
}

export const generateSlideDetails = async (title: string, summary: string): Promise<GeneratedSlideData> => {
    const ai = getGeminiClient();
    const fullPrompt = `
    You are a creative designer for 'Pardus Ofis Sunum'. Your task is to design a single presentation slide based on a title and summary. The slide canvas is 1280px wide and 720px high.
    Generate a JSON object with the following structure. Use the new style properties to create a more polished design.
    {
      "backgroundColor": "a modern and professional hex code (e.g., '#1E293B')",
      "elements": [
        {
          "content": "${title}",
          "position": { "top": 100, "left": 140 },
          "size": { "width": 1000, "height": 100 },
          "fontSize": 58,
          "fontWeight": "bold",
          "textAlign": "center",
          "color": "#F8FAFC",
          "fontFamily": "Inter",
          "textShadow": { "offsetX": 2, "offsetY": 2, "blur": 4, "color": "#00000080" }
        },
        {
          "content": "A well-written, concise paragraph expanding on this summary: ${summary}",
          "position": { "top": 250, "left": 240 },
          "size": { "width": 800, "height": 300 },
          "fontSize": 28,
          "fontWeight": "normal",
          "textAlign": "center",
          "color": "#F0F0F0",
          "fontFamily": "Inter",
          "lineHeight": 1.5,
          "letterSpacing": 0.05
        }
      ]
    }
    For the elements, ensure 'type' is always 'text'. Ensure all values are valid. 'position' and 'size' values must be numbers (pixels). The body text should be a well-written paragraph based on the summary, not just the summary itself.
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-04-17',
    contents: fullPrompt,
    config: {
        responseMimeType: "application/json",
    }
  });

  const details = parseJsonResponse<GeneratedSlideData>(response.text ?? '');
   if (!details || !details.elements) {
      throw new Error("AI failed to generate valid slide details.");
  }
  // Manually add properties that were removed from prompt for simplicity but have defaults
  details.elements.forEach((el: any) => {
    el.type = 'text';
    el.italic = false;
    el.underline = false;
    el.rotation = 0;
    if (!el.letterSpacing) el.letterSpacing = 0;
    if (!el.lineHeight) el.lineHeight = 1.2;
    if (!el.textShadow) el.textShadow = null;
  });
  return details;
};

export const redesignSlide = async (title: string, summary: string): Promise<GeneratedSlideData> => {
    const ai = getGeminiClient();
    const fullPrompt = `
    You are an expert creative designer for 'Pardus Ofis Sunum'. Your task is to redesign a slide with a fresh and exciting new look. The slide canvas is 1280px wide and 720px high.
    The user wants a new design. Be creative and generate a visually distinct and modern aesthetic. Avoid generic or standard layouts.
    
    The existing content is:
    - Title: "${title}"
    - Body/Summary: "${summary}"

    Generate a JSON object with a new 'backgroundColor' and new text 'elements'. The element content should be the same, but with new positions, sizes, fonts, colors, and styles.
    Example JSON response format:
    {
      "backgroundColor": "a creative and bold hex code (e.g., '#4C1D95')",
      "elements": [
        {
          "content": "${title}",
          "position": { "top": 60, "left": 80 },
          "size": { "width": 1120, "height": 120 },
          "fontSize": 64,
          "fontWeight": "black",
          "textAlign": "left",
          "color": "#F0F9FF",
          "fontFamily": "Montserrat"
        },
        {
          "content": "A well-written, concise paragraph based on the provided summary: ${summary}",
          "position": { "top": 200, "left": 80 },
          "size": { "width": 700, "height": 400 },
          "fontSize": 26,
          "fontWeight": "light",
          "textAlign": "left",
          "color": "#E0E7FF",
          "fontFamily": "Lato",
          "lineHeight": 1.6
        }
      ]
    }
    Ensure all values are valid. 'position' and 'size' values must be numbers (pixels). The body text should be a well-written paragraph based on the summary, not just the summary itself.
  `;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: fullPrompt,
        config: {
            responseMimeType: "application/json",
        }
    });

    const details = parseJsonResponse<GeneratedSlideData>(response.text ?? '');
    if (!details || !details.elements) {
        throw new Error("AI failed to generate a valid slide redesign.");
    }
    details.elements.forEach((el: any) => {
        el.type = 'text';
        el.italic = false;
        el.underline = false;
        el.rotation = 0;
        if (!el.letterSpacing) el.letterSpacing = 0;
        if (!el.lineHeight) el.lineHeight = 1.2;
        if (!el.textShadow) el.textShadow = null;
    });
    return details;
};

export const chatOnSlide = async (slideContent: string, history: ChatMessage[], newMessage: string): Promise<string> => {
    const ai = getGeminiClient();
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash-preview-04-17',
        config: {
            systemInstruction: `You are a helpful assistant for improving a presentation slide. The user is working on a slide with the following content: "${slideContent}". Help them refine it.`
        },
        history: history.map(h => ({ role: h.role, parts: [{ text: h.content }] }))
    });
    
    const response = await chat.sendMessage({ message: newMessage });
    return response.text ?? '';
}

export const generateImage = async (prompt: string): Promise<string> => {
    const ai = getGeminiClient();
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });
    if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("AI did not return an image.");
    }
    return response.generatedImages?.[0]?.image?.imageBytes ?? '';
};

export const enhanceImagePrompt = async (prompt: string): Promise<string> => {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-pro',
        contents: `Enhance this image prompt for a generative AI: ${prompt}`,
        config: { responseMimeType: 'text/plain' }
    });

    return response.text?.trim() ?? '';
};