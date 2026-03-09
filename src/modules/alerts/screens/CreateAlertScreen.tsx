import React, { useRef, useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useAppColorScheme } from '@/store/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/buttons/BackButton';
import { Text } from '@/components/Text';
import { Button } from '@/components/buttons/Button';
import { TextInput } from '@/components/inputs/TextInput';
import { Icon } from '@/components/Icon';
import { ChipWithX } from '@/components/chips/ChipWithX';
import {
  BottomSheetListSelection,
  ListSelectionItem,
} from '@/components/bottomSheet/BottomSheetListSelection';
import { BottomSheetSuccess } from '@/components/bottomSheet/BottomSheetSuccess';
import { BottomSheetError } from '@/components/bottomSheet/BottomSheetError';
import { SafeAreaView } from '@/components/SafeAreaView';
import { KeyboardAvoidingView } from '@/components/KeyboardAvoidingView';
import { StatusBar } from '@/components/StatusBar';
import { getQuote, searchStockSymbols } from '@/services/finnhub.service';
import { useAlertsStore } from '@/store/alerts.store';
import { useWatchlistStore } from '@/store/watchlist.store';
import { useSetExtraSymbols } from '@/store/live-prices.context';
import type { LiveQuote } from '@/store/live-prices.types';
import { LivePriceDisplay } from '@/components/LivePriceDisplay';

type AlertType = 'above' | 'below';

interface StockOption {
  symbol: string;
  label: string;
}

