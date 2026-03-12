import React from 'react';
import {
  View,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  ColorSchemeName,
  ViewStyle,
} from 'react-native';
import { useAppColorScheme } from '@/context/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';

export interface TextInputProps extends RNTextInputProps {
  containerStyle?: ViewStyle;
  inputStyle?: RNTextInputProps['style'];
  leftIconContainerStyle?: ViewStyle;
  rightIconContainerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function TextInput({
  containerStyle,
  inputStyle,
  leftIconContainerStyle,
  rightIconContainerStyle,
  leftIcon,
  rightIcon,
  placeholder,
  placeholderTextColor,
  style,
  ...rest
}: TextInputProps) {
  const colorScheme = useAppColorScheme();
  const styles = getDinamicStyles(colorScheme);

  const placeholderColor =
    placeholderTextColor ??
    (getIsDarkMode(colorScheme) ? THEME.colors.textSecondaryDark : THEME.colors.textSecondaryLight);

  return (
    <View style={[styles.container, containerStyle]}>
      {leftIcon != null && (
        <View style={[styles.leftIcon, leftIconContainerStyle]}>{leftIcon}</View>
      )}
      <RNTextInput
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        style={[styles.input, leftIcon != null && styles.inputWithLeftIcon, inputStyle ?? style]}
        {...rest}
      />
      {rightIcon != null && (
        <View style={[styles.rightIcon, rightIconContainerStyle]}>{rightIcon}</View>
      )}
    </View>
  );
}

TextInput.displayName = 'TextInput';

const getDinamicStyles = (colorScheme: ColorSchemeName) => {
  const isDarkMode = getIsDarkMode(colorScheme);
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? THEME.colors.darkCard : THEME.colors.lightCard,
      borderColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder,
      borderRadius: 10,
      borderWidth: 1,
      minHeight: 48,
    },
    input: {
      flex: 1,
      paddingHorizontal: THEME.spacing.inputPaddingHorizontal,
      paddingVertical: THEME.spacing.inputPaddingVertical,
      fontSize: 16,
      color: isDarkMode ? THEME.colors.textPrimaryDark : THEME.colors.textPrimaryLight,
    },
    inputWithLeftIcon: {
      paddingLeft: 8,
    },
    leftIcon: {
      paddingLeft: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    rightIcon: {
      paddingRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
};

export default TextInput;
