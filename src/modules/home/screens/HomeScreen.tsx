import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { SafeAreaView } from '@/components/SafeAreaView';
import { Text } from '@/components/Text';
import { HomeHeader } from '../components/HomeHeader';
import SearchBar from '@/components/inputs/SearchBar';
import { StatusBar } from '@/components/StatusBar';
import { useNavigation, useTheme } from '@react-navigation/native';
import {
  FAB,
  Header,
  WatchlistEmptyState,
  CardWatchlist,
  MarketStatusCard,
  Icon,
} from '@/components';
import { useAppColorScheme } from '@/store/preferences.context';
import { useWatchlistStore } from '@/store/watchlist.store';
import { useAlertsStore } from '@/store/alerts.store';
import { useMarketStatus } from '@/store/market-status.context';
import { getSymbolDescriptions } from '@/services/finnhub.service';

/** Ref methods we use from Swipeable (close). */
interface SwipeableMethods {
  close(): void;
}

function ListHeaderView({
  title,
  count,
  isDarkMode,
}: {
  title: string;
  count: number;
  isDarkMode: boolean;
}) {
  return (
    <View style={headerStyles.wrap}>
      <View style={headerStyles.titleRow}>
        <Text title={title} font="semiBold" style={headerStyles.title} />
        <View
          style={[
            headerStyles.badge,
            { backgroundColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder },
          ]}>
          <Text
            title={String(count)}
            font="semiBold"
            style={[
              headerStyles.badgeText,
              { color: isDarkMode ? THEME.colors.textPrimaryDark : THEME.colors.textPrimaryLight },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  wrap: {
    paddingBottom: THEME.spacing.marginVerticalM,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    lineHeight: 28,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 14,
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
  const removeSymbol = useWatchlistStore((s) => s.removeSymbol);
  const alerts = useAlertsStore((s) => s.alerts);
  const {
    status: marketStatus,
    loading: marketStatusLoading,
    error: marketStatusError,
  } = useMarketStatus();
  const [symbolToName, setSymbolToName] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const swipeableRefs = useRef<Record<string, SwipeableMethods | null>>({});

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

  const handleRemoveSymbol = useCallback(
    (symbol: string) => {
      swipeableRefs.current[symbol]?.close();
      removeSymbol(symbol);
    },
    [removeSymbol]
  );

  const handleEditSymbol = useCallback(
    (symbol: string) => {
      swipeableRefs.current[symbol]?.close();
      const normalized = symbol.toUpperCase();
      const existingAlert = alerts.find((a) => a.symbol === normalized);

      if (existingAlert) {
        navigation.navigate('Stacknavigator', {
          screen: 'CreateAlert',
          params: { alertId: existingAlert.id },
        });
      } else {
        navigation.navigate('Stacknavigator', {
          screen: 'CreateAlert',
          params: { initialSymbol: symbol },
        });
      }
    },
    [alerts, navigation]
  );

  const renderLeftActions = useCallback(
    (item: (typeof listData)[number]) =>
      function LeftActions() {
        return (
          <View style={[styles.swipeActionRow, styles.swipeActionRowLeft]}>
            <Pressable
              style={[styles.swipeActionButton, styles.swipeActionEdit]}
              onPress={() => handleEditSymbol(item.symbol)}>
              <Icon name="edit" size={22} color={THEME.colors.primaryBlue} />
              <Text title={t('home.editStock')} style={styles.swipeActionEditText} />
            </Pressable>
          </View>
        );
      },
    [
      handleEditSymbol,
      styles.swipeActionRow,
      styles.swipeActionRowLeft,
      styles.swipeActionButton,
      styles.swipeActionEdit,
      styles.swipeActionEditText,
      t,
    ]
  );

  const renderRightActions = useCallback(
    (item: (typeof listData)[number]) =>
      function RightActions() {
        return (
          <View style={[styles.swipeActionRow, styles.swipeActionRowRight]}>
            <Pressable
              style={[styles.swipeActionButton, styles.swipeActionRemove]}
              onPress={() => handleRemoveSymbol(item.symbol)}>
              <Icon name="trash" size={22} color={THEME.colors.negative} />
              <Text title={t('home.removeStock')} style={styles.swipeActionText} />
            </Pressable>
          </View>
        );
      },
    [
      handleRemoveSymbol,
      styles.swipeActionRow,
      styles.swipeActionRowRight,
      styles.swipeActionButton,
      styles.swipeActionRemove,
      styles.swipeActionText,
      t,
    ]
  );

  const renderItem = useCallback(
    ({ item }: { item: (typeof listData)[number] }) => (
      <Swipeable
        ref={(el) => {
          swipeableRefs.current[item.symbol] = el;
        }}
        renderLeftActions={renderLeftActions(item)}
        renderRightActions={renderRightActions(item)}
        friction={2}
        rightThreshold={40}
        leftThreshold={40}>
        <CardWatchlist
          symbol={item.symbol}
          companyName={item.companyName}
          live
          containerStyle={styles.cardItem}
        />
      </Swipeable>
    ),
    [renderLeftActions, renderRightActions, styles.cardItem]
  );

  const keyExtractor = useCallback((item: (typeof listData)[number]) => item.symbol, []);

  const ListHeaderComponent = useMemo(
    () => (
      <ListHeaderView
        title={t('home.watchlistTitle')}
        count={filteredListData.length}
        isDarkMode={isDarkMode}
      />
    ),
    [t, filteredListData.length, isDarkMode]
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
        <View style={styles.marketStatusRow}>
          <MarketStatusCard
            status={marketStatus}
            loading={marketStatusLoading}
            error={marketStatusError}
            containerStyle={styles.cardItem}
          />
        </View>
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
    marketStatusRow: {
      paddingHorizontal: THEME.spacing.screenHorizontal,
      marginTop: THEME.spacing.marginVerticalL,
      marginBottom: THEME.spacing.bottomNavPaddingVertical,
    },
    searchRow: {
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
    swipeActionRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      justifyContent: 'flex-end',
      marginBottom: 12,
      gap: 0,
    },
    swipeActionRowLeft: {
      justifyContent: 'flex-start',
      paddingLeft: THEME.spacing.screenHorizontal,
    },
    swipeActionRowRight: {
      paddingRight: THEME.spacing.screenHorizontal,
    },
    swipeActionButton: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 14,
      minWidth: 68,
      gap: 4,
    },
    swipeActionEdit: {
      backgroundColor: isDarkMode ? THEME.colors.darkBackground : THEME.colors.lightBackground,
      borderTopLeftRadius: 24,
      borderBottomLeftRadius: 24,
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
    },
    swipeActionEditText: {
      color: THEME.colors.primaryBlue,
      fontSize: 12,
      fontWeight: '600',
    },
    swipeActionRemove: {
      backgroundColor: isDarkMode ? THEME.colors.darkBackground : THEME.colors.lightBackground,
      borderTopRightRadius: 24,
      borderBottomRightRadius: 24,
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    },
    swipeActionText: {
      color: THEME.colors.white,
      fontSize: 12,
      fontWeight: '600',
    },
  });
}
