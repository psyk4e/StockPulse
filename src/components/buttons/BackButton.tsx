import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Icon } from '@/components/Icon';

export interface BackButtonProps {
  onPress: () => void;
  size?: number;
}

export const BackButton = ({ onPress, size = 24 }: BackButtonProps) => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => (pressed ? [styles.pressable, styles.pressed] : styles.pressable)}
      hitSlop={8}>
      <Icon name="chevron-left" size={size} color={theme.colors.primary} />
    </Pressable>
  );
};

BackButton.displayName = 'BackButton';

const styles = StyleSheet.create({
  pressable: {
    padding: 4,
  },
  pressed: {
    opacity: 0.7,
  },
});
