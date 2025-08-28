import React, { useState, forwardRef, useImperativeHandle, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomModal } from '@/components/ui/modals/BottomModal';
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
  const [isVisible, setIsVisible] = useState(false);
  const { isDark } = useTheme();

  const handleClose = useCallback(() => {
    setIsVisible(false);
    onClose?.();
  }, [onClose]);

  const present = useCallback(() => {
    setIsVisible(true);
  }, []);

  const dismiss = useCallback(() => {
    setIsVisible(false);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      present,
      dismiss,
    }),
    [present, dismiss]
  );

  return (
    <BottomModal
      visible={isVisible}
      onClose={handleClose}
      showCloseButton={false}
      showHandle={true}
      contentStyle={{
        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '80%',
        minHeight: 660,
        paddingTop: 8,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -8,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <View style={styles.contentContainer}>{children}</View>
    </BottomModal>
  );
});

ConfirmationBottomSheet.displayName = 'ConfirmationBottomSheet';

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 8,
  },
});
