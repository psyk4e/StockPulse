import { TIMEFRAME_OPTIONS } from "@/modules/charts/utils/charts.constant";

export type TimeframeOption = (typeof TIMEFRAME_OPTIONS)[number];

export interface TimeframeConfig {
  points: number;
  labels: (idx: number) => string | undefined;
}