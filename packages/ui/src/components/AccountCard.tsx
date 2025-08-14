import { Edit } from '@onflow/frw-icons';
import React, { useState } from 'react';
import { XStack, YStack } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Skeleton } from '../foundation/Skeleton';
import { Text } from '../foundation/Text';
import type { AccountCardProps, Account } from '../types';
import { AccountSelectorModal } from './AccountSelectorModal';
import { AddressText } from './AddressText';

export function AccountCard({
  account,
  title,
  isLoading = false,
  // Modal-style selection props
  accounts,
  onAccountSelect,
  modalTitle = 'Select Account',
  enableModalSelection = false,
  ...props
}: AccountCardProps): React.ReactElement {
  const [modalOpen, setModalOpen] = useState(false);

  const content = (
    <YStack gap="$3">
      {/* Title */}
      <Text fontSize="$2" fontWeight="400" color="rgba(255, 255, 255, 0.8)" lineHeight={16}>
        {title}
      </Text>

      {/* Account Container */}
      <YStack
        bg="rgba(255, 255, 255, 0.1)"
        rounded="$4"
        pt="$4"
        px="$4"
        pb="$6"
        pressStyle={{
          bg: 'rgba(255, 255, 255, 0.12)',
        }}
        onPress={enableModalSelection ? () => setModalOpen(true) : undefined}
        cursor={enableModalSelection ? 'pointer' : 'default'}
        {...props}
      >
        {/* Account Row */}
        <XStack items="center" justify="space-between">
          <XStack items="center" gap="$4" flex={1}>
            {/* Account Avatar */}
            <Avatar
              src={account.avatar}
              fallback={account.name?.charAt(0) || '?'}
              size={36}
              borderColor="#00EF8B"
              borderWidth={1}
            />

            {/* Account Details */}
            <YStack flex={1} gap="$0.5">
              {/* Account Name */}
              <Text color="$white" fontSize="$3" fontWeight="600" lineHeight={17} numberOfLines={1}>
                {account.name || 'Unnamed Account'}
              </Text>

              {/* Account Address */}
              <AddressText
                address={account.address}
                truncate={true}
                startLength={6}
                endLength={4}
              />

              {/* Balance */}
              {isLoading ? (
                <Skeleton width="$8" height="$4" borderRadius="$2" />
              ) : account.balance ? (
                <Text color="#B3B3B3" fontWeight="400" fontSize="$2" lineHeight={17}>
                  {account.balance}
                </Text>
              ) : null}
            </YStack>
          </XStack>

          {/* Edit Icon */}
          <XStack width={24} height={24} items="center" justify="center">
            <Edit size={18} color="#767676" theme="outline" />
          </XStack>
        </XStack>
      </YStack>
    </YStack>
  );

  const handleAccountSelect = (selectedAccount: Account) => {
    if (onAccountSelect) {
      onAccountSelect(selectedAccount);
    }
    setModalOpen(false);
  };

  return (
    <>
      {content}

      {/* Account Selector Modal */}
      {enableModalSelection && accounts && (
        <AccountSelectorModal
          accounts={accounts}
          currentAccount={account}
          onAccountSelect={handleAccountSelect}
          title={modalTitle}
          isOpen={modalOpen}
          onOpenChange={setModalOpen}
        />
      )}
    </>
  );
}
