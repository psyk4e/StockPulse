import React from 'react';
import { renderWithNav, clearMockStorage } from '../../../setup';
import CreateAlertScreen from '@/modules/alerts/screens/CreateAlertScreen';
import { useAlertsStore } from '@/store/alerts.store';
import { useWatchlistStore } from '@/store/watchlist.store';

jest.mock('@/services/finnhub.service', () => ({
  getQuote: jest.fn().mockResolvedValue({ c: 100, d: 1, dp: 1, h: 101, l: 99, o: 99, pc: 99, t: Date.now() }),
  searchStockSymbols: jest.fn().mockResolvedValue({ items: [], total: 0 }),
}));
jest.mock('@/store/live-prices.context', () => ({
  useSetExtraSymbols: () => jest.fn(),
}));

beforeEach(() => {
  clearMockStorage();
  useAlertsStore.getState().clear();
  useWatchlistStore.getState().clear();
});

describe('CreateAlertScreen', () => {
  it('renders without crashing', () => {
    expect(() => renderWithNav(<CreateAlertScreen />)).not.toThrow();
  });
});
