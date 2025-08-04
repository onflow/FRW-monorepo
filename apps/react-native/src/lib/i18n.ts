import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translation files
import en from '../locales/en.json';
import es from '../locales/es.json';

const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
};

const initI18n = async () => {
  let savedLanguage = 'en';
  try {
    const storedLanguage = await AsyncStorage.getItem('@frw_language');
    if (storedLanguage) {
      savedLanguage = storedLanguage;
    }
  } catch (error) {
    console.warn('Failed to load saved language, using default:', error);
  }

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
initI18n();

export default i18n;
