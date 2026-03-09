import { formatCondition, formatCurrentOrTriggered } from '@/modules/alerts/utils/alert.utils';
import type { Alert } from '@/store/alerts.store';

describe('alert.utils', () => {
  describe('formatCondition', () => {
    it('formats above direction with price', () => {
      const alert: Alert = {
        id: '1',
        symbol: 'AAPL',
        priceThreshold: 150.5,
        direction: 'above',
        enabled: true,
      };
      expect(formatCondition(alert)).toBe('Price > $150.50');
    });

    it('formats below direction with price', () => {
      const alert: Alert = {
        id: '1',
        symbol: 'AAPL',
        priceThreshold: 100,
        direction: 'below',
        enabled: true,
      };
      expect(formatCondition(alert)).toBe('Price < $100.00');
    });
  });

  describe('formatCurrentOrTriggered', () => {
    const baseAlert: Alert = {
      id: '1',
      symbol: 'AAPL',
      priceThreshold: 150,
      direction: 'above',
      enabled: true,
    };

    it('returns triggered time when triggeredAt is set', () => {
      const alert = { ...baseAlert, triggeredAt: new Date('2025-01-15T14:30:00').getTime() };
      const result = formatCurrentOrTriggered(alert, undefined);
      expect(result).toMatch(/^Triggered at: \d{1,2}:\d{2}/);
    });

    it('returns current price when currentPrice is set', () => {
      expect(formatCurrentOrTriggered(baseAlert, 155.25)).toBe('Current: $155.25');
    });

    it('returns placeholder when no price and not triggered', () => {
      expect(formatCurrentOrTriggered(baseAlert, undefined)).toBe('Current: --');
    });
  });
});
