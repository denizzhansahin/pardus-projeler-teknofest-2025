
import { Note } from '../types';
import { ALARM_SOUND_URL } from '../constants';

let audio: HTMLAudioElement | null = null;

const playAlarmSound = () => {
  if (!audio) {
    audio = new Audio(ALARM_SOUND_URL);
  }
  audio.play().catch(error => console.error("Error playing alarm sound:", error));
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.error('This browser does not support desktop notification');
    return 'denied';
  }
  return Notification.requestPermission();
};

export const showNotification = (note: Note, t: (key: string, options?: any) => string) => {
  if (Notification.permission === 'granted') {
    const title = t('notificationTitle');
    const body = t('notificationBody', { noteTitle: note.title });
    new Notification(title, { body, icon: '/vite.svg' }); // Replace with actual app icon
    playAlarmSound();
  } else if (Notification.permission === 'default') {
    requestNotificationPermission().then(permission => {
      if (permission === 'granted') {
        showNotification(note, t);
      }
    });
  }
};

// This function would typically be called by a mechanism that checks reminders periodically.
// For simplicity, we'll call this when a note with a reminder is loaded or updated.
// A more robust solution would involve a background worker or a setInterval in a main component.
export const checkAndTriggerAlarms = (notes: Note[], t: (key: string, options?: any) => string) => {
  const now = Date.now();
  notes.forEach(note => {
    if (note.reminder && note.reminder <= now) {
      showNotification(note, t);
      // Optional: Mark reminder as triggered or remove it
      // This part would typically be handled by updating the note in the store
      // e.g., useNoteStore.getState().updateNote({ ...note, reminder: undefined });
      console.log(`Alarm triggered for note: ${note.title}`);
    }
  });
};

export const speakText = (text: string, lang: string = 'en-US') => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang; // Set based on current app language
    utterance.onerror = (event) => console.error("Speech synthesis error", event);
    window.speechSynthesis.cancel(); // Cancel any previous speech
    window.speechSynthesis.speak(utterance);
  } else {
    alert('Browser Speech Synthesis not supported.');
  }
};
