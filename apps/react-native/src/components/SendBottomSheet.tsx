import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';

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

    const containerStyle = {
      ...styles.container,
      backgroundColor: isDark ? '#000000' : '#ffffff',
    };

    return (
      <Modal
        isVisible={isVisible}
        onBackdropPress={handleClose}
        onBackButtonPress={handleClose}
        onSwipeComplete={handleClose}
        swipeDirection={['down']}
        style={styles.modal}
        backdropOpacity={1.0}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={300}
        animationOutTiming={250}
        backdropTransitionInTiming={300}
        backdropTransitionOutTiming={250}
        useNativeDriverForBackdrop={true}
        hideModalContentWhileAnimating={false}
        propagateSwipe={true}
      >
        <View style={containerStyle}>
          <View style={styles.handle} />
          <View style={styles.contentContainer}>{children}</View>
        </View>
      </Modal>
    );
  }
);

SendBottomSheet.displayName = 'SendBottomSheet';

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
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
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
});
