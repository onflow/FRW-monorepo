import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

interface ConfirmationBottomSheetProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export interface ConfirmationBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

export const ConfirmationBottomSheet = forwardRef<
  ConfirmationBottomSheetRef,
  ConfirmationBottomSheetProps
>(({ children, onClose }, ref) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const { isDark } = useTheme();

  // Calculate snap points - 85% for confirmation drawer to show more content
  const snapPoints = useMemo(() => ['85%'], []);

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose?.();
      }
    },
    [onClose]
  );

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  useImperativeHandle(ref, () => ({
    present: () => {
      bottomSheetRef.current?.snapToIndex(0);
    },
    dismiss: () => {
      if (bottomSheetRef.current && typeof bottomSheetRef.current.dismiss === 'function') {
        bottomSheetRef.current.dismiss();
      } else {
        // Fallback: try to close by setting index to -1
        bottomSheetRef.current?.snapToIndex(-1);
      }
    },
  }));

  const backgroundStyle = useMemo(
    () => ({
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    }),
    [isDark]
  );

  const handleStyle = useMemo(
    () => ({
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingTop: 8,
    }),
    [isDark]
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={backgroundStyle}
      handleStyle={handleStyle}
      onChange={handleSheetChanges}
      style={styles.bottomSheet}
    >
      <BottomSheetView style={styles.contentContainer}>{children}</BottomSheetView>
    </BottomSheet>
  );
});

ConfirmationBottomSheet.displayName = 'ConfirmationBottomSheet';

const styles = StyleSheet.create({
  bottomSheet: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 8,
  },
});
