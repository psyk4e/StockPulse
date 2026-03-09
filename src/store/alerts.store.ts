import { create } from 'zustand';
import { storage } from '@/config/plugins/mmkv.plugin';

const ALERTS_KEY = 'alerts_list';

export type AlertDirection = 'above' | 'below';

export interface Alert {
  id: string;
  symbol: string;
  priceThreshold: number;
  direction: AlertDirection;
  enabled: boolean;
  triggeredAt?: number;
}

function getStoredAlerts(): Alert[] {
  try {
    const raw = storage.getString(ALERTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (a: unknown): a is Alert =>
        typeof a === 'object' &&
        a !== null &&
        typeof (a as Alert).id === 'string' &&
        typeof (a as Alert).symbol === 'string' &&
        typeof (a as Alert).priceThreshold === 'number' &&
        ((a as Alert).direction === 'above' || (a as Alert).direction === 'below') &&
        typeof (a as Alert).enabled === 'boolean'
    );
  } catch {
    return [];
  }
}

function persist(alerts: Alert[]): void {
  storage.set(ALERTS_KEY, JSON.stringify(alerts));
}

function generateId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export interface AlertsState {
  alerts: Alert[];
  addAlert: (alert: Omit<Alert, 'id' | 'enabled'> & { enabled?: boolean }) => boolean;
  removeAlert: (id: string) => void;
  updateAlert: (id: string, patch: Partial<Pick<Alert, 'enabled' | 'triggeredAt'>>) => void;
  markTriggered: (id: string) => void;
  clear: () => void;
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  alerts: getStoredAlerts(),

  addAlert: (input) => {
    const symbol = input.symbol.toUpperCase();
    const { priceThreshold, direction } = input;
    const enabled = input.enabled ?? true;
    const current = get().alerts;
    const duplicate = current.some(
      (a) => a.symbol === symbol && a.priceThreshold === priceThreshold && a.direction === direction
    );
    if (duplicate) return false;
    const newAlert: Alert = {
      id: generateId(),
      symbol,
      priceThreshold,
      direction,
      enabled,
    };
    const next = [...current, newAlert];
    persist(next);
    set({ alerts: next });
    return true;
  },

  removeAlert: (id) => {
    const next = get().alerts.filter((a) => a.id !== id);
    persist(next);
    set({ alerts: next });
  },

  updateAlert: (id, patch) => {
    const next = get().alerts.map((a) =>
      a.id === id ? { ...a, ...patch } : a
    );
    persist(next);
    set({ alerts: next });
  },

  markTriggered: (id) => {
    get().updateAlert(id, { triggeredAt: Date.now(), enabled: false });
  },

  clear: () => {
    persist([]);
    set({ alerts: [] });
  },
}));
