import React, { forwardRef } from 'react';
import { Pressable, PressableProps, StyleSheet, Text, TextStyle } from 'react-native';
import { THEME } from '@/utils/theme.utils';

export type ButtonVariant = 'primary' | 'outline' | 'danger';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  title?: string;
  variant?: ButtonVariant;
  textStyle?: TextStyle | undefined;
  children?: React.ReactNode;
}

const getVariantStyles = (variant: ButtonVariant) => {
  switch (variant) {
    case 'outline':
      return {
        button: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: THEME.colors.primaryBlue,
        },
        text: {
          color: THEME.colors.primaryBlue,
        },
      };
    case 'danger':
      return {
        button: {
          backgroundColor: THEME.colors.negative,
          shadowColor: THEME.colors.negative,
        },
        text: {
          color: THEME.colors.white,
        },
      };
    default:
      return {
        button: {
          backgroundColor: THEME.colors.primaryBlue,
          shadowColor: THEME.colors.primaryBlue,
        },
        text: {
          color: THEME.colors.white,
        },
      };
  }
};

export const Button = forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(
  ({ title, variant = 'primary', style, textStyle, children, ...pressableProps }, ref) => {
    const variantStyles = getVariantStyles(variant);

    return (
      <Pressable
        ref={ref}
        style={({ pressed }) => {
          const flatStyle = typeof style === 'function' ? style({ pressed }) : style;
          return [styles.button, variantStyles.button, pressed && styles.pressed, flatStyle];
        }}
        {...pressableProps}>
        {children ?? (
          <Text style={[styles.buttonText, variantStyles.text, textStyle]}>{title}</Text>
        )}
      </Pressable>
    );
  }
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 16,
    height: 52,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  pressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
  },
});
