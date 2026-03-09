import axios from 'axios';
import { FINNHUB } from '@/utils/constant.utils';

export interface QuoteResponse {
  c: number; // current price
  d: number; // change
  dp: number; // percent change
  h: number; // high
  l: number; // low
  o: number; // open
  pc: number; // previous close
  t: number; // timestamp
}

export interface StockSymbol {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export interface PaginatedSymbolsResult {
  items: StockSymbol[];
  total: number;
  page: number;
  pageSize: number;
}

const client = axios.create({
  baseURL: FINNHUB.BASE_URL,
  params: { token: FINNHUB.TOKEN },
  timeout: 10000,
});

let symbolsCache: { exchange: string; list: StockSymbol[] } | null = null;

async function ensureSymbolsCache(exchange: string): Promise<StockSymbol[]> {
  if (symbolsCache?.exchange === exchange) {
    return symbolsCache.list;
  }
  const { data } = await client.get<StockSymbol[]>('/stock/symbol', {
    params: { exchange },
  });
  const list = data ?? [];
  symbolsCache = { exchange, list };
  return list;
}

export async function getQuote(symbol: string): Promise<QuoteResponse> {
  const { data } = await client.get<QuoteResponse>('/quote', {
    params: { symbol: symbol.toUpperCase() },
  });
  return data;
}

const DEFAULT_PAGE_SIZE = 50;

/**
 * Returns a paginated slice of stock symbols for the exchange.
 * Full list is fetched once and cached; subsequent calls use the cache.
 */
export async function getStockSymbolsPage(
  exchange: string = 'US',
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<PaginatedSymbolsResult> {
  const list = await ensureSymbolsCache(exchange);
  const total = list.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = list.slice(start, end);
  return { items, total, page, pageSize };
}

/**
 * Search symbols by query (symbol or description) and return a paginated result.
 * Uses cached symbol list; filters then paginates.
 */
export async function searchStockSymbols(
  query: string,
  exchange: string = 'US',
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<PaginatedSymbolsResult> {
  const list = await ensureSymbolsCache(exchange);
  const q = query.trim().toLowerCase();
  const filtered =
    q === ''
      ? list
      : list.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          (s.description ?? '').toLowerCase().includes(q)
      );
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const items = filtered.slice(start, end);
  return { items, total, page, pageSize };
}

/**
 * Resolve symbol -> description for the given symbols only.
 * Fetches full symbol list once (cached) and returns a map for the requested symbols.
 */
export async function getSymbolDescriptions(
  symbols: string[],
  exchange: string = 'US'
): Promise<Record<string, string>> {
  if (symbols.length === 0) return {};
  const list = await ensureSymbolsCache(exchange);
  const set = new Set(symbols.map((s) => s.toUpperCase()));
  const map: Record<string, string> = {};
  for (const item of list) {
    if (set.has(item.symbol)) {
      map[item.symbol] = item.description ?? item.symbol;
    }
  }
  for (const s of symbols) {
    const key = s.toUpperCase();
    if (!(key in map)) map[key] = s;
  }
  return map;
}
