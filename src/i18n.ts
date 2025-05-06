import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// імпортуємо переклади
import translationEN from "./locales/en/translation.json";
import translationUA from "./locales/ua/translation.json";
import { LocalStorageKey } from "./config/local-storage.config";

export enum LanguageType {
  EN = "en",
  UA = "ua",
}
// Функція для визначення мови
const getBrowserLanguage = () => {
  const storedLang = localStorage.getItem(LocalStorageKey.lang);
  if (storedLang) {
    return JSON.parse(storedLang) as keyof typeof LanguageType;
  }
  const lang = navigator.language || navigator.languages[0];
  if (lang.startsWith(LanguageType.UA)) return LanguageType.UA; // якщо українська
  return LanguageType.EN; // інакше англійська
};

// ресурси
const resources = {
  en: {
    translation: translationEN,
  },
  ua: {
    translation: translationUA,
  },
};

i18n
  .use(initReactI18next) // підключаємо до React
  .init({
    resources,
    lng: getBrowserLanguage(), // мова за замовчуванням
    fallbackLng: LanguageType.EN, // якщо немає перекладу, підставить англійську

    interpolation: {
      escapeValue: false, // react вже екранує HTML
    },
  });

export default i18n;
