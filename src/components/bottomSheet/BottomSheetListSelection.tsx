import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetTextInput,
  useBottomSheetScrollableCreator,
} from '@gorhom/bottom-sheet';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { useAppColorScheme } from '@/context/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { SelectSection } from '../SelectSection';
import { Text } from '../Text';
import { BottomSheetBackdrop } from './BottomSheetBackdrop';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ListSelectionItem<T = string> {
  label: string;
  value: T;
  icon?: React.ReactNode | null;
}

export interface BottomSheetListSelectionProps<T = string> {
  title?: string;
  items: ListSelectionItem<T>[];
  /** Current selected value; when set, each row shows a radio indicator. */
  selectedValue?: T | null;
  onSelect?: (item: ListSelectionItem<T>) => void;
  snapPoints?: (string | number)[];
  onClose?: () => void;
  /** When true, show a search field that filters items by label (case-insensitive). */
  showSearch?: boolean;
  searchPlaceholder?: string;
  /** Controlled search: when set, search is driven by parent (e.g. for async/paginated data). */
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  /** Called when user scrolls to the end of the list (e.g. load more). */
  onEndReached?: () => void;
  /** When true, show a loading indicator instead of empty list. */
  loading?: boolean;
  index?: number;
  enableDynamicSizing?: boolean;
}

function ListHeaderView({
  title,
  showSearch,
  searchPlaceholder,
  searchQuery,
  onSearchChange,
}: {
  title?: string;
  showSearch: boolean;
  searchPlaceholder: string;
  searchQuery: string;
  onSearchChange: (text: string) => void;
}) {
  const colorScheme = useAppColorScheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const searchInputContainerStyle = [
    styles.searchInputContainer,
    {
      backgroundColor: isDarkMode ? THEME.colors.darkCard : THEME.colors.lightCard,
      borderColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder,
    },
  ];
  const searchInputStyle = [
    styles.searchInputField,
    {
      color: isDarkMode ? THEME.colors.textPrimaryDark : THEME.colors.textPrimaryLight,
    },
  ];
  const placeholderColor = isDarkMode
    ? THEME.colors.textSecondaryDark
    : THEME.colors.textSecondaryLight;

  return (
    <View style={styles.headerWrap}>
      {title != null && title !== '' ? (
        <Text title={title} variant="Primary" textStyle={styles.title} />
      ) : null}
      {showSearch ? (
        <View style={searchInputContainerStyle}>
          <BottomSheetTextInput
            placeholder={searchPlaceholder}
            placeholderTextColor={placeholderColor}
            value={searchQuery}
            onChangeText={onSearchChange}
            style={searchInputStyle}
          />
        </View>
      ) : null}
    </View>
  );
}

export const BottomSheetListSelection = forwardRef<BottomSheetModal, BottomSheetListSelectionProps>(
  function BottomSheetListSelection(
    {
      title,
      items,
      selectedValue,
      onSelect,
      snapPoints = ['50%'],
      onClose,
      showSearch = false,
      searchPlaceholder = 'Search...',
      searchQuery: controlledSearchQuery,
      onSearchChange: onSearchChangeProp,
      onEndReached,
      loading = false,
      index = 0,
      enableDynamicSizing = false,
    },
    ref
  ) {
    const insets = useSafeAreaInsets();
    const colorScheme = useAppColorScheme();
    const isDarkMode = getIsDarkMode(colorScheme);
    const backgroundColor = isDarkMode ? THEME.colors.darkCard : THEME.colors.lightCard;
    const showSelectionIndicator = selectedValue !== undefined && selectedValue !== null;
    const [internalSearchQuery, setInternalSearchQuery] = useState('');

    const isControlledSearch =
      controlledSearchQuery !== undefined && onSearchChangeProp !== undefined;
    const searchQuery = isControlledSearch ? controlledSearchQuery : internalSearchQuery;
    const setSearchQuery = isControlledSearch ? onSearchChangeProp! : setInternalSearchQuery;

    const filteredItems = useMemo(() => {
      if (isControlledSearch) return items;
      if (!showSearch || !searchQuery.trim()) return items;
      const q = searchQuery.trim().toLowerCase();
      return items.filter((item) => item.label.toLowerCase().includes(q));
    }, [items, showSearch, searchQuery, isControlledSearch]);

    const renderItem = useCallback(
      ({ item }: ListRenderItemInfo<ListSelectionItem>) => (
        <SelectSection
          label={item.label}
          icon={item.icon}
          showIcon={item.icon != null}
          showSelectionIndicator={showSelectionIndicator}
          selected={item.value === selectedValue}
          onPress={() => onSelect?.(item)}
        />
      ),
      [onSelect, showSelectionIndicator, selectedValue]
    );

    const keyExtractor = useCallback((item: ListSelectionItem) => String(item.value), []);

    const overrideItemLayout = useCallback(
      (layout: { span?: number; size?: number }, _item: ListSelectionItem, index: number) => {
        layout.size = 56;
        if (layout.span !== undefined) layout.span = 1;
      },
      []
    );

    const BottomSheetScrollable = useBottomSheetScrollableCreator();

    const ListEmptyComponent = useMemo(() => {
      if (!loading) return null;
      return (
        <View style={emptyStyles.wrap}>
          <ActivityIndicator size="large" color={THEME.colors.primaryBlue} />
          <Text title="Loading..." variant="Secondary" textStyle={emptyStyles.text} />
        </View>
      );
    }, [loading]);

    const ListHeaderComponent = useMemo(() => {
      return (
        <ListHeaderView
          title={title}
          showSearch={showSearch}
          searchPlaceholder={searchPlaceholder}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      );
    }, [title, showSearch, searchPlaceholder, searchQuery, setSearchQuery]);

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        onDismiss={onClose}
        backgroundStyle={{ backgroundColor }}
        backdropComponent={BottomSheetBackdrop}
        index={index}
        enableDynamicSizing={enableDynamicSizing}
        keyboardBehavior="fillParent"
        keyboardBlurBehavior="none"
        android_keyboardInputMode="adjustResize"
        topInset={insets.top}>
        <FlashList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          overrideItemLayout={overrideItemLayout}
          ListHeaderComponent={ListHeaderComponent}
          ListEmptyComponent={ListEmptyComponent}
          contentContainerStyle={[styles.listContent, styles.contentPadding]}
          renderScrollComponent={BottomSheetScrollable}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
        />
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  contentPadding: {
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  headerWrap: {
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    paddingVertical: 16,
    paddingHorizontal: 0,
    textAlign: 'center',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 48,
    marginBottom: 8,
  },
  searchInputField: {
    flex: 1,
    paddingHorizontal: THEME.spacing.inputPaddingHorizontal,
    paddingVertical: THEME.spacing.inputPaddingVertical,
    fontSize: 16,
  },
});

const emptyStyles = StyleSheet.create({
  wrap: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    fontSize: 14,
  },
});
