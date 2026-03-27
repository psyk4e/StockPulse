import { useQuotesForSymbols } from '@/context/live-prices.context';
import { useAlertsStore } from '@/store/alerts.store';
import React from 'react'
import { formatCondition, formatCurrentOrTriggered } from '../utils/alert.utils';

export function useAlertsScreen() {
  const alerts = useAlertsStore((s) => s.alerts);
  const updateAlert = useAlertsStore((s) => s.updateAlert);
  const alertSymbols = React.useMemo(() => alerts.map((a) => a.symbol), [alerts]);
  const quotes = useQuotesForSymbols(alertSymbols);
  const isEmpty = alerts.length === 0;

  const listData = React.useMemo(() => {
    return alerts.map((alert) => {
      const quote = quotes[alert.symbol];
      const currentPrice = quote?.c;
      const status = alert.triggeredAt != null ? ('triggered' as const) : ('active' as const);
      return {
        ...alert,
        condition: formatCondition(alert),
        currentOrTriggered: formatCurrentOrTriggered(alert, currentPrice),
        status,
      };
    });
  }, [alerts, quotes]);

  const handleToggleEnabled = React.useCallback(
    (id: string, value: boolean) => {
      updateAlert(id, { enabled: value });
    },
    [updateAlert]
  );

  return {
    listData,
    handleToggleEnabled,
    isEmpty,
  }
}