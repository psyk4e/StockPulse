import React from 'react';
import { View, ViewProps } from 'react-native';
import { CardSettingsRow } from './CardSettingsRow';

export interface CardActionItem {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}

export interface CardActionsProps extends ViewProps {
  actions: CardActionItem[];
  containerStyle?: ViewProps['style'];
  rowStyle?: ViewProps['style'];
}

export function CardActions({
  actions,
  containerStyle,
  rowStyle,
  ...rest
}: CardActionsProps) {
  return (
    <View style={containerStyle} {...rest}>
      {actions.map((action, index) => (
        <CardSettingsRow
          key={index}
          icon={action.icon}
          label={action.label}
          type="link"
          onPress={action.onPress}
          containerStyle={rowStyle}
        />
      ))}
    </View>
  );
}

CardActions.displayName = 'CardActions';
