import localforage from 'localforage';
import { StorageValue } from 'zustand/middleware';

localforage.config({
  name: 'IntelliNoteDB',
  storeName: 'intellinote_store',
  description: 'Persistent storage for IntelliNote application',
});

// This custom storage needs to handle the StorageValue object { state: S, version: number }
// The generic type S will be NoteState in the context of useNoteStore.
export const localForageAdapter = {
  getItem: async <S,>(name: string): Promise<StorageValue<S> | null> => {
    const valueStr = await localforage.getItem<string>(name);
    if (!valueStr) {
      return null;
    }
    try {
      return JSON.parse(valueStr) as StorageValue<S>;
    } catch (e) {
      console.error(`Error parsing stored json for key "${name}":`, e);
      // Potentially handle migration from an old format if valueStr is not JSON
      // or not in StorageValue format. For now, returning null if parse fails.
      return null;
    }
  },
  setItem: async <S,>(name: string, value: StorageValue<S>): Promise<void> => {
    await localforage.setItem(name, JSON.stringify(value));
  },
  removeItem: async (name: string): Promise<void> => {
    await localforage.removeItem(name);
  },
};

export default localforage; // Export localforage instance if needed elsewhere, though adapter is primary for store
