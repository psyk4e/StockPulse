import React, { forwardRef } from 'react';
import { View, ViewProps } from 'react-native';
import { Switch, SwitchProps } from './Switch';

export interface SwitchAlertProps extends SwitchProps {
  disabledWhenTriggered?: boolean;
  isTriggered?: boolean;
}

export const SwitchAlert = forwardRef<View, SwitchAlertProps>(
  (
    {
      disabledWhenTriggered = true,
      isTriggered = false,
      value,
      ...rest
    },
    ref
  ) => {
    const disabled = disabledWhenTriggered && isTriggered;

    return (
      <Switch
        ref={ref}
        value={value}
        disabled={disabled}
        {...rest}
      />
    );
  }
);

SwitchAlert.displayName = 'SwitchAlert';
