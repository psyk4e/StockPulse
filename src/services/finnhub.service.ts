import type { StockSymbol } from './finnhub.api';
import * as finnhubApi from './finnhub.api';

export type { QuoteResponse, StockSymbol, MarketStatusResponse, MarketStatusSession } from './finnhub.api';

export interface PaginatedSymbolsResult {
  items: StockSymbol[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SymbolLookupResult {
  items: StockSymbol[];
  total: number;
}

const DEFAULT_PAGE_SIZE = 50;
const SEARCH_TTL_MS = 5 * 60 * 1000;
const SEARCH_MAX_RESULTS = 300;

export class FinnhubService {
  private symbolsCache: { exchange: string; list: StockSymbol[] } | null = null;
  private searchCache: Record<string, { ts: number; result: StockSymbol[] }> = {};

  buildSearchKey(query: string, exchange: string): string {
    return `${exchange.toUpperCase()}::${query.trim().toLowerCase()}`;
  }

  setSymbolsCache(exchange: string, list: StockSymbol[]): void {
    this.symbolsCache = { exchange, list };
  }

  getSymbolsCache(exchange: string): StockSymbol[] | null {
    if (this.symbolsCache?.exchange === exchange) {
      return this.symbolsCache.list;
    }
    return null;
  }

  getSymbolsPage(
    exchange: string,
    page: number = 1,
    pageSize: number = DEFAULT_PAGE_SIZE
  ): PaginatedSymbolsResult | null {
    const list = this.getSymbolsCache(exchange);
    if (!list) return null;
    const total = list.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = list.slice(start, end);
    return { items, total, page, pageSize };
  }

  filterSymbols(list: StockSymbol[], query: string): StockSymbol[] {
    const q = query.trim().toLowerCase();
    if (q === '') return list;
    return list.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        (s.description ?? '').toLowerCase().includes(q)
    );
  }

  searchSymbols(
    list: StockSymbol[],
    query: string,
    page: number = 1,
    pageSize: number = DEFAULT_PAGE_SIZE
  ): PaginatedSymbolsResult {
    const filtered = this.filterSymbols(list, query);
    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);
    return { items, total, page, pageSize };
  }

  getCachedSearch(key: string): SymbolLookupResult | null {
    const entry = this.searchCache[key];
    if (!entry || Date.now() - entry.ts > SEARCH_TTL_MS) return null;
    const items = entry.result.slice(0, SEARCH_MAX_RESULTS);
    return { items, total: items.length };
  }

  setCachedSearch(key: string, result: StockSymbol[]): void {
    const trimmed = result.slice(0, SEARCH_MAX_RESULTS);
    this.searchCache[key] = { ts: Date.now(), result: trimmed };
  }

  getSymbolDescriptions(symbols: string[], list: StockSymbol[]): Record<string, string> {
    if (symbols.length === 0) return {};
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
}

const finnhubService = new FinnhubService();

/**
 * Returns a paginated slice of stock symbols for the exchange.
 * Uses cached symbol list; caller must ensure cache is filled via getStockSymbols.
 */
export async function getStockSymbolsPage(
  exchange: string = 'US',
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<PaginatedSymbolsResult> {
  let list = finnhubService.getSymbolsCache(exchange);
  if (!list) {
    list = await finnhubApi.getStockSymbols(exchange);
    finnhubService.setSymbolsCache(exchange, list);
  }
  const result = finnhubService.getSymbolsPage(exchange, page, pageSize);
  return result ?? { items: [], total: 0, page, pageSize };
}

/**
 * Search symbols by query (symbol or description); uses cached symbol list.
 */
export async function searchStockSymbols(
  query: string,
  exchange: string = 'US',
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<PaginatedSymbolsResult> {
  let list = finnhubService.getSymbolsCache(exchange);
  if (!list) {
    list = await finnhubApi.getStockSymbols(exchange);
    finnhubService.setSymbolsCache(exchange, list);
  }
  return finnhubService.searchSymbols(list, query, page, pageSize);
}

/**
 * Remote search using Finnhub `/search` endpoint; cached per query.
 */
export async function searchSymbolsRemote(
  query: string,
  exchange: string = 'US'
): Promise<SymbolLookupResult> {
  const q = query.trim();
  if (q === '') {
    return { items: [], total: 0 };
  }
  const key = finnhubService.buildSearchKey(q, exchange);
  const cached = finnhubService.getCachedSearch(key);
  if (cached) return cached;
  const data = await finnhubApi.searchRemote(q, exchange);
  const list = Array.isArray(data?.result) ? data.result : [];
  finnhubService.setCachedSearch(key, list);
  const items = list.slice(0, SEARCH_MAX_RESULTS);
  return { items, total: data?.count ?? items.length };
}

/**
 * Resolve symbol -> description; uses cached symbol list when available.
 */
export async function getSymbolDescriptions(
  symbols: string[],
  exchange: string = 'US'
): Promise<Record<string, string>> {
  if (symbols.length === 0) return {};
  let list = finnhubService.getSymbolsCache(exchange);
  if (!list) {
    list = await finnhubApi.getStockSymbols(exchange);
    finnhubService.setSymbolsCache(exchange, list);
  }
  return finnhubService.getSymbolDescriptions(symbols, list);
}

export async function getQuote(symbol: string) {
  return finnhubApi.getQuote(symbol);
}

export async function getMarketStatus(exchange: string = 'US') {
  return finnhubApi.getMarketStatus(exchange);
}

export { finnhubService };
