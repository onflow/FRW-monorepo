import { CheckCircle, Close, Edit, Link, ChevronRight, Copy } from '@onflow/frw-icons';
import { type WalletAccount } from '@onflow/frw-types';
import React, { useState } from 'react';
import { XStack, YStack, Sheet, ScrollView } from 'tamagui';

import { AddressText } from './AddressText';
import { Avatar } from '../foundation/Avatar';
import { IconButton } from '../foundation/IconButton';
import { Text } from '../foundation/Text';

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

// Helper function to detect EOA accounts (Externally Owned Account)
// Based on Android bridge logic: id === 'eoa' (from NativeFRWBridge.kt line 340)
// Also supports extension logic: id === '99' || name includes 'EOA'
// EOA = pure EVM account (shows "EVM" chip)
// COA = Cadence Owned Account / Flow-linked EVM (shows "EVM FLOW" chip)
const isEOAAccount = (account: WalletAccount): boolean => {
  return (
    account.type === 'eoa' ||
    (account.type === 'evm' &&
      (account.id === 'eoa' ||
        account.id === '99' ||
        account.name?.includes('EOA') ||
        account.name?.includes('EVM Account (EOA)')))
  );
};

export interface AccountSelectorProps {
  currentAccount: WalletAccount;
  accounts: WalletAccount[];
  onAccountSelect: (account: WalletAccount) => void;
  title?: string;
  showEditButton?: boolean;
  onEditClick?: () => void;
  actionIcon?: 'edit' | 'chevron'; // Icon to show when showEditButton is true
  showCopyButton?: boolean;
  onCopyAddress?: (address: string) => void;
}

