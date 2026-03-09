import React, { forwardRef } from 'react';
import {
  Switch as RNSwitch,
  SwitchProps as RNSwitchProps,
  View,
  ViewProps,
} from 'react-native';
import { THEME } from '@/utils/theme.utils';

export interface SwitchProps extends RNSwitchProps {
  containerStyle?: ViewProps['style'];
}

export const Switch = forwardRef<View, SwitchProps>(
  ({ containerStyle, ...switchProps }, ref) => {
    return (
      <View ref={ref} style={containerStyle}>
        <RNSwitch
          trackColor={{
            false: THEME.colors.darkBorder,
            true: THEME.colors.primaryBlue,
          }}
          thumbColor={THEME.colors.white}
          {...switchProps}
        />
      </View>
    );
  }
);

Switch.displayName = 'Switch';
