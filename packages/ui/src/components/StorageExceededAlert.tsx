import { navigation } from '@onflow/frw-context';
import { Close } from '@onflow/frw-icons';
import React from 'react';
import { Dialog, YStack, XStack, Button, Adapt, Sheet } from 'tamagui';

import { Text } from '../foundation/Text';
import { usePlatformTranslation } from '../hooks/usePlatformTranslation';

export interface StorageExceededAlertProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
}

export const StorageExceededAlert: React.FC<StorageExceededAlertProps> = ({
  visible,
  onClose,
  title,
}) => {
  const { t } = usePlatformTranslation();

  const handleBuyFlow = () => {
    onClose();
    navigation.navigate('Home');
  };

  const getTitle = () => {
    if (title) return title;
    return t('Insufficient_Storage', 'Storage Limitation Warning');
  };

  return (
    <Dialog modal open={visible} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <Dialog.Content
          key="content"
          animation={[
            'quick',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          x={0}
          scale={1}
          opacity={1}
          y={0}
        >
          <YStack bg="$bg2" p="$6" rounded="$5" gap="$4">
            {/* Header with title and close button */}
            <XStack justify="space-between" items="center">
              <Dialog.Title flex={1} items="center">
                <YStack items="center">
                  <Text fontSize="$7" fontWeight="600" color="$white">
                    {getTitle()}
                  </Text>
                </YStack>
              </Dialog.Title>

              <Dialog.Close asChild items="flex-end">
                <Button
                  elevate
                  size="$6"
                  circular
                  icon={<Close size={24} />}
                  chromeless
                  pressStyle={{ opacity: 0.7 }}
                />
              </Dialog.Close>
            </XStack>

            {/* Main content */}
            <Dialog.Description>
              <YStack gap="$4" items="center">
                <YStack items="center">
                  <Text
                    fontSize="$5"
                    color="$white"
                    lineHeight="$1"
                    style={{ textAlign: 'center' }}
                  >
                    {t(
                      'Transaction_failed_storage_exceeded',
                      'Transaction failed due to storage exceeded'
                    )}
                  </Text>
                </YStack>

                <YStack items="center">
                  <Text
                    fontSize="$5"
                    color="$warning"
                    lineHeight="$1"
                    style={{ textAlign: 'center' }}
                  >
                    {t('Must_have_minimum_flow_storage', 'Must have minimum Flow for storage')}
                  </Text>
                </YStack>

                <YStack items="center" py="$2">
                  <Text
                    fontSize="$5"
                    color="$white"
                    textDecorationLine="underline"
                    cursor="pointer"
                    pressStyle={{ opacity: 0.7 }}
                    style={{ textAlign: 'center' }}
                  >
                    {t('Learn__more', 'Learn more')}
                  </Text>
                </YStack>
              </YStack>
            </Dialog.Description>

            {/* Action button */}
            <YStack
              bg="$white"
              rounded="$4"
              onPress={handleBuyFlow}
              p="$2"
              items="center"
              pressStyle={{ opacity: 0.8 }}
            >
              <Text fontSize="$5" fontWeight="600" color="$black">
                {t('BUY_FLOW', 'Buy Flow')}
              </Text>
            </YStack>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>

      {/* Adapt for mobile - shows as sheet on small screens */}
      <Adapt when="sm" platform="touch">
        <Sheet animation="medium" zIndex={200000} modal dismissOnSnapToBottom>
          <Sheet.Frame p="$4" gap="$4" bg="$bg2">
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        </Sheet>
      </Adapt>
    </Dialog>
  );
};
