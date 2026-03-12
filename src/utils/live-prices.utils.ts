import type { LiveQuote, LiveQuotesMap, PriceHistoryMap } from '@types/live-prices.types';

const MAX_HISTORY_POINTS = 100;

const quotesRef: { current: LiveQuotesMap } = { current: {} };
const historyRef: { current: PriceHistoryMap } = { current: {} };
const pendingPricesRef: { current: Record<string, number> } = { current: {} };
const lastUpdateBySymbolRef: { current: Record<string, number> } = { current: {} };

const listeners = new Map<string, Set<(quote: LiveQuote) => void>>();

function toKey(symbol: string): string {
  return symbol.toUpperCase();
}

function buildQuoteFromPrice(symbol: string, price: number): LiveQuote {
  const key = toKey(symbol);
  const existing = quotesRef.current[key];
  const pc = existing?.pc ?? price;
  const d = price - pc;
  const dp = pc !== 0 ? (d / pc) * 100 : 0;
  return {
    c: price,
    d,
    dp,
    h: existing?.h ?? price,
    l: existing?.l ?? price,
    o: existing?.o ?? price,
    pc,
    t: existing?.t,
  };
}

export function getQuote(symbol: string): LiveQuote | undefined {
  if (!symbol) return undefined;
  return quotesRef.current[toKey(symbol)];
}

export function getHistory(symbol: string): { value: number; label?: string }[] {
  if (!symbol) return [];
  return historyRef.current[toKey(symbol)] ?? [];
}

export function getQuotesRef(): LiveQuotesMap {
  return quotesRef.current;
}

export function getHistoryRef(): PriceHistoryMap {
  return historyRef.current;
}

export function applySocketPrice(symbol: string, price: number): void {
  const key = toKey(symbol);
  pendingPricesRef.current[key] = price;
}

function notifyListeners(key: string): void {
  const set = listeners.get(key);
  const q = quotesRef.current[key];
  if (set?.size && q) {
    set.forEach((cb) => {
      try {
        cb(q);
      } catch {
        // ignore
      }
    });
  }
}

function markUpdated(key: string): void {
  lastUpdateBySymbolRef.current[key] = Date.now();
}

/** Last update timestamp for symbol (ms), or undefined if never updated. */
export function getLastUpdateTime(symbol: string): number | undefined {
  const t = lastUpdateBySymbolRef.current[toKey(symbol)];
  return t;
}

export function seedQuote(symbol: string, quote: LiveQuote): void {
  const key = toKey(symbol);
  quotesRef.current[key] = { ...quote };
  const existing = historyRef.current[key];
  if (!existing?.length) {
    historyRef.current[key] = [{ value: quote.c }];
  }
  markUpdated(key);
  notifyListeners(key);
}

/**
 * Update quote and history from REST (e.g. when socket is not working).
 * Appends current price to history and notifies listeners.
 */
export function applyRestQuote(symbol: string, quote: LiveQuote): void {
  const key = toKey(symbol);
  quotesRef.current[key] = { ...quote };
  const arr = historyRef.current[key] ?? [];
  const next = [...arr, { value: quote.c }];
  if (next.length > MAX_HISTORY_POINTS) next.shift();
  historyRef.current[key] = next;
  markUpdated(key);
  notifyListeners(key);
}

export type QuoteListener = (quote: LiveQuote) => void;

export function subscribeToQuote(symbol: string, callback: QuoteListener): () => void {
  const key = toKey(symbol);
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key)!.add(callback);
  const current = quotesRef.current[key];
  if (current) {
    try {
      callback(current);
    } catch {
      // ignore
    }
  }
  return () => {
    const set = listeners.get(key);
    if (set) {
      set.delete(callback);
      if (set.size === 0) listeners.delete(key);
    }
  };
}

export function flushQuotesAndNotify(): { updatedSymbols: string[] } {
  const pending = { ...pendingPricesRef.current };
  pendingPricesRef.current = {};

  const updatedSymbols: string[] = [];

  for (const [sym, price] of Object.entries(pending)) {
    const quote = buildQuoteFromPrice(sym, price);
    quotesRef.current[sym] = quote;
    updatedSymbols.push(sym);

    const arr = historyRef.current[sym] ?? [];
    const next = [...arr, { value: quote.c }];
    if (next.length > MAX_HISTORY_POINTS) next.shift();
    historyRef.current[sym] = next;
    markUpdated(sym);
  }

  for (const symbol of updatedSymbols) {
    const quote = quotesRef.current[symbol];
    if (quote) {
      const set = listeners.get(symbol);
      if (set) {
        set.forEach((cb) => {
          try {
            cb(quote);
          } catch {
            // ignore
          }
        });
      }
    }
  }

  return { updatedSymbols };
}

export function getPendingSnapshot(): Record<string, number> {
  return { ...pendingPricesRef.current };
}
