import React, { useRef } from 'react';
import { View, ViewProps, Pressable, StyleSheet } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { Text } from './Text';
import { Icon } from './Icon';
import { useAppColorScheme } from '@/store/preferences.context';
import {
  BottomSheetListSelection,
  ListSelectionItem,
} from './bottomSheet/BottomSheetListSelection';

export interface DropdownOption<T = string> {
  label: string;
  value: T;
}

export interface DropdownProps<T = string> extends ViewProps {
  options: DropdownOption<T>[];
  value?: T;
  onSelect?: (option: DropdownOption<T>) => void;
  placeholder?: string;
  containerStyle?: ViewProps['style'];
  triggerStyle?: ViewProps['style'];
  showSearch?: boolean;
  searchPlaceholder?: string;
  loading?: boolean;
}

export function Dropdown<T = string>({
  options,
  value,
  onSelect,
  placeholder = 'Select...',
  containerStyle,
  triggerStyle,
  showSearch = false,
  searchPlaceholder = 'Search...',
  loading = false,
  style,
  ...rest
}: DropdownProps<T>) {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const colorScheme = useAppColorScheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const styles = getStyles(isDarkMode);

  const selected = options.find((o) => o.value === value);
  const label = selected?.label ?? placeholder;

  const handleSelect = (item: DropdownOption<T>) => {
    onSelect?.(item);
    bottomSheetRef.current?.dismiss();
  };

  return (
    <View style={[styles.wrapper, containerStyle ?? style]} {...rest}>
      <Pressable
        style={[styles.trigger, triggerStyle]}
        onPress={() => bottomSheetRef.current?.present()}>
        <Text title={label} variant={selected ? 'Primary' : 'Secondary'} />
        <Icon
          name="chevron-right"
          size={16}
          color={isDarkMode ? THEME.colors.textSecondaryDark : THEME.colors.textSecondaryLight}
        />
      </Pressable>
      <BottomSheetListSelection
        ref={bottomSheetRef}
        title={placeholder}
        items={options as unknown as ListSelectionItem[]}
        onSelect={(item) => handleSelect(item as unknown as DropdownOption<T>)}
        snapPoints={['50%']}
        showSearch={showSearch}
        searchPlaceholder={searchPlaceholder}
        loading={loading}
      />
    </View>
  );
}

Dropdown.displayName = 'Dropdown';

function getStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    wrapper: {},
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      paddingHorizontal: 4,
      gap: 8,
    },
  });
}
