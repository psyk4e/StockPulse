import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppColorScheme } from '@/store/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { Text } from '@/components/Text';

export function AuthLoadingScreen() {
  const colorScheme = useAppColorScheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const { t } = useTranslation();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? THEME.colors.darkBackground : THEME.colors.lightBackground,
    },
    text: {
      marginTop: 12,
    },
  });

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={THEME.colors.primaryBlue} />
      <Text
        title={t('login.loading')}
        variant="Secondary"
        font="regular"
        textStyle={styles.text}
      />
    </View>
  );
}
