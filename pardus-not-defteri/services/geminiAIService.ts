// IMPORTANT: This service SIMULATES calls to the Gemini API.
// It uses the prescribed structures and types but returns mock data.
// The API_KEY is expected to be available as process.env.API_KEY.
// For this example, we'll assume process.env.API_KEY is somehow available.

import { GoogleGenAI, GenerateContentResponse, Chat, Part, Content } from '@google/genai';
import { Note, AIContentRequest, AIChatMessage } from '../types';
import { GEMINI_TEXT_MODEL } from '../constants';

// Mock process.env.API_KEY for environments where it's not set by a build tool
const API_KEY = (typeof process !== 'undefined' && process.env && process.env.API_KEY)
                ? process.env.API_KEY
                // Use a valid-looking placeholder for the mock, but it won't be used for actual calls.
                : "MOCK_API_KEY_DO_NOT_USE_FOR_REAL_REQUESTS"; 

if (API_KEY === "MOCK_API_KEY_DO_NOT_USE_FOR_REAL_REQUESTS") {
  console.warn(
    "GeminiAIService: Using a placeholder API key for simulation. " +
    "Ensure process.env.API_KEY is set in your environment for actual API calls."
  );
}

// Local interface for mock function parameters
interface MockGenerateContentParameters {
  model: string;
  contents: string | (string | Part)[] | Content; // This is the key type
  config?: any; // Keeping config flexible for the mock
}


let ai: GoogleGenAI;

try {
  // @ts-ignore - GoogleGenAI might not be globally available if SDK not fully loaded/mocked
  if (typeof GoogleGenAI !== 'undefined') {
     ai = new GoogleGenAI({ apiKey: API_KEY });
  } else {
    throw new Error('@google/genai SDK not found, using full simulation.');
  }
} catch (error) {
  console.warn("Simulating GoogleGenAI client as @google/genai SDK is not fully available or API key is placeholder. All API calls will be mocked.");
  
  // Basic mock of the AI client structure
  ai = {
    // @ts-ignore
    models: {
      generateContent: async (params: MockGenerateContentParameters): Promise<GenerateContentResponse> => {
        console.log("SIMULATED Gemini API Call: generateContent with params:", params);
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        let textResponse = "This is a simulated AI response. ";
        
        const { contents } = params; 
        let promptForLog = "";

        if (typeof contents === 'string') {
          promptForLog = contents;
        } else if (Array.isArray(contents)) { // contents is (string | Part)[]
            let combinedText = "";
            for (const item of contents) {
                if (typeof item === 'string') {
                    combinedText += item + " ";
                } else if ('text' in item && typeof item.text === 'string') { // item is Part, check for TextPart
                    combinedText += item.text + " ";
                }
            }
            promptForLog = combinedText.trim();
        } else { // contents is Content (i.e. { parts: Part[], role?: string })
            // After type checks, 'contents' is inferred as 'Content' here
            const textPartFound = contents.parts.find((p): p is { text: string } => 'text' in p && typeof p.text === 'string');
            if (textPartFound) {
              promptForLog = textPartFound.text;
            }
        }
        
        if (promptForLog) {
            textResponse += `Received prompt: "${promptForLog.substring(0,50)}..."`;
        }
        
        if (params.config?.responseMimeType === "application/json") {
            const jsonResponse = {
                simulatedData: "This is simulated JSON data.",
                promptReceived: promptForLog || "Complex input"
            };
            textResponse = `\`\`\`json\n${JSON.stringify(jsonResponse, null, 2)}\n\`\`\``;
        }

        return {
          text: textResponse,
          // @ts-ignore
          candidates: [{ 
            content: { parts: [{ text: textResponse }], role: 'model' },
            finishReason: 'STOP',
            index: 0,
            safetyRatings: [],
          }],
          // @ts-ignore
          promptFeedback: { safetyRatings: [] }
        } as GenerateContentResponse;
      },
      generateContentStream: async (params: MockGenerateContentParameters): Promise<AsyncGenerator<GenerateContentResponse, any, unknown>> => {
        console.log("SIMULATED Gemini API Call: generateContentStream with params:", params);
        
        const { contents } = params;
        let promptText = "Complex input";

        if (typeof contents === 'string') {
          promptText = contents;
        } else if (Array.isArray(contents)) { // contents is (string | Part)[]
            let combinedText = "";
            for (const item of contents) {
                if (typeof item === 'string') {
                    combinedText += item + " ";
                } else if ('text' in item && typeof item.text === 'string') {
                    combinedText += item.text + " ";
                }
            }
            promptText = combinedText.trim() || "Complex input";
        } else { // contents is Content
            // After type checks, 'contents' is inferred as 'Content' here
            const textPartFound = contents.parts.find((p): p is { text: string } => 'text' in p && typeof p.text === 'string');
            if (textPartFound) {
              promptText = textPartFound.text;
            }
        }

        async function* streamGenerator() {
            const words = `This is a simulated streaming AI response to: "${promptText.substring(0,50)}...". It comes in chunks.`.split(' ');
            for (const word of words) {
              await new Promise(resolve => setTimeout(resolve, 100));
              yield { text: word + ' ' } as GenerateContentResponse;
            }
        }
        return streamGenerator(); // Return the async generator instance
      }
    },
    // @ts-ignore
    chats: {
      create: (params: { model: string, config?: any, history?: Content[] }): Chat => {
        console.log("SIMULATED Gemini API Chat Create with params:", params);
        const chatHistory: Content[] = params.history || [];
        // @ts-ignore
        return {
          sendMessage: async (messageParams: {message: string} | {parts: Part[]}) => {
            const userMessageText = 'message' in messageParams ? messageParams.message : 
                                       (messageParams.parts.find((p): p is { text: string } => 'text' in p)?.text || "Complex input");
            chatHistory.push({ role: 'user', parts: [{text: userMessageText}] });
            console.log("SIMULATED Gemini API Chat SendMessage:", userMessageText);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const aiResponseText = `Simulated AI chat response to: "${userMessageText.substring(0,50)}..."`;
            chatHistory.push({ role: 'model', parts: [{text: aiResponseText}] });
            // @ts-ignore
            return { text: aiResponseText } as GenerateContentResponse;
          },
          sendMessageStream: async function* (messageParams: {message: string} | {parts: Part[]}) {
             const userMessageText = 'message' in messageParams ? messageParams.message : 
                                       (messageParams.parts.find((p): p is { text: string } => 'text' in p)?.text || "Complex input");

            chatHistory.push({ role: 'user', parts: [{text: userMessageText}] });
            console.log("SIMULATED Gemini API Chat SendMessageStream:", userMessageText);
            const words = `Simulated streaming AI chat response to: "${userMessageText.substring(0,50)}...".`.split(' ');
            let fullStreamedResponse = "";
            for (const word of words) {
              await new Promise(resolve => setTimeout(resolve, 100));
              fullStreamedResponse += word + " ";
              // @ts-ignore
              yield { text: word + ' ' } as GenerateContentResponse;
            }
             chatHistory.push({ role: 'model', parts: [{text: fullStreamedResponse.trim()}] });
          },
          // @ts-ignore
          getHistory: async () => chatHistory,
        } as Chat;
      }
    }
  };
}


