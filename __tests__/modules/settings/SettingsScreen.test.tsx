import React from 'react';
import { renderWithNav } from '../../setup';
import SettingsScreen from '@/modules/settings/screens/SettingsScreen';

jest.mock('@/store/auth.context', () => ({
  useAuth: () => ({
    user: { name: 'Test User', email: 'test@example.com', picture: null },
    signOut: jest.fn(),
  }),
}));

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '1.0.0',
}));

describe('SettingsScreen', () => {
  it('renders without crashing', () => {
    expect(() => renderWithNav(<SettingsScreen />)).not.toThrow();
  });
});
