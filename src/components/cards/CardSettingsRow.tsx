import React from 'react';
import { View, ViewProps, Pressable, StyleSheet } from 'react-native';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { Text } from '../Text';
import { Icon } from '../Icon';
import { Switch } from '../Switch';
import { useAppColorScheme } from '@/context/preferences.context';

export type CardSettingsRowRightType = 'link' | 'switch' | 'text';

export interface CardSettingsRowProps extends ViewProps {
  icon: React.ReactNode;
  label: string;
  type?: CardSettingsRowRightType;
  value?: string;
  switchValue?: boolean;
  onSwitchValueChange?: (value: boolean) => void;
  onPress?: () => void;
  containerStyle?: ViewProps['style'];
  leftStyle?: ViewProps['style'];
  rightStyle?: ViewProps['style'];
  right?: React.ReactNode;
}

export function CardSettingsRow({
  icon,
  label,
  type = 'link',
  value,
  switchValue,
  onSwitchValueChange,
  onPress,
  containerStyle,
  leftStyle,
  rightStyle,
  right,
  ...rest
}: CardSettingsRowProps) {
  const colorScheme = useAppColorScheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const styles = getStyles(isDarkMode);

  let rightContent: React.ReactNode = right;
  if (rightContent == null) {
    if (type === 'switch') {
      rightContent = <Switch value={switchValue} onValueChange={onSwitchValueChange} />;
    } else if (type === 'text') {
      rightContent = <Text title={value ?? ''} variant="Secondary" />;
    } else {
      rightContent = (
        <Icon
          name="chevron-right"
          size={16}
          color={isDarkMode ? THEME.colors.textSecondaryDark : THEME.colors.textSecondaryLight}
        />
      );
    }
  }

  const content = (
    <>
      <View style={[styles.left, leftStyle]}>
        <View style={styles.iconWrap}>{icon}</View>
        <Text title={label} variant="Primary" textStyle={styles.label} />
      </View>
      <View style={[styles.right, rightStyle]}>{rightContent}</View>
    </>
  );

  const rowStyle = [styles.row, containerStyle];

  if (onPress != null && type === 'link') {
    return (
      <Pressable style={rowStyle} onPress={onPress} {...rest}>
        {content}
      </Pressable>
    );
  }

  return (
    <View style={rowStyle} {...rest}>
      {content}
    </View>
  );
}

CardSettingsRow.displayName = 'CardSettingsRow';

function getStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 16,
      backgroundColor: 'rgba(0,136,255,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
    },
    right: {},
  });
}
