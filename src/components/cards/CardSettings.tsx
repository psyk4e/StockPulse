import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useAppColorScheme } from '@/store/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';
import { Text } from '../Text';
import { CanRender } from '../CanRender';

export interface CardSettingsProps extends ViewProps {
  title?: string;
  containerStyle?: ViewProps['style'];
  headerStyle?: ViewProps['style'];
  contentStyle?: ViewProps['style'];
  children: React.ReactNode;
}

export function CardSettings({
  title,
  containerStyle,
  headerStyle,
  contentStyle,
  children,
  ...rest
}: CardSettingsProps) {
  const colorScheme = useAppColorScheme();
  const isDarkMode = getIsDarkMode(colorScheme);
  const styles = getStyles(isDarkMode);

  return (
    <View>
      <CanRender condition={Boolean(title)}>
        <View style={[styles.header, headerStyle]}>
          <Text title={title} variant="overline" textStyle={styles.headerText} />
        </View>
      </CanRender>
      <View style={[styles.container, containerStyle]} {...rest}>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </View>
    </View>
  );
}

CardSettings.displayName = 'CardSettings';

function getStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    container: {
      backgroundColor: isDarkMode ? THEME.colors.darkCard : THEME.colors.lightCard,
      borderColor: isDarkMode ? THEME.colors.darkBorder : THEME.colors.lightBorder,
      borderRadius: 24,
      borderWidth: 1,
      overflow: 'hidden',
    },
    header: {
      paddingBottom: 8,
    },
    headerText: {
      marginBottom: 4,
    },
    content: {},
  });
}
