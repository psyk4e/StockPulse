import React from 'react'
import { useWatchlistStore } from '@/store/watchlist.store';
import { useAlertsStore } from '@/store/alerts.store';
import { useMarketStatus } from '@/context/market-status.context';
import { getSymbolDescriptions } from '@/services/finnhub.service';
import { useNavigation } from '@react-navigation/native';


/** Ref methods we use from Swipeable (close). */
interface SwipeableMethods {
  close(): void;
}

export function useHomeScreen() {
  const navigation = useNavigation();
  const symbols = useWatchlistStore((s) => s.symbols);
  const removeSymbol = useWatchlistStore((s) => s.removeSymbol);
  const alerts = useAlertsStore((s) => s.alerts);
  const {
    status: marketStatus,
    loading: marketStatusLoading,
    error: marketStatusError,
  } = useMarketStatus();
  const [symbolToName, setSymbolToName] = React.useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = React.useState('');
  const swipeableRefs = React.useRef<Record<string, SwipeableMethods | null>>({});

  React.useEffect(() => {
    if (symbols.length === 0) {
      setSymbolToName({});
      return;
    }
    let cancelled = false;
    getSymbolDescriptions(symbols)
      .then((map) => {
        if (!cancelled) setSymbolToName(map);
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, [symbols]);

  const listData = React.useMemo(
    () =>
      symbols.map((symbol) => ({
        symbol,
        companyName: symbolToName[symbol] ?? symbol,
      })),
    [symbols, symbolToName]
  );

  const filteredListData = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return listData;
    return listData.filter(
      (item) => item.symbol.toLowerCase().includes(q) || item.companyName.toLowerCase().includes(q)
    );
  }, [listData, searchQuery]);

  const goToCreateAlertScreen = React.useCallback((): void => {
    navigation.navigate('Stacknavigator', { screen: 'CreateAlert' });
  }, [navigation]);

  const isEmpty = symbols.length === 0;

  const handleRemoveSymbol = React.useCallback(
    (symbol: string) => {
      swipeableRefs.current[symbol]?.close();
      removeSymbol(symbol);
    },
    [removeSymbol]
  );

  const handleEditSymbol = React.useCallback(
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

  return {
    listData,
    filteredListData,
    isEmpty,
    marketStatus,
    marketStatusLoading,
    marketStatusError,
    symbolToName,
    searchQuery,
    swipeableRefs,
    setSearchQuery,
    goToCreateAlertScreen,
    handleRemoveSymbol,
    handleEditSymbol,
  }
}