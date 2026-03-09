import { create } from 'zustand';
import type { ColorSchemeName } from 'react-native';
import { storage } from '@/config/plugins/mmkv.plugin';
import i18n from '@/languages/i18n';

const LANGUAGE_KEY = 'language';
const COLOR_SCHEME_KEY = 'colorScheme';

export type LanguageCode = 'en' | 'es';

export type ColorSchemePreference = 'light' | 'dark';

export interface PreferencesState {
  language: LanguageCode;
  colorSchemePreference: ColorSchemePreference;
  setLanguage: (code: LanguageCode) => void;
  setColorSchemePreference: (value: ColorSchemePreference) => void;
  hydrate: () => void;
}

function getStoredLanguage(): LanguageCode {
  const stored = storage.getString(LANGUAGE_KEY);
  if (stored === 'en' || stored === 'es') return stored;
  return 'en';
}

function getStoredColorScheme(): ColorSchemePreference {
  const stored = storage.getString(COLOR_SCHEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'light';
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  language: getStoredLanguage(),
  colorSchemePreference: getStoredColorScheme(),

  setLanguage: (code) => {
    storage.set(LANGUAGE_KEY, code);
    void i18n.changeLanguage(code);
    set({ language: code });
  },

  setColorSchemePreference: (value) => {
    storage.set(COLOR_SCHEME_KEY, value);
    set({ colorSchemePreference: value });
  },

  hydrate: () => {
    set({
      language: getStoredLanguage(),
      colorSchemePreference: getStoredColorScheme(),
    });
  },
}));

/**
 * Returns the effective color scheme from user preference (light or dark).
 * Use this instead of useColorScheme() when theme should respect Settings > Dark Mode.
 */
export function useEffectiveColorScheme(): NonNullable<ColorSchemeName> {
  const colorSchemePreference = usePreferencesStore((s) => s.colorSchemePreference);
  return colorSchemePreference;
}

