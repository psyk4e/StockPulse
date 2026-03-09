import React from 'react';
import { renderWithNav, clearMockStorage } from '../../../setup';
import HomeScreen from '@/modules/home/screens/HomeScreen';
import { useWatchlistStore } from '@/store/watchlist.store';

jest.mock('@/services/finnhub.service', () => ({
  getSymbolDescriptions: jest.fn().mockResolvedValue({}),
}));

beforeEach(() => {
  clearMockStorage();
  useWatchlistStore.getState().clear();
});

describe('HomeScreen', () => {
  it('renders without crashing when watchlist is empty', () => {
    expect(() => renderWithNav(<HomeScreen />)).not.toThrow();
  });

  it('renders without crashing when watchlist has symbols', () => {
    useWatchlistStore.getState().addSymbol('AAPL');
    expect(() => renderWithNav(<HomeScreen />)).not.toThrow();
  });
});
