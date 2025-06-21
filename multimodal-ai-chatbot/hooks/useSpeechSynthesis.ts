
import { useState, useEffect, useCallback } from 'react';
import { SpeechSynthesisHook } from '../types';

const useSpeechSynthesis = (): SpeechSynthesisHook => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsAvailable(true);
      const utt = new SpeechSynthesisUtterance();
      utt.onstart = () => setIsSpeaking(true);
      utt.onend = () => setIsSpeaking(false);
      utt.onerror = (event) => {
        console.error('Konuşma sentezi hatası:', event);
        setIsSpeaking(false);
      };
      setUtterance(utt);
    } else {
      setIsAvailable(false);
    }

    // Cleanup: cancel speech if component unmounts while speaking
    return () => {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!isAvailable || !utterance || !window.speechSynthesis) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel(); // Cancel current speech before starting new one
    }
    
    utterance.text = text;
    // You can customize voice, rate, pitch here if needed
    // const voices = window.speechSynthesis.getVoices();
    // utterance.voice = voices[0]; // Example: Set a specific voice
    // utterance.rate = 1;
    // utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, [isAvailable, utterance]);

  const cancel = useCallback(() => {
    if (!isAvailable || !window.speechSynthesis || !window.speechSynthesis.speaking) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isAvailable]);

  return { isSpeaking, isAvailable, speak, cancel };
};

export default useSpeechSynthesis;
