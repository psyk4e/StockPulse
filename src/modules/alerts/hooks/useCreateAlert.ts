import React from 'react';
import * as Haptics from 'expo-haptics';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import {
  type ListSelectionItem,
} from '@/components/bottomSheet/BottomSheetListSelection';
import { useDebounce } from '@/hooks/useDebounce';
import { getQuote, getSymbolDescriptions, searchSymbolsRemote } from '@/services/finnhub.service';
import { useAlertsStore } from '@/store/alerts.store';
import { useWatchlistStore } from '@/store/watchlist.store';
import { useSetExtraSymbols } from '@context/live-prices.context';
import type { LiveQuote } from 'types/live-prices.types';
import { Keyboard } from 'react-native';

const SEARCH_DEBOUNCE_MS = 350;

export type AlertType = 'above' | 'below';

export interface StockOption {
  symbol: string;
  label: string;
}

function mapItemsToOptions(items: { symbol: string; description?: string }[]): ListSelectionItem[] {
  const seen = new Set<string>();
  return items
    .filter((s) => {
      if (seen.has(s.symbol)) return false;
      seen.add(s.symbol);
      return true;
    })
    .map((s) => ({
      label: `${s.symbol} - ${s.description ?? s.symbol}`,
      value: s.symbol,
    }));
}

