import React from 'react'
import { ChartDataSet } from '@/components';
import { buildChartData } from '../utils/charts.utils';
import { TimeframeOption } from '@types/charts.types';
import { CHART_LINE_COLORS } from '../utils/charts.constant';
import { useWatchlistStore } from '@/store/watchlist.store';
import { getSymbolDescriptions } from '@/services/finnhub.service';

export function useChartsScreen() {
  const [selectedTimeframe, setSelectedTimeframe] = React.useState<string>('1M');
  const symbols = useWatchlistStore((s) => s.symbols);
  const [symbolToName, setSymbolToName] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (symbols.length === 0) {
      setSymbolToName({});
      return;
    }
    let cancelled = false;
    getSymbolDescriptions(symbols)
      .then((map) => {
        if (!cancelled) setSymbolToName(map);
      })
      .catch(() => { });
    return () => {
      cancelled = true;
    };
  }, [symbols]);

  const listData = React.useMemo(
    () =>
      symbols.map((symbol, colorIndex) => ({
        symbol,
        companyName: symbolToName[symbol] ?? symbol,
        colorIndex: colorIndex % CHART_LINE_COLORS.length,
      })),
    [symbols, symbolToName]
  );

  const chartDataSets = React.useMemo<ChartDataSet[]>(() => {
    const lineCount = Math.max(1, Math.min(listData.length || 2, CHART_LINE_COLORS.length));
    return buildChartData(selectedTimeframe as TimeframeOption, lineCount);
  }, [listData.length, selectedTimeframe]);

  return {
    selectedTimeframe,
    listData,
    chartDataSets,
    setSelectedTimeframe
  }
}