export default function CreateAlertScreen() {
  const colorScheme = useAppColorScheme();
  const theme = useTheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const styles = getStyles(isDarkMode);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const addAlert = useAlertsStore((s) => s.addAlert);
  const addSymbol = useWatchlistStore((s) => s.addSymbol);

  const PAGE_SIZE = 50;
  const [stockOptions, setStockOptions] = useState<ListSelectionItem[]>([]);
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockPage, setStockPage] = useState(1);
  const [stockHasMore, setStockHasMore] = useState(true);
  const [stockLoading, setStockLoading] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockOption | null>(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [alertType, setAlertType] = useState<AlertType>('above');
  const [errorMessage, setErrorMessage] = useState('');
  const [quoteFromState, setQuoteFromState] = useState<LiveQuote | null>(null);

  const listSelectionRef = useRef<BottomSheetModal>(null);
  const successRef = useRef<BottomSheetModal>(null);
  const errorRef = useRef<BottomSheetModal>(null);

  const loadStockPage = useCallback(
    (query: string, page: number, append: boolean) => {
      if (stockLoading) return;
      setStockLoading(true);
      searchStockSymbols(query, 'US', page, PAGE_SIZE)
        .then(({ items, total }) => {
          const seen = new Set<string>();
          const options: ListSelectionItem[] = items
            .filter((s) => {
              if (seen.has(s.symbol)) return false;
              seen.add(s.symbol);
              return true;
            })
            .map((s) => ({
              label: `${s.symbol} - ${s.description ?? s.symbol}`,
              value: s.symbol,
            }));
          setStockOptions((prev) => (append ? [...prev, ...options] : options));
          setStockHasMore((page - 1) * PAGE_SIZE + options.length < total);
        })
        .catch(() => {
          if (!append) setStockOptions([]);
          setStockHasMore(false);
        })
        .finally(() => setStockLoading(false));
    },
    [PAGE_SIZE, stockLoading]
  );

  const handleStockSearchChange = useCallback(
    (text: string) => {
      setStockSearchQuery(text);
      setStockPage(1);
      loadStockPage(text, 1, false);
    },
    [loadStockPage]
  );

  const handleStockEndReached = useCallback(() => {
    if (!stockHasMore || stockLoading) return;
    const nextPage = stockPage + 1;
    setStockPage(nextPage);
    loadStockPage(stockSearchQuery, nextPage, true);
  }, [stockHasMore, stockLoading, stockPage, stockSearchQuery, loadStockPage]);

  const openStockPicker = useCallback(() => {
    Haptics.selectionAsync();
    if (stockOptions.length === 0 && !stockLoading) {
      loadStockPage('', 1, false);
      setStockSearchQuery('');
      setStockPage(1);
      setStockHasMore(true);
    }
    listSelectionRef.current?.present();
  }, [stockOptions.length, stockLoading, loadStockPage]);

  const handleSelectStock = useCallback((item: ListSelectionItem) => {
    setSelectedStock({ symbol: String(item.value), label: item.label });
    listSelectionRef.current?.dismiss();
  }, []);

  const handleRemoveStock = useCallback(() => {
    setSelectedStock(null);
    setQuoteFromState(null);
  }, []);

  const setExtraSymbols = useSetExtraSymbols();
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

  const targetPriceNum = parseFloat(targetPrice.replace(/,/g, '.')) || 0;
  const isFormValid = selectedStock != null && !Number.isNaN(targetPriceNum) && targetPriceNum > 0;

  const handleSubmit = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!selectedStock) {
      setErrorMessage(t('createAlert.errorSelectStock'));
      errorRef.current?.present();
      return;
    }
    const num = parseFloat(targetPrice.replace(/,/g, '.'));
    if (Number.isNaN(num) || num <= 0) {
      setErrorMessage(t('createAlert.errorInvalidPrice'));
      errorRef.current?.present();
      return;
    }
    const added = addAlert({
      symbol: selectedStock.symbol,
      priceThreshold: num,
      direction: alertType,
      enabled: true,
    });
    if (added) {
      addSymbol(selectedStock.symbol);
      successRef.current?.present();
    } else {
      setErrorMessage(t('createAlert.errorDuplicate'));
      errorRef.current?.present();
    }
  }, [selectedStock, targetPrice, alertType, addAlert, addSymbol, t]);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSuccessClose = useCallback(() => {
    successRef.current?.dismiss();
    navigation.goBack();
  }, [navigation]);

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

  const iconColor = isDarkMode ? THEME.colors.textSecondaryDark : THEME.colors.textSecondaryLight;
  const dollarIcon = <Text style={[styles.dollarIcon, { color: iconColor }]}>$</Text>;
  const searchIcon = <Icon name="search" size={20} color={iconColor} />;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.notification} />
      <SafeAreaView
        edges={['top']}
        style={{
          backgroundColor: !isDarkMode ? THEME.colors.white : undefined,
        }}
      />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <Header
          title={t('createAlert.title')}
          titleAlign="center"
          titleStyle={{ fontSize: 16 }}
          leftElement={<BackButton onPress={goBack} />}
        />
        <KeyboardAvoidingView style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            {/* SELECT STOCK */}
            <Text variant="overline" textStyle={[styles.sectionLabel, styles.sectionLabelFirst]}>
              {t('createAlert.selectStock')}
            </Text>
            <Pressable style={styles.stockInputRow} onPress={openStockPicker}>
              <View style={styles.stockInputLeft}>{searchIcon}</View>
              <View style={styles.stockInputContent}>
                {selectedStock ? (
                  <ChipWithX
                    label={selectedStock.label}
                    selected
                    onRemove={handleRemoveStock}
                    containerStyle={styles.chip}
                  />
                ) : null}
                <Text
                  variant="Secondary"
                  title={selectedStock ? '' : t('createAlert.searchStocksPlaceholder')}
                  textStyle={styles.placeholder}
                />
              </View>
            </Pressable>
            {selectedStock && (
              <View style={styles.priceRow}>
                <LivePriceDisplay
                  symbol={selectedStock.symbol}
                  initialQuote={quoteFromState}
                  showChange
                  priceStyle={styles.currentPrice}
                  changeStyle={styles.changeText}
                />
              </View>
            )}

            {/* TARGET PRICE */}
            <Text variant="overline" textStyle={styles.sectionLabel}>
              {t('createAlert.targetPrice')}
            </Text>
            <TextInput
              leftIcon={dollarIcon}
              placeholder="0.00"
              value={targetPrice}
              onChangeText={setTargetPrice}
              keyboardType="decimal-pad"
              containerStyle={styles.input}
            />

            {/* ALERT TYPE */}
            <Text variant="overline" textStyle={styles.sectionLabel}>
              {t('createAlert.alertType')}
            </Text>
            <View style={styles.segmentedRow}>
              <Pressable
                style={[styles.segment, alertType === 'above' && styles.segmentActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setAlertType('above');
                }}>
                <Icon
                  name="arrow-up"
                  size={18}
                  color={alertType === 'above' ? THEME.colors.white : iconColor}
                />
                <Text
                  variant={alertType === 'above' ? 'Primary' : 'Secondary'}
                  title={t('createAlert.above')}
                  textStyle={[
                    styles.segmentLabel,
                    alertType === 'above' && styles.segmentLabelActive,
                  ]}
                />
              </Pressable>
              <Pressable
                style={[styles.segment, alertType === 'below' && styles.segmentActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setAlertType('below');
                }}>
                <Icon
                  name="arrow-down"
                  size={18}
                  color={alertType === 'below' ? THEME.colors.white : iconColor}
                />
                <Text
                  variant={alertType === 'below' ? 'Primary' : 'Secondary'}
                  title={t('createAlert.below')}
                  textStyle={[
                    styles.segmentLabel,
                    alertType === 'below' && styles.segmentLabelActive,
                  ]}
                />
              </Pressable>
            </View>
            <Text variant="Secondary" title={descriptionKey} textStyle={styles.description} />
          </ScrollView>

          {/* CREATE ALERT BUTTON - fixed at bottom */}
          <View style={styles.buttonBottom}>
            <Button
              variant="primary"
              onPress={handleSubmit}
              style={[styles.primaryButton, !isFormValid && styles.primaryButtonDisabled]}
              disabled={!isFormValid}>
              <Icon
                name="bell"
                size={20}
                color={isFormValid ? THEME.colors.white : THEME.colors.darkGrey}
              />
              <Text
                font="semiBold"
                style={[styles.buttonText, !isFormValid && styles.buttonTextDisabled]}>
                {t('createAlert.createAlertButton')}
              </Text>
            </Button>
          </View>
        </KeyboardAvoidingView>

        <BottomSheetListSelection
          ref={listSelectionRef}
          title={t('createAlert.selectStockSheetTitle')}
          items={stockOptions}
          selectedValue={selectedValue}
          onSelect={handleSelectStock}
          showSearch
          searchPlaceholder={t('createAlert.searchStocksPlaceholder')}
          searchQuery={stockSearchQuery}
          onSearchChange={handleStockSearchChange}
          onEndReached={handleStockEndReached}
          loading={stockLoading}
        />
        <BottomSheetSuccess
          ref={successRef}
          snapPoints={['40%']}
          title={t('createAlert.successTitle')}
          message={t('createAlert.successMessage', {
            symbol: selectedStock?.symbol ?? '—',
            price: targetPrice || '0',
          })}
          buttonTitle={t('createAlert.successDone')}
          onButtonPress={handleSuccessClose}
          onClose={handleSuccessClose}
        />
        <BottomSheetError
          ref={errorRef}
          snapPoints={['30%']}
          title={t('createAlert.errorTitle')}
          message={errorMessage || t('createAlert.errorMessage')}
          buttonTitle={t('createAlert.errorTryAgain')}
          secondaryButtonTitle={t('createAlert.errorDismiss')}
          onClose={() => errorRef.current?.dismiss()}
        />
      </SafeAreaView>
    </View>
  );
}

function getStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? THEME.colors.darkBackground : THEME.colors.white,
    },
    safeArea: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: THEME.spacing.screenHorizontal,
      paddingTop: THEME.spacing.marginVerticalL,
      paddingBottom: THEME.spacing.marginVerticalL,
    },
    sectionLabel: {
      marginBottom: 10,
      marginTop: 24,
      fontWeight: '700',
    },
    sectionLabelFirst: {
      marginTop: 0,
    },
    stockInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? THEME.colors.darkCard : THEME.colors.lightBackground,
      borderColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder,
      borderRadius: 12,
      borderWidth: 1,
      minHeight: 52,
    },
    stockInputLeft: {
      paddingLeft: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stockInputContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: 8,
      paddingRight: 12,
      paddingVertical: 8,
      gap: 8,
    },
    chip: {
      alignSelf: 'center',
    },
    placeholder: {
      fontSize: 16,
    },
    priceRow: {
      marginTop: 14,
      gap: 6,
    },
    currentPrice: {
      fontSize: 28,
      fontWeight: '700',
    },
    changeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    changeText: {
      fontSize: 14,
      fontWeight: '500',
    },
    dollarIcon: {
      fontSize: 16,
      fontWeight: '600',
    },
    input: {
      marginBottom: 0,
      backgroundColor: isDarkMode ? THEME.colors.darkCard : THEME.colors.lightBackground,
      borderColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder,
      borderRadius: 12,
    },
    segmentedRow: {
      flexDirection: 'row',
      backgroundColor: isDarkMode ? THEME.colors.darkCard : THEME.colors.white,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder,
      overflow: 'hidden',
    },
    segment: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      gap: 8,
    },
    segmentActive: {
      backgroundColor: THEME.colors.primaryBlue,
    },
    segmentLabel: {
      fontSize: 16,
    },
    segmentLabelActive: {
      color: THEME.colors.white,
    },
    description: {
      marginTop: 14,
      marginBottom: 24,
      fontSize: 14,
      lineHeight: 20,
    },
    buttonBottom: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 24,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder,
      backgroundColor: isDarkMode ? THEME.colors.darkBackground : THEME.colors.lightBackground,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginHorizontal: 0,
      alignSelf: 'stretch',
      width: '100%',
    },
    primaryButtonDisabled: {
      backgroundColor: THEME.colors.lightGrey,
      shadowOpacity: 0,
      elevation: 0,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: THEME.colors.white,
    },
    buttonTextDisabled: {
      color: THEME.colors.darkGrey,
    },
  });
}
