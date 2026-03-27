import { THEME } from "@/utils/theme.utils";
import { TimeframeConfig, TimeframeOption } from "@types/charts.types";

export const TIMEFRAME_OPTIONS = ['1D', '1W', '1M', '3M', '1Y', 'ALL'] as const;

export const CHART_LINE_COLORS = [
  THEME.colors.primary,
  THEME.colors.secondary,
  THEME.colors.tertiary,
  THEME.colors.neutral,
  THEME.colors.errorIcon,
];

export const TIMEFRAME_SUBTITLE_KEYS: Record<TimeframeOption, string> = {
  '1D': 'charts.view1D',
  '1W': 'charts.view1W',
  '1M': 'charts.view1M',
  '3M': 'charts.view3M',
  '1Y': 'charts.view1Y',
  ALL: 'charts.viewAll',
};


export const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const TIMEFRAME_CONFIGS: Record<TimeframeOption, TimeframeConfig> = {
  '1D': {
    points: 8,
    labels: (i) => {
      const hours = ['9:30', '10', '11', '12', '1', '2', '3', '4'];
      return hours[i];
    },
  },
  '1W': {
    points: 5,
    labels: (i) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i],
  },
  '1M': {
    points: 5,
    labels: (i) => {
      const days = ['Oct 01', 'Oct 08', 'Oct 15', 'Oct 22', 'Oct 29'];
      return days[i];
    },
  },
  '3M': {
    points: 6,
    labels: (i) => MONTHS_SHORT.slice(7, 13)[i],
  },
  '1Y': {
    points: 12,
    labels: (i) => (i % 2 === 0 ? MONTHS_SHORT[i] : undefined),
  },
  ALL: {
    points: 8,
    labels: (i) => {
      const years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];
      return years[i];
    },
  },
};

export const SERIES_DATA: Record<TimeframeOption, number[][]> = {
  '1D': [
    [15200, 15800, 16400, 15900, 16800, 17200, 16600, 17400],
    [8200, 9000, 8600, 9400, 10200, 9800, 10600, 11000],
  ],
  '1W': [
    [18000, 22000, 19000, 25000, 23000],
    [6000, 9000, 12000, 8000, 14000],
  ],
  '1M': [
    [15000, 18000, 24000, 35000, 42000],
    [5000, 8000, 13000, 14000, 28000],
  ],
  '3M': [
    [12000, 18000, 15000, 28000, 35000, 40000],
    [4000, 8000, 12000, 10000, 16000, 22000],
  ],
  '1Y': [
    [8000, 12000, 18000, 15000, 22000, 28000, 24000, 32000, 38000, 35000, 42000, 48000],
    [3000, 5000, 8000, 6000, 10000, 14000, 12000, 18000, 22000, 20000, 26000, 30000],
  ],
  ALL: [
    [5000, 12000, 20000, 15000, 28000, 38000, 42000, 50000],
    [2000, 6000, 10000, 14000, 8000, 18000, 24000, 30000],
  ],
};
