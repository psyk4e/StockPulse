import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { Card } from './Card';
import { Text } from '../Text';
import IconWithBackground from '../IconWithBackground';
import { Icon } from '../Icon';
import { THEME } from '@/utils/theme.utils';
import { useAppColorScheme } from '@/context/preferences.context';
import { getIsDarkMode, hexToRgba } from '@/utils/styles.utils';
import { LivePriceDisplay } from '../LivePriceDisplay';

/** Base hex colors for asset icons (Figma: blue, green, orange, purple, red). */
const ASSET_COLOR_HEX = [
  THEME.colors.primaryBlue, // blue (primary)
  THEME.colors.positive, // green
  THEME.colors.orange, // orange
  THEME.colors.purple, // purple
  THEME.colors.negative, // red
] as const;

/** Icon background opacity by scheme so colors read like Figma (more visible on dark). */
const ASSET_BG_OPACITY = { dark: 0.38, light: 0.22 } as const;

function getAssetColors(isDarkMode: boolean): { border: string; background: string }[] {
  const opacity = ASSET_BG_OPACITY[isDarkMode ? 'dark' : 'light'];
  return ASSET_COLOR_HEX.map((hex) => ({
    border: hex,
    background: hexToRgba(hex, opacity),
  }));
}

type CardAssetsBaseProps = ViewProps & {
  symbol: string;
  companyName: string;
  colorIndex?: number;
  onPress?: () => void;
  containerStyle?: ViewProps['style'];
  leftStyle?: ViewProps['style'];
  rightStyle?: ViewProps['style'];
  iconContainerStyle?: ViewProps['style'];
};

export type CardAssetsProps =
  | (CardAssetsBaseProps & { live?: false; price: string; changePercent: number })
  | (CardAssetsBaseProps & { live: true });

type CardAssetsStaticProps = CardAssetsBaseProps & {
  price: string;
  changePercent: number;
};

export function CardAssets(props: CardAssetsProps) {
  const {
    symbol,
    companyName,
    colorIndex = 0,
    live = false,
    onPress,
    containerStyle,
    leftStyle,
    rightStyle,
    iconContainerStyle,
    ...rest
  } = props;

  const colorScheme = useAppColorScheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const assetColors = getAssetColors(isDarkMode);
  const { border: assetBorder, background: assetBg } = assetColors[colorIndex % assetColors.length];
  const staticProps = !live ? (props as CardAssetsStaticProps) : null;

  return (
    <Card onPress={onPress} containerStyle={containerStyle} {...rest}>
      <View style={cardStyles.row}>
        <View style={[cardStyles.left, leftStyle]}>
          <IconWithBackground
            size={32}
            backgroundColor={assetBg}
            borderColor={assetBorder}
            containerStyle={[cardStyles.iconWrap, iconContainerStyle]}>
            <Icon name="chart" size={24} color={assetBorder} />
          </IconWithBackground>
          <View style={cardStyles.textBlock}>
            <Text title={symbol} variant="mono" textStyle={cardStyles.symbol} />
            <Text title={companyName} variant="Secondary" textStyle={cardStyles.company} />
          </View>
        </View>
        <View style={[cardStyles.right, rightStyle]}>
          {live ? (
            <LivePriceDisplay symbol={symbol} showChange />
          ) : (
            <>
              <Text title={staticProps!.price} variant="mono" textStyle={cardStyles.price} />
              <Text
                title={`${staticProps!.changePercent >= 0 ? '+' : ''}${staticProps!.changePercent.toFixed(1)}%`}
                variant="Primary"
                textStyle={[
                  cardStyles.change,
                  {
                    color: staticProps!.changePercent >= 0 ? assetBorder : THEME.colors.negative,
                  },
                ]}
              />
            </>
          )}
        </View>
      </View>
    </Card>
  );
}

CardAssets.displayName = 'CardAssets';

const cardStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  iconWrap: {},
  textBlock: {},
  symbol: {
    fontSize: 16,
    fontWeight: '700',
  },
  company: {
    fontSize: 12,
    marginTop: 2,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
  },
  change: {
    fontSize: 12,
    fontWeight: '500',
  },
});
