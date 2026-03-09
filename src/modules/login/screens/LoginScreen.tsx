import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppColorScheme } from '@/store/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { SafeAreaView } from '@/components/SafeAreaView';
import { Logo } from '../../../components/Logo';
import { Text } from '@/components/Text';
import { Button } from '@/components/buttons/Button';
import { StatusBar } from '@/components/StatusBar';
import { BottomSheetError } from '@/components/bottomSheet/BottomSheetError';
import { useAuth, AUTH_ERROR_USER_CANCELLED } from '@/store/auth.context';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';

export default function LoginScreen() {
  const { signIn, error, clearError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const errorSheetRef = useRef<BottomSheetModal>(null);
  const colorScheme = useAppColorScheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const styles = getStyles(isDarkMode);
  const { t } = useTranslation();

  useEffect(() => {
    if (error && error.message !== AUTH_ERROR_USER_CANCELLED) {
      errorSheetRef.current?.present();
    }
  }, [error]);

  const handleCloseError = useCallback(() => {
    errorSheetRef.current?.dismiss();
    clearError();
  }, [clearError]);

  const handleSignIn = useCallback(async () => {
    clearError();
    setIsSigningIn(true);
    try {
      await signIn();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message === AUTH_ERROR_USER_CANCELLED) {
        clearError(); // Ensure no error modal is shown on cancel.
      }
    } finally {
      setIsSigningIn(false);
    }
  }, [signIn, clearError]);

  const handleSignUp = useCallback(async () => {
    clearError();
    setIsSigningIn(true);
    try {
      await signIn({ screenHint: 'signup' });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message === AUTH_ERROR_USER_CANCELLED) {
        clearError(); // Ensure no error modal is shown on cancel.
      }
    } finally {
      setIsSigningIn(false);
    }
  }, [signIn, clearError]);

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
      <BottomSheetError
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
      color: THEME.colors.primaryBlue,
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
