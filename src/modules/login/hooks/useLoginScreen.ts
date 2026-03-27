import React from 'react';
import { useAuth, AUTH_ERROR_USER_CANCELLED } from '@/context/auth.context';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';

export const useLoginScreen = () => {
  const { signIn, error, clearError } = useAuth();
  const [isSigningIn, setIsSigningIn] = React.useState(false);
  const errorSheetRef = React.useRef<BottomSheetModal>(null);
  const { t } = useTranslation();

  React.useEffect(() => {
    if (error && error.message !== AUTH_ERROR_USER_CANCELLED) {
      errorSheetRef.current?.present();
    }
  }, [error]);

  const handleCloseError = React.useCallback(() => {
    errorSheetRef.current?.dismiss();
    clearError();
  }, [clearError]);

  const handleSignIn = React.useCallback(async () => {
    clearError();
    setIsSigningIn(true);
    try {
      await signIn();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message === AUTH_ERROR_USER_CANCELLED) {
        clearError(); // Ensure no error modal is shown on cancel.
      }
    } finally {
      setIsSigningIn(false);
    }
  }, [signIn, clearError]);

  const handleSignUp = React.useCallback(async () => {
    clearError();
    setIsSigningIn(true);
    try {
      await signIn({ screenHint: 'signup' });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      if (message === AUTH_ERROR_USER_CANCELLED) {
        clearError(); // Ensure no error modal is shown on cancel.
      }
    } finally {
      setIsSigningIn(false);
    }
  }, [signIn, clearError]);

  return {
    errorSheetRef,
    error,
    isSigningIn,
    t,

    handleCloseError,
    handleSignIn,
    handleSignUp,
  }
}