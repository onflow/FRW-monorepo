import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomModal } from '@/components/ui/modals/BottomModal';
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
    const [isVisible, setIsVisible] = useState(false);
    const { isDark } = useTheme();

    const handleClose = () => {
      setIsVisible(false);
      onClose?.();
    };

    useImperativeHandle(ref, () => ({
      present: () => {
        setIsVisible(true);
      },
      dismiss: () => {
        setIsVisible(false);
      },
    }));

    return (
      <BottomModal
        visible={isVisible}
        onClose={handleClose}
        showCloseButton={false}
        showHandle={true}
        contentStyle={{
          backgroundColor: isDark ? '#000000' : '#ffffff',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          minHeight: '100%',
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -8,
          },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 12,
        }}
        containerStyle={{
          flex: 1,
          justifyContent: 'flex-end',
        }}
      >
        <View style={styles.contentContainer}>{children}</View>
      </BottomModal>
    );
  }
);

SendBottomSheet.displayName = 'SendBottomSheet';

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
});
