import { THEME } from "@/utils/theme.utils";
import { StyleSheet } from "react-native";

export function getStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? THEME.colors.darkBackground : THEME.colors.white,
    },
    safeArea: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: THEME.spacing.screenHorizontal,
      paddingTop: THEME.spacing.marginVerticalL,
      paddingBottom: THEME.spacing.marginVerticalL,
    },
    sectionLabel: {
      marginBottom: 10,
      marginTop: 24,
      fontWeight: '700',
    },
    sectionLabelFirst: {
      marginTop: 0,
    },
    stockInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? THEME.colors.darkCard : THEME.colors.lightBackground,
      borderColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder,
      borderRadius: 12,
      borderWidth: 1,
      minHeight: 52,
    },
    stockInputLeft: {
      paddingLeft: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stockInputContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 8,
      paddingRight: 12,
      paddingVertical: 8,
      gap: 8,
    },
    chip: {
      alignSelf: 'center',
    },
    placeholder: {
      fontSize: 16,
    },
    priceRow: {
      marginTop: 14,
      gap: 6,
    },
    currentPrice: {
      fontSize: 28,
      fontWeight: '700',
    },
    changeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    changeText: {
      fontSize: 14,
      fontWeight: '500',
    },
    dollarIcon: {
      fontSize: 16,
      fontWeight: '600',
    },
    input: {
      marginBottom: 0,
      backgroundColor: isDarkMode ? THEME.colors.darkCard : THEME.colors.lightBackground,
      borderColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder,
      borderRadius: 12,
    },
    segmentedRow: {
      flexDirection: 'row',
      backgroundColor: isDarkMode ? THEME.colors.darkCard : THEME.colors.white,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder,
      overflow: 'hidden',
    },
    segment: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      gap: 8,
    },
    segmentActive: {
      backgroundColor: THEME.colors.primaryBlue,
    },
    segmentLabel: {
      fontSize: 16,
    },
    segmentLabelActive: {
      color: THEME.colors.white,
    },
    description: {
      marginTop: 14,
      marginBottom: 24,
      fontSize: 14,
      lineHeight: 20,
    },
    validationError: {
      marginTop: -16,
      marginBottom: 24,
      fontSize: 14,
      color: THEME.colors.errorIcon,
    },
    buttonBottom: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 24,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder,
      backgroundColor: isDarkMode ? THEME.colors.darkBackground : THEME.colors.lightBackground,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginHorizontal: 0,
      alignSelf: 'stretch',
      width: '100%',
    },
    primaryButtonDisabled: {
      backgroundColor: THEME.colors.lightGrey,
      shadowOpacity: 0,
      elevation: 0,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: THEME.colors.white,
    },
    buttonTextDisabled: {
      color: THEME.colors.darkGrey,
    },
  });
}
