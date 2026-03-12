import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { THEME } from '@/utils/theme.utils';
import { Text } from '@/components/Text';
import { Icon } from '@/components/Icon';
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

interface Props {
  onComplete: () => void;
  onCancel: () => void;
}

export default function PasscodeSetupScreen({ onComplete, onCancel }: Props) {
  const { t } = useTranslation();
  const setPasscode = useSecurityStore((s) => s.setPasscode);

  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [code, setCode] = useState('');
  const [firstCode, setFirstCode] = useState('');
  const [error, setError] = useState('');
  const [shakeKey, setShakeKey] = useState(0);

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
          if (step === 'enter') {
            setFirstCode(next);
            setStep('confirm');
            return '';
          }
          if (next === firstCode) {
            setPasscode(next);
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onComplete();
            return '';
          }
          setError(t('security.passcodeMismatch'));
          setShakeKey((k) => k + 1);
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          setStep('enter');
          setFirstCode('');
          return '';
        }
        return next;
      });
    },
    [step, firstCode, setPasscode, onComplete, t]
  );

  const title =
    step === 'enter' ? t('security.enterYourPasscode') : t('security.confirmYourPasscode');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={onCancel} hitSlop={12} style={styles.closeButton}>
            <Icon name="close" size={22} color={THEME.colors.white} />
          </Pressable>
          <Text title={t('security.setPasscodeTitle')} textStyle={styles.headerTitle} />
          <View style={styles.closeButton} />
        </View>

        <View style={styles.content}>
          <Text title={title} textStyle={styles.title} key={`title-${shakeKey}`} />
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

        <Text title={t('security.stockpulseSecure')} textStyle={styles.secureText} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.screenHorizontal,
    paddingVertical: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: THEME.colors.white,
    textAlign: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.colors.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.colors.textSecondaryDark,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
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
  secureText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textSecondaryDark,
    textAlign: 'center',
    letterSpacing: 2,
    paddingBottom: 16,
  },
});
