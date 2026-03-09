import { useMemo } from 'react';

import 'react-native-gesture-handler';

import Navigation from './src/navigation';
import { darkTheme, lightTheme } from '@/utils/theme.utils';
import { RootProvider } from '@/providers/index.provider';
import { useEffectiveColorScheme } from '@/store/preferences.store';
import { AuthProvider, useAuth } from '@/store/auth.context';
import { AuthLoadingScreen } from '@/components/AuthLoadingScreen';

function AppNavigation() {
  const colorScheme = useEffectiveColorScheme();
  const theme = useMemo(() => (colorScheme === 'dark' ? darkTheme : lightTheme), [colorScheme]);
  const { isLoading } = useAuth();

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return <Navigation theme={theme} />;
}

export default function App() {
  return (
    <RootProvider>
      <AuthProvider>
        <AppNavigation />
      </AuthProvider>
    </RootProvider>
  );
}
