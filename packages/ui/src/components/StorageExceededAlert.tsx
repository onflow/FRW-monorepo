import { navigation } from '@onflow/frw-context';
import { Close } from '@onflow/frw-icons';
import React from 'react';
import { YStack, XStack, Stack } from 'tamagui';

import { Modal } from './Modal';
import { Card } from '../foundation/Card';
import { Text } from '../foundation/Text';

export interface StorageExceededAlertProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
}

export const StorageExceededAlert: React.FC<StorageExceededAlertProps> = ({ visible, onClose }) => {
  const handleBuyFlow = () => {
    onClose();
    navigation.navigate('/dashboard?onramp=true');
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      width="320px"
      maxWidth="90vw"
      backgroundColor="$bg2"
      overlayColor="rgba(0, 0, 0, 0.5)"
      padding="$5"
      gap="$4"
      borderRadius="$4"
      zIndex={1000}
    >
      <Card backgroundColor="$bg2" p="$6" style={{ borderRadius: '$5' }}>
        <YStack flex={1} gap="$4">
          <XStack justify="space-between" items="center">
            {/* Title */}
            <Stack flex={1} items="center">
              <Text fontSize="$7" fontWeight="600" color="white"></Text>
            </Stack>

            {/* Close Icon */}
            <Stack
              cursor="pointer"
              items="flex-end"
              pressStyle={{ opacity: 0.7 }}
              onPress={onClose}
            >
              <Close size={20} color="white" />
            </Stack>
          </XStack>

          {/* Main content */}
          <YStack gap="$4" py="$2" items="center">
            <Text fontSize="$5" color="white" lineHeight="$1" style={{ textAlign: 'center' }}>
              {chrome.i18n.getMessage('Transaction_failed_storage_exceeded')}
            </Text>

            <Text fontSize="$5" color="orange" lineHeight="$1" style={{ textAlign: 'center' }}>
              {chrome.i18n.getMessage('Must_have_minimum_flow_storage')}
            </Text>

            <Stack items="center" py="$2">
              <Text
                fontSize="$5"
                color="white"
                style={{ textAlign: 'center', textDecoration: 'underline' }}
                cursor="pointer"
                pressStyle={{ opacity: 0.7 }}
              >
                {chrome.i18n.getMessage('Learn__more')}
              </Text>
            </Stack>
          </YStack>

          <YStack
            bg={'white'}
            rounded="$4"
            onPress={handleBuyFlow}
            p="$2"
            items="center"
            pressStyle={{ opacity: 0.8 }}
          >
            <Text fontSize="$5" fontWeight="600" color={'black'}>
              {chrome.i18n.getMessage('BUY_FLOW')}
            </Text>
          </YStack>
        </YStack>
      </Card>
    </Modal>
  );
};
