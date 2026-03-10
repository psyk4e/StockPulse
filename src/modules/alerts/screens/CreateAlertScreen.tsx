import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useTheme, useRoute, type RouteProp, useNavigation } from '@react-navigation/native';
import type { StackNavigatorParamList } from '@/navigation/stack-navigator';
import { useAppColorScheme } from '@/store/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/buttons/BackButton';
import { Text } from '@/components/Text';
import { Button } from '@/components/buttons/Button';
import { TextInput } from '@/components/inputs/TextInput';
import { Icon } from '@/components/Icon';
import { BottomSheetListSelection } from '@/components/bottomSheet/BottomSheetListSelection';
import { BottomSheetSuccess } from '@/components/bottomSheet/BottomSheetSuccess';
import { BottomSheetError } from '@/components/bottomSheet/BottomSheetError';
import { SafeAreaView } from '@/components/SafeAreaView';
import { KeyboardAvoidingView } from '@/components/KeyboardAvoidingView';
import { StatusBar } from '@/components/StatusBar';
import { LivePriceDisplay } from '@/components/LivePriceDisplay';
import { useCreateAlert } from '../hooks/useCreateAlert';
import { getStyles } from '../styles/createAlert.style';

export default function CreateAlertScreen() {
  const { t } = useTranslation();
  const colorScheme = useAppColorScheme();
  const theme = useTheme();
  const route = useRoute<RouteProp<StackNavigatorParamList, 'CreateAlert'>>();
  const isDarkMode = getIsDarkMode(colorScheme);
  const styles = getStyles(isDarkMode);
  const navigation = useNavigation();

  const initialSymbol = route.params?.initialSymbol;
  const alertId = route.params?.alertId;
  const {
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
    listSelectionRef,
    successRef,
    errorRef,
    handleStockSearchChange,
    openStockPicker,
    handleSelectStock,
    handleSubmit,
    goBack,
    handleSuccessClose,
    dismissError,
    isFormValid,
    targetPriceValidationError,
    selectedValue,
    descriptionKey,
    isEditMode,
  } = useCreateAlert(alertId, initialSymbol);

  const iconColor = isDarkMode ? THEME.colors.textSecondaryDark : THEME.colors.textSecondaryLight;
  const dollarIcon = <Text style={[styles.dollarIcon, { color: iconColor }]}>$</Text>;
  const searchIcon = <Icon name="search" size={20} color={iconColor} />;
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditMode ? t('createAlert.editTitle') : t('createAlert.title'),
    });
  }, [navigation, t, isEditMode]);

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
          title={isEditMode ? t('createAlert.editTitle') : t('createAlert.title')}
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
            <Text variant="overline" textStyle={[styles.sectionLabel, styles.sectionLabelFirst]}>
              {t('createAlert.selectStock')}
            </Text>
            <Pressable style={styles.stockInputRow} onPress={openStockPicker}>
              <View style={styles.stockInputLeft}>{searchIcon}</View>
              <View style={styles.stockInputContent}>
                <Text
                  variant="Secondary"
                  title={
                    selectedStock ? selectedStock.label : t('createAlert.searchStocksPlaceholder')
                  }
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
            {targetPriceValidationError != null ? (
              <Text
                variant="Secondary"
                title={targetPriceValidationError}
                textStyle={styles.validationError}
              />
            ) : null}
          </ScrollView>

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
                {isEditMode
                  ? t('createAlert.updateAlertButton')
                  : t('createAlert.createAlertButton')}
              </Text>
            </Button>
          </View>
        </KeyboardAvoidingView>

        <BottomSheetListSelection
          ref={listSelectionRef}
          enableDynamicSizing
          title={t('createAlert.selectStockSheetTitle')}
          items={stockOptions}
          selectedValue={selectedValue}
          onSelect={handleSelectStock}
          showSearch
          searchPlaceholder={t('createAlert.searchStocksPlaceholder')}
          searchQuery={stockSearchQuery}
          onSearchChange={handleStockSearchChange}
          loading={stockLoading}
        />
        <BottomSheetSuccess
          ref={successRef}
          snapPoints={['40%']}
          title={isEditMode ? t('createAlert.updatedTitle') : t('createAlert.successTitle')}
          message={
            isEditMode
              ? t('createAlert.updatedMessage')
              : t('createAlert.successMessage', {
                  symbol: selectedStock?.symbol ?? '—',
                  price: targetPrice || '0',
                })
          }
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
          onClose={dismissError}
        />
      </SafeAreaView>
    </View>
  );
}
