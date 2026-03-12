import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  getSubscribedSymbols,
  onPriceUpdate,
  subscribe as wsSubscribe,
  unsubscribe as wsUnsubscribe,
} from '@/services/finnhub.socket';
import { getQuote as fetchQuote } from '@/services/finnhub.service';
import { useWatchlistStore } from '@store/watchlist.store';
import { useAlertsStore } from '@store/alerts.store';
import { scheduleLocalNotification } from '@/config/notifications';
import {
  applyRestQuote,
  applySocketPrice,
  flushQuotesAndNotify,
  getLastUpdateTime,
  getQuote,
  getHistory,
  seedQuote,
  subscribeToQuote,
} from '@utils/live-prices.utils';
import { LiveQuote } from '@types/live-prices.types';

export { subscribeToQuote, getQuote, getHistory } from '@utils/live-prices.utils';

/** Subscribe to quote updates and return latest history for the given symbols (for charts). */
export function usePriceHistoryForSymbols(
  symbols: string[]
): Record<string, { value: number; label?: string }[]> {
  const [history, setHistory] = useState<Record<string, { value: number; label?: string }[]>>(() =>
    symbols.reduce((acc, s) => ({ ...acc, [s]: getHistory(s) }), {})
  );

  useEffect(() => {
    if (symbols.length === 0) {
      setHistory({});
      return;
    }
    const unsubs = symbols.map((sym) =>
      subscribeToQuote(sym, () => {
        setHistory((prev) => {
          const next = { ...prev };
          for (const s of symbols) {
            next[s] = getHistory(s);
          }
          return next;
        });
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [symbols.join(',')]);

  return history;
}

/** Subscribe to quote updates for the given symbols and return latest quotes (for alerts list etc). */
export function useQuotesForSymbols(symbols: string[]): Record<string, LiveQuote | undefined> {
  const [quotes, setQuotes] = useState<Record<string, LiveQuote | undefined>>(() =>
    symbols.reduce((acc, s) => ({ ...acc, [s]: getQuote(s) }), {})
  );

  useEffect(() => {
    if (symbols.length === 0) {
      setQuotes({});
      return;
    }
    const unsubs = symbols.map((sym) =>
      subscribeToQuote(sym, () => {
        setQuotes((prev) => {
          const next = { ...prev };
          for (const s of symbols) {
            next[s] = getQuote(s);
          }
          return next;
        });
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [symbols.join(',')]);

  return quotes;
}

type SetExtraSymbols = (symbols: string[]) => void;
const ExtraSymbolsContext = React.createContext<SetExtraSymbols | null>(null);

export function useSetExtraSymbols(): SetExtraSymbols {
  const setter = useContext(ExtraSymbolsContext);
  if (setter == null) throw new Error('useSetExtraSymbols must be used within LivePricesProvider');
  return setter;
}

const THROTTLE_MS = 500;
/** If no socket update for this long (ms), refresh from REST. */
const REST_FALLBACK_STALE_MS = 45_000;
/** How often to check for stale symbols and refetch from REST. */
const REST_FALLBACK_POLL_MS = 30_000;

export function LivePricesProvider({ children }: { children: React.ReactNode }) {
  const lastFlushRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restFallbackRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const symbols = useWatchlistStore((s) => s.symbols);
  const alerts = useAlertsStore((s) => s.alerts);
  const markTriggered = useAlertsStore((s) => s.markTriggered);
  const subscribedRef = useRef<Set<string>>(new Set());

  const flush = useCallback(() => {
    const now = Date.now();
    if (now - lastFlushRef.current < THROTTLE_MS) return;
    lastFlushRef.current = now;
    const { updatedSymbols } = flushQuotesAndNotify();
    if (updatedSymbols.length === 0) return;

    const alerts = useAlertsStore.getState().alerts;
    const enabledAlerts = alerts.filter((a) => a.enabled && !a.triggeredAt);
    for (const symbol of updatedSymbols) {
      const quote = getQuote(symbol);
      if (quote == null) continue;
      const price = quote.c;
      for (const alert of enabledAlerts) {
        if (alert.symbol !== symbol) continue;
        const crossed =
          alert.direction === 'above'
            ? price >= alert.priceThreshold
            : price <= alert.priceThreshold;
        if (crossed) {
          markTriggered(alert.id);
          scheduleLocalNotification(
            {
              title: 'Price Alert',
              body: `${symbol} is now $${price.toFixed(2)} (trigger: $${alert.priceThreshold.toFixed(2)})`,
            },
            null
          ).catch(() => {});
        }
      }
    }
  }, [markTriggered]);

  useEffect(() => {
    const unsub = onPriceUpdate((symbol, price) => {
      applySocketPrice(symbol, price);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(flush, THROTTLE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [flush]);

  const [extraSymbols, setExtraSymbolsState] = useState<string[]>([]);

  const setExtraSymbols = useCallback((symbols: string[]) => {
    setExtraSymbolsState((prev) => {
      const next = symbols.map((s) => s.toUpperCase().trim()).filter(Boolean);
      if (prev.length === next.length && prev.every((s, i) => s === next[i])) return prev;
      return next;
    });
  }, []);

  useEffect(() => {
    const activeAlertSymbols = alerts
      .filter((a) => a.enabled && !a.triggeredAt)
      .map((a) => a.symbol.toUpperCase().trim())
      .filter(Boolean);

    const next = new Set([...symbols, ...extraSymbols, ...activeAlertSymbols]);
    const current = new Set(getSubscribedSymbols());

    for (const s of current) {
      if (!next.has(s)) wsUnsubscribe(s);
    }
    for (const s of next) {
      if (!current.has(s)) {
        wsSubscribe(s);
        const isNew = !subscribedRef.current.has(s);
        if (isNew) {
          subscribedRef.current.add(s);
          fetchQuote(s)
            .then((res) => {
              const quote: LiveQuote = {
                c: res.c,
                d: res.d,
                dp: res.dp,
                h: res.h,
                l: res.l,
                o: res.o,
                pc: res.pc,
                t: res.t,
              };
              seedQuote(s, quote);
            })
            .catch(() => {});
        }
      }
    }
    for (const s of current) {
      if (next.has(s)) subscribedRef.current.add(s);
    }
    subscribedRef.current = new Set(next);
  }, [symbols, extraSymbols, alerts]);

  // When socket is not working, refresh from REST so chart and prices still update
  useEffect(() => {
    const runFallback = () => {
      const toRefresh = getSubscribedSymbols();
      const now = Date.now();
      for (const sym of toRefresh) {
        const last = getLastUpdateTime(sym);
        if (last == null || now - last >= REST_FALLBACK_STALE_MS) {
          fetchQuote(sym)
            .then((res) => {
              const quote: LiveQuote = {
                c: res.c,
                d: res.d,
                dp: res.dp,
                h: res.h,
                l: res.l,
                o: res.o,
                pc: res.pc,
                t: res.t,
              };
              applyRestQuote(sym, quote);
            })
            .catch(() => {});
        }
      }
    };
    if (restFallbackRef.current) clearInterval(restFallbackRef.current);
    restFallbackRef.current = setInterval(runFallback, REST_FALLBACK_POLL_MS);
    return () => {
      if (restFallbackRef.current) {
        clearInterval(restFallbackRef.current);
        restFallbackRef.current = null;
      }
    };
  }, [symbols]);

  return (
    <ExtraSymbolsContext.Provider value={setExtraSymbols}>{children}</ExtraSymbolsContext.Provider>
  );
}
