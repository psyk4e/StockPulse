import { clearMockStorage } from '../setup';
import { useWatchlistStore } from '@/store/watchlist.store';

beforeEach(() => {
  clearMockStorage();
  useWatchlistStore.getState().clear();
});

describe('watchlist.store', () => {
  it('addSymbol normalizes to uppercase and dedupes', () => {
    useWatchlistStore.getState().addSymbol('  aapl  ');
    expect(useWatchlistStore.getState().symbols).toEqual(['AAPL']);
    useWatchlistStore.getState().addSymbol('AAPL');
    expect(useWatchlistStore.getState().symbols).toEqual(['AAPL']);
  });

  it('addSymbol ignores empty string', () => {
    useWatchlistStore.getState().addSymbol('   ');
    expect(useWatchlistStore.getState().symbols).toEqual([]);
  });

  it('removeSymbol removes by symbol', () => {
    useWatchlistStore.getState().addSymbol('AAPL');
    useWatchlistStore.getState().addSymbol('MSFT');
    useWatchlistStore.getState().removeSymbol('aapl');
    expect(useWatchlistStore.getState().symbols).toEqual(['MSFT']);
  });

  it('setSymbols replaces with trimmed unique uppercase', () => {
    useWatchlistStore.getState().setSymbols(['  aapl  ', 'MSFT', 'aapl']);
    expect(useWatchlistStore.getState().symbols).toEqual(['AAPL', 'MSFT']);
  });

  it('clear removes all symbols', () => {
    useWatchlistStore.getState().addSymbol('AAPL');
    useWatchlistStore.getState().clear();
    expect(useWatchlistStore.getState().symbols).toEqual([]);
  });
});
