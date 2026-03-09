import { clearMockStorage } from '../setup';
import { usePreferencesStore } from '@/store/preferences.store';

beforeEach(() => {
  clearMockStorage();
  usePreferencesStore.getState().setLanguage('en');
  usePreferencesStore.getState().setColorSchemePreference('light');
});

describe('preferences.store', () => {
  it('setLanguage updates state', () => {
    usePreferencesStore.getState().setLanguage('es');
    expect(usePreferencesStore.getState().language).toBe('es');
  });

  it('setColorSchemePreference updates state', () => {
    usePreferencesStore.getState().setColorSchemePreference('dark');
    expect(usePreferencesStore.getState().colorSchemePreference).toBe('dark');
  });

  it('hydrate re-reads from storage', () => {
    usePreferencesStore.getState().setLanguage('es');
    usePreferencesStore.getState().setColorSchemePreference('dark');
    usePreferencesStore.getState().hydrate();
    expect(usePreferencesStore.getState().language).toBe('es');
    expect(usePreferencesStore.getState().colorSchemePreference).toBe('dark');
  });
});
