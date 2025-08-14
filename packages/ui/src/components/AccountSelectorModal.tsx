import React, { useState } from 'react';
import { XStack, YStack, ScrollView } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
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

  if (!open) {
    return trigger ? <>{trigger}</> : null;
  }

  return (
    <>
      {trigger && <YStack onPress={() => setOpen(true)}>{trigger}</YStack>}

      {/* Overlay */}
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0, 0, 0, 0.5)"
        onPress={() => setOpen(false)}
        zIndex={1000}
      />

      {/* Bottom Drawer */}
      <YStack
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        alignSelf="center"
        maxWidth={375}
        bg="#141415"
        borderTopLeftRadius={16}
        borderTopRightRadius={16}
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: -2 }}
        shadowOpacity={0.1}
        shadowRadius={8}
        elevation={8}
        pt={12}
        px={16}
        pb={20}
        zIndex={1001}
      >
        <YStack gap={16}>
          {/* Header */}
          <XStack items="center" justify="space-between" pt={10} position="relative">
            <Text fontSize={14} fontWeight="400" color="#FFFFFF">
              {title}
            </Text>

            <XStack
              position="absolute"
              right={0}
              top={10}
              onPress={() => setOpen(false)}
              cursor="pointer"
            >
              <Text color="#FFFFFF" fontSize={18}>
                ✕
              </Text>
            </XStack>
          </XStack>

          {/* Account List */}
          <YStack maxHeight={400} bg="#141415" borderRadius={16} gap={2} pb={8}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <YStack>
                {accounts.map((account, index) => {
                  const isSelected = currentAccount?.address === account.address;

                  return (
                    <React.Fragment key={account.address || index}>
                      <XStack
                        items="center"
                        justify="space-between"
                        gap={8}
                        onPress={() => handleAccountSelect(account)}
                        cursor="pointer"
                      >
                        <XStack items="center" gap={8}>
                          {/* Account Avatar */}
                          <Avatar
                            src={account.avatar}
                            fallback={account.name?.charAt(0) || '?'}
                            size={53.44}
                          />

                          {/* Account Details */}
                          <YStack gap={6} width={201} height={35} justify="center">
                            <Text
                              fontSize={14}
                              fontWeight="600"
                              color="rgba(255, 255, 255, 0.8)"
                              numberOfLines={1}
                            >
                              {account.name || 'Unnamed Account'}
                            </Text>
                            <Text
                              fontSize={14}
                              fontWeight="400"
                              color="rgba(255, 255, 255, 0.8)"
                              numberOfLines={1}
                            >
                              {account.address}
                            </Text>
                          </YStack>
                        </XStack>

                        {/* Selection Indicator */}
                        {isSelected && (
                          <YStack width={24} height={24} items="center" justify="center">
                            <Text color="#00EF8B" fontSize={18}>
                              ✓
                            </Text>
                          </YStack>
                        )}
                      </XStack>

                      {index < accounts.length - 1 && (
                        <YStack py={8} items="center">
                          <YStack height={1} bg="rgba(255, 255, 255, 0.15)" width={343} />
                        </YStack>
                      )}
                    </React.Fragment>
                  );
                })}
              </YStack>
            </ScrollView>
          </YStack>
        </YStack>
      </YStack>
    </>
  );
}
