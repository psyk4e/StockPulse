import React, { forwardRef } from 'react';
import { StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetModalProps, BottomSheetView } from '@gorhom/bottom-sheet';
import { useAppColorScheme } from '@/store/preferences.context';
import { getIsDarkMode } from '@/utils/styles.utils';
import { THEME } from '@/utils/theme.utils';

const sheetStyles = StyleSheet.create({
  content: { flex: 1 },
});

export interface StockPulseBottomSheetProps extends Omit<
  BottomSheetModalProps,
  'backgroundStyle' | 'handleComponent' | 'children'
> {
  children?: React.ReactNode;
  onClose?: () => void;
  containerStyle?: BottomSheetModalProps['style'];
}

export const BottomSheet = forwardRef<BottomSheetModal, StockPulseBottomSheetProps>(
  ({ children, snapPoints = ['50%'], onDismiss, onClose, containerStyle, style, ...rest }, ref) => {
    const colorScheme = useAppColorScheme();
    const isDarkMode = getIsDarkMode(colorScheme);
    const backgroundColor = isDarkMode ? THEME.colors.darkCard : THEME.colors.lightCard;

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        index={0}
        enableDynamicSizing={false}
        onDismiss={onDismiss ?? onClose}
        backgroundStyle={[{ backgroundColor }, containerStyle ?? style]}
        {...rest}>
        <BottomSheetView style={[sheetStyles.content, { backgroundColor }]}>
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';
