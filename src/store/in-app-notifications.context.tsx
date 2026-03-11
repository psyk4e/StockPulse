import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type ToastVariant = 'snackbar' | 'banner';

export interface InAppToastPayload {
  title: string;
  message: string;
  /** Optional icon name; defaults per variant (e.g. check for snackbar, bell for banner). */
  icon?: 'bell' | 'check' | 'info';
  actionLabel?: string;
  onAction?: () => void;
}

export interface InAppToastItem extends InAppToastPayload {
  id: string;
  variant: ToastVariant;
  createdAt: number;
}

const MAX_TOASTS = 5;

function generateId(): string {
  return `toast_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export interface InAppNotificationsContextValue {
  items: InAppToastItem[];
  showSnackbar: (payload: InAppToastPayload) => string;
  showBanner: (payload: InAppToastPayload) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const InAppNotificationsContext = createContext<InAppNotificationsContextValue | null>(null);

export function useInAppNotifications(): InAppNotificationsContextValue {
  const ctx = useContext(InAppNotificationsContext);
  if (ctx == null) {
    throw new Error('useInAppNotifications must be used within InAppNotificationsProvider');
  }
  return ctx;
}

interface InAppNotificationsProviderProps {
  children: ReactNode;
}

export function InAppNotificationsProvider({ children }: InAppNotificationsProviderProps) {
  const [items, setItems] = useState<InAppToastItem[]>([]);

  const showSnackbar = useCallback((payload: InAppToastPayload): string => {
    const id = generateId();
    const item: InAppToastItem = {
      ...payload,
      id,
      variant: 'snackbar',
      createdAt: Date.now(),
    };
    setItems((prev) => [item, ...prev].slice(0, MAX_TOASTS));
    return id;
  }, []);

  const showBanner = useCallback((payload: InAppToastPayload): string => {
    const id = generateId();
    const item: InAppToastItem = {
      ...payload,
      id,
      variant: 'banner',
      createdAt: Date.now(),
    };
    setItems((prev) => [item, ...prev].slice(0, MAX_TOASTS));
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<InAppNotificationsContextValue>(
    () => ({
      items,
      showSnackbar,
      showBanner,
      dismiss,
      dismissAll,
    }),
    [items, showSnackbar, showBanner, dismiss, dismissAll]
  );

  return (
    <InAppNotificationsContext.Provider value={value}>
      {children}
    </InAppNotificationsContext.Provider>
  );
}
