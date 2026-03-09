import { StyleSheet } from 'react-native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

export const colors = {
  // Brand / accent
  primaryBlue: '#2196F3',
  subtleBlue: '#81A6ED',
  // Header gradient (purple to blue)
  gradientStart: '#8B5CF6',
  gradientEnd: '#2196F3',
  avatarBorder: 'rgba(139, 92, 246, 0.4)',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  lightGrey: '#888888',
  darkGrey: '#212121',

  // Dark mode surfaces
  darkBackground: '#0D0D1A',
  darkCard: '#1A1A2E',
  darkBorder: '#3E445B',

  // Light mode surfaces
  lightBackground: '#F5F5F5',
  lightCard: '#FFFFFF',
  lightBorder: '#E0E0E0',

  // Semantic
  positive: '#4CAF50',
  negative: '#EF5350',
  successIcon: '#00C853',
  errorIcon: '#FF5252',
  notification: '#F44336',
  orange: '#F59E0B',
  purple: '#A855F7',
  textPrimaryDark: '#F1F5F9',
  textPrimaryLight: '#101518',
  textSecondaryDark: '#64748B',
  textSecondaryLight: '#5E778D',
} as const;

/** Inter font family names (normal/variant names). Load via useLoadFont from useTheme. */
export const fontFamily = {
  thin: 'Inter_100Thin',
  extraLight: 'Inter_200ExtraLight',
  light: 'Inter_300Light',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extraBold: 'Inter_800ExtraBold',
  black: 'Inter_900Black',
} as const;

export const spacing = {
  screenHorizontal: 20,
  headerTopPadding: 40,
  marginVerticalL: 24,
  marginVerticalM: 16,
  inputPaddingHorizontal: 16,
  inputPaddingVertical: 12,
  textGap: 8,
  cardPaddingHorizontal: 16,
  cardPaddingVertical: 16,
  borderRadius: 12,
  fabSize: 56,
  fabMargin: 20,
  bottomNavHeight: 60,
  bottomNavPaddingVertical: 8,
} as const;

export const flex = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center' },
  start: { alignItems: 'flex-start', justifyContent: 'flex-start' },
  end: { alignItems: 'flex-end', justifyContent: 'flex-end' },
  alignCenter: { alignItems: 'center' },
  alignStart: { alignItems: 'flex-start' },
  alignEnd: { alignItems: 'flex-end' },
  alignStretch: { alignItems: 'stretch' },
  alignBase: { alignItems: 'baseline' },
  justifyCenter: { justifyContent: 'center' },
  justifyStart: { justifyContent: 'flex-start' },
  justifyEnd: { justifyContent: 'flex-end' },
  spaceBetween: { justifyContent: 'space-between' },
  spaceAround: { justifyContent: 'space-around' },
  spaceEvenly: { justifyContent: 'space-evenly' },
  fill: { height: '100%', width: '100%' },
  fillH: { height: '100%' },
  fillW: { width: '100%' },
  col: { display: 'flex', flexDirection: 'column' },
  row: { display: 'flex', flexDirection: 'row' },
  flex1: { flex: 1 },
  flex2: { flex: 2 },
});

const lightThemeColors = {
  primary: colors.primaryBlue,
  background: colors.lightBackground,
  card: colors.lightCard,
  text: colors.darkGrey,
  border: colors.lightBorder,
  notification: colors.notification,
};

const darkThemeColors = {
  primary: colors.primaryBlue,
  background: colors.darkBackground,
  card: colors.darkCard,
  text: colors.white,
  border: colors.darkBorder,
  notification: colors.notification,
};

export const lightTheme = {
  ...DefaultTheme,
  colors: lightThemeColors,
};

export const darkTheme = {
  ...DarkTheme,
  colors: darkThemeColors,
};

export const THEME = {
  colors,
  darkTheme,
  lightTheme,
  spacing,
  flex,
  fontFamily,
} as const;
