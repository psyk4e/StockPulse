import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInAppNotifications } from '@/context/in-app-notifications.context';
import { SnackbarToast } from './SnackbarToast';
import { TopBannerToast } from './TopBannerToast';

const PEEK_PX = 8;
const MAX_VISIBLE = 4;

export function ToastStack() {
  const { items, dismiss } = useInAppNotifications();
  const insets = useSafeAreaInsets();

  const banners = items.filter((i) => i.variant === 'banner').slice(0, MAX_VISIBLE);
  const snackbars = items.filter((i) => i.variant === 'snackbar').slice(0, MAX_VISIBLE);

  const topBase = insets.top + 8;
  const bottomBase = insets.bottom + 24;
  const totalBannerPeek = banners.length > 1 ? (banners.length - 1) * PEEK_PX : 0;
  const totalSnackbarPeek = snackbars.length > 1 ? (snackbars.length - 1) * PEEK_PX : 0;

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]} pointerEvents="box-none">
      {banners.length > 0 && (
        <View
          style={[styles.topStack, { height: topBase + 80 + totalBannerPeek }]}
          pointerEvents="box-none">
          {[...banners].reverse().map((item) => {
            const idx = banners.indexOf(item);
            return (
              <TopBannerToast
                key={item.id}
                item={item}
                onDismiss={dismiss}
                stackIndex={idx}
                containerStyle={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: topBase + idx * PEEK_PX,
                  zIndex: MAX_VISIBLE - idx,
                }}
              />
            );
          })}
        </View>
      )}

      {snackbars.length > 0 && (
        <View
          style={[styles.bottomStack, { height: bottomBase + 80 + totalSnackbarPeek }]}
          pointerEvents="box-none">
          {[...snackbars].reverse().map((item) => {
            const idx = snackbars.indexOf(item);
            return (
              <SnackbarToast
                key={item.id}
                item={item}
                onDismiss={dismiss}
                onAction={item.onAction}
                stackIndex={idx}
                containerStyle={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: bottomBase + idx * PEEK_PX,
                  zIndex: MAX_VISIBLE - idx,
                }}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    zIndex: 9999,
  },
  topStack: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
  },
  bottomStack: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