const generateText = async (prompt: string, systemInstruction?: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        ...(systemInstruction && { systemInstruction }),
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text (simulated):", error);
    return "Simulated AI error: Could not generate text.";
  }
};

export const getAIContent = async (request: AIContentRequest): Promise<string> => {
  let prompt = "";
  let systemInstruction = "You are a helpful writing assistant.";

  switch (request.type) {
    case 'summarize':
      prompt = `Summarize the following note content in 3-5 key bullet points:\n\n${request.noteContent}`;
      systemInstruction = "You are an expert summarizer. Provide concise summaries.";
      break;
    case 'suggest':
      prompt = `Review the following note content and provide 3 actionable suggestions to improve its clarity, completeness, or impact. Be specific:\n\n${request.noteContent}`;
      systemInstruction = "You are an expert editor. Provide constructive feedback.";
      break;
    case 'plan':
      prompt = `Based on the following note content, create a simple step-by-step action plan with 3-5 steps:\n\n${request.noteContent}`;
      systemInstruction = "You are an expert planner. Create clear and actionable plans.";
      break;
    default:
      return "Invalid AI request type (simulated).";
  }
  return generateText(prompt, systemInstruction);
};

export const getNoteSummaryForSpeech = async (noteContent: string): Promise<string> => {
  const prompt = `Provide a very brief, spoken-word friendly summary of the following note, suitable for text-to-speech. Focus on the main topic or key items. Keep it under 25 words if possible:\n\n${noteContent.replace(/<[^>]+>/g, ' ').substring(0, 500)}`; // Sanitize and limit length
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        systemInstruction: "You are an assistant that provides extremely concise summaries for audio playback.",
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating speech summary (simulated):", error);
    return "Simulated AI error: Could not generate summary for speech.";
  }
};


let chatInstance: Chat | null = null;

const initializeChat = (allNotes: Note[], systemInstruction: string) => {
  const notesContext = allNotes.map(note => `Note Title: ${note.title}\nContent:\n${note.content.replace(/<[^>]+>/g, ' ').substring(0, 200)}...\n---`).join('\n');
  const fullSystemInstruction = `${systemInstruction}\n\nYou have access to the user's notes. Here is a summary of their notes:\n${notesContext}\n\nAnswer questions based on this information. If the information is not in the notes, say so.`;
  
  chatInstance = ai.chats.create({
    model: GEMINI_TEXT_MODEL,
    config: { systemInstruction: fullSystemInstruction },
  });
};


export const chatWithAI = async (message: string, allNotes: Note[]): Promise<AIChatMessage> => {
  if (!chatInstance) {
    initializeChat(allNotes, "You are a helpful AI assistant for the IntelliNote app.");
  }

  try {
    if (!chatInstance) throw new Error("Chat not initialized"); 
    const response: GenerateContentResponse = await chatInstance.sendMessage({message});
    return {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: response.text,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Error in AI chat (simulated):", error);
    return {
      id: `ai-err-${Date.now()}`,
      sender: 'ai',
      text: "Simulated AI error: Could not get response.", // Completed error message
      timestamp: Date.now(), // Added missing timestamp
    };
  }
};

export async function* streamChatWithAI(message: string, allNotes: Note[]): AsyncGenerator<GenerateContentResponse, void, undefined> {
  if (!chatInstance || typeof chatInstance.getHistory !== 'function' // Basic check if chatInstance might be from a different session / needs re-init with new notes context
    // A more robust check might involve comparing the notes context used for initialization
  ) { 
    initializeChat(allNotes, "You are a helpful AI assistant for the IntelliNote app, responding in a stream.");
  }

  if (!chatInstance) { 
    console.error("Chat not initialized for streaming.");
    yield { text: "Simulated AI error: Chat not initialized for streaming." } as GenerateContentResponse; 
    return;
  }

  try {
    const stream = await chatInstance.sendMessageStream({ message });
    for await (const chunk of stream) { // chunk is GenerateContentResponse
      yield chunk;
    }
  } catch (error) {
    console.error("Error in AI streaming chat (simulated):", error);
    yield { text: "Simulated AI error: Could not stream chat response." } as GenerateContentResponse;
  }
}