import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { SafeAreaView } from '@/components/SafeAreaView';
import { Text } from '@/components/Text';
import { StatusBar } from '@/components/StatusBar';
import { useTheme, useNavigation } from '@react-navigation/native';
import { Header, CardActiveAlerts } from '@/components';
import { useAlertsStore } from '@/store/alerts.store';
import { useQuotesForSymbols } from '@context/live-prices.context';
import { AlertsEmptyIllustration } from '../components/AlertsEmptyIllustration';
import { formatCondition, formatCurrentOrTriggered } from '../utils/alert.utils';
import { useAppColorScheme } from '@/context/preferences.context';

export default function AlertsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const alerts = useAlertsStore((s) => s.alerts);
  const updateAlert = useAlertsStore((s) => s.updateAlert);
  const alertSymbols = useMemo(() => alerts.map((a) => a.symbol), [alerts]);
  const colorScheme = useAppColorScheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const quotes = useQuotesForSymbols(alertSymbols);

  const listData = useMemo(() => {
    return alerts.map((alert) => {
      const quote = quotes[alert.symbol];
      const currentPrice = quote?.c;
      const status = alert.triggeredAt != null ? ('triggered' as const) : ('active' as const);
      return {
        ...alert,
        condition: formatCondition(alert),
        currentOrTriggered: formatCurrentOrTriggered(alert, currentPrice),
        status,
      };
    });
  }, [alerts, quotes]);

  const handleEditAlert = useCallback(
    (id: string) => {
      navigation.navigate('Stacknavigator', {
        screen: 'CreateAlert',
        params: { alertId: id },
      });
    },
    [navigation]
  );

  const handleToggleEnabled = useCallback(
    (id: string, value: boolean) => {
      updateAlert(id, { enabled: value });
    },
    [updateAlert]
  );

  const renderItem = useCallback(
    ({ item }: { item: (typeof listData)[number] }) => (
      <CardActiveAlerts
        symbol={item.symbol}
        status={item.status}
        condition={item.condition}
        currentOrTriggered={item.currentOrTriggered}
        value={item.enabled}
        onValueChange={(value) => handleToggleEnabled(item.id, value)}
        onPress={() => handleEditAlert(item.id)}
        containerStyle={styles.cardItem}
      />
    ),
    [handleToggleEnabled, handleEditAlert, styles.cardItem]
  );

  const keyExtractor = useCallback((item: (typeof listData)[number]) => item.id, []);

  const ListHeaderComponent = useCallback(
    () => (
      <Text font="semiBold" style={styles.sectionTitle}>
        {t('alerts.activeAlerts', { count: listData.length })}
      </Text>
    ),
    [t, listData.length, styles.sectionTitle]
  );

  const isEmpty = alerts.length === 0;

  if (isEmpty) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={theme.colors.notification} />
        <SafeAreaView
          edges={['top']}
          style={{ backgroundColor: !isDarkMode ? theme.colors.card : undefined }}
        />
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <Header title={t('alerts.title')} />
          <View style={styles.emptyWrapper}>
            <AlertsEmptyIllustration isDarkMode={isDarkMode} />
            <Text
              title={t('alerts.emptyDisclaimer')}
              variant="Secondary"
              style={styles.disclaimer}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.notification} />
      <SafeAreaView
        edges={['top']}
        style={{ backgroundColor: !isDarkMode ? theme.colors.card : undefined }}
      />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <Header title={t('alerts.title')} />
        <FlashList
          data={listData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeaderComponent}
          contentContainerStyle={styles.scrollContent}
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: THEME.spacing.screenHorizontal,
    paddingTop: THEME.spacing.marginVerticalM,
    paddingBottom: THEME.spacing.marginVerticalL,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 28,
    paddingBottom: THEME.spacing.marginVerticalM,
  },
  cardItem: {
    marginBottom: 12,
  },
  emptyWrapper: {
    flex: 1,
    paddingHorizontal: THEME.spacing.screenHorizontal,
    paddingTop: THEME.spacing.marginVerticalL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
  },
});
