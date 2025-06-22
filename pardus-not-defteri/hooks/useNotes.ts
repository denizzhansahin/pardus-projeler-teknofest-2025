
import { useState, useEffect, useCallback } from 'react';
import { Note, Category, AiHelperSuggestion } from '../types';
import { 
  loadNotesFromLocalStorage, 
  saveNotesToLocalStorage,
  loadCategoriesFromLocalStorage,
  saveCustomCategoriesToLocalStorage
} from '../services/localStorageService';
import { DEFAULT_CATEGORIES } from '../types';


interface ActiveAlarm {
  timeoutId: number;
  noteId: string;
  notificationId: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>(loadCategoriesFromLocalStorage());

  useEffect(() => {
    const loadedCategories = loadCategoriesFromLocalStorage();
    setCategories(loadedCategories);
  }, []);

  const addCategory = useCallback((newCategory: Category) => {
    if (newCategory.trim() === '') return;
    if (categories.map(c => c.toLowerCase()).includes(newCategory.toLowerCase())) return; // Avoid duplicates, case-insensitive

    setCategories(prevCategories => {
      const updatedCategories = [...prevCategories, newCategory.trim()];
      // Save only custom categories
      const customCategories = updatedCategories.filter(c => !DEFAULT_CATEGORIES.includes(c as any));
      saveCustomCategoriesToLocalStorage(customCategories);
      return updatedCategories;
    });
  }, [categories]);

  return { categories, addCategory };
};


export const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeAlarms, setActiveAlarms] = useState<ActiveAlarm[]>([]);

  useEffect(() => {
    const loadedNotes = loadNotesFromLocalStorage();
    setNotes(loadedNotes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveNotesToLocalStorage(notes);
    scheduleAllPendingNotifications(notes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes]);

  const clearExistingAlarm = useCallback((noteId: string, notificationId?: string) => {
    setActiveAlarms(prevAlarms => {
      const alarmToClear = prevAlarms.find(
        alarm => alarm.noteId === noteId && (notificationId ? alarm.notificationId === notificationId : true)
      );
      if (alarmToClear) {
        clearTimeout(alarmToClear.timeoutId);
        return prevAlarms.filter(alarm => alarm.timeoutId !== alarmToClear.timeoutId);
      }
      return prevAlarms;
    });
  }, []);

  const scheduleNotification = useCallback((note: Note) => {
    if (note.notification && !note.notification.triggered) {
      const notificationTime = new Date(note.notification.time).getTime();
      const now = Date.now();
      const delay = notificationTime - now;

      if (delay > 0) {
        clearExistingAlarm(note.id, note.notification.id); 

        const timeoutId = setTimeout(() => {
          console.log(`ALARM for note: ${note.title}`);
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`"${note.title}" için hatırlatma!`, {
              body: note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''),
              icon: '/favicon.ico', 
              tag: note.id // Use note ID as tag to prevent multiple notifications for same note if triggered closely
            });
          } else {
            alert(`"${note.title}" için hatırlatma!\n${note.content.substring(0,100)}...`);
          }
          
          setNotes(prevNotes => 
            prevNotes.map(n => 
              n.id === note.id && n.notification?.id === note.notification?.id
                ? { ...n, notification: { ...n.notification!, triggered: true } } 
                : n
            )
          );
          setActiveAlarms(prev => prev.filter(alarm => alarm.timeoutId !== timeoutId));
        }, delay);

        setActiveAlarms(prev => [...prev, { timeoutId: Number(timeoutId), noteId: note.id, notificationId: note.notification!.id }]);
      } else if (delay <= 0 && !note.notification.triggered) {
        setNotes(prevNotes =>
          prevNotes.map(n =>
            n.id === note.id && n.notification?.id === note.notification?.id
              ? { ...n, notification: { ...n.notification!, triggered: true } }
              : n
          )
        );
      }
    }
  }, [clearExistingAlarm]);

  const scheduleAllPendingNotifications = useCallback((currentNotes: Note[]) => {
    activeAlarms.forEach(alarm => clearTimeout(alarm.timeoutId));
    setActiveAlarms([]);

    currentNotes.forEach(note => {
      if (note.notification && !note.notification.triggered) {
        scheduleNotification(note);
      }
    });
  }, [activeAlarms, scheduleNotification]);


  const addNote = (newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note => {
    const noteWithTimestamps: Note = {
      ...newNote,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      backgroundColor: newNote.backgroundColor || 'bg-white', // Default background
      textColor: newNote.textColor || 'text-slate-800', // Default text color
    };
    setNotes(prevNotes => [noteWithTimestamps, ...prevNotes]);
    return noteWithTimestamps; // Return the created note
  };

  const updateNote = (updatedNote: Note) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === updatedNote.id
          ? { ...updatedNote, updatedAt: new Date().toISOString() }
          : note
      )
    );
  };

  const deleteNote = (noteId: string) => {
    const noteToDelete = notes.find(n => n.id === noteId);
    if (noteToDelete && noteToDelete.notification) {
      clearExistingAlarm(noteToDelete.id, noteToDelete.notification.id);
    }
    setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
  };
  
  const setNoteNotification = (noteId: string, time: string | null) => {
    setNotes(prevNotes =>
      prevNotes.map(note => {
        if (note.id === noteId) {
          if (note.notification) { 
            clearExistingAlarm(note.id, note.notification.id);
          }
          if (time) {
            return {
              ...note,
              notification: { id: Date.now().toString(), time, triggered: false },
              updatedAt: new Date().toISOString(),
            };
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { notification, ...restOfNote } = note; 
            return { ...restOfNote, updatedAt: new Date().toISOString() };
          }
        }
        return note;
      })
    );
  };


  return { notes, addNote, updateNote, deleteNote, setNoteNotification, scheduleNotification };
};