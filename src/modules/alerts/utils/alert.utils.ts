import { ListSelectionItem } from '@/components';
import type { Alert } from '@/store/alerts.store';

export function formatCondition(alert: Alert): string {
  const price = alert.priceThreshold.toFixed(2);
  return alert.direction === 'above' ? `Price > $${price}` : `Price < $${price}`;
}

export function formatCurrentOrTriggered(
  alert: Alert,
  currentPrice: number | undefined
): string {
  if (alert.triggeredAt != null) {
    const date = new Date(alert.triggeredAt);
    return `Triggered at: ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  if (currentPrice != null) {
    return `Current: $${currentPrice.toFixed(2)}`;
  }
  return 'Current: --';
}

export function mapItemsToOptions(items: { symbol: string; description?: string }[]): ListSelectionItem[] {
  const seen = new Set<string>();
  return items
    .filter((s) => {
      if (seen.has(s.symbol)) return false;
      seen.add(s.symbol);
      return true;
    })
    .map((s) => ({
      label: `${s.symbol} - ${s.description ?? s.symbol}`,
      value: s.symbol,
    }));
}