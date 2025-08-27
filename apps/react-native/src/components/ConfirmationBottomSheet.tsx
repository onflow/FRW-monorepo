import React, { useState, forwardRef, useImperativeHandle, useCallback, useRef } from 'react';
import { StyleSheet, View, Modal, Pressable, Animated } from 'react-native';

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

  // Animation values
  const slideAnim = useRef(new Animated.Value(600)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

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
    setIsVisible(true);

    // Animate in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.5,
        duration: 380,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  const dismiss = useCallback(() => {
    // Animate out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 600,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      setIsContentReady(false);
      presentingRef.current = false;
    });
  }, [slideAnim, opacityAnim]);

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
    transform: [{ translateY: slideAnim }],
  };

  return (
    <Modal transparent={true} visible={isVisible} animationType="none" onRequestClose={handleClose}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]} />
      </Pressable>

      {/* Bottom Sheet Container */}
      <View style={styles.modal}>
        <Animated.View style={containerStyle}>
          <View style={styles.handle} />
          <View style={styles.contentContainer}>
            {isContentReady ? children : <View style={{ minHeight: 200 }} />}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
});

ConfirmationBottomSheet.displayName = 'ConfirmationBottomSheet';

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    flex: 1,
    justifyContent: 'flex-end',
    margin: 0,
    pointerEvents: 'box-none',
  },
  container: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
    minHeight: 640,
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
