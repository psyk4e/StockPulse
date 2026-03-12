import { useMemo } from 'react';

import 'react-native-gesture-handler';

import Navigation from './src/navigation';
import { darkTheme, lightTheme } from '@/utils/theme.utils';
import { RootProvider } from '@/providers/index.provider';
import { useEffectiveColorScheme } from '@/store/preferences.store';
import { AuthProvider, useAuth } from '@/context/auth.context';
import { AuthLoadingScreen } from '@/components/AuthLoadingScreen';
import { useSecurityStore } from '@/store/security.store';
import BiometricLockScreen from '@/modules/security/screens/BiometricLockScreen';

function AppNavigation() {
  const colorScheme = useEffectiveColorScheme();
  const theme = useMemo(() => (colorScheme === 'dark' ? darkTheme : lightTheme), [colorScheme]);
  const { isLoading, isSignedIn } = useAuth();
  const isLocked = useSecurityStore((s) => s.isLocked);
  const isSecurityEnabled = useSecurityStore((s) => s.isSecurityEnabled);

  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  if (isSignedIn && isLocked && isSecurityEnabled()) {
    return <BiometricLockScreen />;
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
