import React, { useState } from 'react';
import { XStack, YStack } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Card } from '../foundation/Card';
import { Skeleton } from '../foundation/Skeleton';
import { Text } from '../foundation/Text';
import type { AccountCardProps } from '../types';
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
      <XStack items="center" justify="space-between">
        <XStack items="center" gap="$4" flex={1}>
          {/* Account Avatar */}
          <Avatar src={account.avatar} fallback={account.name?.charAt(0) || '?'} size={44} />

          {/* Account Details */}
          <YStack flex={1}>
            <YStack gap="$0.5">
              {/* Account Name */}
              <XStack items="center" gap="$1">
                <Text color="$text" fontSize="$3" fontWeight="400" lineHeight="$1">
                  {account.name}
                </Text>
              </XStack>

              {/* Account Address */}
              <Text fontSize="$2" color="$textSecondary">
                {account.address}
              </Text>

              {/* Balance and additional info */}
              <YStack height="$1.5" mb="$1">
                {isLoading ? (
                  <Skeleton width="$6" height="$1" />
                ) : account.balance ? (
                  <Text color="$textSecondary" fontWeight="400" fontSize="$2" lineHeight="$2">
                    {account.balance}
                  </Text>
                ) : null}
              </YStack>
            </YStack>
          </YStack>
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
        <Card width="100%" rounded="$4" p="$4" mt="$5" bg="$bg2">
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
