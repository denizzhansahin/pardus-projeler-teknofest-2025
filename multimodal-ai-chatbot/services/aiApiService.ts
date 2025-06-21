// services/aiApiService.ts

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

async function handleResponse(response: Response) {
  if (!response.ok) {
    let errorMsg = 'Bilinmeyen hata';
    try {
      const data = await response.json();
      errorMsg = data.error || JSON.stringify(data);
    } catch {
      errorMsg = response.statusText;
    }
    throw new Error(errorMsg);
  }
  return response;
}

export async function generateTextWithGemma(prompt: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/gemma/generate-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    await handleResponse(response);
    return response.json();
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function generateTextFromImageWithGemma(image: File, prompt: string) {
  try {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('prompt', prompt);
    const response = await fetch(`${API_BASE_URL}/gemma/generate-from-image`, {
      method: 'POST',
      body: formData,
    });
    await handleResponse(response);
    return response.json();
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function transcribeAudioWithWhisper(audio: File) {
  try {
    const formData = new FormData();
    formData.append('audio', audio);
    const response = await fetch(`${API_BASE_URL}/whisper/transcribe`, {
      method: 'POST',
      body: formData,
    });
    await handleResponse(response);
    return response.json();
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function generateSpeechWithBark(text: string, voice_preset = 'v2/tr_speaker_2') {
  try {
    const response = await fetch(`${API_BASE_URL}/bark/generate-speech`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice_preset }),
    });
    await handleResponse(response);
    return response.blob();
  } catch (e: any) {
    throw new Error(e.message);
  }
}
