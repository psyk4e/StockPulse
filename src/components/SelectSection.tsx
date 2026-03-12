import React, { forwardRef } from 'react';
import { Pressable, PressableProps, StyleSheet, View, ViewProps } from 'react-native';
import { useAppColorScheme } from '@/context/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { Text } from './Text';
import { Icon } from './Icon';

export interface SelectSectionProps extends Omit<PressableProps, 'children'> {
  label: string;
  icon?: React.ReactNode | null;
  showIcon?: boolean;
  /** When true, shows a radio-style indicator on the right instead of chevron. */
  showSelectionIndicator?: boolean;
  selected?: boolean;
  onPress?: () => void;
  containerStyle?: ViewProps['style'];
  labelStyle?: ViewProps['style'];
  iconContainerStyle?: ViewProps['style'];
}

export const SelectSection = forwardRef<React.ComponentRef<typeof Pressable>, SelectSectionProps>(
  (
    {
      label,
      icon,
      showIcon = true,
      showSelectionIndicator = false,
      selected = false,
      onPress,
      containerStyle,
      labelStyle,
      iconContainerStyle,
      style,
      ...pressableProps
    },
    ref
  ) => {
    const colorScheme = useAppColorScheme();
    const isDarkMode = getIsDarkMode(colorScheme);
    const styles = getStyles(isDarkMode);

    const iconNode =
      showIcon &&
      (icon != null ? (
        typeof icon === 'string' ? (
          <Icon name={icon as any} size={20} color={THEME.colors.primaryBlue} />
        ) : (
          icon
        )
      ) : null);

    const rightContent = showSelectionIndicator ? (
      <View style={styles.radioWrap}>
        <View
          style={[
            styles.radioOuter,
            selected
              ? styles.radioOuterSelected
              : { borderColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder },
          ]}>
          {selected && <View style={styles.radioInner} />}
        </View>
      </View>
    ) : (
      <View style={styles.chevron}>
        <Icon
          name="chevron-right"
          size={18}
          color={isDarkMode ? THEME.colors.textSecondaryDark : THEME.colors.textSecondaryLight}
        />
      </View>
    );

    const content = (
      <>
        {/* {iconNode != null && <View style={[styles.iconWrap, iconContainerStyle]}>{iconNode}</View>} */}
        <Text title={label} variant="Primary" textStyle={[styles.label, labelStyle]} />
        {rightContent}
      </>
    );

    return (
      <Pressable
        ref={ref}
        style={({ pressed }) => {
          const s = containerStyle ?? style;
          const flatStyle = typeof s === 'function' ? s({ pressed }) : s;
          return [styles.row, pressed && styles.pressed, flatStyle];
        }}
        onPress={onPress}
        {...pressableProps}>
        {content}
      </Pressable>
    );
  }
);

SelectSection.displayName = 'SelectSection';

function getStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder,
    },
    pressed: {
      opacity: 0.8,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 16,
      backgroundColor: 'rgba(0,136,255,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
    },
    chevron: {
      marginLeft: 'auto',
    },
    radioWrap: {
      marginLeft: 'auto',
    },
    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOuterSelected: {
      borderColor: THEME.colors.primaryBlue,
      backgroundColor: THEME.colors.primaryBlue,
    },
    radioInner: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: THEME.colors.white,
    },
  });
}
