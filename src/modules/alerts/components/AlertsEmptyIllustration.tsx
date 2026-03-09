import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';
import { THEME } from '@/utils/theme.utils';

const CHART_WIDTH = 160;
const CHART_HEIGHT = 80;
const BAR_WIDTH = 14;
const BAR_GAP = 10;
const BAR_HEIGHTS = [28, 48, 36, 56, 32, 44];
const BAR_BASELINE = CHART_HEIGHT - 10;
const getBarX = (i: number) => 12 + i * (BAR_WIDTH + BAR_GAP);

export interface AlertsEmptyIllustrationProps {
  isDarkMode: boolean;
}

export function AlertsEmptyIllustration({ isDarkMode }: AlertsEmptyIllustrationProps) {
  const primary = THEME.colors.primaryBlue;
  const accent = THEME.colors.subtleBlue;
  const axisColor = isDarkMode ? THEME.colors.textSecondaryDark : THEME.colors.lightGrey;
  return (
    <View style={styles.wrapper}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        <Line
          x1={8}
          y1={BAR_BASELINE}
          x2={CHART_WIDTH - 8}
          y2={BAR_BASELINE}
          stroke={axisColor}
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.7}
        />
        {BAR_HEIGHTS.map((h, i) => (
          <Rect
            key={`bar-${i}`}
            x={getBarX(i)}
            y={BAR_BASELINE - h}
            width={BAR_WIDTH}
            height={h}
            rx={4}
            fill={i % 3 === 1 ? accent : primary}
            opacity={i % 3 === 1 ? 0.9 : 0.75}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: THEME.spacing.marginVerticalL,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
