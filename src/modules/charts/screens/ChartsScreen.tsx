import React from 'react';
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
import { useAppColorScheme } from '@/context/preferences.context';
import { TIMEFRAME_OPTIONS, TIMEFRAME_SUBTITLE_KEYS } from '../utils/charts.constant';
import { TimeframeOption } from '@types/charts.types';
import { useChartsScreen } from '../hooks/useChartsScreen';

export default function ChartsScreen() {
  const colorScheme = useAppColorScheme();
  const theme = useTheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const { t } = useTranslation();
  const { selectedTimeframe, listData, chartDataSets, setSelectedTimeframe } = useChartsScreen();

  const renderAssetItem = React.useCallback(
    ({ item }: { item: (typeof listData)[number] }) => (
      <CardAssets
        symbol={item.symbol}
        companyName={item.companyName}
        colorIndex={item.colorIndex}
        live
        containerStyle={styles.cardItem}
      />
    ),
    []
  );

  const keyExtractorAsset = React.useCallback((item: (typeof listData)[number]) => item.symbol, []);

  const ListHeaderComponent = React.useMemo(
    () => (
      <Text font="semiBold" style={styles.sectionTitle}>
        {t('charts.trackedAssets')}
      </Text>
    ),
    [t]
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
