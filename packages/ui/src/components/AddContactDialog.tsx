import { Close } from '@onflow/frw-icons';
import React from 'react';
import { Dialog, YStack, XStack, Text } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Button } from '../foundation/Button';
import { Input } from '../foundation/Input';

export interface AddContactDialogProps {
  visible: boolean;
  address: string;
  initial?: string;
  contactName: string;
  isSubmitting?: boolean;
  onContactNameChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  title?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  confirmLabel?: string;
}

export function AddContactDialog({
  visible,
  address,
  initial = '?',
  contactName,
  isSubmitting = false,
  onContactNameChange,
  onConfirm,
  onClose,
  title = 'New contact',
  nameLabel = 'Contact name',
  namePlaceholder = 'Enter a name',
  confirmLabel = 'Add to address book',
}: AddContactDialogProps): React.ReactElement | null {
  return (
    <Dialog modal open={visible} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          bg="$dark80"
          animateOnly={['transform', 'opacity']}
          animation={[
            'quicker',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          onPress={isSubmitting ? undefined : onClose}
        />
        <Dialog.Content
          key="content"
          width={343}
          bg="$surfaceDark5"
          rounded="$4"
          p="$5"
          gap="$5"
          shadowColor="$shadow"
          shadowOffset={{ width: 0, height: 5 }}
          shadowOpacity={0.25}
          shadowRadius={12}
          elevation={8}
          animateOnly={['transform', 'opacity']}
          animation={[
            'quicker',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: 20, opacity: 0 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
        >
          <YStack gap="$4" position="relative">
            <YStack position="absolute" top={-8} right={-8}>
              <Button
                variant="ghost"
                size="small"
                onPress={onClose}
                disabled={isSubmitting}
                icon={<Close size={20} />}
              />
            </YStack>

            <Text fontSize={20} fontWeight="700" color="$white" textAlign="center">
              {title}
            </Text>

            <XStack bg="$surfaceDark5" rounded="$3" px="$4" py="$3" items="center" gap="$3">
              <Avatar size={40} fallback={initial} bgColor="$surfaceDark4" textColor="$white" />
              <Text
                fontSize={14}
                fontWeight="500"
                color="$white"
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {address}
              </Text>
            </XStack>

            <Input
              label={nameLabel}
              value={contactName}
              onChangeText={onContactNameChange}
              placeholder={namePlaceholder}
            />

            <Button
              variant="inverse"
              fullWidth={true}
              loading={isSubmitting}
              disabled={isSubmitting}
              onPress={onConfirm}
            >
              {confirmLabel}
            </Button>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
