
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
// Corrected: Ensure paths are relative from i18n.ts to the locales directory
import enTranslation from './locales/en/translation.json';
import trTranslation from './locales/tr/translation.json';
import { Language } from './types';

const resources = {
  [Language.EN]: {
    translation: enTranslation,
  },
  [Language.TR]: {
    translation: trTranslation,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: Language.EN,
    debug: false, // Set to true for development debugging
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;