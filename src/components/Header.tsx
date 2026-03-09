import React from 'react';
import { View, ViewProps, Pressable, StyleSheet, TextProps } from 'react-native';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { useAppColorScheme } from '@/store/preferences.context';
import { Text } from './Text';
import { CanRender } from './CanRender';

export type TitleAlign = 'left' | 'center' | 'right';

export interface HeaderProps extends ViewProps {
  title?: string;
  titleAlign?: TitleAlign;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  containerStyle?: ViewProps['style'];
  leftSectionStyle?: ViewProps['style'];
  centerSectionStyle?: ViewProps['style'];
  rightSectionStyle?: ViewProps['style'];
  titleStyle?: TextProps['style'];
}

export function Header({
  title,
  titleAlign = 'left',
  leftIcon,
  rightIcon,
  leftElement,
  rightElement,
  onLeftPress,
  onRightPress,
  containerStyle,
  leftSectionStyle,
  centerSectionStyle,
  rightSectionStyle,
  style,
  ...rest
}: HeaderProps) {
  const colorScheme = useAppColorScheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const styles = getStyles(isDarkMode);

  const leftContent =
    leftElement ??
    (leftIcon != null && onLeftPress != null ? (
      <Pressable onPress={onLeftPress} style={({ pressed }) => pressed && { opacity: 0.7 }}>
        {leftIcon}
      </Pressable>
    ) : (
      (leftIcon ?? leftElement)
    ));

  const rightContent =
    rightElement ??
    (rightIcon != null && onRightPress != null ? (
      <Pressable onPress={onRightPress} style={({ pressed }) => pressed && { opacity: 0.7 }}>
        {rightIcon}
      </Pressable>
    ) : (
      (rightIcon ?? rightElement)
    ));

  const resolvedCenter =
    titleAlign === 'center'
      ? styles.centerCenter
      : titleAlign === 'right'
        ? styles.centerRight
        : styles.centerLeft;

  const isCenterAbsolute = titleAlign === 'center' && title != null;

  return (
    <View style={[styles.container, containerStyle ?? style]} {...rest}>
      <CanRender condition={Boolean(leftContent)}>
        <View style={[styles.left, leftSectionStyle]}>{leftContent}</View>
      </CanRender>
      <CanRender condition={Boolean(rightContent)}>
        <View style={[styles.right, rightSectionStyle]}>{rightContent}</View>
      </CanRender>
      <CanRender condition={Boolean(title)}>
        <View
          style={[resolvedCenter, centerSectionStyle, isCenterAbsolute && styles.centerAbsolute]}
          pointerEvents={isCenterAbsolute ? 'box-none' : undefined}>
          {title != null && (
            <Text
              font="bold"
              title={title}
              variant="Primary"
              textStyle={[styles.title, rest.titleStyle]}
            />
          )}
        </View>
      </CanRender>
    </View>
  );
}

Header.displayName = 'Header';

function getStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      paddingTop: 24,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder,
      backgroundColor: isDarkMode ? 'rgba(13,13,26,0.8)' : 'rgba(255,255,255,0.95)',
    },
    left: {
      minWidth: 48,
      alignItems: 'flex-start',
    },
    centerLeft: {
      flex: 1,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    centerCenter: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerAbsolute: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    centerRight: {
      flex: 1,
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    right: {
      minWidth: 48,
      alignItems: 'flex-end',
    },
    title: {
      fontSize: 28,
    },
  });
}
