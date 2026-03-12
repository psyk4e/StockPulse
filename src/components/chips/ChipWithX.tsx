import React, { forwardRef } from 'react';
import { Pressable, PressableProps, StyleSheet, Text } from 'react-native';
import { useAppColorScheme } from '@/context/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { Icon } from '../Icon';

export interface ChipWithXProps extends Omit<PressableProps, 'children'> {
  label: string;
  selected?: boolean;
  onRemove?: () => void;
  onUncheck?: () => void;
  containerStyle?: PressableProps['style'];
  labelStyle?: import('react-native').TextStyle;
}

export const ChipWithX = forwardRef<React.ComponentRef<typeof Pressable>, ChipWithXProps>(
  (
    {
      label,
      selected = false,
      onRemove,
      onUncheck,
      containerStyle,
      labelStyle,
      style,
      ...pressableProps
    },
    ref
  ) => {
    const colorScheme = useAppColorScheme();
    const isDarkMode = getIsDarkMode(colorScheme);
    const styles = getStyles(isDarkMode, selected);
    const handleX = onRemove ?? onUncheck;

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
        {handleX != null && (
          <Pressable onPress={handleX} style={styles.xWrap} hitSlop={8}>
            <Icon name="close" size={14} color={styles.label.color} />
          </Pressable>
        )}
      </Pressable>
    );
  }
);

ChipWithX.displayName = 'ChipWithX';

function getStyles(isDarkMode: boolean, selected: boolean) {
  const labelColor = selected
    ? THEME.colors.white
    : isDarkMode
      ? THEME.colors.textSecondaryDark
      : THEME.colors.textSecondaryLight;
  return StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 16,
      paddingVertical: 8,
      paddingRight: 8,
      borderRadius: 9999,
      backgroundColor: selected
        ? THEME.colors.primaryBlue
        : isDarkMode
          ? THEME.colors.darkCard
          : THEME.colors.lightCard,
      alignSelf: 'flex-start',
      gap: 6,
    },
    pressed: {
      opacity: 0.9,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: labelColor,
    },
    xWrap: {
      padding: 2,
    },
  });
}
