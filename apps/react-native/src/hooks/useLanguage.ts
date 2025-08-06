import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const LANGUAGE_KEY = '@frw_language';

export const useLanguage = () => {
  const { i18n, t } = useTranslation();

  const changeLanguage = async (language: string) => {
    try {
      await i18n.changeLanguage(language);
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage && savedLanguage !== i18n.language) {
        await i18n.changeLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Failed to load saved language:', error);
    }
  };

  return {
    currentLanguage: i18n.language,
    changeLanguage,
    loadSavedLanguage,
    t,
  };
};
