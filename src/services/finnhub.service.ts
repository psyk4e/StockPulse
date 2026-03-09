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

export interface SymbolLookupResponse {
  count: number;
  result: StockSymbol[];
}

export interface SymbolLookupResult {
  items: StockSymbol[];
  total: number;
}

const client = axios.create({
  baseURL: FINNHUB.BASE_URL,
  params: { token: FINNHUB.TOKEN },
  timeout: 10000,
});

let symbolsCache: { exchange: string; list: StockSymbol[] } | null = null;

type SearchCacheEntry = { ts: number; result: StockSymbol[] };
const searchCache: Record<string, SearchCacheEntry> = {};
const SEARCH_TTL_MS = 5 * 60 * 1000; // 5 minutes
const SEARCH_MAX_RESULTS = 300;

function buildSearchKey(query: string, exchange: string): string {
  return `${exchange.toUpperCase()}::${query.trim().toLowerCase()}`;
}

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
 *
 * NOTE: Este helper existe solo para utilidades internas puntuales.
 * No debe usarse para autocompletado interactivo en la UI.
 * Para búsquedas dinámicas, usar `searchSymbolsRemote`.
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
 *
 * NOTE: Este método también depende del listado masivo `/stock/symbol`.
 * No debe usarse para búsquedas en tiempo real del usuario; preferir `searchSymbolsRemote`.
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
 * Remote search using Finnhub `/search` endpoint.
 * Always scoped to the given exchange (defaults to US) and cached per query.
 * This is the preferred API for interactive symbol search in the UI.
 */
export async function searchSymbolsRemote(
  query: string,
  exchange: string = 'US'
): Promise<SymbolLookupResult> {
  const q = query.trim();
  if (q === '') {
    return { items: [], total: 0 };
  }

  const key = buildSearchKey(q, exchange);
  const now = Date.now();
  const cached = searchCache[key];
  if (cached && now - cached.ts <= SEARCH_TTL_MS) {
    const items = cached.result.slice(0, SEARCH_MAX_RESULTS);
    return { items, total: items.length };
  }

  const { data } = await client.get<SymbolLookupResponse>('/search', {
    params: { q, exchange },
  });

  const list = Array.isArray(data?.result) ? data.result : [];
  const trimmed = list.slice(0, SEARCH_MAX_RESULTS);
  searchCache[key] = { ts: now, result: trimmed };

  return { items: trimmed, total: data?.count ?? trimmed.length };
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
