import React, { useEffect, useState } from 'react';
import { View, StyleSheet, type TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { subscribeToQuote } from '@/store/live-prices.context';
import type { LiveQuote } from '@/store/live-prices.types';
import { THEME } from '@/utils/theme.utils';
import { Text } from './Text';
import { Icon } from './Icon';

const POSITIVE_COLOR = THEME.colors.positive;
const NEGATIVE_COLOR = THEME.colors.negative;

export interface LivePriceDisplayProps {
  symbol: string;
  /** Initial quote from state/REST so price shows immediately instead of waiting for socket */
  initialQuote?: LiveQuote | null;
  showChange?: boolean;
  priceStyle?: TextStyle;
  changeStyle?: TextStyle;
  formatPrice?: (price: number) => string;
}

export function LivePriceDisplay({
  symbol,
  initialQuote,
  showChange = true,
  priceStyle,
  changeStyle,
  formatPrice = (p) => `$${p.toFixed(2)}`,
}: LivePriceDisplayProps) {
  const [price, setPrice] = useState<number | null>(initialQuote?.c ?? null);
  const [changePercent, setChangePercent] = useState<number>(initialQuote?.dp ?? 0);
  const changePercentSv = useSharedValue(initialQuote?.dp ?? 0);

  useEffect(() => {
    if (initialQuote != null) {
      setPrice(initialQuote.c);
      setChangePercent(initialQuote.dp);
      changePercentSv.value = initialQuote.dp;
    }
  }, [initialQuote?.c, initialQuote?.dp]);

  useEffect(() => {
    if (!symbol?.trim()) return;
    const unsub = subscribeToQuote(symbol.trim(), (quote) => {
      setPrice(quote.c);
      setChangePercent(quote.dp);
      changePercentSv.value = withTiming(quote.dp, { duration: 200 });
    });
    return unsub;
  }, [symbol]);

  const animatedChangeStyle = useAnimatedStyle(() => {
    const p = changePercentSv.value;
    return {
      color: p >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR,
    };
  });

  if (price == null) {
    return (
      <View style={styles.row}>
        <Text variant="mono" title="—" textStyle={[styles.price, priceStyle]} />
      </View>
    );
  }

  return (
    <View style={styles.row}>
      <Text
        variant="mono"
        font="bold"
        title={formatPrice(price)}
        textStyle={[styles.price, priceStyle]}
      />
      {showChange && (
        <View style={styles.changeRow}>
          <Icon
            name={changePercent >= 0 ? 'arrow-up' : 'arrow-down'}
            size={14}
            color={changePercent >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR}
          />
          <Animated.Text
            style={[styles.changeText, changeStyle, animatedChangeStyle]}
            numberOfLines={1}
          >
            {` ${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`}
          </Animated.Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-end',
    gap: 4,
  },
  price: {
    fontSize: 18,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
