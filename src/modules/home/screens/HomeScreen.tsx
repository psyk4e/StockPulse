import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { SafeAreaView } from '@/components/SafeAreaView';
import { Text } from '@/components/Text';
import { HomeHeader } from '../components/HomeHeader';
import SearchBar from '@/components/inputs/SearchBar';
import { StatusBar } from '@/components/StatusBar';
import { useNavigation, useTheme } from '@react-navigation/native';
import { FAB, Header, WatchlistEmptyState, CardWatchlist } from '@/components';
import { useAppColorScheme } from '@/store/preferences.context';
import { useWatchlistStore } from '@/store/watchlist.store';
import { getSymbolDescriptions } from '@/services/finnhub.service';

function ListHeaderView({ title }: { title: string }) {
  return (
    <View style={headerStyles.wrap}>
      <Text title={title} font="semiBold" style={headerStyles.title} />
    </View>
  );
}

const headerStyles = StyleSheet.create({
  wrap: {
    paddingBottom: THEME.spacing.marginVerticalM,
  },
  title: {
    fontSize: 18,
    lineHeight: 28,
  },
});

export default function HomeScreen() {
  const colorScheme = useAppColorScheme();
  const theme = useTheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const styles = getStyles(isDarkMode);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const symbols = useWatchlistStore((s) => s.symbols);
  const [symbolToName, setSymbolToName] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

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
      symbols.map((symbol) => ({
        symbol,
        companyName: symbolToName[symbol] ?? symbol,
      })),
    [symbols, symbolToName]
  );

  const filteredListData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return listData;
    return listData.filter(
      (item) => item.symbol.toLowerCase().includes(q) || item.companyName.toLowerCase().includes(q)
    );
  }, [listData, searchQuery]);

  const goToCreateAlertScreen = useCallback((): void => {
    navigation.navigate('Stacknavigator', { screen: 'CreateAlert' });
  }, [navigation]);

  const isEmpty = symbols.length === 0;

  const renderItem = useCallback(
    ({ item }: { item: (typeof listData)[number] }) => (
      <CardWatchlist
        symbol={item.symbol}
        companyName={item.companyName}
        live
        containerStyle={styles.cardItem}
      />
    ),
    [styles.cardItem]
  );

  const keyExtractor = useCallback((item: (typeof listData)[number]) => item.symbol, []);

  const ListHeaderComponent = useMemo(
    () => <ListHeaderView title={t('home.watchlistTitle')} />,
    [t]
  );

  if (isEmpty) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={theme.colors.notification} />
        <SafeAreaView
          edges={['top']}
          style={{ backgroundColor: !isDarkMode ? theme.colors.card : undefined }}
        />
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <Header title={t('appName')} titleStyle={{ fontSize: 16 }} />
          <WatchlistEmptyState
            title={t('home.emptyTitle')}
            subtitle={t('home.emptySubtitle')}
            buttonLabel={t('home.addStockButton')}
            onAddPress={goToCreateAlertScreen}
          />
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
        <HomeHeader />
        <View style={styles.searchRow}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('home.searchPlaceholder')}
          />
        </View>
        <FlashList
          data={filteredListData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={ListHeaderComponent}
          contentContainerStyle={styles.scrollContent}
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
        />
        <FAB onPress={goToCreateAlertScreen} />
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
    searchRow: {
      marginTop: THEME.spacing.marginVerticalL,
      paddingHorizontal: THEME.spacing.screenHorizontal,
    },
    cardItem: {
      marginBottom: 12,
    },
    watchlistTitle: {
      fontSize: 18,
      lineHeight: 28,
      paddingBottom: THEME.spacing.marginVerticalM,
    },
  });
}
