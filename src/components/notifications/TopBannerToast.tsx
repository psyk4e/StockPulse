import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Pressable, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useAppColorScheme } from '@/context/preferences.context';
import { getIsDarkMode, hexToRgba } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { Text } from '../Text';
import { Icon } from '../Icon';
import type { InAppToastItem } from '@/context/in-app-notifications.context';

const AUTO_DISMISS_MS = 5500;

interface TopBannerToastProps {
  item: InAppToastItem;
  onDismiss: (id: string) => void;
  containerStyle?: ViewStyle;
  stackIndex: number;
}

export function TopBannerToast({
  item,
  onDismiss,
  containerStyle,
  stackIndex,
}: TopBannerToastProps) {
  const colorScheme = useAppColorScheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const styles = getStyles(isDarkMode);
  const dismissRef = useRef(false);

  const scale = useSharedValue(1 - stackIndex * 0.04);
  const opacity = useSharedValue(
    stackIndex === 0 ? 1 : Math.max(0.4, 0.85 - (stackIndex - 1) * 0.15)
  );

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

  const iconName = item.icon === 'bell' ? 'bell' : item.icon === 'info' ? 'info' : 'bell';
  const iconColor = THEME.colors.primaryBlue;
  const iconBg = hexToRgba(THEME.colors.primaryBlue, isDarkMode ? 0.15 : 0.12);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(280)}
      exiting={FadeOut.duration(220)}
      style={[styles.outer, animatedStyle, containerStyle]}>
      <View style={styles.container}>
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
          <Icon name={iconName} size={20} color={iconColor} />
        </View>
        <View style={styles.textWrap}>
          <Text
            title={item.title}
            variant="Primary"
            font="semiBold"
            textStyle={styles.title}
            numberOfLines={1}
          />
          <Text
            title={item.message}
            variant="Secondary"
            textStyle={styles.message}
            numberOfLines={2}
          />
        </View>
        <Pressable onPress={handleDismiss} hitSlop={12} style={styles.closeWrap}>
          <Icon
            name="close"
            size={18}
            color={isDarkMode ? THEME.colors.textSecondaryDark : THEME.colors.textSecondaryLight}
          />
        </Pressable>
      </View>
    </Animated.View>
  );
}

function getStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    outer: {
      marginHorizontal: THEME.spacing.screenHorizontal,
      shadowColor: THEME.colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 6,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      backgroundColor: isDarkMode ? THEME.colors.darkCard : THEME.colors.lightCard,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    textWrap: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: 15,
      color: isDarkMode ? THEME.colors.textPrimaryDark : THEME.colors.textPrimaryLight,
    },
    message: {
      fontSize: 13,
      marginTop: 2,
      color: isDarkMode ? THEME.colors.textSecondaryDark : THEME.colors.textSecondaryLight,
    },
    closeWrap: {
      padding: 4,
      marginLeft: 8,
    },
  });
}
