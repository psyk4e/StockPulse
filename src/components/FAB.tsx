import React, { forwardRef } from 'react';
import { Pressable, PressableProps, StyleSheet } from 'react-native';
import { THEME } from '@/utils/theme.utils';
import { Icon, IconName } from './Icon';

export interface FABProps extends Omit<PressableProps, 'children'> {
  icon?: IconName;
  iconColor?: string;
  style?: PressableProps['style'];
  children?: React.ReactNode;
}

export const FAB = forwardRef<React.ComponentRef<typeof Pressable>, FABProps>(
  ({ icon = 'add', iconColor = THEME.colors.white, style, children, ...pressableProps }, ref) => {
    const size = THEME.spacing.fabSize;

    return (
      <Pressable
        ref={ref}
        style={({ pressed }) => {
          const flatStyle = typeof style === 'function' ? style({ pressed }) : style;
          return [
            styles.fab,
            { width: size, height: size, borderRadius: size / 2 },
            pressed && styles.pressed,
            flatStyle,
          ];
        }}
        {...pressableProps}>
        {children ?? <Icon name={icon} size={24} color={iconColor} />}
      </Pressable>
    );
  }
);

FAB.displayName = 'FAB';

const styles = StyleSheet.create({
  fab: {
    alignItems: 'center',
    backgroundColor: THEME.colors.primaryBlue,
    justifyContent: 'center',
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowColor: THEME.colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  pressed: {
    opacity: 0.9,
  },
});
