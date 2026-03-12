import React from 'react';
import { Text as TextRN, TextProps, StyleSheet, ColorSchemeName } from 'react-native';
import { useAppColorScheme } from '@/context/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';

export type TextVariant = 'Primary' | 'Secondary' | 'caption' | 'overline' | 'mono' | 'link';

export type ThemeFontFamilyKey = keyof typeof THEME.fontFamily;

export interface TextComponentProps extends TextProps {
  title?: string;
  textStyle?: TextProps['style'];
  variant?: TextVariant;
  font?: ThemeFontFamilyKey;
}

export function Text({
  title,
  textStyle,
  variant = 'Primary',
  font: fontKey,
  style,
  ...rest
}: TextComponentProps) {
  const colorScheme = useAppColorScheme();
  const styles = getDinamicStyle(colorScheme);
  const variantStyle = getVariantStyle(styles, variant);
  const fontFamilyStyle = fontKey != null ? { fontFamily: THEME.fontFamily[fontKey] } : undefined;

  return (
    <TextRN {...rest} style={[variantStyle, fontFamilyStyle, textStyle, style]}>
      {title ?? rest.children}
    </TextRN>
  );
}

Text.displayName = 'Text';

function getVariantStyle(base: ReturnType<typeof getDinamicStyle>, variant: TextVariant) {
  switch (variant) {
    case 'Secondary':
      return base.textSecondary;
    case 'caption':
      return base.caption;
    case 'overline':
      return base.overline;
    case 'mono':
      return base.mono;
    case 'link':
      return base.link;
    default:
      return base.textPrimary;
  }
}

const getDinamicStyle = (colorScheme: ColorSchemeName) => {
  const isDarkMode = getIsDarkMode(colorScheme);
  return StyleSheet.create({
    textPrimary: {
      color: isDarkMode ? THEME.colors.textPrimaryDark : THEME.colors.textPrimaryLight,
    },
    textSecondary: {
      color: isDarkMode ? THEME.colors.textSecondaryDark : THEME.colors.textSecondaryLight,
    },
    caption: {
      color: isDarkMode ? '#94a3b8' : THEME.colors.textSecondaryLight,
      fontSize: 14,
    },
    overline: {
      color: isDarkMode ? '#94a3b8' : THEME.colors.textSecondaryLight,
      fontSize: 12,
      fontWeight: '600',
      letterSpacing: 0.7,
      textTransform: 'uppercase',
    },
    mono: {
      color: isDarkMode ? THEME.colors.textPrimaryDark : THEME.colors.textPrimaryLight,
      fontFamily: undefined,
    },
    link: {
      color: THEME.colors.primaryBlue,
    },
  });
};
