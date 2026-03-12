import React, { useState, useCallback } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useAppColorScheme } from '@/context/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';

const Y_AXIS_LABEL_WIDTH = 50;

const CHART_LINE_COLORS = ['#2196F3', '#EF5350', '#4CAF50', '#FF9800', '#9C27B0'] as const;

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
  dataSets?: ChartDataSet[];
}

function formatYLabel(raw: string): string {
  const n = Number(raw);
  if (Number.isNaN(n)) return raw;
  if (Math.abs(n) >= 1000) return `$${Math.round(n / 1000)}k`;
  return `$${Math.round(n)}`;
}

function computeNiceAxis(values: number[]) {
  if (values.length === 0) {
    return { maxValue: 100, stepValue: 20, noOfSections: 5 };
  }

  const rawMax = Math.max(...values);
  const rawMin = Math.min(...values, 0);
  const range = Math.max(1, rawMax - rawMin);

  const roughStep = range / 5;
  const power = Math.pow(10, Math.floor(Math.log10(Math.max(1, roughStep))));
  const nice = [1, 2, 2.5, 5, 10];
  let stepValue = nice[nice.length - 1] * power;
  for (const m of nice) {
    const candidate = m * power;
    if (candidate >= roughStep) {
      stepValue = candidate;
      break;
    }
  }

  let maxValue = stepValue;
  while (maxValue < rawMax) maxValue += stepValue;

  const noOfSections = Math.round(maxValue / stepValue);

  return { maxValue, stepValue, noOfSections };
}

export function MultiStockChart({
  width: widthProp,
  height = 220,
  containerStyle,
  dataSets: dataSetsProp,
}: MultiStockChartProps) {
  const colorScheme = useAppColorScheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      if (w > 0 && w !== containerWidth) setContainerWidth(w);
    },
    [containerWidth]
  );

  const chartWidth =
    widthProp ?? Math.max(0, containerWidth > 0 ? containerWidth - Y_AXIS_LABEL_WIDTH : 0);

  const dataSetSource = dataSetsProp ?? [];
  const dataPointCount = Math.max(1, ...dataSetSource.map((s) => s.data?.length ?? 0));
  const spacing =
    chartWidth > 0 && dataPointCount > 1 ? (chartWidth - 16) / (dataPointCount - 1) : 0;

  const allValues = dataSetSource.flatMap((s) => (s.data ?? []).map((p) => p.value));
  const { maxValue, stepValue, noOfSections } = computeNiceAxis(allValues);

  const dataSet = dataSetSource.map((series, index) => ({
    data: (series.data ?? []).map((pt) => ({
      value: pt.value,
      label: pt.label,
    })),
    color: series.color ?? CHART_LINE_COLORS[index % CHART_LINE_COLORS.length],
    thickness: 2.5,
    curved: true,
    areaChart: true,
    startOpacity: 0.25,
    endOpacity: 0.02,
    hideDataPoints: true,
  }));

  const backgroundColor = isDarkMode ? THEME.colors.darkCard : THEME.colors.lightCard;
  const axisColor = isDarkMode ? THEME.colors.textSecondaryDark : THEME.colors.textSecondaryLight;
  const textColor = axisColor;

  return (
    <View style={[styles.container, { backgroundColor }, containerStyle]} onLayout={onLayout}>
      {chartWidth > 0 && dataSet.length > 0 && (
        <LineChart
          dataSet={dataSet}
          width={chartWidth}
          height={height - 40}
          maxValue={maxValue}
          mostNegativeValue={0}
          noOfSections={noOfSections}
          noOfSectionsBelowXAxis={0}
          stepValue={stepValue}
          formatYLabel={formatYLabel}
          backgroundColor={backgroundColor}
          xAxisColor={axisColor}
          yAxisColor={'transparent'}
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
