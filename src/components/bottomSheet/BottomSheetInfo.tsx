import React, { forwardRef } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetResult } from './BottomSheetResult';

export interface BottomSheetInfoProps {
  title: string;
  message?: string;
  buttonTitle?: string;
  onButtonPress?: () => void;
  snapPoints?: (string | number)[];
  onClose?: () => void;
}

export const BottomSheetInfo = forwardRef<BottomSheetModal, BottomSheetInfoProps>(
  function BottomSheetInfo(
    { title, message, buttonTitle = 'OK', onButtonPress, snapPoints = ['50%'], onClose },
    ref
  ) {
    return (
      <BottomSheetResult
        ref={ref}
        variant="info"
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

BottomSheetInfo.displayName = 'BottomSheetInfo';
