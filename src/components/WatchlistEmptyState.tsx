import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useAppColorScheme } from '@/store/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { Text } from './Text';
import { Button } from './buttons/Button';

export interface WatchlistEmptyStateProps {
  title: string;
  subtitle: string;
  buttonLabel: string;
  onAddPress: () => void;
}

const CHART_WIDTH = 160;
const CHART_HEIGHT = 80;
const POINTS = [
  [0, 50],
  [32, 35],
  [64, 45],
  [96, 25],
  [128, 40],
  [160, 30],
];

export function WatchlistEmptyState({
  title,
  subtitle,
  buttonLabel,
  onAddPress,
}: WatchlistEmptyStateProps) {
  const colorScheme = useAppColorScheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const styles = getStyles(isDarkMode);
  const lineColor = isDarkMode ? THEME.colors.textSecondaryDark : THEME.colors.lightGrey;
  const pathD = POINTS.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');

  return (
    <View style={styles.container}>
      <View style={styles.illustration}>
        <Svg
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
          <Path d={pathD} stroke={lineColor} strokeWidth={2} fill="none" />
          {POINTS.map(([x, y], i) => (
            <Circle key={i} cx={x} cy={y} r={4} fill={lineColor} />
          ))}
          <Line
            x1={0}
            y1={CHART_HEIGHT - 8}
            x2={CHART_WIDTH}
            y2={CHART_HEIGHT - 8}
            stroke={lineColor}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        </Svg>
      </View>
      <Text title={title} font="bold" style={styles.title} />
      <Text title={subtitle} variant="Secondary" style={styles.subtitle} />
      <Button
        title={`+ ${buttonLabel}`}
        variant="primary"
        onPress={onAddPress}
        style={styles.button}
      />
    </View>
  );
}

function getStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: THEME.spacing.screenHorizontal,
      paddingVertical: THEME.spacing.marginVerticalL,
    },
    illustration: {
      marginBottom: THEME.spacing.marginVerticalL,
    },
    title: {
      fontSize: 20,
      textAlign: 'center',
      color: isDarkMode ? THEME.colors.textPrimaryDark : THEME.colors.textPrimaryLight,
    },
    subtitle: {
      fontSize: 14,
      textAlign: 'center',
      marginTop: 8,
      maxWidth: 280,
    },
    button: {
      marginTop: 24,
      minWidth: 160,
    },
  });
}
