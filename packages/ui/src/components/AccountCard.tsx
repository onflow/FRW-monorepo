import { Edit } from '@onflow/frw-icons';
import React, { useState } from 'react';
import { XStack, YStack } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Card } from '../foundation/Card';
import { Skeleton } from '../foundation/Skeleton';
import { Text } from '../foundation/Text';
import type { AccountCardProps, Account } from '../types';
import { AccountSelectorModal } from './AccountSelectorModal';

export function AccountCard({
  account,
  title,
  isLoading = false,
  showBackground = false,
  // Modal-style selection props
  accounts,
  onAccountSelect,
  modalTitle = 'Select Account',
  enableModalSelection = false,
  ...props
}: AccountCardProps): React.ReactElement {
  const [modalOpen, setModalOpen] = useState(false);
  const content = (
    <YStack {...props}>
      <Text fontSize="$2" mb="$3" fontWeight="400" color="$textSecondary">
        {title}
      </Text>

      {/* Account Row */}
      <XStack items="center" justify="space-between" py="$2.5" px="$1.5">
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
            <Text color="$white" fontSize={14} fontWeight="600" lineHeight="$1">
              {account.name}
            </Text>

            {/* Account Address */}
            <Text fontSize={12} color="$textSecondary" fontWeight="400">
              {account.address}
            </Text>

            {/* Balance */}
            {isLoading ? (
              <Skeleton width="$6" height="$1" />
            ) : account.balance ? (
              <Text color="$textSecondary" fontWeight="400" fontSize={12}>
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
  );

  const handleAccountSelect = (selectedAccount: Account) => {
    if (onAccountSelect) {
      onAccountSelect(selectedAccount);
    }
    setModalOpen(false);
  };

  return (
    <>
      {showBackground ? (
        <Card
          width="100%"
          rounded={16}
          pt="$4"
          px="$4"
          pb="$6"
          mt="$5"
          bg="rgba(255, 255, 255, 0.1)"
        >
          {content}
        </Card>
      ) : (
        content
      )}

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
