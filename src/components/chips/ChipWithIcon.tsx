import React, { forwardRef } from 'react';
import { ColorSchemeName, Pressable, PressableProps, StyleSheet, Text, View } from 'react-native';
import { useAppColorScheme } from '@/context/preferences.context';
import { THEME } from '@/utils/theme.utils';
import { Icon, IconName } from '../Icon';
import { getIsDarkMode } from '@/utils/styles.utils';

export type ChipStatus = 'active' | 'triggered' | 'neutral';

export interface ChipWithIconProps extends Omit<PressableProps, 'children'> {
  label: string;
  icon?: IconName | React.ReactNode;
  status?: ChipStatus;
  iconPosition?: 'leading' | 'trailing';
  containerStyle?: PressableProps['style'];
  labelStyle?: import('react-native').TextStyle;
  iconContainerStyle?: import('react-native').ViewStyle;
}

export const ChipWithIcon = forwardRef<React.ComponentRef<typeof Pressable>, ChipWithIconProps>(
  (
    {
      label,
      icon,
      status = 'neutral',
      iconPosition = 'leading',
      containerStyle,
      labelStyle,
      iconContainerStyle,
      style,
      ...pressableProps
    },
    ref
  ) => {
    const colorScheme = useAppColorScheme();
    const statusStyle = getStatusStyle(colorScheme)[status];
    const styles = getStyles(statusStyle);

    const iconNode =
      icon != null &&
      (typeof icon === 'string' ? (
        <Icon name={icon as IconName} size={12} color={statusStyle.text} />
      ) : (
        icon
      ));

    return (
      <Pressable
        ref={ref}
        style={({ pressed }) => {
          const s = containerStyle ?? style;
          const flatStyle = typeof s === 'function' ? s({ pressed }) : s;
          return [styles.chip, pressed && styles.pressed, flatStyle];
        }}
        {...pressableProps}>
        {iconPosition === 'leading' && iconNode != null && (
          <View style={[styles.iconWrap, iconContainerStyle]}>{iconNode}</View>
        )}
        <Text style={[styles.label, labelStyle]}>{label}</Text>
        {iconPosition === 'trailing' && iconNode != null && (
          <View style={[styles.iconWrap, iconContainerStyle]}>{iconNode}</View>
        )}
      </Pressable>
    );
  }
);

ChipWithIcon.displayName = 'ChipWithIcon';

function getStyles(statusStyle: { bg: string; text: string }) {
  return StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 9999,
      backgroundColor: statusStyle.bg,
      alignSelf: 'flex-start',
      gap: 4,
    },
    pressed: {
      opacity: 0.9,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: statusStyle.text,
    },
    iconWrap: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}

function getStatusStyle(colorScheme: ColorSchemeName) {
  const isDarkMode = getIsDarkMode(colorScheme);
  return {
    active: {
      bg: isDarkMode ? 'rgba(6,78,59,0.4)' : '#D1FAE5',
      text: isDarkMode ? '#34d399' : '#059669',
    },
    triggered: {
      bg: isDarkMode ? 'rgba(244,63,94,0.1)' : '#FFE4E6',
      text: isDarkMode ? '#F43F5E' : '#E11D48',
    },
    neutral: {
      bg: isDarkMode ? 'rgba(100,116,139,0.24)' : '#F1F5F9',
      text: isDarkMode ? '#94a3b8' : '#64748b',
    },
  };
}
