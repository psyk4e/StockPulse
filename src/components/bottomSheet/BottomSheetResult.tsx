import React, { forwardRef } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { THEME } from '@/utils/theme.utils';
import { BottomSheet } from './BottomSheet';
import { Text } from '../Text';
import { Button } from '../buttons/Button';
import { Icon } from '../Icon';
import SuccesIcon from '@assets/icons/success-icon.svg';
import ErrorIcon from '@assets/icons/error-icon.svg';
import { BottomSheetBackdrop } from './BottomSheetBackdrop';
import { CanRender } from '../CanRender';

export type BottomSheetResultVariant = 'success' | 'error' | 'info';

export interface BottomSheetResultProps {
  variant: BottomSheetResultVariant;
  title: string;
  message?: string;
  primaryButtonTitle: string;
  onPrimaryPress?: () => void;
  secondaryButtonTitle?: string;
  onSecondaryPress?: () => void;
  snapPoints?: (string | number)[];
  onClose?: () => void;
}

export const BottomSheetResult = forwardRef<BottomSheetModal, BottomSheetResultProps>(
  function BottomSheetResult(
    {
      variant,
      title,
      message,
      primaryButtonTitle,
      onPrimaryPress,
      secondaryButtonTitle,
      onSecondaryPress,
      snapPoints = ['50%'],
      onClose,
    },
    ref
  ) {
    const handlePrimary = () => {
      onPrimaryPress?.();
      onClose?.();
    };
    const handleSecondary = () => {
      onSecondaryPress?.();
      onClose?.();
    };

    const styles = getStyles();
    const isInfo = variant === 'info';
    const SuccessOrErrorIcon = variant === 'success' ? SuccesIcon : ErrorIcon;
    return (
      <BottomSheet
        ref={ref}
        snapPoints={snapPoints}
        onClose={onClose}
        backdropComponent={BottomSheetBackdrop}>
        <View style={styles.content}>
          <View style={[styles.iconWrap, isInfo && styles.iconWrapInfo]}>
            {isInfo ? (
              <Icon name="info" size={48} color={THEME.colors.primaryBlue} />
            ) : (
              <SuccessOrErrorIcon style={{ width: 10, height: 10 }} />
            )}
          </View>
          <Text title={title} variant="Primary" font="bold" textStyle={styles.title} />
          {message != null && message !== '' && (
            <Text title={message} variant="Secondary" textStyle={styles.message} />
          )}
          <View style={styles.buttons}>
            <CanRender condition={primaryButtonTitle !== null && Boolean(onPrimaryPress)}>
              <Button
                title={primaryButtonTitle}
                variant="primary"
                onPress={handlePrimary}
                textStyle={{ fontFamily: THEME.fontFamily.semiBold }}
              />
            </CanRender>

            <CanRender condition={secondaryButtonTitle !== null && Boolean(onSecondaryPress)}>
              <Pressable
                onPress={handleSecondary}
                style={({ pressed }) => [styles.secondaryLink, pressed && { opacity: 0.7 }]}>
                <Text
                  title={secondaryButtonTitle}
                  variant="Secondary"
                  textStyle={styles.secondaryLinkText}
                />
              </Pressable>
            </CanRender>
          </View>
        </View>
      </BottomSheet>
    );
  }
);

BottomSheetResult.displayName = 'BottomSheetResult';

function getStyles() {
  return StyleSheet.create({
    content: {
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 32,
      alignItems: 'center',
    },
    iconWrap: {
      marginBottom: 20,
    },
    iconWrapInfo: {
      backgroundColor: `${THEME.colors.primaryBlue}18`,
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 22,
      textAlign: 'center',
      marginBottom: 8,
    },
    message: {
      textAlign: 'center',
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 28,
      paddingHorizontal: 8,
    },
    buttons: {
      width: '100%',
      gap: 16,
      alignItems: 'center',
    },
    secondaryLink: {
      paddingVertical: 8,
    },
    secondaryLinkText: {
      fontSize: 15,
    },
  });
}
