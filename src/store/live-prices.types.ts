/**
 * Full Finnhub quote attributes for live price display and logic.
 * @see https://finnhub.io/docs/api/quote
 */
export interface LiveQuote {
  /** Current price */
  c: number;
  /** Change */
  d: number;
  /** Percent change */
  dp: number;
  /** High price of the day */
  h: number;
  /** Low price of the day */
  l: number;
  /** Open price of the day */
  o: number;
  /** Previous close price */
  pc: number;
  /** Timestamp (optional) */
  t?: number;
}

export type LiveQuotesMap = Record<string, LiveQuote>;

export interface PriceHistoryPoint {
  value: number;
  label?: string;
}

export type PriceHistoryMap = Record<string, PriceHistoryPoint[]>;
