import React, { forwardRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetResult } from './BottomSheetResult';

export interface BottomSheetErrorProps {
  title: string;
  message?: string;
  buttonTitle?: string;
  onButtonPress?: () => void;
  secondaryButtonTitle?: string;
  onSecondaryPress?: () => void;
  snapPoints?: (string | number)[];
  onClose?: () => void;
}

export const BottomSheetError = forwardRef<BottomSheetModal, BottomSheetErrorProps>(
  function BottomSheetError(
    {
      title,
      message,
      buttonTitle = 'Try Again',
      onButtonPress,
      secondaryButtonTitle = 'Dismiss',
      onSecondaryPress,
      snapPoints = ['55%'],
      onClose,
    },
    ref
  ) {
    return (
      <BottomSheetResult
        ref={ref}
        variant="error"
        title={title}
        message={message}
        primaryButtonTitle={buttonTitle}
        onPrimaryPress={onButtonPress}
        secondaryButtonTitle={secondaryButtonTitle}
        onSecondaryPress={onSecondaryPress}
        snapPoints={snapPoints}
        onClose={onClose}
      />
    );
  }
);

BottomSheetError.displayName = 'BottomSheetError';
