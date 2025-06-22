
import { Note, Category } from '../types';
import { DEFAULT_CATEGORIES } from '../types';

const NOTES_KEY = 'aiNotesAppNotes';
const CUSTOM_CATEGORIES_KEY = 'aiNotesAppCustomCategories';

export const loadNotesFromLocalStorage = (): Note[] => {
  try {
    const notesJson = localStorage.getItem(NOTES_KEY);
    return notesJson ? JSON.parse(notesJson) : [];
  } catch (error) {
    console.error("Failed to load notes from local storage:", error);
    return [];
  }
};

export const saveNotesToLocalStorage = (notes: Note[]): void => {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("Failed to save notes to local storage:", error);
  }
};

export const loadCategoriesFromLocalStorage = (): Category[] => {
  try {
    const customCategoriesJson = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    const customCategories: Category[] = customCategoriesJson ? JSON.parse(customCategoriesJson) : [];
    // Combine default and custom, ensuring no duplicates and default come first
    const allCategories = [...DEFAULT_CATEGORIES, ...customCategories.filter(cc => !DEFAULT_CATEGORIES.includes(cc as any))];
    return allCategories;
  } catch (error) {
    console.error("Failed to load categories from local storage:", error);
    return [...DEFAULT_CATEGORIES];
  }
};

export const saveCustomCategoriesToLocalStorage = (customCategories: Category[]): void => {
  try {
    // Filter out default categories before saving, only save truly custom ones
    const categoriesToSave = customCategories.filter(cc => !DEFAULT_CATEGORIES.includes(cc as any));
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categoriesToSave));
  } catch (error) {
    console.error("Failed to save custom categories to local storage:", error);
  }
};
