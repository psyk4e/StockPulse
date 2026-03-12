import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from './Card';
import { Text } from '../Text';
import { useAppColorScheme } from '@/context/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import type { MarketStatusResponse } from '@/services/finnhub.service';

/** Session chip colors (rgba) aligned with chart palette */
const SESSION_CHIP_COLORS: Record<'pre-market' | 'regular' | 'post-market' | 'closed', string> = {
  'pre-market': 'rgba(255, 152, 0, 0.9)', // #FF9800 orange
  regular: 'rgba(76, 175, 80, 0.9)', // #4CAF50 green
  'post-market': 'rgba(156, 39, 176, 0.9)', // #9C27B0 purple
  closed: 'rgba(136, 136, 136, 0.9)', // grey
};

function formatMarketDate(timestamp: number): string {
  const d = new Date(timestamp * 1000);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export interface MarketStatusCardProps {
  status: MarketStatusResponse | null;
  loading?: boolean;
  error?: boolean;
  containerStyle?: React.ComponentProps<typeof Card>['containerStyle'];
}

function sessionKey(session: MarketStatusResponse['session']): string {
  if (session === 'pre-market') return 'home.sessionPreMarket';
  if (session === 'regular') return 'home.sessionRegular';
  if (session === 'post-market') return 'home.sessionPostMarket';
  return 'home.marketClosed';
}

export function MarketStatusCard({
  status,
  loading = false,
  error = false,
  containerStyle,
}: MarketStatusCardProps) {
  const { t } = useTranslation();
  const colorScheme = useAppColorScheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const styles = getStyles(isDarkMode);

  if (loading) {
    return (
      <Card containerStyle={[styles.card, containerStyle]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text variant="Primary" title={t('home.usMarketTitle')} textStyle={styles.title} />
            <Text variant="Secondary" title="..." textStyle={styles.subtitle} />
          </View>
          <View style={styles.rightCol}>
            <View style={[styles.chip, styles.chipNeutral]}>
              <Text variant="Secondary" title="..." textStyle={styles.chipText} />
            </View>
            <Text variant="Secondary" title="..." textStyle={styles.isOpenLabel} />
          </View>
        </View>
      </Card>
    );
  }

  if (error || status == null) {
    const sessionLabel = error ? t('home.marketStatusUnavailable') : t('home.marketClosed');
    return (
      <Card containerStyle={[styles.card, containerStyle]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text variant="Primary" title={t('home.usMarketTitle')} textStyle={styles.title} />
            <Text
              variant="Secondary"
              title={t('home.marketIsClosed')}
              textStyle={styles.subtitle}
            />
          </View>
          <View style={styles.rightCol}>
            <View style={[styles.chip, styles.chipClosed]}>
              <Text variant="Secondary" title={sessionLabel} textStyle={styles.chipText} />
            </View>
            <Text
              variant="Secondary"
              title={t('home.marketIsClosed')}
              textStyle={styles.isOpenLabel}
            />
          </View>
        </View>
      </Card>
    );
  }

  const sessionLabel = status.session ? t(sessionKey(status.session)) : t('home.marketClosed');
  const isOpenLabel = status.isOpen ? t('home.marketOpen') : t('home.marketIsClosed');
  const subtitle = [status.timezone, status.t ? formatMarketDate(status.t) : null]
    .filter(Boolean)
    .join(' • ');
  const sessionKeyForColor = status.session ?? ('closed' as const);
  const chipBgColor =
    sessionKeyForColor === 'closed'
      ? isDarkMode
        ? THEME.colors.darkBorder
        : THEME.colors.lightGrey
      : SESSION_CHIP_COLORS[sessionKeyForColor];

  return (
    <Card containerStyle={[styles.card, containerStyle]}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text variant="Primary" title={t('home.usMarketTitle')} textStyle={styles.title} />
          {subtitle ? (
            <Text variant="Secondary" title={subtitle} textStyle={styles.subtitle} />
          ) : null}
        </View>
        <View style={styles.rightCol}>
          <View style={[styles.chip, { backgroundColor: chipBgColor }]}>
            <Text variant="Secondary" title={sessionLabel} textStyle={styles.chipText} />
          </View>
          <Text variant="Secondary" title={isOpenLabel} textStyle={styles.isOpenLabel} />
        </View>
      </View>
      {status.holiday ? (
        <Text variant="caption" title={status.holiday} textStyle={styles.holiday} />
      ) : null}
    </Card>
  );
}

MarketStatusCard.displayName = 'MarketStatusCard';

function getStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    card: {
      marginBottom: 12,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
    },
    headerLeft: {
      flex: 1,
      gap: 2,
    },
    rightCol: {
      alignItems: 'flex-end',
      gap: 6,
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
    },
    subtitle: {
      fontSize: 13,
      marginTop: 2,
      color: isDarkMode ? THEME.colors.textSecondaryDark : THEME.colors.textSecondaryLight,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      minHeight: 32,
      justifyContent: 'center',
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: THEME.colors.white,
    },
    isOpenLabel: {
      fontSize: 12,
      color: isDarkMode ? THEME.colors.textSecondaryDark : THEME.colors.textSecondaryLight,
    },
    chipClosed: {
      backgroundColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightGrey,
    },
    chipNeutral: {
      backgroundColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder,
    },
    holiday: {
      fontSize: 12,
      marginTop: 10,
      color: isDarkMode ? THEME.colors.textSecondaryDark : THEME.colors.textSecondaryLight,
    },
  });
}
