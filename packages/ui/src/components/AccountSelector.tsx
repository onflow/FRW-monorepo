import { CheckCircle, Close, Edit } from '@onflow/frw-icons';
import React, { useState } from 'react';
import { XStack, YStack, Sheet, ScrollView } from 'tamagui';

import { AddressText } from './AddressText';
import { Avatar } from '../foundation/Avatar';
import { Text } from '../foundation/Text';
import type { Account } from '../types';

// Helper function to round balance to 5 decimal places
const formatBalance = (balance: string): string => {
  // Extract numeric value from balance string (e.g., "123.456789 FLOW" -> "123.456789")
  const match = balance.match(/^([\d.,]+)/);
  if (!match) return balance;

  const numericPart = match[1].replace(/,/g, ''); // Remove commas
  const restOfString = balance.replace(match[0], ''); // Get the rest (e.g., " FLOW")

  const num = parseFloat(numericPart);
  if (isNaN(num)) return balance;

  // Round to 5 decimal places and format
  const rounded = Number(num.toFixed(5));
  return `${rounded}${restOfString}`;
};

export interface AccountSelectorProps {
  currentAccount: Account;
  accounts: Account[];
  onAccountSelect: (account: Account) => void;
  title?: string;
  showEditButton?: boolean;
  onEditClick?: () => void;
}

export function AccountSelector({
  currentAccount,
  accounts,
  onAccountSelect,
  title = 'From Account',
  showEditButton = false,
  onEditClick,
}: AccountSelectorProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  const handleAccountSelect = (account: Account) => {
    onAccountSelect(account);
    setOpen(false);
  };

  const handleEditClick = () => {
    if (accounts.length > 1) {
      setOpen(true);
    } else if (onEditClick) {
      onEditClick();
    }
  };

  return (
    <>
      {/* Current Account Display */}
      <YStack height={120} gap={12}>
        {/* Title */}
        <Text fontSize={12} fontWeight="400" color="$light80" lineHeight={16}>
          {title}
        </Text>

        {/* Account Container */}
        <XStack py={10} pl={5} pr={0} justify="space-between" items="center">
          {/* Left side: Avatar and Account Details */}
          <XStack items="center" gap={16} flex={1}>
            {/* Account Avatar */}
            <Avatar
              src={currentAccount.avatar}
              fallback={currentAccount.emojiInfo?.emoji || currentAccount.name?.charAt(0) || '?'}
              bgColor={currentAccount.emojiInfo?.color}
              size={36}
              borderColor="$primary"
              borderWidth={1}
            />

            {/* Account Details */}
            <YStack flex={1} gap={2}>
              {/* Account Name */}
              <Text color="$white" fontSize={14} fontWeight="600" lineHeight={17} numberOfLines={1}>
                {currentAccount.name || 'Unnamed Account'}
              </Text>

              {/* Account Address */}
              <AddressText
                address={currentAccount.address}
                truncate={true}
                startLength={6}
                endLength={4}
                color="$textSecondary"
                fontSize={12}
                fontWeight="400"
              />

              {/* Balance */}
              <Text
                color="$textMuted"
                fontWeight="400"
                fontSize={12}
                lineHeight={17}
                numberOfLines={1}
              >
                {formatBalance(currentAccount.balance)}
              </Text>
            </YStack>
          </XStack>

          {/* Edit Icon */}
          {showEditButton && (
            <XStack
              width={24}
              height={24}
              items="center"
              justify="center"
              pressStyle={{ opacity: 0.7 }}
              onPress={handleEditClick}
              cursor="pointer"
            >
              <Edit size={24} color="#767676" theme="outline" />
            </XStack>
          )}
        </XStack>
      </YStack>

      {/* Account Selection Bottom Sheet */}
      <Sheet
        forceRemoveScrollEnabled={open}
        modal={true}
        open={open}
        onOpenChange={setOpen}
        snapPoints={[85]}
        dismissOnSnapToBottom
        zIndex={100_000}
      >
        <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />

        <Sheet.Handle />

        <Sheet.Frame
          padding="$4"
          backgroundColor="$bg2"
          borderTopLeftRadius={16}
          borderTopRightRadius={16}
        >
          <YStack gap={16}>
            {/* Header */}
            <XStack items="center" justify="space-between" pt={10}>
              <Text fontSize={14} fontWeight="400" color="$white">
                Select Account
              </Text>

              <XStack onPress={() => setOpen(false)} cursor="pointer" pressStyle={{ opacity: 0.7 }}>
                <Close size={15} color="rgba(255, 255, 255, 0.8)" theme="outline" />
              </XStack>
            </XStack>

            {/* Account List */}
            <ScrollView maxHeight={400}>
              <YStack gap={2}>
                {accounts.map((account, index) => {
                  const isSelected = currentAccount.address === account.address;

                  return (
                    <XStack
                      key={account.address || index}
                      items="center"
                      justify="space-between"
                      gap={8}
                      py={12}
                      px={8}
                      pressStyle={{ opacity: 0.8 }}
                      onPress={() => handleAccountSelect(account)}
                      cursor="pointer"
                      borderRadius={8}
                      backgroundColor={isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent'}
                    >
                      <XStack items="center" gap={16} flex={1}>
                        {/* Account Avatar */}
                        <Avatar
                          src={account.avatar}
                          fallback={
                            account.emojiInfo?.emoji || account.name?.charAt(0).toUpperCase()
                          }
                          bgColor={account.emojiInfo?.color}
                          size={40}
                          borderColor={isSelected ? '$primary' : undefined}
                          borderWidth={isSelected ? 1 : undefined}
                        />

                        {/* Account Details */}
                        <YStack gap={2} flex={1} justify="center">
                          <Text
                            fontSize={14}
                            fontWeight="600"
                            color="rgba(255, 255, 255, 0.9)"
                            numberOfLines={1}
                          >
                            {account.name || 'Unnamed Account'}
                          </Text>
                          <AddressText
                            address={account.address}
                            truncate={true}
                            startLength={6}
                            endLength={4}
                            fontSize={12}
                            fontWeight="400"
                            color="rgba(255, 255, 255, 0.6)"
                          />
                          <Text
                            fontSize={12}
                            fontWeight="400"
                            color="rgba(255, 255, 255, 0.6)"
                            numberOfLines={1}
                          >
                            {formatBalance(account.balance)}
                          </Text>
                        </YStack>
                      </XStack>

                      {/* Selection Indicator */}
                      {isSelected && (
                        <YStack width={24} height={24} items="center" justify="center">
                          <CheckCircle size={24} color="#00EF8B" theme="filled" />
                        </YStack>
                      )}
                    </XStack>
                  );
                })}
              </YStack>
            </ScrollView>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}
