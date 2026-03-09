import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { SafeAreaView } from '@/components/SafeAreaView';
import { Text } from '@/components/Text';
import { StatusBar } from '@/components/StatusBar';
import { useTheme } from '@react-navigation/native';
import { Header, CardAssets, Chip, MultiStockChart } from '@/components';
import type { ChartDataSet } from '@/components/MultiStockChart';
import { useAppColorScheme } from '@/store/preferences.context';
import { useWatchlistStore } from '@/store/watchlist.store';
import { usePriceHistoryForSymbols } from '@/store/live-prices.context';
import { getSymbolDescriptions } from '@/services/finnhub.service';

const TIMEFRAME_OPTIONS = ['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const;

const CHART_LINE_COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#EF5350'];

export default function ChartsScreen() {
  const colorScheme = useAppColorScheme();
  const theme = useTheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const styles = getStyles(isDarkMode);
  const { t } = useTranslation();
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1M');
  const symbols = useWatchlistStore((s) => s.symbols);
  const priceHistory = usePriceHistoryForSymbols(symbols);
  const [symbolToName, setSymbolToName] = useState<Record<string, string>>({});

  useEffect(() => {
    if (symbols.length === 0) {
      setSymbolToName({});
      return;
    }
    let cancelled = false;
    getSymbolDescriptions(symbols)
      .then((map) => {
        if (!cancelled) setSymbolToName(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [symbols]);

  const listData = useMemo(
    () =>
      symbols.map((symbol, colorIndex) => ({
        symbol,
        companyName: symbolToName[symbol] ?? symbol,
        colorIndex: colorIndex % CHART_LINE_COLORS.length,
      })),
    [symbols, symbolToName]
  );

  const chartDataSets = useMemo((): ChartDataSet[] => {
    return symbols.map((symbol, index) => {
      const series = priceHistory[symbol];
      const data = (series ?? []).map((p) => ({ value: p.value, label: p.label }));
      return {
        data: data.length > 0 ? data : [{ value: 0 }],
        color: CHART_LINE_COLORS[index % CHART_LINE_COLORS.length],
      };
    });
  }, [symbols, priceHistory]);

  const renderAssetItem = useCallback(
    ({ item }: { item: (typeof listData)[number] }) => (
      <CardAssets
        symbol={item.symbol}
        companyName={item.companyName}
        colorIndex={item.colorIndex}
        live
        containerStyle={styles.cardItem}
      />
    ),
    [styles.cardItem]
  );

  const keyExtractorAsset = useCallback((item: (typeof listData)[number]) => item.symbol, []);

  const ListHeaderComponent = useCallback(
    () => (
      <>
        <View style={styles.timeframeRow}>
          {TIMEFRAME_OPTIONS.map((option) => (
            <React.Fragment key={option}>
              <Chip
                label={option}
                selected={selectedTimeframe === option}
                onPress={() => setSelectedTimeframe(option)}
                containerStyle={styles.timeframeChip}
              />
              {option !== TIMEFRAME_OPTIONS[TIMEFRAME_OPTIONS.length - 1] && (
                <View style={styles.timeframeGap} />
              )}
            </React.Fragment>
          ))}
        </View>
        <View style={styles.chartHeader}>
          <Text font="semiBold" style={styles.chartTitle}>
            {t('charts.multiStockComparison')}
          </Text>
          <Text variant="Secondary" style={styles.chartSubtitle}>
            {t('charts.view1M')}
          </Text>
        </View>
        <MultiStockChart
          height={180}
          containerStyle={styles.chartContainer}
          dataSets={chartDataSets.length > 0 ? chartDataSets : undefined}
        />
        <Text font="semiBold" style={styles.sectionTitle}>
          {t('charts.trackedAssets')}
        </Text>
      </>
    ),
    [
      t,
      selectedTimeframe,
      styles.timeframeRow,
      styles.timeframeGap,
      styles.timeframeChip,
      styles.chartHeader,
      styles.chartTitle,
      styles.chartSubtitle,
      styles.chartContainer,
      styles.sectionTitle,
      chartDataSets,
    ]
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.notification} />
      <SafeAreaView
        edges={['top']}
        style={{ backgroundColor: !isDarkMode ? theme.colors.card : undefined }}
      />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <Header title={t('charts.title')} />
        <FlashList
          data={listData}
          renderItem={renderAssetItem}
          keyExtractor={keyExtractorAsset}
          ListHeaderComponent={ListHeaderComponent}
          contentContainerStyle={styles.scrollContent}
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
}

function getStyles(isDarkMode: boolean) {
  return StyleSheet.create({
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
    timeframeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: THEME.spacing.marginVerticalM,
    },
    timeframeGap: {
      width: 8,
    },
    timeframeChip: {
      marginRight: 0,
    },
    chartHeader: {
      marginBottom: 8,
    },
    chartTitle: {
      fontSize: 18,
      lineHeight: 24,
    },
    chartSubtitle: {
      fontSize: 14,
      marginTop: 2,
    },
    chartContainer: {
      marginBottom: THEME.spacing.marginVerticalL,
    },
    sectionTitle: {
      fontSize: 18,
      lineHeight: 28,
      paddingBottom: THEME.spacing.marginVerticalM,
    },
    cardItem: {
      marginBottom: 12,
    },
  });
}
