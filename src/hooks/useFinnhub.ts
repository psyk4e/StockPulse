import { useCallback } from 'react';
import {
  getQuote,
  searchSymbolsRemote,
  getSymbolDescriptions,
  getStockSymbolsPage,
  searchStockSymbols,
} from '@/services/finnhub.service';
import type { QuoteResponse, SymbolLookupResult, PaginatedSymbolsResult } from '@/services/finnhub.service';

/**
 * Hook that exposes Finnhub API. All logic (caching, filtering) lives in FinnhubService;
 * HTTP is performed by finnhub.api. Use this in components that need quote, search, or descriptions.
 */
export function useFinnhub() {
  const fetchQuote = useCallback((symbol: string): Promise<QuoteResponse> => {
    return getQuote(symbol);
  }, []);

  const searchSymbols = useCallback(
    (query: string, exchange: string = 'US'): Promise<SymbolLookupResult> => {
      return searchSymbolsRemote(query, exchange);
    },
    []
  );

  const fetchSymbolDescriptions = useCallback(
    (symbols: string[], exchange: string = 'US'): Promise<Record<string, string>> => {
      return getSymbolDescriptions(symbols, exchange);
    },
    []
  );

  const fetchStockSymbolsPage = useCallback(
    (
      exchange: string = 'US',
      page: number = 1,
      pageSize: number = 50
    ): Promise<PaginatedSymbolsResult> => {
      return getStockSymbolsPage(exchange, page, pageSize);
    },
    []
  );

  const searchStockSymbolsPage = useCallback(
    (
      query: string,
      exchange: string = 'US',
      page: number = 1,
      pageSize: number = 50
    ): Promise<PaginatedSymbolsResult> => {
      return searchStockSymbols(query, exchange, page, pageSize);
    },
    []
  );

  return {
    getQuote: fetchQuote,
    searchSymbolsRemote: searchSymbols,
    getSymbolDescriptions: fetchSymbolDescriptions,
    getStockSymbolsPage: fetchStockSymbolsPage,
    searchStockSymbols: searchStockSymbolsPage,
  };
}
