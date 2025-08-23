import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';

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
  const [isContentReady, setIsContentReady] = useState(false);
  const { isDark } = useTheme();

  // Add a flag to prevent double triggering
  const presentingRef = useRef(false);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setIsContentReady(false);
    presentingRef.current = false;
    onClose?.();
  }, [onClose]);

  const present = useCallback(() => {
    // Prevent double triggering
    if (presentingRef.current) return;
    presentingRef.current = true;
    setIsContentReady(true);
    // Small delay to ensure content is ready
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    setIsContentReady(false);
    presentingRef.current = false;
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      present,
      dismiss,
    }),
    [present, dismiss]
  );

  const containerStyle = {
    ...styles.container,
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
  };

  // Custom animation with ease-out curve
  const customSlideInUp = useMemo(
    () => ({
      from: {
        translateY: 600,
      },
      to: {
        translateY: 0,
      },
    }),
    []
  );

  const customSlideOutDown = useMemo(
    () => ({
      from: {
        translateY: 0,
      },
      to: {
        translateY: 600,
      },
    }),
    []
  );

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={handleClose}
      onBackButtonPress={handleClose}
      onSwipeComplete={handleClose}
      swipeDirection={['down']}
      style={styles.modal}
      backdropOpacity={0.5}
      animationIn={customSlideInUp}
      animationOut={customSlideOutDown}
      animationInTiming={380}
      animationOutTiming={300}
      backdropTransitionInTiming={380}
      backdropTransitionOutTiming={300}
      useNativeDriverForBackdrop={true}
      useNativeDriver={true}
      hideModalContentWhileAnimating={false}
      propagateSwipe={true}
      avoidKeyboard={false}
      statusBarTranslucent={false}
      customBackdrop={undefined}
      onModalShow={() => {
        presentingRef.current = false;
      }}
    >
      <View style={containerStyle}>
        <View style={styles.handle} />
        <View style={styles.contentContainer}>
          {isContentReady ? children : <View style={{ minHeight: 200 }} />}
        </View>
      </View>
    </Modal>
  );
});

ConfirmationBottomSheet.displayName = 'ConfirmationBottomSheet';

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    minHeight: '70%',
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
    opacity: 0.6,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 8,
  },
});
