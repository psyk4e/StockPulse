import React from 'react';
import { renderWithNav } from '../../../setup';
import LoginScreen from '@/modules/login/screens/LoginScreen';

jest.mock('@/store/auth.context', () => ({
  useAuth: () => ({
    signIn: jest.fn(),
    clearError: jest.fn(),
    error: null,
    isLoading: false,
    isSignedIn: false,
    user: null,
    signOut: jest.fn(),
  }),
  AUTH_ERROR_USER_CANCELLED: 'a0.session.user_cancelled',
}));

describe('LoginScreen', () => {
  it('renders without crashing', () => {
    expect(() => renderWithNav(<LoginScreen />)).not.toThrow();
  });
});
