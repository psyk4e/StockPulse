import { clearMockStorage } from '../setup';
import { useAlertsStore } from '@/store/alerts.store';

beforeEach(() => {
  clearMockStorage();
  useAlertsStore.getState().clear();
});

describe('alerts.store', () => {
  it('adds alert and persists', () => {
    const added = useAlertsStore.getState().addAlert({
      symbol: 'aapl',
      priceThreshold: 150,
      direction: 'above',
      enabled: true,
    });
    expect(added).toBe(true);
    const alerts = useAlertsStore.getState().alerts;
    expect(alerts).toHaveLength(1);
    expect(alerts[0].symbol).toBe('AAPL');
    expect(alerts[0].priceThreshold).toBe(150);
    expect(alerts[0].direction).toBe('above');
    expect(alerts[0].enabled).toBe(true);
    expect(alerts[0].id).toMatch(/^alert_/);
  });

  it('returns false for duplicate symbol+threshold+direction', () => {
    useAlertsStore.getState().addAlert({
      symbol: 'MSFT',
      priceThreshold: 300,
      direction: 'below',
      enabled: true,
    });
    const added = useAlertsStore.getState().addAlert({
      symbol: 'msft',
      priceThreshold: 300,
      direction: 'below',
      enabled: true,
    });
    expect(added).toBe(false);
    expect(useAlertsStore.getState().alerts).toHaveLength(1);
  });

  it('allows same symbol with different threshold', () => {
    useAlertsStore.getState().addAlert({
      symbol: 'GOOG',
      priceThreshold: 100,
      direction: 'above',
      enabled: true,
    });
    const added = useAlertsStore.getState().addAlert({
      symbol: 'GOOG',
      priceThreshold: 200,
      direction: 'above',
      enabled: true,
    });
    expect(added).toBe(true);
    expect(useAlertsStore.getState().alerts).toHaveLength(2);
  });

  it('updateAlert updates enabled', () => {
    useAlertsStore.getState().addAlert({
      symbol: 'AAPL',
      priceThreshold: 150,
      direction: 'above',
      enabled: true,
    });
    const id = useAlertsStore.getState().alerts[0].id;
    useAlertsStore.getState().updateAlert(id, { enabled: false });
    expect(useAlertsStore.getState().alerts[0].enabled).toBe(false);
  });

  it('removeAlert removes by id', () => {
    useAlertsStore.getState().addAlert({
      symbol: 'AAPL',
      priceThreshold: 150,
      direction: 'above',
      enabled: true,
    });
    const id = useAlertsStore.getState().alerts[0].id;
    useAlertsStore.getState().removeAlert(id);
    expect(useAlertsStore.getState().alerts).toHaveLength(0);
  });

  it('markTriggered sets triggeredAt and disables', () => {
    useAlertsStore.getState().addAlert({
      symbol: 'AAPL',
      priceThreshold: 150,
      direction: 'above',
      enabled: true,
    });
    const id = useAlertsStore.getState().alerts[0].id;
    useAlertsStore.getState().markTriggered(id);
    const alert = useAlertsStore.getState().alerts[0];
    expect(alert.triggeredAt).toBeDefined();
    expect(alert.enabled).toBe(false);
  });

  it('clear removes all alerts', () => {
    useAlertsStore.getState().addAlert({
      symbol: 'AAPL',
      priceThreshold: 150,
      direction: 'above',
      enabled: true,
    });
    useAlertsStore.getState().clear();
    expect(useAlertsStore.getState().alerts).toHaveLength(0);
  });
});
