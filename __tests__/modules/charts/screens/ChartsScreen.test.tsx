import React from 'react';
import { renderWithNav, clearMockStorage } from '../../../setup';
import ChartsScreen from '@/modules/charts/screens/ChartsScreen';
import { useWatchlistStore } from '@/store/watchlist.store';

jest.mock('@/services/finnhub.service', () => ({
  getSymbolDescriptions: jest.fn().mockResolvedValue({}),
}));
jest.mock('@/store/live-prices.context', () => ({
  usePriceHistoryForSymbols: () => ({}),
}));

beforeEach(() => {
  clearMockStorage();
  useWatchlistStore.getState().clear();
});

describe('ChartsScreen', () => {
  it('renders without crashing', () => {
    expect(() => renderWithNav(<ChartsScreen />)).not.toThrow();
  });

  it('renders without crashing when watchlist has symbols', () => {
    useWatchlistStore.getState().addSymbol('AAPL');
    expect(() => renderWithNav(<ChartsScreen />)).not.toThrow();
  });
});
