import { en } from "./en";
import { es } from "./es";

export type BaseTranslation = typeof en | typeof es;
export const translations: Record<string, BaseTranslation> = { en, es } as const;
