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
