import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import { THEME } from '@/utils/theme.utils';
import { Text } from '@/components/Text';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/buttons/Button';
import { StatusBar } from '@/components/StatusBar';
import { SafeAreaView } from '@/components/SafeAreaView';
import { useSecurityStore } from '@/store/security.store';

const PASSCODE_LENGTH = 4;
const KEYPAD_NUMBERS = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [null, 0, 'backspace'],
] as const;

type KeyValue = number | 'backspace' | null;

export default function BiometricLockScreen() {
  const { t } = useTranslation();
  const unlock = useSecurityStore((s) => s.unlock);
  const faceIdEnabled = useSecurityStore((s) => s.faceIdEnabled);
  const passcode = useSecurityStore((s) => s.passcode);

  const [showPasscode, setShowPasscode] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const attemptBiometric = useCallback(async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        setShowPasscode(true);
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('security.biometricPrompt'),
        fallbackLabel: t('security.biometricFallback'),
        cancelLabel: t('security.cancel'),
        disableDeviceFallback: false,
      });
      if (result.success) {
        unlock();
      } else {
        setShowPasscode(true);
      }
    } catch {
      setShowPasscode(true);
    }
  }, [unlock, t]);

  useEffect(() => {
    if (faceIdEnabled) {
      void attemptBiometric();
    } else {
      setShowPasscode(true);
    }
  }, [faceIdEnabled, attemptBiometric]);

  const handleKeyPress = useCallback(
    (key: KeyValue) => {
      if (key === null) return;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (key === 'backspace') {
        setCode((prev) => prev.slice(0, -1));
        setError('');
        return;
      }

      setCode((prev) => {
        const next = prev + String(key);
        if (next.length === PASSCODE_LENGTH) {
          if (next === passcode) {
            unlock();
            return '';
          }
          setError(t('security.passcodeMismatch'));
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          return '';
        }
        return next;
      });
    },
    [passcode, unlock, t]
  );

  if (showPasscode) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <View style={styles.passcodeContent}>
            <Text title={t('security.enterYourPasscode')} textStyle={styles.title} />
            <Text title={t('security.passcodeSubtitle')} textStyle={styles.subtitle} />

            <View style={styles.dots}>
              {Array.from({ length: PASSCODE_LENGTH }).map((_, i) => (
                <View key={i} style={styles.dot}>
                  {i < code.length ? <View style={styles.dotInner} /> : null}
                </View>
              ))}
            </View>

            {error ? <Text title={error} textStyle={styles.errorText} /> : null}
          </View>

          <View style={styles.keypad}>
            {KEYPAD_NUMBERS.map((row, rowIdx) => (
              <View key={rowIdx} style={styles.keypadRow}>
                {row.map((key, colIdx) => (
                  <Pressable
                    key={colIdx}
                    style={({ pressed }) => [
                      styles.key,
                      key === null && styles.keyEmpty,
                      pressed && key !== null && styles.keyPressed,
                    ]}
                    onPress={() => handleKeyPress(key as KeyValue)}
                    disabled={key === null}>
                    {key === 'backspace' ? (
                      <Icon name="backspace" size={24} color={THEME.colors.white} />
                    ) : key !== null ? (
                      <Text title={String(key)} textStyle={styles.keyText} />
                    ) : null}
                  </Pressable>
                ))}
              </View>
            ))}
          </View>

          {faceIdEnabled ? (
            <Pressable onPress={() => void attemptBiometric()} style={styles.retryBiometric}>
              <Icon name="face-id" size={20} color={THEME.colors.primaryBlue} />
              <Text title={t('security.signInWithFaceId')} textStyle={styles.retryBiometricText} />
            </Pressable>
          ) : null}

          <Text title={t('security.stockpulseSecure')} textStyle={styles.secureText} />
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.biometricContent}>
          <Text title={t('security.lockTitle')} textStyle={styles.appTitle} />

          <View style={styles.faceIdIconContainer}>
            <Icon name="face-id" size={56} color={THEME.colors.primaryBlue} />
          </View>

          <Text title={t('security.signInWithFaceId')} textStyle={styles.title} />
          <Text title={t('security.biometricSubtitle')} textStyle={styles.subtitle} />

          {passcode ? (
            <Button
              variant="outline"
              title={t('security.enterPasscode')}
              onPress={() => setShowPasscode(true)}
              style={styles.passcodeButton}
            />
          ) : null}

          <Pressable onPress={() => void attemptBiometric()} style={styles.troubleLink}>
            <Text title={t('security.troubleSigningIn')} textStyle={styles.troubleLinkText} />
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Icon name="lock" size={14} color={THEME.colors.textSecondaryDark} />
          <Text title={t('security.secureEncryption')} textStyle={styles.secureText} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const KEY_SIZE = 72;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.darkBackground,
  },
  safeArea: {
    flex: 1,
  },
  biometricContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.colors.white,
    marginBottom: 32,
  },
  faceIdIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME.colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondaryDark,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  passcodeButton: {
    width: '100%',
    marginHorizontal: 0,
    marginBottom: 16,
  },
  troubleLink: {
    padding: 8,
  },
  troubleLinkText: {
    fontSize: 14,
    color: THEME.colors.primaryBlue,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 16,
  },
  secureText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textSecondaryDark,
    textAlign: 'center',
    letterSpacing: 1,
    paddingBottom: 16,
  },
  passcodeContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  dots: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  dot: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: THEME.colors.darkBorder,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  dotInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: THEME.colors.primaryBlue,
  },
  errorText: {
    fontSize: 13,
    color: THEME.colors.negative,
    textAlign: 'center',
    marginTop: 8,
  },
  keypad: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  key: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    borderRadius: KEY_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyEmpty: {
    backgroundColor: 'transparent',
  },
  keyPressed: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  keyText: {
    fontSize: 28,
    fontWeight: '500',
    color: THEME.colors.white,
  },
  retryBiometric: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  retryBiometricText: {
    fontSize: 14,
    color: THEME.colors.primaryBlue,
  },
});
