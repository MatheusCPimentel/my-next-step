import type { Translation } from "../lib/i18n/types";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: Translation;
    };
  }
}
