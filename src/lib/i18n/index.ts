import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import pt from "./locales/pt.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    defaultNS: "translation",
    resources: {
      en: { translation: en },
      pt: { translation: pt },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
