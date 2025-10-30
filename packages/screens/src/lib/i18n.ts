import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import en from '../locales/en.json';
import es from '../locales/es.json';
import zh from '../locales/zh.json';
import ru from '../locales/ru.json';
import jp from '../locales/jp.json';

// Translation resources
const resources = {
  en: {
    translation: en,
  },
  es: {
    translation: es,
  },
  zh: {
    translation: zh,
  },
  ru: {
    translation: ru,
  },
  jp: {
    translation: jp,
  },
};

// Initialize i18n for screens layer
i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',

  interpolation: {
    escapeValue: false, // react already does escaping
  },

  // Configure react-i18next
  react: {
    useSuspense: false,
  },
});

// Initialize function that can be called with platform-specific language
export const initializeI18n = (language?: string) => {
  const lng = language && Object.keys(resources).includes(language) ? language : 'en';

  return i18n.changeLanguage(lng);
};

export default i18n;
export { resources };
