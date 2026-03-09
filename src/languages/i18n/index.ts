import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import { storage } from "@/config/plugins/mmkv.plugin";
import { translations } from "@/languages/locales";

const resources = {
  "en": { translation: translations.en },
  "es": { translation: translations.es },
};

const initI18n = async () => {
  let savedLanguage = storage.getString("language");

  if (!savedLanguage) {
    savedLanguage = Localization.getLocales()[0]?.languageCode ?? "en";
  }

  i18n.use(initReactI18next).init({
    compatibilityJSON: "v4" as const,
    resources,
    lng: savedLanguage,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
};

initI18n();

export default i18n;
