import React from 'react';
import { View, ViewProps, StyleSheet, ColorSchemeName, useColorScheme } from 'react-native';
import { Card } from './Card';
import { Text } from '../Text';
import { ChipWithIcon } from '../chips/ChipWithIcon';
import { SwitchAlert } from '../SwitchAlert';
import { THEME } from '@/utils/theme.utils';
import { getIsDarkMode } from '@/utils/styles.utils';
import { useAppColorScheme } from '@/context/preferences.context';

export interface CardActiveAlertsProps extends ViewProps {
  symbol: string;
  status: 'active' | 'triggered';
  condition: string;
  currentOrTriggered: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  onPress?: () => void;
  containerStyle?: ViewProps['style'];
  leftStyle?: ViewProps['style'];
  rightStyle?: ViewProps['style'];
  switchContainerStyle?: ViewProps['style'];
}

export function CardActiveAlerts({
  symbol,
  status,
  condition,
  currentOrTriggered,
  value,
  onValueChange,
  onPress,
  containerStyle,
  leftStyle,
  rightStyle,
  switchContainerStyle,
  ...rest
}: CardActiveAlertsProps) {
  const colorSchema = useAppColorScheme();
  const initial = symbol.charAt(0).toUpperCase();
  const cardStyles = getCardStyles(colorSchema);

  return (
    <Card onPress={onPress} containerStyle={containerStyle} {...rest}>
      <View style={cardStyles.row}>
        <View style={[cardStyles.left, leftStyle]}>
          <View style={cardStyles.initialWrap}>
            <Text title={initial} variant="Primary" textStyle={cardStyles.initial} />
          </View>
          <View style={cardStyles.content}>
            <View style={cardStyles.titleRow}>
              <Text title={symbol} variant="mono" textStyle={cardStyles.symbol} />
              <ChipWithIcon label={status === 'active' ? 'Active' : 'Triggered'} status={status} />
            </View>
            <Text
              title={condition}
              variant="Secondary"
              textStyle={[cardStyles.condition, status === 'triggered' && cardStyles.strikethrough]}
            />
            <Text title={currentOrTriggered} variant="caption" textStyle={cardStyles.meta} />
          </View>
        </View>
        <View style={[cardStyles.switchWrap, switchContainerStyle ?? rightStyle]}>
          <SwitchAlert
            value={value}
            onValueChange={onValueChange}
            isTriggered={status === 'triggered'}
          />
        </View>
      </View>
    </Card>
  );
}

CardActiveAlerts.displayName = 'CardActiveAlerts';

const getCardStyles = (colorScheme: ColorSchemeName) => {
  const isDarkMode = getIsDarkMode(colorScheme);
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    left: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    initialWrap: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    initial: {
      fontSize: 20,
      fontWeight: '700',
    },
    content: {
      flex: 1,
      gap: 2,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    symbol: {
      fontSize: 16,
      fontWeight: '700',
    },
    condition: {
      fontSize: 14,
    },
    strikethrough: {
      textDecorationLine: 'line-through',
    },
    meta: {
      fontSize: 12,
      marginTop: 2,
    },
    switchWrap: {
      marginLeft: 16,
    },
  });
};
