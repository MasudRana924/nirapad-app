import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en';
import bn from './bn';

const LANG_KEY = 'app_language';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async callback => {
    try {
      const savedLang = await AsyncStorage.getItem(LANG_KEY);
      if (savedLang === 'en' || savedLang === 'bn') {
        callback(savedLang);
        return;
      }
    } catch (_) {}
    callback('en');
  },
  init: () => {},
  cacheUserLanguage: async lng => {
    try {
      await AsyncStorage.setItem(LANG_KEY, lng);
    } catch (_) {}
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {translation: en},
      bn: {translation: bn},
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