export function AccountSelector({
  currentAccount,
  accounts,
  onAccountSelect,
  title = 'From Account',
  showEditButton = false,
  onEditClick,
  actionIcon = 'edit',
  showCopyButton = false,
  onCopyAddress,
}: AccountSelectorProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  // Icon color that works in both light and dark modes
  const iconColor = '#767676';

  const handleAccountSelect = (account: WalletAccount) => {
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
      <YStack width="100%" gap={title ? 12 : 0}>
        {/* Title - only render if not empty */}
        {title && (
          <Text fontSize="$3" fontWeight="400" color="$textSecondary" lineHeight={16}>
            {title}
          </Text>
        )}

        {/* Account Container */}
        <XStack pb={'$2'} pl={5} pr={0} justify="space-between" items="center">
          {/* Left side: Avatar and Account Details */}
          <XStack items="center" gap={16} flex={1}>
            {/* Account Avatar with parent emoji overlay */}
            <XStack position="relative" width={36} height={36}>
              <Avatar
                src={currentAccount.avatar}
                fallback={currentAccount.emojiInfo?.emoji || currentAccount.name?.charAt(0) || '?'}
                bgColor={currentAccount.emojiInfo?.color}
                textColor={currentAccount.emojiInfo?.color ? undefined : '$text'}
                size={36}
                borderColor="$primary"
                borderWidth={1}
              />
              {/* Parent emoji overlay bubble for linked accounts (hidden for EOA accounts) */}
              {currentAccount.parentEmoji && !isEOAAccount(currentAccount) && (
                <YStack
                  position="absolute"
                  left={-6}
                  top={-6}
                  width={18}
                  height={18}
                  rounded={9}
                  bg={(currentAccount.parentEmoji.color as any) || '$bg2'}
                  borderWidth={2}
                  borderColor="$bg2"
                  items="center"
                  justify="center"
                  overflow="hidden"
                >
                  <Text fontSize={8} fontWeight="600" lineHeight={12}>
                    {currentAccount.parentEmoji.emoji}
                  </Text>
                </YStack>
              )}
            </XStack>

            {/* Account Details */}
            <YStack flex={1} gap={2}>
              {/* Account Name with link icon and EVM Badge */}
              <XStack items="center" gap={4}>
                {/* Link icon for linked accounts */}
                {(currentAccount.type === 'child' || currentAccount.parentEmoji) && (
                  <Link size={12.8} color={iconColor} theme="outline" />
                )}
                <Text
                  color="$text"
                  fontSize={14}
                  fontWeight="600"
                  lineHeight={17}
                  numberOfLines={1}
                >
                  {currentAccount.name || 'Unnamed Account'}
                </Text>
                {(currentAccount.type === 'evm' || currentAccount.type === 'eoa') && (
                  <>
                    {isEOAAccount(currentAccount) ? (
                      // EOA: Pure EVM account - solid blue chip
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
                          color="$white"
                          lineHeight={9.7}
                          letterSpacing={0.128}
                        >
                          EVM
                        </Text>
                      </XStack>
                    ) : (
                      // COA: Flow-linked EVM account - green FLOW pill overlaps blue EVM pill
                      <XStack items="center">
                        {/* Blue EVM pill (base layer) */}
                        <XStack
                          bg="$accentEVM"
                          pl={4}
                          pr={16}
                          items="center"
                          justify="center"
                          height={16}
                          rounded="$4"
                          z={1}
                        >
                          <Text
                            fontSize={8}
                            fontWeight="400"
                            color="$white"
                            lineHeight={9.7}
                            letterSpacing={0.128}
                          >
                            EVM
                          </Text>
                        </XStack>
                        {/* Green FLOW pill (overlays on top with curved left edge) */}
                        <XStack
                          bg="$primary"
                          px={4}
                          ml="$-3"
                          items="center"
                          justify="center"
                          height={16}
                          rounded="$4"
                          z={2}
                        >
                          <Text
                            fontSize={8}
                            fontWeight="400"
                            color="$black"
                            lineHeight={9.7}
                            letterSpacing={0.128}
                          >
                            FLOW
                          </Text>
                        </XStack>
                      </XStack>
                    )}
                  </>
                )}
              </XStack>

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
                {formatBalance(currentAccount.balance || '0')}
              </Text>
            </YStack>
          </XStack>

          {/* Action Icons */}
          <XStack gap="$2" items="center">
            {/* Copy Icon */}
            {showCopyButton && (
              <XStack mr="$4">
                <IconButton
                  icon={<Copy size={24} color={iconColor} theme="outline" />}
                  variant="ghost"
                  size="small"
                  onPress={() => onCopyAddress?.(currentAccount.address)}
                />
              </XStack>
            )}

            {/* Edit/Chevron Icon */}
            {showEditButton && (
              <IconButton
                icon={
                  actionIcon === 'chevron' ? (
                    <ChevronRight size={24} color="#767676" theme="outline" />
                  ) : (
                    <Edit size={24} color="#767676" theme="outline" />
                  )
                }
                variant="ghost"
                size="small"
                onPress={handleEditClick}
              />
            )}
          </XStack>
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
          backgroundColor="$bgDrawer"
          borderTopLeftRadius={16}
          borderTopRightRadius={16}
        >
          <YStack gap={16}>
            {/* Header */}
            <XStack items="center" justify="space-between" pt={10}>
              <Text fontSize={14} fontWeight="400" color="$text">
                Select Account
              </Text>

              <IconButton
                icon={<Close size={15} color="#767676" theme="outline" />}
                variant="ghost"
                size="small"
                onPress={() => setOpen(false)}
              />
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
                      backgroundColor={isSelected ? '$bg2' : 'transparent'}
                    >
                      <XStack items="center" gap={16} flex={1}>
                        {/* Account Avatar with parent emoji overlay */}
                        <XStack position="relative" width={40} height={40}>
                          <Avatar
                            src={account.avatar}
                            fallback={
                              account.emojiInfo?.emoji || account.name?.charAt(0).toUpperCase()
                            }
                            bgColor={account.emojiInfo?.color}
                            textColor={account.emojiInfo?.color ? undefined : '$text'}
                            size={40}
                            borderColor={isSelected ? '$primary' : undefined}
                            borderWidth={isSelected ? 1 : undefined}
                          />
                          {/* Parent emoji overlay bubble for linked accounts (hidden for EOA accounts) */}
                          {account.parentEmoji && !isEOAAccount(account) && (
                            <YStack
                              position="absolute"
                              style={{
                                left: -6,
                                top: -6,
                              }}
                              width={18}
                              height={18}
                              rounded={9}
                              bg={(account.parentEmoji.color as any) || '$bg2'}
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
                        <YStack gap={2} flex={1} justify="center">
                          <XStack items="center" gap={4}>
                            {/* Link icon for linked accounts */}
                            {(account.type === 'child' || account.parentEmoji) && (
                              <Link size={12.8} color={iconColor} theme="outline" />
                            )}
                            <Text fontSize={14} fontWeight="600" color="$text" numberOfLines={1}>
                              {account.name || 'Unnamed Account'}
                            </Text>
                            {account.type === 'evm' && (
                              <>
                                {isEOAAccount(account) ? (
                                  // EOA: Pure EVM account - solid blue chip
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
                                      color="$white"
                                      lineHeight={9.7}
                                      letterSpacing={0.128}
                                    >
                                      EVM
                                    </Text>
                                  </XStack>
                                ) : (
                                  // COA: Flow-linked EVM account - green FLOW pill overlaps blue EVM pill
                                  <XStack items="center">
                                    {/* Blue EVM pill (base layer) */}
                                    <XStack
                                      bg="$accentEVM"
                                      pl={4}
                                      pr={16}
                                      items="center"
                                      justify="center"
                                      height={16}
                                      rounded="$4"
                                      z={1}
                                    >
                                      <Text
                                        fontSize={8}
                                        fontWeight="400"
                                        color="$white"
                                        lineHeight={9.7}
                                        letterSpacing={0.128}
                                      >
                                        EVM
                                      </Text>
                                    </XStack>
                                    {/* Green FLOW pill (overlays on top with curved left edge) */}
                                    <XStack
                                      bg="$primary"
                                      px={4}
                                      ml="$-3"
                                      items="center"
                                      justify="center"
                                      height={16}
                                      rounded="$4"
                                      z={2}
                                    >
                                      <Text
                                        fontSize={8}
                                        fontWeight="400"
                                        color="$black"
                                        lineHeight={9.7}
                                        letterSpacing={0.128}
                                      >
                                        FLOW
                                      </Text>
                                    </XStack>
                                  </XStack>
                                )}
                              </>
                            )}
                          </XStack>
                          <AddressText
                            address={account.address}
                            truncate={true}
                            startLength={6}
                            endLength={4}
                            fontSize={12}
                            fontWeight="400"
                            color="$textSecondary"
                          />
                          <Text
                            fontSize={12}
                            fontWeight="400"
                            color="$textSecondary"
                            numberOfLines={1}
                          >
                            {formatBalance(account.balance || '0')}
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
