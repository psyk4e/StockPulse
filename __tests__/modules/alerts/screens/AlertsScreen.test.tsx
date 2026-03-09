import React from 'react';
import { renderWithNav, clearMockStorage } from '../../../setup';
import AlertsScreen from '@/modules/alerts/screens/AlertsScreen';
import { useAlertsStore } from '@/store/alerts.store';

jest.mock('@/store/live-prices.context', () => ({
  useQuotesForSymbols: () => ({}),
}));

beforeEach(() => {
  clearMockStorage();
  useAlertsStore.getState().clear();
});

describe('AlertsScreen', () => {
  it('renders without crashing when no alerts', () => {
    expect(() => renderWithNav(<AlertsScreen />)).not.toThrow();
  });

  it('renders without crashing when alerts exist', () => {
    useAlertsStore.getState().addAlert({
      symbol: 'AAPL',
      priceThreshold: 150,
      direction: 'above',
      enabled: true,
    });
    expect(() => renderWithNav(<AlertsScreen />)).not.toThrow();
  });
});
