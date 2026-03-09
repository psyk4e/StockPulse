import React from 'react';
import {
  BottomSheetBackdrop as BottomSheetBackdropGorm,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';

export const BottomSheetBackdrop = (props: BottomSheetBackdropProps) => {
  return (
    <BottomSheetBackdropGorm
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.6}
      style={[props.style, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}
    />
  );
};
