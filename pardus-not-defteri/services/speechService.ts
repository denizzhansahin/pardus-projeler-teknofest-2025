
let utterance: SpeechSynthesisUtterance | null = null;
let currentResolve: (() => void) | null = null;
let currentReject: ((error: Error) => void) | null = null;

const cleanupSpeech = () => {
    if (utterance) {
        utterance.onend = null;
        utterance.onerror = null;
        utterance.onboundary = null; // Clear all handlers
    }
    utterance = null;
    currentResolve = null;
    currentReject = null;
};

export const speakText = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof speechSynthesis === 'undefined') {
      console.warn("Speech Synthesis API is not available.");
      return reject(new Error("Speech Synthesis API not available."));
    }

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel(); // Stop any current speech
      if (currentReject) {
        currentReject(new Error("Speech interrupted by new request."));
      }
      cleanupSpeech(); // Clean up previous utterance state
    }

    currentResolve = resolve;
    currentReject = reject;

    utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to find a Turkish voice
    const voices = speechSynthesis.getVoices();
    const turkishVoice = voices.find(v => v.lang.startsWith('tr')) || 
                         voices.find(v => v.default && v.lang.startsWith('tr')); // Check default Turkish voice too
    
    if (turkishVoice) {
      utterance.voice = turkishVoice;
    } else {
        // Fallback or just use default system voice if no specific Turkish voice found
        utterance.lang = 'tr-TR'; 
    }
    
    utterance.rate = 1.0; // Normal speech rate
    utterance.pitch = 1.0; // Normal pitch

    utterance.onend = () => {
      if (currentResolve) currentResolve();
      cleanupSpeech();
    };

    utterance.onerror = (event) => {
      console.error('SpeechSynthesisUtterance.onerror', event);
      if (currentReject) currentReject(new Error(`Speech error: ${event.error}`));
      cleanupSpeech();
    };
    
    // Ensure voices are loaded before speaking, especially on first use
    if (voices.length === 0) {
        speechSynthesis.onvoiceschanged = () => {
            // Voices loaded, try again to set Turkish voice
            const loadedVoices = speechSynthesis.getVoices();
            const loadedTurkishVoice = loadedVoices.find(v => v.lang.startsWith('tr')) || loadedVoices.find(v => v.default && v.lang.startsWith('tr'));
            if (loadedTurkishVoice && utterance) {
                utterance.voice = loadedTurkishVoice;
            }
            speechSynthesis.speak(utterance!); // Non-null assertion, utterance is defined
            speechSynthesis.onvoiceschanged = null; // Remove listener
        };
    } else {
        speechSynthesis.speak(utterance);
    }
  });
};

export const stopSpeaking = () => {
  if (typeof speechSynthesis === 'undefined') return;

  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  if (currentReject) {
    currentReject(new Error("Speech stopped by user."));
  }
  cleanupSpeech();
};

export const isSpeaking = (): boolean => {
  if (typeof speechSynthesis === 'undefined') return false;
  return speechSynthesis.speaking;
};

// Pre-load voices if possible when the module loads - this helps ensure voices are available.
if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = () => {
        // console.log("Voices loaded:", speechSynthesis.getVoices().map(v => `${v.name} (${v.lang})`));
        // Can remove listener after first fire if not needed for dynamic updates
        // speechSynthesis.onvoiceschanged = null; 
    };
}
