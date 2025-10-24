import { X } from '@onflow/frw-icons';
import React, { useEffect, useRef } from 'react';
import { Dialog, YStack, XStack, Text, useTheme } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Button } from '../foundation/Button';
import { IconButton } from '../foundation/IconButton';
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
  const inputRef = useRef<any>(null);
  const theme = useTheme();
  useEffect(() => {
    if (!visible) {
      return;
    }

    const timer = setTimeout(() => {
      inputRef.current?.focus?.();
    }, 50);

    return () => {
      clearTimeout(timer);
    };
  }, [visible]);

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
          width="80%"
          bg="$bg1"
          rounded="$4"
          p="$5"
          gap="$2"
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
          <YStack gap="$3" position="relative">
            <XStack items="center" justify="space-between">
              <Text fontSize="$6" fontWeight="700" color="$text" flex={1} shrink={1} minWidth={0}>
                {title}
              </Text>
              <IconButton
                variant="ghost"
                size="small"
                onPress={onClose}
                disabled={isSubmitting}
                icon={<X size={24} color="$text" />}
                pressStyle={{ opacity: 0.5, transform: [{ scale: 0.9 }] }}
              />
            </XStack>

            <XStack bg="$bg1" rounded="$3" px="$4" py="$3" items="center" gap="$3">
              <Avatar size={40} fallback={initial} bgColor="$surfaceDark4" textColor="$white" />
              <Text
                fontSize={14}
                fontWeight="500"
                color="$text"
                flex={1}
                numberOfLines={1}
                ellipsizeMode="middle"
                shrink={1}
              >
                {address}
              </Text>
            </XStack>

            <Input
              label={nameLabel}
              value={contactName}
              onChangeText={onContactNameChange}
              placeholder={namePlaceholder}
              ref={inputRef}
              autoFocus
            />

            <Button
              variant="inverse"
              size="large"
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
