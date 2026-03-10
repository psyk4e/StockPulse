import axios from 'axios';
import { FINNHUB } from '@/utils/constant.utils';

export interface QuoteResponse {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

export interface StockSymbol {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export interface SymbolLookupResponse {
  count: number;
  result: StockSymbol[];
}

export type MarketStatusSession = 'pre-market' | 'regular' | 'post-market';

export interface MarketStatusResponse {
  exchange: string;
  holiday: string | null;
  isOpen: boolean;
  session: MarketStatusSession | null;
  timezone: string;
  t: number;
}

const client = axios.create({
  baseURL: FINNHUB.BASE_URL,
  params: { token: FINNHUB.TOKEN },
  timeout: 10000,
});

export async function getQuote(symbol: string): Promise<QuoteResponse> {
  const { data } = await client.get<QuoteResponse>('/quote', {
    params: { symbol: symbol.toUpperCase() },
  });
  return data;
}

export async function getStockSymbols(exchange: string): Promise<StockSymbol[]> {
  const { data } = await client.get<StockSymbol[]>('/stock/symbol', {
    params: { exchange },
  });
  return data ?? [];
}

export async function searchRemote(
  query: string,
  exchange: string
): Promise<SymbolLookupResponse> {
  const { data } = await client.get<SymbolLookupResponse>('/search', {
    params: { q: query.trim(), exchange },
  });
  return data ?? { count: 0, result: [] };
}

export async function getMarketStatus(exchange: string): Promise<MarketStatusResponse> {
  const { data } = await client.get<MarketStatusResponse>('/stock/market-status', {
    params: { exchange },
  });
  return data;
}
