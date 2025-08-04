import React, { useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { useTheme } from '@/contexts/ThemeContext';

interface SendBottomSheetProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export interface SendBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

export const SendBottomSheet = forwardRef<SendBottomSheetRef, SendBottomSheetProps>(
  ({ children, onClose }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);
    const { isDark } = useTheme();

    // Calculate snap points - full screen for send workflow
    const snapPoints = useMemo(() => ['100%'], []);

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
          opacity={1.0}
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
        bottomSheetRef.current?.dismiss();
      },
    }));

    const backgroundStyle = useMemo(
      () => ({
        backgroundColor: isDark ? '#000000' : '#ffffff',
      }),
      [isDark]
    );

    const handleStyle = useMemo(
      () => ({
        backgroundColor: isDark ? '#000000' : '#ffffff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
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
  }
);

SendBottomSheet.displayName = 'SendBottomSheet';

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
    paddingHorizontal: 20,
    paddingTop: 8,
  },
});
