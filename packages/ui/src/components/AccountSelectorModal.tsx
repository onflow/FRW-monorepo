import React, { useState } from 'react';
import { Dialog, XStack, YStack, ScrollView, Button as TamaguiButton } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Button } from '../foundation/Button';
import { Text } from '../foundation/Text';
import type { Account } from '../types';

export interface AccountSelectorModalProps {
  accounts: Account[];
  currentAccount?: Account | null;
  onAccountSelect: (account: Account) => void;
  title?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactElement;
}

export function AccountSelectorModal({
  accounts,
  currentAccount,
  onAccountSelect,
  title = 'Select Account',
  isOpen,
  onOpenChange,
  trigger,
}: AccountSelectorModalProps): React.ReactElement {
  const [localOpen, setLocalOpen] = useState(false);

  const open = isOpen !== undefined ? isOpen : localOpen;
  const setOpen = onOpenChange || setLocalOpen;

  const handleAccountSelect = (account: Account) => {
    onAccountSelect(account);
    setOpen(false);
  };

  // Don't render modal if no accounts are available
  if (!accounts || accounts.length === 0) {
    return null;
  }

  return (
    <Dialog modal open={open} onOpenChange={setOpen}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}

      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={['transform', 'opacity']}
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
          w={400}
          maxHeight="80vh"
        >
          {/* Header */}
          <XStack
            items="center"
            justify="space-between"
            p="$4"
            borderBottomWidth={1}
            borderBottomColor="$border"
          >
            <Dialog.Title asChild>
              <Text fontSize="$5" fontWeight="600">
                {title}
              </Text>
            </Dialog.Title>

            <Dialog.Close asChild>
              <TamaguiButton size="$2" circular variant="outlined">
                ✕
              </TamaguiButton>
            </Dialog.Close>
          </XStack>

          {/* Account List */}
          <ScrollView maxHeight={400}>
            <YStack p="$2">
              {accounts.map((account, index) => {
                const isSelected = currentAccount?.address === account.address;

                return (
                  <XStack
                    key={account.address || index}
                    items="center"
                    p="$3"
                    mx="$2"
                    rounded="$3"
                    pressStyle={{ bg: '$bg3' }}
                    hoverStyle={{ bg: '$bg2' }}
                    bg={isSelected ? '$primary10' : 'transparent'}
                    onPress={() => handleAccountSelect(account)}
                    cursor="pointer"
                  >
                    {/* Account Avatar */}
                    <Avatar
                      src={account.avatar}
                      fallback={account.name?.charAt(0) || '?'}
                      size={40}
                    />

                    {/* Account Details */}
                    <YStack flex={1} ml="$3">
                      <Text
                        fontSize="$4"
                        fontWeight="500"
                        color={isSelected ? '$primary' : '$text'}
                      >
                        {account.name || 'Unnamed Account'}
                      </Text>
                      <Text fontSize="$3" color="$textSecondary" numberOfLines={1}>
                        {account.address}
                      </Text>
                      {account.balance && (
                        <Text fontSize="$2" color="$textTertiary" mt="$0.5">
                          {account.balance}
                        </Text>
                      )}
                    </YStack>

                    {/* Selection Indicator */}
                    {isSelected && (
                      <YStack
                        w={20}
                        h={20}
                        rounded="$10"
                        bg="$primary"
                        items="center"
                        justify="center"
                      >
                        <Text color="$black" fontSize="$1" fontWeight="600">
                          ✓
                        </Text>
                      </YStack>
                    )}
                  </XStack>
                );
              })}
            </YStack>
          </ScrollView>

          {/* Footer */}
          <XStack justify="flex-end" gap="$3" p="$4" borderTopWidth={1} borderTopColor="$border">
            <Dialog.Close asChild>
              <Button variant="outlined">Cancel</Button>
            </Dialog.Close>
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
