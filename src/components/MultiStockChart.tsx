import React, { useState, useCallback } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useAppColorScheme } from '@/store/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';

const Y_AXIS_LABEL_WIDTH = 44;
const DATA_POINTS = 5;

/** Line colors matching the design (red, blue, green, orange, purple) */
const CHART_LINE_COLORS = [
  '#EF5350', // red
  '#2196F3', // blue
  '#4CAF50', // green
  '#FF9800', // orange
  '#9C27B0', // purple
] as const;

const DUMMY_DATA_SETS: { data: { value: number; label?: string }[] }[] = [
  {
    data: [
      { value: 12, label: 'Oct 1' },
      { value: 8, label: 'Oct 8' },
      { value: 14, label: 'Oct 15' },
      { value: 10, label: 'Oct 22' },
      { value: 12.4, label: 'Oct 29' },
    ],
  },
  { data: [{ value: 5 }, { value: 6 }, { value: 4 }, { value: 8 }, { value: 8.2 }] },
  { data: [{ value: 2 }, { value: 4 }, { value: 6 }, { value: 3 }, { value: 5.1 }] },
  { data: [{ value: 0 }, { value: 2 }, { value: 3 }, { value: 5 }, { value: 4.2 }] },
  { data: [{ value: -2 }, { value: 0 }, { value: 1 }, { value: -1 }, { value: -2.4 }] },
];

export interface ChartDataPoint {
  value: number;
  label?: string;
}

export interface ChartDataSet {
  data: ChartDataPoint[];
  color?: string;
}

export interface MultiStockChartProps {
  width?: number;
  height?: number;
  containerStyle?: React.ComponentProps<typeof View>['style'];
  /** When provided, use these series instead of default dummy data. */
  dataSets?: ChartDataSet[];
}

export function MultiStockChart({
  width: widthProp,
  height = 180,
  containerStyle,
  dataSets: dataSetsProp,
}: MultiStockChartProps) {
  const colorScheme = useAppColorScheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setContainerWidth(w);
  }, []);

  const chartWidth = widthProp ?? Math.max(0, containerWidth - Y_AXIS_LABEL_WIDTH);
  const dataSetSource = dataSetsProp ?? DUMMY_DATA_SETS;
  const dataPointCount = Math.max(
    1,
    ...dataSetSource.map((s) => s.data?.length ?? 0)
  );
  const spacing =
    chartWidth > 0 && dataPointCount > 1 ? (chartWidth - 16) / (dataPointCount - 1) : 0;

  const dataSet = dataSetSource.map((series, index) => {
    const s = series as ChartDataSet;
    return {
      data: (s.data ?? []).map((point) => ({ value: point.value, label: point.label })),
      color:
        s.color ?? CHART_LINE_COLORS[index % CHART_LINE_COLORS.length],
    thickness: 2,
    curved: true,
    areaChart: true,
    startOpacity: 0.3,
    endOpacity: 0.05,
    hideDataPoints: true,
  };
  });

  const isCustomData = dataSetsProp != null && dataSetsProp.length > 0;
  const allValues = dataSetSource.flatMap((s) => (s.data ?? []).map((p) => p.value));
  const maxVal = allValues.length > 0 ? Math.max(...allValues) : 15;
  const minVal = allValues.length > 0 ? Math.min(...allValues) : -5;
  const maxValue = isCustomData && maxVal > minVal ? maxVal + (maxVal - minVal) * 0.1 : 15;
  const mostNegativeValue =
    isCustomData && minVal < maxVal ? minVal - (maxVal - minVal) * 0.1 : -5;
  const step = Math.ceil((maxValue - mostNegativeValue) / 4) || 5;

  const backgroundColor = isDarkMode ? THEME.colors.darkCard : THEME.colors.lightCard;
  const axisColor = isDarkMode ? THEME.colors.textSecondaryDark : THEME.colors.textSecondaryLight;
  const textColor = isDarkMode ? THEME.colors.textSecondaryDark : THEME.colors.textSecondaryLight;

  return (
    <View style={[styles.container, { backgroundColor }, containerStyle]} onLayout={onLayout}>
      {containerWidth > 0 && dataSet.length > 0 && (
        <LineChart
          dataSet={dataSet}
          width={chartWidth}
          height={height - 32}
          maxValue={maxValue}
          mostNegativeValue={mostNegativeValue}
          noOfSections={3}
          noOfSectionsBelowXAxis={1}
          stepValue={step}
          negativeStepValue={step}
          yAxisLabelSuffix={isCustomData ? '$' : '%'}
          formatYLabel={
            isCustomData
              ? (label) => String(Number(label).toFixed(0))
              : (label) => `${Number(label) >= 0 ? '+' : ''}${label}`
          }
          backgroundColor={backgroundColor}
          xAxisColor={axisColor}
          yAxisColor={axisColor}
          yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
          yAxisTextStyle={[styles.axisText, { color: textColor }]}
          xAxisLabelTextStyle={[styles.axisText, { color: textColor }]}
          xAxisLabelsAtBottom
          rulesColor={axisColor}
          rulesType="dashed"
          dashWidth={2}
          dashGap={4}
          spacing={spacing}
          initialSpacing={8}
          endSpacing={8}
          scrollAnimation={false}
          disableScroll
        />
      )}
    </View>
  );
}

MultiStockChart.displayName = 'MultiStockChart';

const styles = StyleSheet.create({
  container: {
    borderRadius: THEME.spacing.borderRadius,
    overflow: 'hidden',
    paddingVertical: 16,
    paddingRight: 0,
    paddingLeft: 4,
    alignSelf: 'stretch',
    width: '100%',
  },
  axisText: {
    fontSize: 10,
  },
});
