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
    <XStack
      items="center"
      justify="space-between"
      py="$3"
      px="$4"
      bg="rgba(255, 255, 255, 0.05)"
      borderRadius="$4"
      borderWidth={1}
      borderColor="rgba(255, 255, 255, 0.1)"
      pressStyle={{
        bg: 'rgba(255, 255, 255, 0.08)',
        borderColor: 'rgba(255, 255, 255, 0.15)',
      }}
      onPress={enableModalSelection ? () => setModalOpen(true) : undefined}
      cursor={enableModalSelection ? 'pointer' : 'default'}
      {...props}
    >
      <YStack flex={1} gap="$2">
        {/* Title */}
        <Text fontSize="$2" fontWeight="500" color="$textSecondary" lineHeight="$1">
          {title}
        </Text>

        {/* Account Row */}
        <XStack items="center" gap="$3" flex={1}>
          {/* Account Avatar */}
          <Avatar
            src={account.avatar}
            fallback={account.name?.charAt(0) || '?'}
            size={40}
            borderColor="#00EF8B"
            borderWidth={2}
          />

          {/* Account Details */}
          <YStack flex={1} gap="$1">
            {/* Account Name */}
            <Text color="$white" fontSize="$4" fontWeight="600" lineHeight="$1" numberOfLines={1}>
              {account.name || 'Unnamed Account'}
            </Text>

            {/* Account Address */}
            <AddressText
              address={account.address}
              truncate={true}
              startLength={6}
              endLength={4}
              fontSize="$2"
              color="$textSecondary"
              fontWeight="400"
            />

            {/* Balance */}
            {isLoading ? (
              <Skeleton width="$8" height="$2" borderRadius="$2" />
            ) : account.balance ? (
              <Text color="$textSecondary" fontWeight="500" fontSize="$2" lineHeight="$1">
                {account.balance}
              </Text>
            ) : null}
          </YStack>
        </XStack>
      </YStack>

      {/* Edit/Dropdown Icon */}
      {enableModalSelection ? (
        <XStack width={24} height={24} items="center" justify="center" opacity={0.6}>
          <Edit size={24} color="#FFFFFF" theme="outline" />
        </XStack>
      ) : (
        <XStack width={24} height={24} items="center" justify="center" opacity={0.4}>
          <Edit size={24} color="#767676" theme="outline" />
        </XStack>
      )}
    </XStack>
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
