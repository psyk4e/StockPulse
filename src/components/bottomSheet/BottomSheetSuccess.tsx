import React, { forwardRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetResult } from './BottomSheetResult';

export interface BottomSheetSuccessProps {
  title: string;
  message?: string;
  buttonTitle?: string;
  onButtonPress?: () => void;
  snapPoints?: (string | number)[];
  onClose?: () => void;
}

export const BottomSheetSuccess = forwardRef<BottomSheetModal, BottomSheetSuccessProps>(
  function BottomSheetSuccess(
    { title, message, buttonTitle = 'Done', onButtonPress, snapPoints = ['50%'], onClose },
    ref
  ) {
    return (
      <BottomSheetResult
        ref={ref}
        variant="success"
        title={title}
        message={message}
        primaryButtonTitle={buttonTitle}
        onPrimaryPress={onButtonPress}
        snapPoints={snapPoints}
        onClose={onClose}
      />
    );
  }
);

BottomSheetSuccess.displayName = 'BottomSheetSuccess';
