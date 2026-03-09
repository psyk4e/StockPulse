import React from 'react';
import {
  KeyboardAvoidingView as KeyboardAvoidingViewLib,
  type KeyboardAvoidingViewProps as LibProps,
} from 'react-native-keyboard-controller';

export type KeyboardAvoidingViewProps = LibProps;

/**
 * Keyboard-avoiding wrapper using react-native-keyboard-controller.
 * Works identically on iOS and Android (no Platform checks needed).
 */
export function KeyboardAvoidingView({
  behavior = 'padding',
  keyboardVerticalOffset = 0,
  style,
  ...rest
}: KeyboardAvoidingViewProps) {
  return (
    <KeyboardAvoidingViewLib
      behavior={behavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={style}
      {...rest}
    />
  );
}
