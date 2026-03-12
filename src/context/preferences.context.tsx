import React, { createContext, useContext } from 'react';
import type { ColorSchemeName } from 'react-native';
import { useColorScheme } from 'react-native';
import { useEffectiveColorScheme } from '../store/preferences.store';

const ColorSchemeContext = createContext<NonNullable<ColorSchemeName> | null>(null);

export function ColorSchemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useEffectiveColorScheme();
  return (
    <ColorSchemeContext.Provider value={scheme}>{children}</ColorSchemeContext.Provider>
  );
}

/**
 * Use this in components instead of useColorScheme() so theme respects Settings > Dark Mode.
 * Must be used inside ColorSchemeProvider (wrapped by RootProvider).
 */
export function useAppColorScheme(): NonNullable<ColorSchemeName> {
  const context = useContext(ColorSchemeContext);
  const system = useColorScheme();
  return context ?? system ?? 'light';
}
