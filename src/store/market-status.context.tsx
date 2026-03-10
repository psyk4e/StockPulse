import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { getMarketStatus } from '@/services/finnhub.service';
import type { MarketStatusResponse } from '@/services/finnhub.service';

interface MarketStatusContextValue {
  status: MarketStatusResponse | null;
  loading: boolean;
  error: boolean;
  refetch: () => Promise<void>;
}

const MarketStatusContext = createContext<MarketStatusContextValue | null>(null);

const EXCHANGE = 'US';

export function MarketStatusProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<MarketStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getMarketStatus(EXCHANGE);
      setStatus(data);
    } catch {
      setError(true);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        fetchStatus();
      }
    });
    return () => subscription.remove();
  }, [fetchStatus]);

  const value: MarketStatusContextValue = {
    status,
    loading,
    error,
    refetch: fetchStatus,
  };

  return (
    <MarketStatusContext.Provider value={value}>{children}</MarketStatusContext.Provider>
  );
}

export function useMarketStatus(): MarketStatusContextValue {
  const ctx = useContext(MarketStatusContext);
  if (ctx == null) {
    throw new Error('useMarketStatus must be used within MarketStatusProvider');
  }
  return ctx;
}
