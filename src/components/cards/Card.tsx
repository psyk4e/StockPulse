import React from 'react';
import {
  View,
  ViewProps,
  Pressable,
  StyleSheet,
  ColorSchemeName,
} from 'react-native';
import { useAppColorScheme } from '@/store/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';

export interface CardProps extends ViewProps {
  onPress?: () => void;
  containerStyle?: ViewProps['style'];
}

function CardRoot({ children, onPress, style, containerStyle, ...rest }: CardProps) {
  const colorScheme = useAppColorScheme();
  const styles = getStyles(colorScheme);

  const content = (
    <View style={[styles.card, containerStyle ?? style]} {...rest}>
      {children}
    </View>
  );

  if (onPress != null) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {content}
      </Pressable>
    );
  }

  return content;
}

CardRoot.displayName = 'Card';

export interface CardSectionProps extends ViewProps {
  style?: ViewProps['style'];
}

function CardLeft({ children, style, ...rest }: CardSectionProps) {
  return (
    <View style={[sectionStyles.left, style]} {...rest}>
      {children}
    </View>
  );
}
CardLeft.displayName = 'Card.Left';

function CardRight({ children, style, ...rest }: CardSectionProps) {
  return (
    <View style={[sectionStyles.right, style]} {...rest}>
      {children}
    </View>
  );
}
CardRight.displayName = 'Card.Right';

function CardHeader({ children, style, ...rest }: CardSectionProps) {
  return (
    <View style={[sectionStyles.header, style]} {...rest}>
      {children}
    </View>
  );
}
CardHeader.displayName = 'Card.Header';

function CardBody({ children, style, ...rest }: CardSectionProps) {
  return (
    <View style={[sectionStyles.body, style]} {...rest}>
      {children}
    </View>
  );
}
CardBody.displayName = 'Card.Body';

function CardRow({ children, style, ...rest }: CardSectionProps) {
  return (
    <View style={[sectionStyles.row, style]} {...rest}>
      {children}
    </View>
  );
}
CardRow.displayName = 'Card.Row';

function getStyles(colorScheme: ColorSchemeName) {
  const isDarkMode = getIsDarkMode(colorScheme);
  return StyleSheet.create({
    card: {
      backgroundColor: isDarkMode ? THEME.colors.darkCard : THEME.colors.lightCard,
      borderColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder,
      borderRadius: 24,
      borderWidth: 1,
      padding: THEME.spacing.cardPaddingHorizontal,
    },
    pressed: {
      opacity: 0.95,
    },
  });
}

const sectionStyles = StyleSheet.create({
  left: {
    flex: 1,
    justifyContent: 'center',
  },
  right: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  header: {
    marginBottom: 8,
  },
  body: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export const Card = Object.assign(CardRoot, {
  Left: CardLeft,
  Right: CardRight,
  Header: CardHeader,
  Body: CardBody,
  Row: CardRow,
});

export default Card;
