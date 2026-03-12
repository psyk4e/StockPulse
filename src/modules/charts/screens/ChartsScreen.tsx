import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
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
import { useAppColorScheme } from '@/context/preferences.context';
import { useWatchlistStore } from '@/store/watchlist.store';
import { getSymbolDescriptions } from '@/services/finnhub.service';

const TIMEFRAME_OPTIONS = ['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const;

const CHART_LINE_COLORS = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#EF5350'];

type TimeframeOption = (typeof TIMEFRAME_OPTIONS)[number];

const TIMEFRAME_SUBTITLE_KEYS: Record<TimeframeOption, string> = {
  '1D': 'charts.view1D',
  '1W': 'charts.view1W',
  '1M': 'charts.view1M',
  '3M': 'charts.view3M',
  '1Y': 'charts.view1Y',
  ALL: 'charts.viewAll',
};

interface TimeframeConfig {
  points: number;
  labels: (idx: number) => string | undefined;
}

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const TIMEFRAME_CONFIGS: Record<TimeframeOption, TimeframeConfig> = {
  '1D': {
    points: 8,
    labels: (i) => {
      const hours = ['9:30', '10', '11', '12', '1', '2', '3', '4'];
      return hours[i];
    },
  },
  '1W': {
    points: 5,
    labels: (i) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i],
  },
  '1M': {
    points: 5,
    labels: (i) => {
      const days = ['Oct 01', 'Oct 08', 'Oct 15', 'Oct 22', 'Oct 29'];
      return days[i];
    },
  },
  '3M': {
    points: 6,
    labels: (i) => MONTHS_SHORT.slice(7, 13)[i],
  },
  '1Y': {
    points: 12,
    labels: (i) => (i % 2 === 0 ? MONTHS_SHORT[i] : undefined),
  },
  ALL: {
    points: 8,
    labels: (i) => {
      const years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];
      return years[i];
    },
  },
};

/**
 * Pre-baked dummy series per timeframe. Each line has large, sweeping values
 * so the chart fills the full vertical and horizontal space.
 */
const SERIES_DATA: Record<TimeframeOption, number[][]> = {
  '1D': [
    [15200, 15800, 16400, 15900, 16800, 17200, 16600, 17400],
    [8200, 9000, 8600, 9400, 10200, 9800, 10600, 11000],
  ],
  '1W': [
    [18000, 22000, 19000, 25000, 23000],
    [6000, 9000, 12000, 8000, 14000],
  ],
  '1M': [
    [15000, 18000, 24000, 35000, 42000],
    [5000, 8000, 13000, 14000, 28000],
  ],
  '3M': [
    [12000, 18000, 15000, 28000, 35000, 40000],
    [4000, 8000, 12000, 10000, 16000, 22000],
  ],
  '1Y': [
    [8000, 12000, 18000, 15000, 22000, 28000, 24000, 32000, 38000, 35000, 42000, 48000],
    [3000, 5000, 8000, 6000, 10000, 14000, 12000, 18000, 22000, 20000, 26000, 30000],
  ],
  ALL: [
    [5000, 12000, 20000, 15000, 28000, 38000, 42000, 50000],
    [2000, 6000, 10000, 14000, 8000, 18000, 24000, 30000],
  ],
};

function buildChartData(timeframe: TimeframeOption, lineCount: number): ChartDataSet[] {
  const config = TIMEFRAME_CONFIGS[timeframe];
  const seriesPool = SERIES_DATA[timeframe];
  const count = Math.min(lineCount, seriesPool.length);
  const dataSets: ChartDataSet[] = [];

  for (let i = 0; i < count; i += 1) {
    const values = seriesPool[i];
    const data = values.map((value, idx) => ({
      value,
      label: config.labels(idx),
    }));
    dataSets.push({ data });
  }

  return dataSets;
}

export default function ChartsScreen() {
  const colorScheme = useAppColorScheme();
  const theme = useTheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const styles = getStyles(isDarkMode);
  const { t } = useTranslation();
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1M');
  const symbols = useWatchlistStore((s) => s.symbols);
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

  const chartDataSets = useMemo<ChartDataSet[]>(() => {
    const lineCount = Math.max(1, Math.min(listData.length || 2, CHART_LINE_COLORS.length));
    return buildChartData(selectedTimeframe as TimeframeOption, lineCount);
  }, [listData.length, selectedTimeframe]);

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

  const ListHeaderComponent = useMemo(
    () => (
      <Text font="semiBold" style={styles.sectionTitle}>
        {t('charts.trackedAssets')}
      </Text>
    ),
    [t, styles.sectionTitle]
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

        <View style={styles.chartSection}>
          <FlatList
            data={TIMEFRAME_OPTIONS as unknown as TimeframeOption[]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.timeframeList}
            ItemSeparatorComponent={() => <View style={styles.timeframeGap} />}
            renderItem={({ item }) => (
              <Chip
                label={item}
                selected={selectedTimeframe === item}
                onPress={() => setSelectedTimeframe(item)}
                containerStyle={styles.timeframeChip}
              />
            )}
          />
          <View style={styles.chartHeader}>
            <Text font="semiBold" style={styles.chartTitle}>
              {t('charts.multiStockComparison')}
            </Text>
            <Text variant="Secondary" style={styles.chartSubtitle}>
              {t(TIMEFRAME_SUBTITLE_KEYS[selectedTimeframe as TimeframeOption])}
            </Text>
          </View>
          <MultiStockChart
            height={220}
            containerStyle={styles.chartContainer}
            dataSets={chartDataSets}
          />
        </View>

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
      paddingBottom: THEME.spacing.marginVerticalL,
    },
    chartSection: {
      paddingHorizontal: THEME.spacing.screenHorizontal,
      paddingTop: THEME.spacing.marginVerticalM,
    },
    timeframeList: {
      paddingBottom: 4,
    },
    timeframeGap: {
      width: 8,
    },
    timeframeChip: {
      marginRight: 0,
    },
    chartHeader: {
      marginVertical: 8,
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
