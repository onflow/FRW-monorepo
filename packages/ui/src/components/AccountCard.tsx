import React, { useState } from 'react';
import { XStack, YStack } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Skeleton } from '../foundation/Skeleton';
import { Text } from '../foundation/Text';
import type { Account, AccountCardProps } from '../types';
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
    <YStack
      width="100%"
      pt="$2"
      px="$2"
      pb="$2"
      onPress={enableModalSelection ? () => setModalOpen(true) : undefined}
      {...props}
    >
      <Text fontSize="$3" fontWeight="400" color="$text2" lineHeight={16}>
        {title}
      </Text>
      {/* Account Row */}
      <XStack items="center" mt="$1">
        <XStack items="center" gap="$2" flex={1}>
          {/* Account Avatar */}
          <Avatar
            src={account.avatar}
            fallback={account.name?.charAt(0) || '?'}
            size={36}
            borderColor="#00EF8B"
            borderWidth={1}
          />

          {/* Account Details */}
          <YStack flex={1}>
            {/* Account Name */}
            <Text color="$text" fontSize="$3.5" fontWeight="600" lineHeight={17} numberOfLines={1}>
              {account.name || 'Unnamed Account'}
            </Text>

            {/* Account Address */}
            <AddressText
              address={account.address}
              color="$text2"
              truncate={true}
              startLength={6}
              endLength={4}
            />

            {/* Balance */}
            {isLoading ? (
              <Skeleton width="$8" height="$4" />
            ) : account.balance ? (
              <Text color="$text2" fontWeight="400" fontSize="$3" lineHeight={17}>
                {account.balance}
              </Text>
            ) : null}
          </YStack>
        </XStack>

        {/* Edit Icon */}
        <XStack width="$6" height="$6" items="center" justify="center">
          Edit
        </XStack>
      </XStack>
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
