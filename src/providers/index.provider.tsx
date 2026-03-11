import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useLoadFont } from '@/hooks/useTheme';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ColorSchemeProvider } from '@/store/preferences.context';
import { LivePricesProvider } from '@/store/live-prices.context';
import { InAppNotificationsProvider } from '@/store/in-app-notifications.context';
import { MarketStatusProvider } from '@/store/market-status.context';
import { ToastStack, NotificationsForegroundListener } from '@/components/notifications';
import {
  requestNotificationPermissions,
} from '@/config/notifications';
import '@languages/i18n';

interface Props {
  children: React.ReactNode;
}

export function RootProvider(props: Props) {
  useLoadFont();
  void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);

  useEffect(() => {
    requestNotificationPermissions().catch(() => {
      // Permission denied or unavailable (e.g. simulator)
    });
  }, []);

  return (
    <SafeAreaProvider>
      <ColorSchemeProvider>
        <LivePricesProvider>
        <MarketStatusProvider>
        <InAppNotificationsProvider>
        <GestureHandlerRootView>
          <KeyboardProvider>
            <BottomSheetModalProvider>
              {props.children}
              <ToastStack />
              <NotificationsForegroundListener />
            </BottomSheetModalProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
        </InAppNotificationsProvider>
        </MarketStatusProvider>
        </LivePricesProvider>
      </ColorSchemeProvider>
    </SafeAreaProvider>
  );
}
