import { Close } from '@onflow/frw-icons';
import React from 'react';
import { View, XStack, YStack } from 'tamagui';

import { Text } from '../foundation/Text';

export interface ModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback when modal should be closed */
  onClose: () => void;
  /** Modal title (optional) */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Modal width - can be number (px), string with units, or theme token */
  width?: number | string;
  /** Modal height - can be number (px), string with units, or theme token */
  height?: number | string;
  /** Maximum width - can be number (px), string with units, or theme token */
  maxWidth?: number | string;
  /** Maximum height - can be number (px), string with units, or theme token */
  maxHeight?: number | string;
  /** Minimum width - can be number (px), string with units, or theme token */
  minWidth?: number | string;
  /** Minimum height - can be number (px), string with units, or theme token */
  minHeight?: number | string;
  /** Modal padding using theme tokens */
  padding?: string;
  /** Modal gap between elements using theme tokens */
  gap?: string;
  /** Modal border radius using theme tokens */
  borderRadius?: string;
  /** Modal background color using theme tokens */
  backgroundColor?: string;
  /** Overlay background color */
  overlayColor?: string;
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Whether to show the header */
  showHeader?: boolean;
  /** Custom z-index */
  zIndex?: number;
  /** Whether clicking overlay closes modal */
  closeOnOverlayClick?: boolean;
  /** Additional styles for the modal container */
  containerStyle?: Record<string, any>;
  /** Additional styles for the overlay */
  overlayStyle?: Record<string, any>;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  width = '90%',
  height = 'auto',
  maxWidth = '$20', // 320px using theme token
  maxHeight = '80vh',
  minWidth,
  minHeight,
  padding = '$5', // 20px using theme token
  gap = '$4', // 16px using theme token
  borderRadius = '$4', // 14px using theme token
  backgroundColor = '$bg2', // Secondary background using theme token
  overlayColor = 'rgba(0, 0, 0, 0.5)',
  showCloseButton = true,
  showHeader = true,
  zIndex = 1000,
  closeOnOverlayClick = true,
  containerStyle = {},
  overlayStyle = {},
}) => {
  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <View
      position="fixed"
      items="center"
      justify="center"
      onPress={handleOverlayClick}
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex,
        backgroundColor: overlayColor,
        ...overlayStyle,
      }}
    >
      {/* Modal Container */}
      <YStack
        style={{
          position: 'none',
          width,
          height,
          maxWidth,
          maxHeight,
          minWidth,
          minHeight,
          backgroundColor,
          borderRadius,
          padding,
          gap,
          backdropFilter: 'blur(10px)',
          ...containerStyle,
        }}
      >
        {/* Header */}
        {showHeader && (title || showCloseButton) && (
          <XStack items="center" justify="space-between">
            {/* Title */}
            {title && (
              <Text fontSize="$5" fontWeight="600" color="$text">
                {title}
              </Text>
            )}

            {/* Spacer if no title but close button exists */}
            {!title && showCloseButton && <View flex={1} />}

            {/* Close Button */}
            {showCloseButton && (
              <View
                cursor="pointer"
                pressStyle={{ opacity: 0.7 }}
                onPress={onClose}
                p="$1"
                rounded="$2"
                hoverStyle={{ bg: '$bg3' }}
              >
                <Close size={16} color="$text" />
              </View>
            )}
          </XStack>
        )}

        {/* Content */}
        <View flex={1}>{children}</View>
      </YStack>
    </View>
  );
};

// Preset configurations for common modal sizes
export const ModalPresets = {
  small: {
    width: '280px',
    maxWidth: '90vw',
  },
  medium: {
    width: '400px',
    maxWidth: '90vw',
  },
  large: {
    width: '600px',
    maxWidth: '90vw',
  },
  fullWidth: {
    width: '90vw',
    maxWidth: '800px',
  },
  compact: {
    width: '320px',
    maxWidth: '90vw',
    padding: '$4',
    gap: '$3',
  },
  spacious: {
    width: '500px',
    maxWidth: '90vw',
    padding: '$6',
    gap: '$5',
  },
} as const;

export type ModalPreset = keyof typeof ModalPresets;

// Helper component for common modal patterns
export interface QuickModalProps
  extends Omit<ModalProps, 'width' | 'maxWidth' | 'padding' | 'gap'> {
  preset?: ModalPreset;
}

export const QuickModal: React.FC<QuickModalProps> = ({ preset = 'medium', ...props }) => {
  const presetConfig = ModalPresets[preset];

  return <Modal {...presetConfig} {...props} />;
};
