import { create } from 'zustand';
import { storage } from '@/config/plugins/mmkv.plugin';

const WATCHLIST_KEY = 'watchlist_symbols';

function getStoredSymbols(): string[] {
  try {
    const raw = storage.getString(WATCHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) && parsed.every((x) => typeof x === 'string')
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function persist(symbols: string[]): void {
  storage.set(WATCHLIST_KEY, JSON.stringify(symbols));
}

export interface WatchlistState {
  symbols: string[];
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
  setSymbols: (symbols: string[]) => void;
  clear: () => void;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  symbols: getStoredSymbols(),

  addSymbol: (symbol) => {
    const s = symbol.toUpperCase().trim();
    if (!s) return;
    const current = get().symbols;
    if (current.includes(s)) return;
    const next = [...current, s];
    persist(next);
    set({ symbols: next });
  },

  removeSymbol: (symbol) => {
    const s = symbol.toUpperCase();
    const next = get().symbols.filter((x) => x !== s);
    persist(next);
    set({ symbols: next });
  },

  setSymbols: (symbols) => {
    const next = symbols.map((x) => String(x).toUpperCase().trim()).filter(Boolean);
    const unique = Array.from(new Set(next));
    persist(unique);
    set({ symbols: unique });
  },

  clear: () => {
    persist([]);
    set({ symbols: [] });
  },
}));
