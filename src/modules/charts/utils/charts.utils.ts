import type { TimeframeOption } from "@types/charts.types";
import { SERIES_DATA, TIMEFRAME_CONFIGS } from "./charts.constant";
import type { ChartDataSet } from "@/components/MultiStockChart";

export function buildChartData(timeframe: TimeframeOption, lineCount: number): ChartDataSet[] {
  const config = TIMEFRAME_CONFIGS[timeframe];
  const seriesPool = SERIES_DATA[timeframe];
  const count = Math.min(lineCount, seriesPool.length);
  const dataSets: ChartDataSet[] = [];

  for (let i = 0; i < count; i += 1) {
    const values = seriesPool[i];
    const data = values.map((value, idx) => ({
      value,
      label: config.labels(idx),
    }));
    dataSets.push({ data });
  }

  return dataSets;
}