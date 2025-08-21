import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import en from '../locales/en.json';
import es from '../locales/es.json';
import ja from '../locales/ja.json';
import ru from '../locales/ru.json';
import zh from '../locales/zh.json';

const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
  ja: {
    translation: ja,
  },
  ru: {
    translation: ru,
  },
  zh: {
    translation: zh,
  },
};

const initI18n = async (language?: string) => {
  const savedLanguage = language || 'en';

  await i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // React i18next options
    react: {
      useSuspense: false, // Important for React Native
    },

    // Debug mode - can be disabled in production
    debug: __DEV__,
  });
};

// Initialize i18n
export default initI18n;
