import React from 'react';
import { View, ViewProps, Image, StyleSheet, ColorSchemeName } from 'react-native';
import { Text } from './Text';
import { THEME } from '@/utils/theme.utils';
import { getIsDarkMode } from '@/utils/styles.utils';

export interface ProfileProps extends ViewProps {
  avatarUri?: string | null;
  name: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  containerStyle?: ViewProps['style'];
  avatarStyle?: ViewProps['style'];
  nameStyle?: ViewProps['style'];
  subtitleStyle?: ViewProps['style'];
  colorScheme?: ColorSchemeName;
}

const AVATAR_SIZES = { sm: 40, md: 56, lg: 80 } as const;

export function Profile({
  avatarUri,
  name,
  subtitle,
  size = 'lg',
  containerStyle,
  avatarStyle,
  nameStyle,
  subtitleStyle,
  style,
  colorScheme,
  ...rest
}: ProfileProps) {
  const avatarSize = AVATAR_SIZES[size];
  const styles = getStyleProfile(colorScheme);
  return (
    <View style={[styles.container, containerStyle ?? style]} {...rest}>
      <View
        style={[
          styles.avatarWrap,
          { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
          avatarStyle,
        ]}>
        {avatarUri != null && avatarUri !== '' ? (
          <Image
            source={{ uri: avatarUri }}
            style={[
              styles.avatar,
              { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
            ]}
          />
        ) : (
          <View
            style={[
              styles.initialWrap,
              { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
            ]}>
            <Text
              title={name.charAt(0).toUpperCase()}
              variant="Primary"
              textStyle={styles.initial}
            />
          </View>
        )}
      </View>
      <View style={styles.textBlock}>
        <Text title={name} variant="Primary" textStyle={[styles.name, nameStyle]} />
        {subtitle != null && subtitle !== '' && (
          <Text title={subtitle} variant="Secondary" textStyle={[styles.subtitle, subtitleStyle]} />
        )}
      </View>
    </View>
  );
}

Profile.displayName = 'Profile';

const getStyleProfile = (colorScheme: ColorSchemeName) => {
  const isDark = getIsDarkMode(colorScheme);
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    avatarWrap: {
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'rgba(0,136,255,0.2)',
    },
    avatar: {
      resizeMode: 'cover',
    },
    initialWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDark ? THEME.colors.darkCard : THEME.colors.lightCard,
    },
    initial: {
      fontSize: 24,
      fontWeight: '700',
      color: THEME.colors.primaryBlue,
    },
    textBlock: {
      flex: 1,
      gap: 4,
    },
    name: {
      fontSize: 24,
      fontWeight: '700',
    },
    subtitle: {
      fontSize: 14,
    },
  });
};
