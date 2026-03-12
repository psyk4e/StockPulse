import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useAppColorScheme } from '@/context/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';

export interface IconWithBackgroundProps extends ViewProps {
  children: React.ReactNode;
  size?: number;
  glow?: boolean;
  borderColor?: string;
  backgroundColor?: string;
  containerStyle?: ViewProps['style'];
}

function IconWithBackground({
  children,
  size = 48,
  glow = false,
  borderColor,
  backgroundColor,
  containerStyle,
  style,
  ...rest
}: IconWithBackgroundProps) {
  const colorScheme = useAppColorScheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const styles = getStyles(size, glow, isDarkMode, borderColor, backgroundColor);

  return (
    <View style={[styles.container, containerStyle, style]} {...rest}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

IconWithBackground.displayName = 'IconWithBackground';

function getStyles(
  size: number,
  glow: boolean,
  isDarkMode: boolean,
  borderColor?: string,
  backgroundColor?: string
) {
  const bg = backgroundColor ?? (isDarkMode ? THEME.colors.darkCard : THEME.colors.lightCard);
  const border = borderColor ?? (isDarkMode ? 'rgba(0,136,255,0.2)' : THEME.colors.lightBorder);

  return StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: bg,
      borderWidth: 1,
      borderColor: border,
      alignItems: 'center',
      justifyContent: 'center',
      ...(glow && {
        shadowColor: '#0088ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
      }),
    },
    inner: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}

export default IconWithBackground;
