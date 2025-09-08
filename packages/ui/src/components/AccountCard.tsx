import { Edit, CheckCircle, Close } from '@onflow/frw-icons';
import React, { useState } from 'react';
import { XStack, YStack, ScrollView } from 'tamagui';

import { Avatar } from '../foundation/Avatar';
import { Skeleton } from '../foundation/Skeleton';
import { Text } from '../foundation/Text';
import type { AccountCardProps, Account } from '../types';
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
      width={300}
      bg="$light10"
      rounded="$4"
      pt={16}
      px={16}
      pb={32}
      gap={12}
      height={135}
      pressStyle={{
        bg: '$light25',
      }}
      onPress={enableModalSelection ? () => setModalOpen(true) : undefined}
      cursor={enableModalSelection ? 'pointer' : 'default'}
      {...props}
    >
      {/* Title */}
      <Text fontSize="$2" fontWeight="400" color="$light80" lineHeight={16}>
        {title}
      </Text>

      {/* Account Container */}
      <XStack py={10} pl={5} pr={0} justify="space-between" items="start" flex={1}>
        {/* Left side: Avatar and Account Details */}
        <XStack items="start" gap={16} flex={1}>
          {/* Account Avatar */}
          <Avatar
            src={account.avatar}
            fallback={account.name?.charAt(0) || '?'}
            size={36}
            borderColor="$primary"
            borderWidth={1}
          />

          {/* Account Details */}
          <YStack width={151.34} gap={2}>
            {/* Account Name */}
            <Text color="$white" fontSize="$3" fontWeight="600" lineHeight={17} numberOfLines={1}>
              {account.name || 'Unnamed Account'}
            </Text>

            {/* Account Address */}
            <AddressText address={account.address} truncate={true} startLength={6} endLength={4} />

            {/* Balance */}
            {isLoading ? (
              <Skeleton width="$12" height="$3" borderRadius="$2" mb="$3" />
            ) : account.balance ? (
              <Text
                color="$textMuted"
                fontWeight="400"
                fontSize="$2"
                lineHeight={17}
                mb="$3"
                numberOfLines={1}
              >
                {account.balance}
              </Text>
            ) : null}
          </YStack>
        </XStack>

        {/* Edit Icon */}
        <XStack width={24} height={24} items="center" justify="center" mt={6}>
          <Edit size={24} color="#767676" theme="outline" />
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

  // Calculate dynamic height based on account count
  // Each account item is ~60px (36px avatar + padding), plus separators and container padding
  const calculateDynamicHeight = (accountCount: number): number => {
    const itemHeight = 60; // Approximate height per account item
    const separatorHeight = 17; // Height of separator (8px padding top + 1px line + 8px padding bottom)
    const containerPadding = 32; // Top and bottom padding
    
    const contentHeight = (accountCount * itemHeight) + ((accountCount - 1) * separatorHeight) + containerPadding;
    return Math.min(contentHeight, 400); // Cap at 400px max
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
                <Text fontSize={12} fontWeight="400" color="$white">
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
              <YStack 
                h={calculateDynamicHeight(accounts.length)}
                bg="$bg2" 
                rounded={16} 
                gap={2} 
                pb={8}
                alignSelf="flex-start"
              >
                <ScrollView 
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={accounts.length > 5}
                >
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
                              {/* Account Avatar */}
                              <Avatar
                                src={acc.avatar}
                                fallback={acc.name?.charAt(0) || '?'}
                                size={36}
                                borderColor={isSelected ? '$primary' : undefined}
                                borderWidth={isSelected ? 1 : undefined}
                              />

                              {/* Account Details */}
                              <YStack gap={2} flex={1} justify="center">
                                <Text
                                  fontSize={14}
                                  fontWeight="600"
                                  color="rgba(255, 255, 255, 0.8)"
                                  numberOfLines={1}
                                  ellipsizeMode="tail"
                                >
                                  {acc.name || 'Unnamed Account'}
                                </Text>
                                <AddressText
                                  address={acc.address}
                                  truncate={true}
                                  startLength={6}
                                  endLength={4}
                                  fontSize={12}
                                  fontWeight="400"
                                  color="rgba(255, 255, 255, 0.8)"
                                />
                              </YStack>
                            </XStack>

                            {/* Selection Indicator */}
                            {isSelected && (
                              <YStack width={24} height={24} items="center" justify="center">
                                <CheckCircle size={24} color="#41CC5D" theme="filled" />
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
