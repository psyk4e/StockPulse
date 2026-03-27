import React from 'react';
import { usePreferencesStore } from '@/store/preferences.store';
import { useSecurityStore } from '@/store/security.store';

export function useSettingsScreen() {
  const language = usePreferencesStore((s) => s.language);
  const colorSchemePreference = usePreferencesStore((s) => s.colorSchemePreference);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);
  const setColorSchemePreference = usePreferencesStore((s) => s.setColorSchemePreference);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const faceIdEnabled = useSecurityStore((s) => s.faceIdEnabled);
  const setFaceIdEnabled = useSecurityStore((s) => s.setFaceIdEnabled);
  const hasPasscode = useSecurityStore((s) => s.hasPasscode);
  const setPasscode = useSecurityStore((s) => s.setPasscode);

  const [passcodeModalVisible, setPasscodeModalVisible] = React.useState(false);
  const [pendingFaceId, setPendingFaceId] = React.useState(false);
  const [dummyModalVariant, setDummyModalVariant] = React.useState<'Terms' | 'Privacy'>('Terms');

  return {
    language,
    colorSchemePreference,
    notificationsEnabled,
    faceIdEnabled,
    passcodeModalVisible,
    pendingFaceId,
    dummyModalVariant,
    setDummyModalVariant,
    setFaceIdEnabled,
    hasPasscode,
    setPasscode,
    setColorSchemePreference,
    setLanguage,
    setNotificationsEnabled,
    setPasscodeModalVisible,
    setPendingFaceId,
  };
}
