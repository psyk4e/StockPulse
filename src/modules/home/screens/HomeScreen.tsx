import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { SafeAreaView } from '@/components/SafeAreaView';
import { Text } from '@/components/Text';
import { HomeHeader } from '../components/HomeHeader';
import SearchBar from '@/components/inputs/SearchBar';
import { StatusBar } from '@/components/StatusBar';
import { useTheme } from '@react-navigation/native';
import {
  FAB,
  Header,
  WatchlistEmptyState,
  CardWatchlist,
  MarketStatusCard,
  Icon,
} from '@/components';
import { useAppColorScheme } from '@/context/preferences.context';
import { useHomeScreen } from '../hooks/useHomeScreen';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const colorScheme = useAppColorScheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const theme = useTheme();
  const styles = getStyles(isDarkMode);
  const {
    listData,
    filteredListData,
    isEmpty,
    marketStatus,
    marketStatusLoading,
    marketStatusError,
    searchQuery,
    setSearchQuery,
    goToCreateAlertScreen,
    handleRemoveSymbol,
    handleEditSymbol,
  } = useHomeScreen();

  const renderLeftActions = useCallback(
    (item: (typeof listData)[number]) =>
      function LeftActions() {
        return (
          <View style={[styles.swipeActionRow, styles.swipeActionRowLeft]}>
            <Pressable
              style={[styles.swipeActionButton, styles.swipeActionEdit]}
              onPress={() => handleEditSymbol(item.symbol)}>
              <Icon name="edit" size={22} color={THEME.colors.primary} />
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
      color: THEME.colors.primary,
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
      color: THEME.colors.negative,
      fontSize: 12,
      fontWeight: '600',
    },
  });
}