export function useCreateAlert(editingAlertId?: string, initialSymbol?: string) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const alerts = useAlertsStore((s) => s.alerts);
  const addAlert = useAlertsStore((s) => s.addAlert);
  const updateAlert = useAlertsStore((s) => s.updateAlert);
  const addSymbol = useWatchlistStore((s) => s.addSymbol);
  const setExtraSymbols = useSetExtraSymbols();
  const editInitDoneRef = React.useRef(false);
  const initialSymbolDoneRef = React.useRef(false);

  const [stockOptions, setStockOptions] = React.useState<ListSelectionItem[]>([]);
  const [stockSearchQuery, setStockSearchQuery] = React.useState('');
  const [stockLoading, setStockLoading] = React.useState(false);
  const [selectedStock, setSelectedStock] = React.useState<StockOption | null>(null);
  const [targetPrice, setTargetPrice] = React.useState('');
  const [alertType, setAlertType] = React.useState<AlertType>('above');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [quoteFromState, setQuoteFromState] = React.useState<LiveQuote | null>(null);

  const listSelectionRef = React.useRef<BottomSheetModal>(null);
  const successRef = React.useRef<BottomSheetModal>(null);
  const errorRef = React.useRef<BottomSheetModal>(null);

  const debouncedSearchQuery = useDebounce(stockSearchQuery, SEARCH_DEBOUNCE_MS);

  React.useEffect(() => {
    const trimmed = debouncedSearchQuery.trim();
    if (trimmed.length === 0) {
      setStockOptions([]);
      setStockLoading(false);
      return;
    }
    setStockLoading(true);
    searchSymbolsRemote(trimmed, 'US')
      .then(({ items }) => setStockOptions(mapItemsToOptions(items)))
      .catch(() => setStockOptions([]))
      .finally(() => setStockLoading(false));
  }, [debouncedSearchQuery]);

  const handleStockSearchChange = React.useCallback((text: string) => {
    setStockSearchQuery(text);
    if (text.trim().length === 0) {
      setStockOptions([]);
      setStockLoading(false);
    }
  }, []);

  const openStockPicker = React.useCallback(() => {
    Haptics.selectionAsync();
    listSelectionRef.current?.present();
  }, []);

  const handleSelectStock = React.useCallback((item: ListSelectionItem) => {
    setSelectedStock({ symbol: String(item.value), label: item.label });
    listSelectionRef.current?.dismiss();
  }, []);

  React.useEffect(() => {
    if (selectedStock?.symbol) {
      setExtraSymbols([selectedStock.symbol]);
    } else {
      setExtraSymbols([]);
    }
    return () => setExtraSymbols([]);
  }, [selectedStock?.symbol, setExtraSymbols]);

  React.useEffect(() => {
    if (!selectedStock?.symbol) {
      setQuoteFromState(null);
      return;
    }
    let cancelled = false;
    getQuote(selectedStock.symbol)
      .then((res) => {
        if (cancelled) return;
        setQuoteFromState({
          c: res.c,
          d: res.d,
          dp: res.dp,
          h: res.h,
          l: res.l,
          o: res.o,
          pc: res.pc,
          t: res.t,
        });
      })
      .catch(() => {
        if (!cancelled) setQuoteFromState(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedStock?.symbol]);

  const editingAlert = React.useMemo(
    () => (editingAlertId ? alerts.find((a) => a.id === editingAlertId) : null),
    [editingAlertId, alerts]
  );

  React.useEffect(() => {
    editInitDoneRef.current = false;
  }, [editingAlertId]);

  React.useEffect(() => {
    initialSymbolDoneRef.current = false;
  }, [initialSymbol]);

  React.useEffect(() => {
    if (!initialSymbol || editingAlertId || initialSymbolDoneRef.current) return;
    initialSymbolDoneRef.current = true;
    const sym = initialSymbol.trim().toUpperCase();
    setStockSearchQuery(sym);
    getSymbolDescriptions([sym])
      .then((map) => {
        const desc = map[sym] ?? sym;
        setSelectedStock({ symbol: sym, label: `${sym} - ${desc}` });
      })
      .catch(() => {
        setSelectedStock({ symbol: sym, label: sym });
      });
  }, [initialSymbol, editingAlertId]);

  React.useEffect(() => {
    if (!editingAlertId || !editingAlert || editInitDoneRef.current) return;
    editInitDoneRef.current = true;
    const alert = editingAlert;
    setTargetPrice(String(alert.priceThreshold));
    setAlertType(alert.direction as AlertType);
    setStockSearchQuery(alert.symbol);
    getSymbolDescriptions([alert.symbol])
      .then((map) => {
        const desc = map[alert.symbol] ?? alert.symbol;
        setSelectedStock({
          symbol: alert.symbol,
          label: `${alert.symbol} - ${desc}`,
        });
      })
      .catch(() => {
        setSelectedStock({ symbol: alert.symbol, label: alert.symbol });
      });
  }, [editingAlertId, editingAlert]);

  const targetPriceNum = parseFloat(targetPrice.replace(/,/g, '.')) || 0;
  const currentPrice = quoteFromState?.c;

  const targetPriceValidationError = React.useMemo(() => {
    if (currentPrice == null || !selectedStock) return null;
    if (alertType === 'above' && targetPriceNum > 0 && targetPriceNum <= currentPrice) {
      return t('createAlert.errorTargetMustBeAboveCurrent', { price: currentPrice });
    }
    if (alertType === 'below' && targetPriceNum > 0 && targetPriceNum >= currentPrice) {
      return t('createAlert.errorTargetMustBeBelowCurrent', { price: currentPrice });
    }
    return null;
  }, [currentPrice, selectedStock, alertType, targetPriceNum, t]);

  const isFormValid =
    selectedStock != null &&
    !Number.isNaN(targetPriceNum) &&
    targetPriceNum > 0 &&
    targetPriceValidationError == null;

  const showError = React.useCallback((msg: string) => {
    setErrorMessage(msg);
    errorRef.current?.present();
  }, []);

  const validateSubmission = React.useCallback((): number | null => {
    if (!selectedStock) {
      showError(t('createAlert.errorSelectStock'));
      return null;
    }
    const num = parseFloat(targetPrice.replace(/,/g, '.'));
    if (Number.isNaN(num) || num <= 0) {
      showError(t('createAlert.errorInvalidPrice'));
      return null;
    }
    if (currentPrice != null) {
      if (alertType === 'above' && num <= currentPrice) {
        showError(t('createAlert.errorTargetMustBeAboveCurrent', { price: currentPrice }));
        return null;
      }
      if (alertType === 'below' && num >= currentPrice) {
        showError(t('createAlert.errorTargetMustBeBelowCurrent', { price: currentPrice }));
        return null;
      }
    }
    return num;
  }, [selectedStock, targetPrice, alertType, currentPrice, showError, t]);

  const persistAlert = React.useCallback(
    (symbol: string, price: number): boolean => {
      if (editingAlertId) {
        return updateAlert(editingAlertId, {
          symbol,
          priceThreshold: price,
          direction: alertType,
        });
      }
      const added = addAlert({ symbol, priceThreshold: price, direction: alertType, enabled: true });
      if (added) addSymbol(symbol);
      return added;
    },
    [editingAlertId, alertType, updateAlert, addAlert, addSymbol]
  );

  const handleSubmit = React.useCallback(() => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const price = validateSubmission();
    if (price == null) {
      showError(t('createAlert.errorInvalidPrice'));
      return;
    };

    const success = persistAlert(selectedStock!.symbol, price);

    console.log('success', success);

    if (!success) {
      showError(t('createAlert.errorDuplicate'));
      return;
    }
    successRef.current?.present();
  }, [validateSubmission, persistAlert, selectedStock, showError, t]);

  const goBack = React.useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSuccessClose = React.useCallback(() => {
    successRef.current?.dismiss();
    navigation.goBack();
  }, [navigation]);

  const dismissError = React.useCallback(() => {
    errorRef.current?.dismiss();
  }, []);

  const selectedValue = selectedStock?.symbol ?? null;
  const descriptionKey =
    alertType === 'above'
      ? t('createAlert.alertDescriptionAbove', {
        symbol: selectedStock?.label ?? '—',
        price: targetPrice || '0',
      })
      : t('createAlert.alertDescriptionBelow', {
        symbol: selectedStock?.label ?? '—',
        price: targetPrice || '0',
      });

  const isEditMode = Boolean(editingAlertId);

  return {
    // Form state
    stockOptions,
    stockSearchQuery,
    stockLoading,
    selectedStock,
    targetPrice,
    setTargetPrice,
    alertType,
    setAlertType,
    errorMessage,
    quoteFromState,
    // Refs for bottom sheets
    listSelectionRef,
    successRef,
    errorRef,
    // Handlers
    handleStockSearchChange,
    openStockPicker,
    handleSelectStock,
    handleSubmit,
    goBack,
    handleSuccessClose,
    dismissError,
    // Derived
    targetPriceNum,
    isFormValid,
    targetPriceValidationError,
    selectedValue,
    descriptionKey,
    isEditMode,
  };
}
