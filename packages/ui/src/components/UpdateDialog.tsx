import { Close } from '@onflow/frw-icons';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Platform, Modal, Linking } from 'react-native';
import { YStack, Stack, ScrollView } from 'tamagui';

import HtmlView from './HtmlView';
import { Button } from '../foundation/Button';
import { Text } from '../foundation/Text';

export interface WhatsNewAction {
  text: string;
  url?: string;
  type: 'external' | 'internal' | 'deeplink';
  style?: Record<string, unknown>;
}

export interface WhatsNewResponse {
  version: string;
  platform: string;
  language: string;
  title: string;
  content: string; // HTML content
  actions: WhatsNewAction[];
}

export interface UpdateDialogProps {
  visible: boolean;
  data: WhatsNewResponse;
  onClose: () => void;
  onDismiss?: () => void;
  onActionPress?: (action: WhatsNewAction) => void;
}

export const UpdateDialog: React.FC<UpdateDialogProps> = ({
  visible,
  data,
  onClose,
  onDismiss,
  onActionPress,
}) => {
  // Handle escape key press and body scroll prevention
  useEffect(() => {
    // Only run in browser environment
    if (typeof document === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && visible) {
        handleDismiss();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when dialog is open
      if (document.body) {
        document.body.style.overflow = 'hidden';
      }
    }

    return (): void => {
      document.removeEventListener('keydown', handleKeyDown);
      if (document.body) {
        document.body.style.overflow = 'unset';
      }
    };
  }, [visible, onDismiss, onClose]);

  const handleDismiss = React.useCallback((): void => {
    onDismiss?.();
    onClose();
  }, [onDismiss, onClose]);

  const handleActionPress = async (action: WhatsNewAction): Promise<void> => {
    try {
      // Call the external handler first
      if (onActionPress) {
        onActionPress(action);
      }

      // Handle different action types
      switch (action.type) {
        case 'external':
          if (action.url) {
            if (Platform.OS === 'web') {
              window.open(action.url, '_blank');
            } else {
              await Linking.openURL(action.url);
            }
          }
          break;

        case 'internal':
          // This would typically be handled by the parent component
          // through onActionPress callback for navigation
          break;

        case 'deeplink':
          if (action.url) {
            await Linking.openURL(action.url);
          }
          break;
      }

      // Close dialog after external actions
      if (action.type === 'external' || action.type === 'deeplink') {
        onClose();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to handle action:', error);
      // You might want to show an error toast here
    }
  };

  if (!visible || !data) return null;

  const dialogContent = (
    <Stack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="$dark80"
      zi={5}
      ai="center"
      jc="center"
      pressStyle={{ opacity: 1 }}
      onPress={handleDismiss}
      aria-modal="true"
      role="dialog"
      aria-labelledby="update-dialog-title"
      aria-describedby="update-dialog-content"
    >
      <YStack
        width="$50"
        minWidth="$40"
        maxWidth="90%"
        maxHeight="80%"
        bg="$bg2"
        borderRadius="$5"
        shadowColor="$shadow"
        shadowOffset={{ width: 0, height: 10 }}
        shadowOpacity={0.3}
        shadowRadius={20}
        elevation={12}
        pressStyle={{ opacity: 1 }}
        onPress={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <YStack position="relative" paddingTop="$6" paddingHorizontal="$6" paddingBottom="$4">
          {/* Close button */}
          <YStack
            position="absolute"
            top="$5"
            right="$5"
            width="$8"
            height="$8"
            ai="center"
            jc="center"
            backgroundColor="$bg3"
            borderRadius="$4"
            pressStyle={{ opacity: 0.7 }}
            onPress={handleDismiss}
            cursor="pointer"
            aria-label="Close update dialog"
          >
            <Close size={16} color="$textSecondary" />
          </YStack>

          {/* Title */}
          <Text
            id="update-dialog-title"
            fontSize="$5"
            fontWeight="700"
            lineHeight="$7"
            letterSpacing={-0.4}
            textAlign="center"
            color="$text"
            paddingRight="$10" // Padding to avoid close button
          >
            {data.title}
          </Text>

          {/* Version badge */}
          {data.version && (
            <YStack
              alignSelf="center"
              backgroundColor="$primary"
              paddingHorizontal="$3"
              paddingVertical="$1"
              borderRadius="$3"
              marginTop="$2"
            >
              <Text fontSize="$3" fontWeight="600" color="$white">
                v{data.version}
              </Text>
            </YStack>
          )}
        </YStack>

        {/* Scrollable content area */}
        <ScrollView showsVerticalScrollIndicator={false} paddingHorizontal="$6" maxHeight="$50">
          <YStack gap="$4">
            {/* HTML Content */}
            <YStack id="update-dialog-content">
              <HtmlView
                htmlContent={data.content}
                styles={{
                  color: '$text',
                  fontSize: '$4',
                  lineHeight: 1.5,
                }}
              />
            </YStack>
          </YStack>
        </ScrollView>

        {/* Action buttons */}
        <YStack paddingHorizontal="$6" paddingBottom="$6" paddingTop="$4" gap="$3">
          {data.actions.map((action, index) => {
            const buttonStyle = action.style || {};

            return (
              <Button
                key={`${action.type}-${index}`}
                width="100%"
                height="$12"
                backgroundColor={buttonStyle.backgroundColor || '$bg'}
                borderRadius="$3"
                pressStyle={{ opacity: 0.8, scale: 0.98 }}
                onPress={() => handleActionPress(action)}
                cursor="pointer"
                borderWidth={1}
                borderColor={buttonStyle.borderColor || 'transparent'}
                {...buttonStyle}
              >
                <Text
                  fontSize="$4"
                  fontWeight="600"
                  color={buttonStyle.color || '$text'}
                  textAlign="center"
                >
                  {action.text}
                </Text>
              </Button>
            );
          })}

          {/* Dismiss button if no actions or as fallback */}
          {data.actions.length === 0 && (
            <Button
              width="100%"
              height="$12"
              backgroundColor="$bg3"
              borderRadius="$3"
              pressStyle={{ opacity: 0.8 }}
              onPress={handleDismiss}
              cursor="pointer"
            >
              <Text fontSize="$4" fontWeight="600" color="$text" textAlign="center">
                Got it
              </Text>
            </Button>
          )}
        </YStack>
      </YStack>
    </Stack>
  );

  // Use portal to render at document body level (only in browser)
  if (typeof document !== 'undefined' && Platform.OS === 'web') {
    return createPortal(dialogContent, document.body);
  }

  // For React Native, use Modal component for proper overlay
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleDismiss}
      statusBarTranslucent={true}
    >
      {dialogContent}
    </Modal>
  );
};

export default UpdateDialog;
