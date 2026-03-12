import React, { useRef } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { SafeAreaView } from '@/components/SafeAreaView';
import { Text } from '@/components/Text';
import { StatusBar } from '@/components/StatusBar';
import { useTheme } from '@react-navigation/native';
import {
  Header,
  Profile,
  CardSettings,
  CardSettingsRow,
  Icon,
  Button,
  BottomSheet,
  BottomSheetListSelection,
} from '@/components';
import { BottomSheetBackdrop } from '@/components/bottomSheet/BottomSheetBackdrop';
import { usePreferencesStore } from '@/store/preferences.store';
import type { LanguageCode } from '@/store/preferences.store';
import { useAppColorScheme } from '@/context/preferences.context';
import { useAuth } from '@/context/auth.context';
import { FLAGS } from '@/utils/flags.utils';
import * as Application from 'expo-application';

const APP_VERSION = Application.nativeApplicationVersion;

const LANGUAGE_OPTIONS: {
  labelKey: 'english' | 'spanish';
  value: LanguageCode;
  icon: React.ReactNode;
}[] = [
  { labelKey: 'english', value: 'en', icon: <FLAGS.en height={24} width={24} /> },
  { labelKey: 'spanish', value: 'es', icon: <FLAGS.es height={24} width={24} /> },
];

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const colorScheme = useAppColorScheme();
  const theme = useTheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const styles = getStyles(isDarkMode);
  const { t } = useTranslation();
  const languageBottomRef = useRef<BottomSheetModal>(null);
  const dummyModalRef = useRef<BottomSheetModal>(null);
  const [dummyModalVariant, setDummyModalVariant] = React.useState<'Terms' | 'Privacy'>('Terms');
  const language = usePreferencesStore((s) => s.language);
  const colorSchemePreference = usePreferencesStore((s) => s.colorSchemePreference);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);
  const setColorSchemePreference = usePreferencesStore((s) => s.setColorSchemePreference);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  const profileName = user?.name ?? '—';
  const profileEmail = user?.email ?? '—';

  const languageLabel = language === 'en' ? t('settings.english') : t('settings.spanish');
  const languageSheetItems = LANGUAGE_OPTIONS.map((opt) => ({
    label: t(`settings.${opt.labelKey}`),
    value: opt.value,
    icon: opt.icon,
  }));

  const handleLanguageSelect = (item: { label: string; value: LanguageCode | string }) => {
    setLanguage(item.value as LanguageCode);
    languageBottomRef.current?.dismiss();
  };

  const openDummyModal = (variant: 'Terms' | 'Privacy') => {
    setDummyModalVariant(variant);
    dummyModalRef.current?.present();
  };

  const ModalContentDummy = ({ variant }: { variant: 'Terms' | 'Privacy' }) => {
    const title = variant === 'Terms' ? t('settings.termsOfService') : t('settings.privacyPolicy');
    return (
      <View style={styles.bottomSheetContent}>
        <Text title={title} variant="Primary" textStyle={styles.bottomSheetTitle} />
        <ScrollView showsVerticalScrollIndicator={false} style={styles.bottomSheetScroll}>
          <Text
            title="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            variant="Secondary"
            textStyle={styles.bottomSheetBody}
          />
          <Text
            title="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
            variant="Secondary"
            textStyle={[styles.bottomSheetBody, { marginTop: THEME.spacing.marginVerticalM }]}
          />
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.card} translucent={true} />
      <SafeAreaView
        edges={['top']}
        style={{ backgroundColor: !isDarkMode ? theme.colors.card : undefined }}
      />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <Header title={t('settings.title')} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={styles.scroll}
          showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <Profile
              colorScheme={colorSchemePreference}
              name={profileName}
              subtitle={profileEmail}
              avatarUri={user?.picture ?? undefined}
              size="lg"
            />
            <Pressable style={styles.editProfileButton} onPress={() => {}}>
              <Text
                title={t('settings.editProfile')}
                variant="Primary"
                textStyle={styles.editProfileText}
              />
            </Pressable>
          </View>

          <CardSettings title={t('settings.preferences')} containerStyle={styles.card}>
            <CardSettingsRow
              icon={<Icon name="language" size={20} color={THEME.colors.primaryBlue} />}
              label={t('settings.language')}
              type="link"
              onPress={() => languageBottomRef.current?.present()}
              right={
                <View style={styles.languageRight}>
                  <Text
                    title={languageLabel}
                    variant="Secondary"
                    textStyle={styles.languageValue}
                  />
                  <Icon
                    name="chevron-right"
                    size={16}
                    color={
                      isDarkMode ? THEME.colors.textSecondaryDark : THEME.colors.textSecondaryLight
                    }
                  />
                </View>
              }
            />
            <CardSettingsRow
              icon={<Icon name="moon" size={20} color={THEME.colors.primaryBlue} />}
              label={t('settings.darkMode')}
              type="switch"
              switchValue={colorSchemePreference === 'dark'}
              onSwitchValueChange={(value) => setColorSchemePreference(value ? 'dark' : 'light')}
            />
            <CardSettingsRow
              icon={<Icon name="bell" size={20} color={THEME.colors.primaryBlue} />}
              label={t('settings.pushNotifications')}
              type="switch"
              switchValue={notificationsEnabled}
              onSwitchValueChange={setNotificationsEnabled}
            />
          </CardSettings>

          <CardSettings title={t('settings.about')} containerStyle={styles.card}>
            <CardSettingsRow
              icon={<Icon name="info" size={20} color={THEME.colors.primaryBlue} />}
              label={t('settings.version')}
              type="text"
              value={APP_VERSION ?? undefined}
            />
            <CardSettingsRow
              icon={<Icon name="description" size={20} color={THEME.colors.primaryBlue} />}
              label={t('settings.termsOfService')}
              type="link"
              onPress={() => openDummyModal('Terms')}
            />
            <CardSettingsRow
              icon={<Icon name="shield" size={20} color={THEME.colors.primaryBlue} />}
              label={t('settings.privacyPolicy')}
              type="link"
              onPress={() => openDummyModal('Privacy')}
            />
          </CardSettings>

          <View style={styles.signOutSection}>
            <Button variant="danger" onPress={() => void signOut()} style={styles.signOutButton}>
              <View style={styles.signOutButtonContent}>
                <Icon name="logout" size={20} color={THEME.colors.white} />
                <Text title={t('settings.signOut')} textStyle={styles.signOutButtonText} />
              </View>
            </Button>
          </View>
        </ScrollView>
        <BottomSheetListSelection
          ref={languageBottomRef}
          title={t('settings.language')}
          items={languageSheetItems}
          selectedValue={language}
          onSelect={handleLanguageSelect}
        />

        <BottomSheet
          ref={dummyModalRef}
          snapPoints={['60%']}
          backdropComponent={BottomSheetBackdrop}>
          <ModalContentDummy variant={dummyModalVariant} />
        </BottomSheet>
      </SafeAreaView>
    </View>
  );
}

function getStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: THEME.spacing.screenHorizontal,
      paddingTop: THEME.spacing.marginVerticalM,
      paddingBottom: THEME.spacing.marginVerticalL,
    },
    profileSection: {
      marginBottom: THEME.spacing.marginVerticalL,
    },
    editProfileButton: {
      marginTop: 12,
    },
    editProfileText: {
      fontSize: 14,
      fontWeight: '600',
      color: THEME.colors.primaryBlue,
    },
    card: {
      marginBottom: THEME.spacing.marginVerticalM,
    },
    signOutSection: {
      marginTop: THEME.spacing.marginVerticalM,
    },
    signOutButton: {
      marginHorizontal: 0,
    },
    signOutButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    signOutButtonText: {
      color: THEME.colors.white,
      fontSize: 16,
      fontWeight: '600',
    },
    languageRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    languageValue: {
      fontSize: 16,
    },
    bottomSheetContent: {
      flex: 1,
      paddingHorizontal: THEME.spacing.screenHorizontal,
      paddingTop: THEME.spacing.marginVerticalM,
    },
    bottomSheetTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: THEME.spacing.marginVerticalM,
    },
    bottomSheetScroll: {
      flex: 1,
    },
    bottomSheetBody: {
      fontSize: 15,
      lineHeight: 22,
    },
  });
}
