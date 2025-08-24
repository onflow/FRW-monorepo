import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Use require() for reliable JSON loading in release mode
const loadResources = () => {
  try {
    return {
      en: { translation: require('../locales/en.json') },
      es: { translation: require('../locales/es.json') },
      ja: { translation: require('../locales/ja.json') },
      ru: { translation: require('../locales/ru.json') },
      zh: { translation: require('../locales/zh.json') },
    };
  } catch (error) {
    console.warn('[i18n] Failed to load some translations, using English only:', error);
    return {
      en: { translation: require('../locales/en.json') },
    };
  }
};

const initI18n = (language?: string) => {
  const savedLanguage = language || 'en';
  const resources = loadResources();

  try {
    // Synchronous initialization prevents UI render race condition
    i18n.use(initReactI18next).init({
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

    // Validate initialization succeeded
    if (!i18n.isInitialized) {
      throw new Error('i18n initialization failed');
    }

  } catch (error) {
    console.error('[i18n] Initialization failed:', error);
    // Emergency fallback to prevent crash
    try {
      i18n.use(initReactI18next).init({
        resources: { en: { translation: {} } },
        lng: 'en',
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
        react: { useSuspense: false },
        debug: false,
      });
    } catch (fallbackError) {
      console.error('[i18n] Emergency fallback also failed:', fallbackError);
    }
  }
};

// Export validation function for health checks
export const validateI18n = () => {
  return i18n && i18n.isInitialized && typeof i18n.t === 'function';
};

// Export the initialization function
export { initI18n };

// Export i18n instance as default for compatibility
export default i18n;
