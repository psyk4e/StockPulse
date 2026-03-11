import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, FadeIn, FadeOut } from 'react-native-reanimated';
import { useAppColorScheme } from '@/store/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { Text } from '../Text';
import { Icon } from '../Icon';
import { Button } from '../buttons/Button';
import type { InAppToastItem } from '@/store/in-app-notifications.context';

const AUTO_DISMISS_MS = 5000;

interface SnackbarToastProps {
  item: InAppToastItem;
  onDismiss: (id: string) => void;
  onAction?: () => void;
  containerStyle?: ViewStyle;
  /** Accordion: 0 = front (full), 1+ = behind (scaled down) */
  stackIndex: number;
}

export function SnackbarToast({
  item,
  onDismiss,
  onAction,
  containerStyle,
  stackIndex,
}: SnackbarToastProps) {
  const colorScheme = useAppColorScheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const styles = getStyles(isDarkMode);
  const dismissRef = useRef(false);

  const scale = useSharedValue(1 - stackIndex * 0.04);
  const opacity = useSharedValue(stackIndex === 0 ? 1 : Math.max(0.4, 0.85 - (stackIndex - 1) * 0.15));

  useEffect(() => {
    scale.value = 1 - stackIndex * 0.04;
    opacity.value = stackIndex === 0 ? 1 : Math.max(0.4, 0.85 - (stackIndex - 1) * 0.15);
  }, [stackIndex, scale, opacity]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!dismissRef.current) {
        dismissRef.current = true;
        onDismiss(item.id);
      }
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [item.id, onDismiss]);

  const handleDismiss = () => {
    if (dismissRef.current) return;
    dismissRef.current = true;
    onDismiss(item.id);
  };

  const handleAction = () => {
    onAction?.();
    item.onAction?.();
    handleDismiss();
  };

  const iconName = item.icon === 'check' ? 'check' : item.icon === 'info' ? 'info' : 'check';
  const iconColor = THEME.colors.primaryBlue;

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(280)}
      exiting={FadeOut.duration(220)}
      style={[styles.container, animatedStyle, containerStyle]}>
      <View style={styles.content}>
        <Icon name={iconName} size={20} color={iconColor} style={styles.icon} />
        <View style={styles.textWrap}>
          <Text
            title={item.message}
            variant="Primary"
            font="medium"
            textStyle={styles.message}
            numberOfLines={2}
          />
          {item.actionLabel && (
            <Button
              variant="outline"
              title={item.actionLabel}
              onPress={handleAction}
              style={styles.actionButton}
              textStyle={styles.actionButtonText}
            />
          )}
        </View>
        <Pressable onPress={handleDismiss} hitSlop={12} style={styles.closeWrap}>
          <Icon name="close" size={20} color={isDarkMode ? THEME.colors.textSecondaryDark : THEME.colors.textSecondaryLight} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

function getStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    container: {
      borderRadius: THEME.spacing.borderRadius,
      marginHorizontal: THEME.spacing.screenHorizontal,
      backgroundColor: isDarkMode ? THEME.colors.darkCard : THEME.colors.white,
      borderWidth: 1,
      borderColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder,
      shadowColor: THEME.colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: THEME.spacing.borderRadius,
    },
    icon: {
      marginRight: 12,
    },
    textWrap: {
      flex: 1,
      minWidth: 0,
    },
    message: {
      fontSize: 14,
      color: isDarkMode ? THEME.colors.textPrimaryDark : THEME.colors.textPrimaryLight,
    },
    actionButton: {
      marginTop: 8,
      marginHorizontal: 0,
      height: 36,
      minWidth: 0,
      alignSelf: 'flex-start',
    },
    actionButtonText: {
      fontSize: 14,
    },
    closeWrap: {
      padding: 4,
      marginLeft: 8,
    },
  });
}
