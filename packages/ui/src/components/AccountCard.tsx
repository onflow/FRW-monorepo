import { CheckCircle, Close, Copy, Edit, Link } from '@onflow/frw-icons';
import React, { useState } from 'react';
import { ScrollView, XStack, YStack } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { IconButton } from '../foundation/IconButton';
import { Skeleton } from '../foundation/Skeleton';
import { Text } from '../foundation/Text';
import type { Account, AccountCardProps } from '../types';
import { AddressText } from './AddressText';

// Helper function to format balance with max 5 decimal places
function formatBalance(balance?: string): string {
  if (!balance) return '0';

  const num = parseFloat(balance);
  if (isNaN(num)) return balance;

  // If the number has more than 5 decimal places, round to 5
  // Otherwise, show the number as is (without trailing zeros)
  const rounded = Math.round(num * 100000) / 100000;
  return rounded.toString();
}

export function AccountCard({
  account,
  title,
  isLoading = false,
  isSendTokensScreen = false,
  // Modal-style selection props
  accounts,
  onAccountSelect,
  modalTitle = 'Select Account',
  enableModalSelection = false,
  showEditButton = false,
  showCopyButton = false,
  onCopyAddress,
  ...props
}: AccountCardProps): React.ReactElement {
  const [modalOpen, setModalOpen] = useState(false);

  // Early return if no account data
  if (!account) {
    return (
      <YStack width="100%" pt="$2" px="$1" pb="$6" gap="$1" {...props}>
        <Text fontSize="$3" mb="$1" fontWeight="400" color="$textSecondary" lineHeight={16}>
          {title}
        </Text>
        <Text color="$error">No account data available</Text>
      </YStack>
    );
  }

  const content = (
    <YStack
      width="100%"
      rounded="$4"
      pt="$1"
      pb={isSendTokensScreen ? '$4' : '$1'}
      gap="$1"
      onPress={enableModalSelection ? () => setModalOpen(true) : undefined}
      cursor={enableModalSelection ? 'pointer' : 'default'}
      {...props}
    >
      {/* Title - only shown if provided */}
      {title && (
        <Text
          fontSize="$3"
          mb={isSendTokensScreen ? '$8' : '$1'}
          fontWeight="400"
          // color="$textSecondary"
          lineHeight={16}
        >
          {title}
        </Text>
      )}

      {/* Account Container */}
      <XStack py="$2" pl="$1.25" pr={0} justify="space-between" items="center" flex={1}>
        {/* Left side: Avatar and Account Details */}
        <XStack items="center" gap="$4" flex={1}>
          {/* Account Avatar with parent emoji overlay */}
          <XStack position="relative" width={36} height={36}>
            <Avatar
              src={account.avatar}
              fallback={account.emojiInfo?.emoji || account.name?.charAt(0) || '?'}
              bgColor={account.emojiInfo?.color}
              size={36}
              borderColor="$primary"
              borderWidth={1}
            />
            {/* Parent emoji overlay bubble for linked accounts */}
            {account.parentEmoji && (
              <YStack
                position="absolute"
                l={-6}
                t={-6}
                width={18}
                height={18}
                rounded={9}
                bg={account.parentEmoji.color || '$bg2'}
                borderWidth={2}
                borderColor="$bg2"
                items="center"
                justify="center"
                overflow="hidden"
              >
                <Text fontSize={8} fontWeight="600" lineHeight={12}>
                  {account.parentEmoji.emoji}
                </Text>
              </YStack>
            )}
          </XStack>

          {/* Account Details */}
          <YStack flex={1} gap="$0.5">
            {/* Account Name with link icon and EVM badge */}
            <XStack items="center" gap={4} minH={20}>
              {/* Link icon for linked accounts */}
              {(account.type === 'child' || account.parentEmoji) && (
                <Link size={12.8} color="#767676" theme="outline" />
              )}
              <Text color="$text" fontSize={14} fontWeight="600" lineHeight={17} numberOfLines={1}>
                {account.name || 'Unnamed Account'}
              </Text>
              {/* EVM Badge - inline with name */}
              {account.type === 'evm' && (
                <XStack
                  bg="$accentEVM"
                  rounded="$4"
                  px={4}
                  items="center"
                  justify="center"
                  height={16}
                >
                  <Text
                    fontSize={8}
                    fontWeight="400"
                    color="#FFFFFF"
                    lineHeight={9.7}
                    letterSpacing={0.128}
                  >
                    EVM
                  </Text>
                </XStack>
              )}
            </XStack>

            {/* Account Address */}
            <AddressText
              address={account.address}
              truncate={true}
              startLength={6}
              endLength={4}
              color="$textSecondary"
              minH={18}
              w="100%"
            />

            {/* Balance Row */}
            <XStack items="center" gap="$2" minH={17}>
              {/* Balance */}
              {isLoading ? (
                <Skeleton width="$12" height="$3" borderRadius="$2" />
              ) : account.balance ? (
                <Text
                  color="$textMuted"
                  fontWeight="400"
                  fontSize="$2"
                  lineHeight={17}
                  numberOfLines={1}
                  flex={1}
                >
                  {formatBalance(account.balance)} FLOW
                </Text>
              ) : null}
            </XStack>
          </YStack>
        </XStack>

        {/* Action Icons */}
        <XStack gap="$2" items="center">
          {/* Copy Icon */}
          {showCopyButton && (
            <IconButton
              icon={<Copy size={24} color="#FFFFFF" theme="outline" />}
              variant="ghost"
              size="small"
              onPress={() => onCopyAddress?.(account.address)}
            />
          )}

          {/* Edit Icon */}
          {showEditButton && (
            <IconButton
              icon={<Edit size={24} color="#767676" theme="outline" />}
              variant="ghost"
              size="small"
            />
          )}
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
      {enableModalSelection && accounts && modalOpen && (
        <>
          {/* Overlay */}
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(0, 0, 0, 0.5)"
            onPress={() => setModalOpen(false)}
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
            bg="$bg2"
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
                <Text fontSize={14} fontWeight="400" color="$white">
                  {modalTitle}
                </Text>

                <XStack
                  position="absolute"
                  right={0}
                  top={10}
                  onPress={() => setModalOpen(false)}
                  cursor="pointer"
                >
                  <Close size={15} color="rgba(255, 255, 255, 0.8)" theme="outline" />
                </XStack>
              </XStack>

              {/* Account List */}
              <YStack maxH={400} bg="$bg2" rounded={16} gap={2} pb={8}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <YStack>
                    {accounts.map((acc, index) => {
                      const isSelected = account?.address === acc.address;

                      return (
                        <React.Fragment key={acc.address || index}>
                          <XStack
                            items="center"
                            justify="space-between"
                            gap={8}
                            onPress={() => handleAccountSelect(acc)}
                            cursor="pointer"
                          >
                            <XStack items="center" gap={8}>
                              {/* Account Avatar with parent emoji overlay */}
                              <XStack position="relative" width={53.44} height={53.44}>
                                <Avatar
                                  src={acc.avatar}
                                  fallback={acc.emojiInfo?.emoji || acc.name?.charAt(0) || '?'}
                                  bgColor={acc.emojiInfo?.color}
                                  size={53.44}
                                  borderColor={isSelected ? '$primary' : undefined}
                                  borderWidth={isSelected ? 1 : undefined}
                                />
                                {/* Parent emoji overlay bubble for linked accounts */}
                                {acc.parentEmoji && (
                                  <YStack
                                    position="absolute"
                                    l={-6}
                                    t={-6}
                                    width={18}
                                    height={18}
                                    rounded={9}
                                    bg={acc.parentEmoji.color || '$bg2'}
                                    borderWidth={2}
                                    borderColor="$bg2"
                                    items="center"
                                    justify="center"
                                    overflow="hidden"
                                  >
                                    <Text fontSize={8} fontWeight="600" lineHeight={12}>
                                      {acc.parentEmoji.emoji}
                                    </Text>
                                  </YStack>
                                )}
                              </XStack>

                              {/* Account Details */}
                              <YStack gap={2} flex={1} justify="center">
                                {/* Account Name with link icon and EVM badge */}
                                <XStack items="center" gap={4}>
                                  {/* Link icon for linked accounts */}
                                  {(acc.type === 'child' || acc.parentEmoji) && (
                                    <Link size={12.8} color={chainLinkIconColor} theme="outline" />
                                  )}
                                  <Text
                                    fontSize={14}
                                    fontWeight="600"
                                    color="rgba(255, 255, 255, 0.8)"
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                  >
                                    {acc.name || 'Unnamed Account'}
                                  </Text>
                                  {/* EVM Badge - inline with name */}
                                  {acc.type === 'evm' && (
                                    <XStack
                                      bg="$accentEVM"
                                      rounded="$4"
                                      px={4}
                                      items="center"
                                      justify="center"
                                      height={16}
                                    >
                                      <Text
                                        fontSize={8}
                                        fontWeight="400"
                                        color="#FFFFFF"
                                        lineHeight={9.7}
                                        letterSpacing={0.128}
                                      >
                                        EVM
                                      </Text>
                                    </XStack>
                                  )}
                                </XStack>

                                <AddressText
                                  address={acc.address}
                                  truncate={true}
                                  startLength={6}
                                  endLength={4}
                                  fontSize={14}
                                  fontWeight="400"
                                  color="rgba(255, 255, 255, 0.8)"
                                />
                              </YStack>
                            </XStack>

                            {/* Selection Indicator */}
                            {isSelected && (
                              <YStack width={24} height={24} items="center" justify="center">
                                <CheckCircle size={24} color="$success" theme="filled" />
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
      )}
    </>
  );
}
