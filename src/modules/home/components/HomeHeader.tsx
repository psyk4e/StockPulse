import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppColorScheme } from '@/store/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Logo } from '@/components/Logo';
import { useAuth } from '@/store/auth.context';

const AVATAR_SIZE = 36;

export function HomeHeader() {
  const { user } = useAuth();
  const colorScheme = useAppColorScheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const { t } = useTranslation();
  const styles = getStyles(isDarkMode);

  const leftElement = (
    <View style={styles.leftRow}>
      <Logo height={44} width={44} />
      <View style={styles.textBlock}>
        <Text
          title={t('home.liveInsights')}
          variant="Secondary"
          font="semiBold"
          textStyle={styles.liveInsights}
        />
        <Text
          title={t('home.greeting', { name: user?.name })}
          variant="Primary"
          font="bold"
          textStyle={styles.greeting}
        />
      </View>
    </View>
  );

  return <Header leftElement={leftElement} leftSectionStyle={styles.leftSection} />;
}

HomeHeader.displayName = 'HomeHeader';

function getStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    leftSection: {
      minWidth: undefined,
      flex: 1,
    },
    leftRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    textBlock: {
      flex: 1,
      justifyContent: 'center',
      gap: 2,
    },
    liveInsights: {
      fontSize: 11,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    greeting: {
      fontSize: 20,
    },
    avatarRing: {
      width: AVATAR_SIZE + 2,
      height: AVATAR_SIZE + 2,
      borderRadius: (AVATAR_SIZE + 2) / 2,
      borderWidth: 1,
      borderColor: THEME.colors.avatarBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
