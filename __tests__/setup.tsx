import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ColorSchemeProvider } from '@/context/preferences.context';
import { lightTheme } from '@/utils/theme.utils';

declare global {
  // eslint-disable-next-line no-var
  var __mockStorageMap: Map<string, string> | undefined;
}

jest.mock('@/config/plugins/mmkv.plugin', () => {
  if (!global.__mockStorageMap) global.__mockStorageMap = new Map();
  const map = global.__mockStorageMap;
  return {
    storage: {
      getString: (key: string) => map.get(key) ?? null,
      set: (key: string, value: string) => {
        map.set(key, value);
      },
    },
  };
});

export function clearMockStorage(): void {
  global.__mockStorageMap?.clear();
}

jest.mock('react-native-auth0', () => ({
  Auth0Provider: ({ children }: { children: unknown }) => children,
  useAuth0: () => ({
    user: null,
    isLoading: false,
    authorize: jest.fn().mockResolvedValue(undefined),
    clearSession: jest.fn().mockResolvedValue(undefined),
    clearCredentials: jest.fn().mockResolvedValue(undefined),
    hasValidCredentials: jest.fn().mockResolvedValue(false),
  }),
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Medium: 2 },
}));

jest.mock('@/languages/i18n', () => ({
  __esModule: true,
  default: { changeLanguage: jest.fn() },
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskRegisteredAsync: jest.fn().mockResolvedValue(false),
  unregisterTaskAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/config/notifications', () => ({
  setNotificationHandler: jest.fn(),
  requestNotificationPermissions: jest.fn().mockResolvedValue(undefined),
  scheduleLocalNotification: jest.fn().mockResolvedValue(undefined),
  BACKGROUND_NOTIFICATION_TASK: 'BACKGROUND_NOTIFICATION_TASK',
}));

jest.mock('react-native-keyboard-controller', () => ({
  KeyboardProvider: ({ children }: { children: unknown }) => children,
  KeyboardAvoidingView: require('react-native').KeyboardAvoidingView,
  useReanimatedKeyboardAnimation: () => ({ height: { value: 0 } }),
}));

export function renderWithNav(ui: React.ReactElement, options?: { theme?: typeof lightTheme }) {
  const theme = options?.theme ?? lightTheme;
  return render(
    <SafeAreaProvider>
      <ColorSchemeProvider>
        <NavigationContainer theme={theme}>{ui}</NavigationContainer>
      </ColorSchemeProvider>
    </SafeAreaProvider>
  );
}
