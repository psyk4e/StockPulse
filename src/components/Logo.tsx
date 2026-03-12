import { getIsDarkMode } from '@/utils/styles.utils';
import React from 'react';
import { View } from 'react-native';
import { useAppColorScheme } from '@/context/preferences.context';
import LogoDark from '@assets/icons/logo-round-glow-dark.svg';
import LogoLight from '@assets/icons/logo-round-glow.svg';

const DEFAULTS = {
  height: 88,
  width: 88,
};

export interface LogoProps {
  height?: number;
  width?: number;
}

export function Logo({ height = DEFAULTS.height, width = DEFAULTS.width }: LogoProps) {
  const colorScheme = useAppColorScheme();
  const Logo = getIsDarkMode(colorScheme) ? LogoDark : LogoLight;

  return (
    <View style={{ alignItems: 'center' }}>
      <Logo width={height} height={width} />
    </View>
  );
}

Logo.displayName = 'LogoGlow';
