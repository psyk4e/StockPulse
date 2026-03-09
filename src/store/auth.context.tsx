import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Auth0Provider, useAuth0 } from 'react-native-auth0';
import { AUTH0 } from '@/utils/constant.utils';
import { useWatchlistStore } from '@/store/watchlist.store';
import { useAlertsStore } from '@/store/alerts.store';

export const AUTH_ERROR_USER_CANCELLED = 'a0.session.user_cancelled';

// SignIn context for static navigation `if` hooks (useIsSignedIn / useIsSignedOut)
const SignInContext = createContext<boolean>(false);

export function useIsSignedIn(): boolean {
  return useContext(SignInContext);
}

export function useIsSignedOut(): boolean {
  return !useIsSignedIn();
}

export interface AuthContextValue {
  isLoading: boolean;
  isSignedIn: boolean;
  user: { name?: string; email?: string; picture?: string } | null;
  signIn: (options?: { screenHint?: 'signup' }) => Promise<void>;
  signOut: () => Promise<void>;
  error: Error | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (value == null) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return value;
}

const customScheme = AUTH0.CUSTOM_SCHEME;
const scope = 'openid profile email';

function AuthProviderInner({ children }: { children: ReactNode }) {
  const {
    user,
    isLoading: auth0Loading,
    authorize,
    clearSession,
    clearCredentials,
    hasValidCredentials,
  } = useAuth0();

  const [restoreDone, setRestoreDone] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isLoading = !restoreDone || auth0Loading;
  const isSignedIn = user != null;

  useEffect(() => {
    let cancelled = false;
    hasValidCredentials()
      .then(() => {
        if (!cancelled) setRestoreDone(true);
      })
      .catch(() => {
        if (!cancelled) setRestoreDone(true);
      });
    return () => {
      cancelled = true;
    };
  }, [hasValidCredentials]);

  const signIn = useCallback(
    async (options?: { screenHint?: 'signup' }) => {
      setError(null);
      try {
        await authorize(
          {
            scope,
            ...(options?.screenHint === 'signup' && {
              additionalParameters: { screen_hint: 'signup' },
            }),
          },
          { customScheme }
        );
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        if (err.message !== AUTH_ERROR_USER_CANCELLED) {
          setError(err);
        }
        throw err;
      }
    },
    [authorize]
  );

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await clearSession({}, { customScheme });
      await clearCredentials();
      useWatchlistStore.getState().clear();
      useAlertsStore.getState().clear();
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    }
  }, [clearSession, clearCredentials]);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isLoading,
      isSignedIn,
      user,
      signIn,
      signOut,
      error,
      clearError,
    }),
    [isLoading, isSignedIn, user, signIn, signOut, error, clearError]
  );

  return (
    <AuthContext.Provider value={value}>
      <SignInContext.Provider value={isSignedIn}>{children}</SignInContext.Provider>
    </AuthContext.Provider>
  );
}

export interface AuthProviderProps {
  children: ReactNode;
}

const stubAuthValue: AuthContextValue = {
  isLoading: false,
  isSignedIn: false,
  user: null,
  signIn: async () => {},
  signOut: async () => {},
  error: null,
  clearError: () => {},
};

export function AuthProvider({ children }: AuthProviderProps) {
  const domain = AUTH0.DOMAIN;
  const clientId = AUTH0.CLIENT_ID;

  if (!domain || !clientId) {
    return (
      <AuthContext.Provider value={stubAuthValue}>
        <SignInContext.Provider value={false}>{children}</SignInContext.Provider>
      </AuthContext.Provider>
    );
  }

  return (
    <Auth0Provider domain={domain} clientId={clientId}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </Auth0Provider>
  );
}
