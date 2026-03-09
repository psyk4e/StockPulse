import React, { forwardRef } from 'react';
import { Pressable, PressableProps, StyleSheet, Text, TextStyle } from 'react-native';
import { useAppColorScheme } from '@/store/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';

export interface ChipProps extends Omit<PressableProps, 'children'> {
  label: string;
  selected?: boolean;
  containerStyle?: PressableProps['style'];
  labelStyle?: TextStyle | StyleSheet.NamedStyles<unknown>;
}

export const Chip = forwardRef<React.ComponentRef<typeof Pressable>, ChipProps>(
  ({ label, selected = false, containerStyle, labelStyle, style, ...pressableProps }, ref) => {
    const colorScheme = useAppColorScheme();
    const isDarkMode = getIsDarkMode(colorScheme);
    const styles = getStyles(isDarkMode, selected);

    return (
      <Pressable
        ref={ref}
        style={({ pressed }) => {
          const s = containerStyle ?? style;
          const flatStyle = typeof s === 'function' ? s({ pressed }) : s;
          return [styles.chip, pressed && styles.pressed, flatStyle];
        }}
        {...pressableProps}>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      </Pressable>
    );
  }
);

Chip.displayName = 'Chip';

function getStyles(isDarkMode: boolean, selected: boolean) {
  return StyleSheet.create({
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 9999,
      backgroundColor: selected
        ? THEME.colors.primaryBlue
        : isDarkMode
          ? THEME.colors.darkCard
          : THEME.colors.lightCard,
      alignSelf: 'flex-start',
    },
    pressed: {
      opacity: 0.9,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: selected
        ? THEME.colors.white
        : isDarkMode
          ? THEME.colors.textSecondaryDark
          : THEME.colors.textSecondaryLight,
    },
  });
}
