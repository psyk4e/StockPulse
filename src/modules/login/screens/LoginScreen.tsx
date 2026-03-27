import { View, StyleSheet, ScrollView, Pressable } from 'react-native';

import { THEME } from '@/utils/theme.utils';
import { SafeAreaView } from '@/components/SafeAreaView';
import { Logo } from '../../../components/Logo';
import { Text } from '@/components/Text';
import { Button } from '@/components/buttons/Button';
import { StatusBar } from '@/components/StatusBar';
import { BottomSheetResult } from '@/components/bottomSheet/BottomSheetResult';
import { getIsDarkMode } from '@/utils/styles.utils';
import { useAppColorScheme } from '@/context/preferences.context';
import { useLoginScreen } from '../hooks/useLoginScreen';

export default function LoginScreen() {
  const colorScheme = useAppColorScheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const styles = getStyles(isDarkMode);

  const { errorSheetRef, error, isSigningIn, t, handleCloseError, handleSignIn, handleSignUp } =
    useLoginScreen();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.topSection}>
          <Logo />
          <Text title={t('login.title')} variant="Primary" font="bold" textStyle={styles.title} />
          <Text
            title={t('login.subtitle')}
            variant="Secondary"
            font="regular"
            textStyle={styles.subtitle}
          />
        </View>

        <View style={styles.bottomSection}>
          <Button
            title={t('login.button')}
            variant="primary"
            onPress={handleSignIn}
            disabled={isSigningIn}
            textStyle={{ fontFamily: THEME.fontFamily.semiBold }}
          />
          <Text
            title={t('login.disclaimer')}
            variant="Secondary"
            font="regular"
            textStyle={styles.disclaimer}
          />
          <View style={styles.signupRow}>
            <Text>{t('login.signupAsk')}</Text>
            <Pressable onPress={handleSignUp} disabled={isSigningIn} hitSlop={8}>
              <Text style={[styles.signupLink, { fontFamily: THEME.fontFamily.medium }]}>
                {t('login.signupLink')}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
      <BottomSheetResult.Error
        ref={errorSheetRef}
        snapPoints={['35%']}
        title={t('login.errorGeneric')}
        message={error?.message}
        onSecondaryPress={handleCloseError}
        onClose={handleCloseError}
      />
    </ScrollView>
  );
}

function getStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? THEME.colors.darkBackground : THEME.colors.lightBackground,
      paddingHorizontal: THEME.spacing.screenHorizontal,
    },
    safeArea: {
      flex: 1,
      justifyContent: 'space-between',
    },
    title: {
      marginTop: 16,
      fontSize: 28,
      textAlign: 'center',
    },
    subtitle: {
      marginTop: 8,
      fontSize: 16,
      textAlign: 'center',
    },
    disclaimer: {
      fontSize: 12,
      textAlign: 'center',
      marginTop: 8,
    },
    signupLink: {
      fontSize: 14,
      textAlign: 'center',
      color: THEME.colors.primary,
    },
    topSection: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: THEME.spacing.marginVerticalL,
    },
    bottomSection: {
      paddingBottom: THEME.spacing.marginVerticalL,
      gap: 16,
      alignItems: 'stretch',
    },
    signupRow: {
      justifyContent: 'center',
      flexDirection: 'row',
      gap: THEME.spacing.textGap,
    },
  });
}
