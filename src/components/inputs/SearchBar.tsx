import React from 'react';
import { ViewStyle } from 'react-native';
import { Icon } from '../Icon';
import TextInput, { TextInputProps } from './TextInput';
import { THEME } from '@/utils/theme.utils';
import { useAppColorScheme } from '@/context/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';

export interface SearchBarProps extends Omit<TextInputProps, 'leftIcon'> {
  placeholder?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextInputProps['inputStyle'];
  onClear?: () => void;
}

function SearchBar({
  placeholder = 'Search stocks...',
  containerStyle,
  inputStyle,
  onClear,
  ...rest
}: SearchBarProps) {
  const colorScheme = useAppColorScheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const iconColor = isDarkMode ? THEME.colors.textSecondaryDark : THEME.colors.textSecondaryLight;

  const leftIcon = <Icon name="search" size={20} color={iconColor} />;

  return (
    <TextInput
      placeholder={placeholder}
      leftIcon={leftIcon}
      containerStyle={containerStyle}
      inputStyle={inputStyle}
      {...rest}
    />
  );
}

SearchBar.displayName = 'SearchBar';

export default SearchBar;
