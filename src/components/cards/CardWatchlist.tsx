import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Text } from '../Text';
import { ChipWithIcon } from '../chips/ChipWithIcon';
import { LivePriceDisplay } from '../LivePriceDisplay';

type CardWatchlistBaseProps = ViewProps & {
  symbol: string;
  companyName: string;
  onPress?: () => void;
  containerStyle?: ViewProps['style'];
  leftStyle?: ViewProps['style'];
  rightStyle?: ViewProps['style'];
};

export type CardWatchlistProps =
  | (CardWatchlistBaseProps & { live?: false; price: string; changePercent: number })
  | (CardWatchlistBaseProps & { live: true });

type CardWatchlistStaticProps = CardWatchlistBaseProps & {
  price: string;
  changePercent: number;
};

export function CardWatchlist(props: CardWatchlistProps) {
  const {
    symbol,
    companyName,
    live = false,
    onPress,
    containerStyle,
    leftStyle,
    rightStyle,
    ...rest
  } = props;

  const staticProps = !live ? (props as CardWatchlistStaticProps) : null;

  return (
    <Card onPress={onPress} containerStyle={containerStyle} {...rest}>
      <View style={cardStyles.row}>
        <View style={[cardStyles.left, leftStyle]}>
          <Text title={symbol} variant="Primary" font="bold" textStyle={cardStyles.symbol} />
          <Text title={companyName} variant="Secondary" textStyle={cardStyles.company} />
        </View>
        <View style={[cardStyles.right, rightStyle]}>
          {live ? (
            <LivePriceDisplay symbol={symbol} showChange />
          ) : (
            <>
              <Text
                title={staticProps!.price}
                variant="mono"
                font="bold"
                textStyle={cardStyles.price}
              />
              <ChipWithIcon
                label={`${staticProps!.changePercent >= 0 ? '+' : ''}${staticProps!.changePercent.toFixed(1)}%`}
                icon={staticProps!.changePercent >= 0 ? 'arrow-up' : 'arrow-down'}
                status={staticProps!.changePercent >= 0 ? 'active' : 'triggered'}
              />
            </>
          )}
        </View>
      </View>
    </Card>
  );
}

CardWatchlist.displayName = 'CardWatchlist';

const cardStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  left: {},
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  symbol: {
    fontSize: 18,
    fontWeight: '700',
  },
  company: {
    fontSize: 14,
    marginTop: 2,
  },
  price: {
    fontSize: 18,
  },
});
